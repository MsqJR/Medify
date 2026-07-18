# Refactor Plan: File #2 — BrandLogo.tsx

**File:** `components/pharmacy/BrandLogo.tsx`
**Rule Vector:** Layout shifts (CLS) — missing dimension attributes on images
**Priority:** CRITICAL

---

## Issues

1. **Native `<img>` with eslint-disable** — same as `ProductImage`, bypasses `next/image` optimization.
2. **Zero width/height attributes** — `className="w-full h-full object-cover"` means the container starts at 0×0 and snaps open when the image loads → CLS.
3. **`useEffect` for error state reset** — unnecessary, replaceable with `key` prop on the image element.
4. **`useMemo` for `normalizeLogoUrl`** — trivial string operation, adds more overhead than it saves.

---

## Strategy

### A. Switch to `next/image`

`normalizeLogoUrl` returns HTTP URLs, relative `/media/` paths, `data:`, or `blob:` URIs. Use `next/image` for HTTP/relative URLs; keep native `<img>` for `data:`/`blob:`.

### B. Eliminate CLS

Use `<Image fill />` inside a wrapper `<div>`. Callers pass `imageClassName="w-full h-full object-cover"` — the wrapper inherits those dimensions from its parent grid/flex container.

### C. Remove `useEffect` + `useMemo`

- Replace `useEffect` error reset with `key={normalizedSrc}` on the image.
- Drop `useMemo` — `normalizeLogoUrl` is a cheap string operation.

---

## Proposed Implementation Sketch

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { normalizeLogoUrl } from '@/lib/storage'

type BrandLogoProps = {
  src?: string | null
  alt: string
  fallbackText?: string
  imageClassName?: string
  fallbackClassName?: string
}

const isNextImageCompatible = (url: string) =>
  url.startsWith('/') || url.startsWith('http:') || url.startsWith('https:')

export function BrandLogo({
  src,
  alt,
  fallbackText = 'P',
  imageClassName = 'w-full h-full object-cover',
  fallbackClassName = 'w-full h-full bg-neutral-dark text-white flex items-center justify-center font-bold',
}: BrandLogoProps) {
  const normalizedSrc = normalizeLogoUrl(src)
  const [hasImageError, setHasImageError] = useState(false)

  const fallbackLetter = (fallbackText || 'P').charAt(0).toUpperCase() || 'P'

  if (!normalizedSrc || hasImageError) {
    return <div className={fallbackClassName}>{fallbackLetter}</div>
  }

  if (isNextImageCompatible(normalizedSrc)) {
    return (
      <div className={imageClassName}>
        <Image
          key={normalizedSrc}
          src={normalizedSrc}
          alt={alt}
          fill
          sizes="200px"
          className="object-cover"
          onError={() => setHasImageError(true)}
        />
      </div>
    )
  }

  // data: and blob: URIs — must use native <img>
  return (
    <img
      key={normalizedSrc}
      src={normalizedSrc}
      alt={alt}
      className={imageClassName}
      onError={() => setHasImageError(true)}
    />
  )
}
```

---

## Caller Impact

No API changes. ~20 callers across Topbar, Sidebar, templates 1–3, and dashboard pages work unchanged. The wrapper `<div className={imageClassName}>` preserves the existing layout contract.

---

## Verification

1. `npm run dev` — check brand logo renders in Topbar, Sidebar, and template pages with no layout shift.
2. Inspect DOM — `next/image` emits an optimized `<img>` with intrinsic dimensions.
3. Test broken logo URL — fallback letter (`P` or first letter of business name) displays.
4. Test `data:` logo — still renders via native `<img>` branch.
