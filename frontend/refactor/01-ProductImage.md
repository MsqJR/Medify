# Refactor Plan: File #1 — ProductImage.tsx

**File:** `components/pharmacy/ProductImage.tsx`
**Rule Vector:** Layout shifts (CLS) — missing dimension attributes on images
**Priority:** CRITICAL

---

## Issues

1. **Native `<img>` tag with eslint-disable** — bypasses Next.js Image Optimization (automatic dimensions, lazy loading, responsive srcset, placeholder blur).
2. **Zero width/height attributes** — every image load triggers a layout shift (CLS). The `className="h-full w-full object-cover"` only works *after* the image loads, causing the container to jump from 0×0 → full size.
3. **`useEffect` for error state reset** — runs on every `normalizedSrc` change. Could be replaced with a `key` prop on the image element.
4. **Mixed URL types** — `normalizeRenderableProductImageUrl` returns HTTP URLs, relative paths (`/`), `data:`, and `blob:` URIs. `next/image` only supports HTTP(S) and relative paths.

---

## Strategy

### A. Render split by URL type

Use `next/image` for HTTP(S) and relative URLs. Keep a native `<img>` only for `data:` and `blob:` URIs (unsupported by `next/image`).

### B. Eliminate CLS

- Use `<Image fill />` with a **sized wrapper `<div>`**. Callers already pass `className="h-full w-full object-cover"`, so the wrapper will have explicit intrinsic sizing from the grid/flex parent.
- Add `sizes` prop for responsive image selection.

### C. Remove `useEffect`

Replace the `useEffect`-based error reset with a `key={normalizedSrc}` on the image element. When `src` changes, React unmounts/remounts the element, resetting error state naturally.

### D. Keep `'use client'` minimal

The `onError` handler requires client-side interactivity. Use `'use client'` only for the native-image branch; the `next/image` branch can still work inside the same client component.

---

## Proposed Implementation Sketch

```tsx
'use client'

import Image from 'next/image'
import { FiImage } from 'react-icons/fi'
import { normalizeRenderableProductImageUrl } from '@/lib/productImage'

type ProductImageProps = {
  src?: string | null
  alt: string
  className?: string
  fallbackClassName?: string
  fallbackLabel?: string
  loading?: 'lazy' | 'eager'
}

const isNextImageCompatible = (url: string) =>
  url.startsWith('/') || url.startsWith('http:') || url.startsWith('https:')

export function ProductImage({
  src,
  alt,
  className = 'h-full w-full object-cover',
  fallbackClassName = 'grid h-full w-full place-items-center bg-slate-100 text-slate-500',
  fallbackLabel = 'No product image',
  loading = 'lazy',
}: ProductImageProps) {
  const normalizedSrc = normalizeRenderableProductImageUrl(src)
  const [hasError, setHasError] = useState(false)

  if (!normalizedSrc || hasError) {
    return (
      <div className={fallbackClassName} role="img" aria-label={fallbackLabel}>
        <div className="flex flex-col items-center gap-2 px-2 text-center">
          <FiImage className="text-lg" />
          <span className="text-xs font-semibold uppercase tracking-[0.12em]">
            {fallbackLabel}
          </span>
        </div>
      </div>
    )
  }

  if (isNextImageCompatible(normalizedSrc)) {
    return (
      <div className={className}>
        <Image
          src={normalizedSrc}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          loading={loading}
          onError={() => setHasError(true)}
        />
      </div>
    )
  }

  // data: and blob: URIs — must use native <img>
  return (
    <img
      src={normalizedSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
    />
  )
}
```

---

## Caller Impact

No API changes — `ProductImageProps` stays the same. All 15+ callers across templates 1–6 and medication pages continue to work unchanged. The wrapper `<div className={className}>` preserves the existing layout contract (`h-full w-full object-cover` from the parent's perspective).

---

## Verification

1. `npm run dev` — navigate to each pharmacy template page and verify product images render at correct size with no layout shift.
2. Inspect the DOM — `next/image` should emit a `<img>` with inline `width`/`height` and a `<link rel="preload">` for the optimized srcset.
3. Test error state — set a broken image URL; the fallback `<FiImage>` icon should display.
4. Test data: and blob: URIs — e.g., CSV-imported images should still render via native `<img>`.
