# Refactor Plan: File #3 — templates/pharmacy/layout.tsx

**File:** `app/templates/pharmacy/layout.tsx`
**Rule Vector:** Data-fetching waterfall
**Priority:** CRITICAL

---

## Issues

1. **Sequential fetch chains (waterfall)** — The first `useEffect` (lines 49–143) fetches business-info, *then* pharmacy profile sequentially. The second `useEffect` (lines 145–191) separately fetches products + sync status. Visitors see a blank/spinner until all three phases complete. These are **independent operations** that should run in parallel.

2. **`safeJsonParse` defined inline** — Duplicated identically in ~15 template files. Should be a shared utility import.

3. **Massive `'use client'` layout** — Imports 6 modules (`pharmacyApi`, `pharmacyProductsApi`, `pharmacySheetSync`, `pharmacyTheme`, `storage`, `next/navigation`). Ideal long-term fix: split into a server layout (parallel data fetch) + thin client shell. Covered as a future improvement below.

4. **Floating `void fetch(...)` promises** — Unhandled promise rejections could crash the render. No error boundaries.

---

## Strategy

### A. Parallelize all fetches (primary fix)

Merge the two `useEffect` blocks. Use `Promise.all` to fire business-info, pharmacy-profile, and product-sync fetches simultaneously:

```
Promise.all([
  fetchBusinessInfo(token, ownerId),
  fetchPharmacyProfile(token),
  fetchProductsAndSync(token, ownerId),
])
```

Each operation writes to localStorage independently when resolved. No operation blocks another.

### B. Extract `safeJsonParse`

Move to `@/lib/helpers` (or re-export from the existing `pharmacyTemplateRuntime.ts`) and import it. Eliminates the inline definition in this file and in ~15 template files.

### C. Error isolation

Wrap each `Promise.all` branch with individual `.catch()` so one failure doesn't cancel the others.

---

## Proposed Implementation Sketch

```tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { pharmacyApi, pharmacyProductsApi } from '@/lib/pharmacy'
import { startPharmacyProductPolling, fetchSyncedProducts, persistProductSnapshot } from '@/lib/pharmacySheetSync'
import {
  getPharmacyThemeCssVariables,
  getStoredPharmacyThemeSettings,
  normalizePharmacyThemeSettings,
  persistPharmacyThemeSettings,
} from '@/lib/pharmacyTheme'
import { getSiteItem, getSiteOwnerId, getStoredUser, setPublicSiteItem, setSiteItem, setSiteOwnerId } from '@/lib/storage'
import { safeJsonParse } from '@/lib/helpers'

// --- helpers scoped to this file ---

type BusinessInfoSnapshot = { /* ... same as today ... */ }

function fetchBusinessInfo(token: string | null, ownerId: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || ...
  const cachedInfo = safeJsonParse<BusinessInfoSnapshot>(getSiteItem('businessInfo'))

  if (token) {
    return fetch(`${apiBase}/business-info/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        const merged = { /* merge with cachedInfo */ }
        setSiteItem('businessInfo', JSON.stringify(merged))
        setPublicSiteItem('businessInfo', JSON.stringify(merged))
      })
      .catch(() => {})
  }

  const resolvedOwnerId = ownerId || getSiteOwnerId()
  if (!resolvedOwnerId) return Promise.resolve()
  return fetch(`${apiBase}/business-info/public_info/?owner_id=${resolvedOwnerId}`)
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (!data?.business_info) return
      const merged = { /* merge with cachedInfo */ }
      setSiteItem('businessInfo', JSON.stringify(merged))
      setPublicSiteItem('businessInfo', JSON.stringify(merged))
    })
    .catch(() => {})
}

function fetchPharmacyProfile() {
  return pharmacyApi.getProfile()
    .then(res => {
      if (!res.data?.theme_settings) return
      const normalized = normalizePharmacyThemeSettings(res.data.theme_settings)
      persistPharmacyThemeSettings(normalized)
      setThemeSettings(normalized)
    })
    .catch(() => {})
}

// --- layout content ---

function PharmacyTemplatesLayoutContent({ children }) {
  const searchParams = useSearchParams()
  const ownerId = searchParams?.get('owner') || ''
  const isDemo = searchParams?.get('demo') === '1' || searchParams?.get('demo') === 'true'
  const [themeSettings, setThemeSettings] = useState(() => normalizePharmacyThemeSettings(null))

  useEffect(() => {
    const currentUser = getStoredUser()
    const token = localStorage.getItem('access_token')
    if (ownerId) setSiteOwnerId(ownerId)
    if (!ownerId && currentUser?.id) setSiteOwnerId(currentUser.id)

    if (isDemo) return

    // --- parallel fetch all three independent operations ---
    Promise.all([
      fetchBusinessInfo(token, ownerId).catch(() => {}),
      fetchPharmacyProfile().catch(() => {}),
      fetchProductsAndSync(token, ownerId).catch(() => {}),
    ])
  }, [isDemo, ownerId])

  // ... rest stays the same: themeVariables, return ...
}
```

---

## Caller Impact

No API changes. The layout's `children` prop contract is unchanged. All 6 template pages continue to work.

**Bonus:** If `safeJsonParse` is extracted in this pass, every template file that currently defines it inline can be updated to import it — roughly 15 fewer copies of the same 8-line function.

---

## Future Improvement (not in scope of this plan)

Restructure into **server component layout**:

```tsx
// app/templates/pharmacy/layout.tsx (server component)
import { Suspense } from 'react'
import { PharmacyThemeShell } from './PharmacyThemeShell'

async function loadInitialData(ownerId: string) {
  const [businessInfo, profile, products] = await Promise.all([
    fetchBusinessInfoSSR(ownerId),
    fetchPharmacyProfileSSR(),
    fetchProductsSSR(ownerId),
  ])
  return { businessInfo, profile, products }
}

export default async function Layout({ children }) {
  const searchParams = await params
  const initialData = await loadInitialData(searchParams.owner)
  return (
    <PharmacyThemeShell initialData={initialData}>
      {children}
    </PharmacyThemeShell>
  )
}
```

This eliminates the client-side `useEffect` entirely and ships zero fetch JS. The client shell only handles theme toggling and localStorage persistence. However, this requires significant restructuring (the layout currently mixes data fetching with localStorage writes), so it's flagged as a follow-up.

---

## Verification

1. `npm run dev` — load a pharmacy template page; verify all three data sources load (business info renders, theme applies, products appear) without visible waterfall.
2. Check DevTools Network tab — the three fetch calls should fire simultaneously (or near-simultaneously), not sequentially.
3. Test demo mode (`?demo=1`) — no fetches fire, cached/fallback data renders immediately.
4. Test error case — break the backend; template pages should still render with cached fallbacks.
