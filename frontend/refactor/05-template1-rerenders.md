# Refactor Plan: File #5 — templates/pharmacy/1/page.tsx

**File:** `app/templates/pharmacy/1/page.tsx`
**Rule Vector:** Inefficient re-renders (`rerender-memo`, `rerender-move-effect-to-event`)
**Priority:** MEDIUM

---

## Issues

1. **`withDemo` function recreated every render** (lines 74–82) — defined inside the component body, a new function object is allocated on every render. Used in 9+ places in JSX. Should be `useCallback` or extracted to module level.

2. **Cart effect cascade** — three separate `useEffect` hooks (lines 97–104, 106–115, 117–125) create a read→write→re-read cycle:
   - Effect A sets `pharmacySetup`/`businessInfo` from localStorage
   - Effect B reads cart from localStorage and calls `setCart`
   - Effect C writes cart to localStorage whenever `cart` changes
   
   This means: **mount → Effect A → render → Effect B → setCart → render → Effect C → localStorage → render**. Three renders instead of one.

3. **Nested `setAddedToCart` inside `setCart` updater** (lines 210–215) — `setAddedToCart` is called inside the `setCart` callback, creating two sequential state updates. React 18+ batches these, but the pattern is fragile and hard to reason about.

4. **`handleQuickMessageSubmit`** (lines 220–240) — defined inline, no `useCallback`. Recreated on every render. Minor impact since it's only passed to `<form onSubmit>`.

5. **Static JSX inlined** — the services section (lines 424–464) and footer (lines 684–689) contain purely static markup with no dynamic dependencies. They are re-rendered on every state change for no reason.

---

## Strategy

### A. `withDemo` → `useCallback`

Wrap with `useCallback` with `[isDemo, ownerId]` deps. This makes the function reference stable across renders unless the search params change.

### B. Merge cart effects

Combine the cart-read and cart-write logic. Read cart from localStorage once in the same effect that loads business info. Only write on explicit cart mutations (in `addToCart`), not in a passive effect. This eliminates the cascade.

### C. Batch related state updates

Merge `setAddedToCart` into the `addToCart` function body (outside the `setCart` callback) so both `setCart` and `setAddedToCart` fire in the same event handler tick.

### D. `useCallback` for event handlers

Use `useCallback` for `addToCart` and `handleQuickMessageSubmit`.

### E. Extract static JSX

Move the services section and footer to module-level constants or separate lightweight components. They contain zero dynamic data and should never re-render.

---

## Proposed Implementation Sketch

```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useMemo, useState, Suspense } from 'react'
import { FiClock, FiMapPin, FiPhoneCall, FiShoppingBag, FiShield, FiTruck, FiCheck, FiArrowRight, FiShoppingCart } from 'react-icons/fi'
import { AIChatbot } from '@/components/pharmacy/AIChatbot'
import { BrandLogo } from '@/components/pharmacy/BrandLogo'
import { ProductImage } from '@/components/pharmacy/ProductImage'
import { useSearchParams } from 'next/navigation'
import { getSiteItem, setSiteItem, removeSiteItem, getStoredUser, setSiteOwnerId } from '@/lib/storage'
import { addPharmacyInboxMessage } from '@/lib/pharmacyInbox'
import { getStoredPharmacyThemeSettings, isSectionEnabled } from '@/lib/pharmacyTheme'
import { safeJsonParse } from '@/lib/helpers'

// --- static JSX extracted outside component ---

const servicesSection = (
  <section id="services" className="mx-auto max-w-6xl px-4 py-14 bg-white/50">
    {/* ... identical static content from lines 424–464 ... */}
  </section>
)

const footerSection = (
  <footer className="border-t border-neutral-border bg-gradient-to-b from-white to-neutral-light/30">
    {/* ... identical static content from lines 684–689, minus dynamic year/name ... */}
  </footer>
)

// --- component ---

function PharmacyTemplate1PageContent() {
  const searchParams = useSearchParams()
  const isDemo = searchParams?.get('demo') === '1' || searchParams?.get('demo') === 'true'
  const ownerId = searchParams?.get('owner') || ''
  const cartKey = isDemo ? 'pharmacy_cart_demo' : 'pharmacy_cart'

  const withDemo = useCallback((path: string) => {
    const [base, hash] = path.split('#')
    const [pathname, query = ''] = base.split('?')
    const params = new URLSearchParams(query)
    if (isDemo) params.set('demo', '1')
    if (ownerId) params.set('owner', ownerId)
    const nextQuery = params.toString()
    return `${pathname}${nextQuery ? `?${nextQuery}` : ''}${hash ? `#${hash}` : ''}`
  }, [isDemo, ownerId])

  const [pharmacySetup, setPharmacySetup] = useState<PharmacySetup | null>(null)
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null)
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Initialize cart from storage on first mount (avoids effect cascade)
    if (typeof window === 'undefined') return []
    const raw = isDemo ? localStorage.getItem(cartKey) : getSiteItem(cartKey)
    return safeJsonParse<CartItem[]>(raw) || []
  })
  const [addedToCart, setAddedToCart] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    const raw = isDemo ? localStorage.getItem(cartKey) : getSiteItem(cartKey)
    const saved = safeJsonParse<CartItem[]>(raw)
    if (!saved) return new Set()
    return new Set(saved.map(item => item.product.id))
  })
  const [quickMessage, setQuickMessage] = useState({ name: '', contact: '', message: '' })
  const [quickMessageSent, setQuickMessageSent] = useState(false)

  // Single effect for ownerId + localStorage read
  useEffect(() => {
    if (ownerId) setSiteOwnerId(ownerId)
    const user = getStoredUser()
    if (!ownerId && user?.id) setSiteOwnerId(user.id)

    if (isDemo) return

    const savedSetup = safeJsonParse<PharmacySetup>(getSiteItem('pharmacySetup'))
    const savedInfo = safeJsonParse<BusinessInfo>(getSiteItem('businessInfo'))
    setPharmacySetup(savedSetup)
    setBusinessInfo(savedInfo)
  }, [isDemo, ownerId]) // cart load removed from effect — handled in lazy state init

  const brand = useMemo(() => { /* ... same as before ... */ }, [businessInfo, pharmacySetup, isDemo])
  const themeSettings = useMemo(() => (isDemo ? null : getStoredPharmacyThemeSettings()), [isDemo])

  const showHero = isDemo || !themeSettings || isSectionEnabled(themeSettings, 'hero')
  const showFeaturedProducts = isDemo || !themeSettings || isSectionEnabled(themeSettings, 'featuredProducts')
  // ... same section checks ...

  const productCatalog = useMemo(() => { /* ... same as before ... */ }, [pharmacySetup, isDemo])
  const products = useMemo(() => productCatalog.slice(0, 3), [productCatalog])
  const categoryChips = useMemo(() => { /* ... same ... */ }, [productCatalog])
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])

  const addToCart = useCallback((product: Product) => {
    if (!product.inStock) return

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })

    setAddedToCart((prev) => {
      const next = new Set(prev)
      next.add(product.id)
      return next
    })

    // Write to storage immediately (no passive effect needed)
    const updated = /* compute from prev state */ /* or defer to a ref */
  }, [/* stable — no deps needed since we use functional updater */])

  // Write cart to storage (single point, not a reactive effect)
  // Instead: write inside addToCart after the setCart call

  const handleQuickMessageSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault()
    if (!quickMessage.name.trim() || !quickMessage.contact.trim() || !quickMessage.message.trim()) return

    addPharmacyInboxMessage(
      { type: 'refill', name: quickMessage.name, contact: quickMessage.contact, message: quickMessage.message, source: 'template1-home' },
      ownerId || undefined,
    )

    setQuickMessage({ name: '', contact: '', message: '' })
    setQuickMessageSent(true)
    window.setTimeout(() => setQuickMessageSent(false), 2500)
  }, [quickMessage, ownerId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-light/30 via-white to-primary-light/10">
      {/* Top bar — same dynamic content */}
      {/* Header — same dynamic content */}
      {/* Hero — same dynamic content */}
      {servicesSection}  {/* ← static, never re-renders */}
      {/* Products — same dynamic content */}
      {/* Offers — same dynamic content */}
      {/* Contact — same dynamic content */}
      {/* Footer — static + year/brand.name */}
      <AIChatbot pharmacyName={brand.name || ...} pharmacyPhone={brand.phone || ''} />
    </div>
  )
}
```

---

## Key Changes Summary

| # | Change | Impact |
|---|--------|--------|
| 1 | `withDemo` → `useCallback([isDemo, ownerId])` | Stable function reference, 9+ JSX call sites avoid re-creation |
| 2 | Cart state initialized in `useState` lazy init, not in `useEffect` | Eliminates the 3-effect cascade → 1 render instead of 3 |
| 3 | `setAddedToCart` moved outside `setCart` callback | Both updates batch in the same event tick |
| 4 | `addToCart` → `useCallback` with functional `setCart` | Stable callback, no unnecessary child re-renders |
| 5 | Static JSX extracted to module level | Services section + footer never re-render |

---

## Caller Impact

Zero. No prop/export changes. The `Suspense` wrapper remains. Only internal re-render behavior changes.

---

## Verification

1. `npm run dev` — load template 1 page. Verify all sections render correctly.
2. Add items to cart — verify cart count updates, storage writes correctly, no flash/glitch from effect cascade.
3. Remove `console.log` in render body — verify re-render count drops (especially during cart operations).
4. Toggle demo mode (`?demo=1`) — verify `withDemo` paths still append `demo=1` correctly.
5. Submit quick message form — verify message sends and success message appears.
