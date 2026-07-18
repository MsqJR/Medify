# Refactor Plan: File #4 — PharmacySubdomainWrapper.tsx

**File:** `app/[subdomain]/PharmacySubdomainWrapper.tsx`
**Rule Vector:** Bloated client bundle (`bundle-dynamic-imports`)
**Priority:** CRITICAL

---

## Issues

1. **Static imports of all 6 template pages** (lines 11–16) — every template is a `'use client'` component weighing 278–703 lines each. Each imports `react-icons/fi`, `ProductImage`, `BrandLogo`, cart logic, etc. **The browser downloads ~2,764 lines of template JS + all their transitive dependencies regardless of which template is active.**

2. **Only 1 of 6 templates renders** — the switch on `template_id` picks one, but the other 5 are still bundled, parsed, and executed. Estimated wasted JS: **~65 KB per page load** (icons alone are heavy).

3. **Loading state is generic** — a single "Loading pharmacy..." spinner. Once split, we can show a template-specific skeleton.

---

## Strategy

### A. Replace static imports with `next/dynamic`

Use `next/dynamic` with named exports to code-split each template. Only the active template's chunk is loaded.

### B. Dynamic import map

Build a `Record<number, LucideComponent>` mapping `template_id` to its dynamic import. This avoids a switch statement and makes the mapping declarative.

### C. Keep Suspense boundary

`next/dynamic` returns a component that can be wrapped in `<Suspense>` for a loading fallback.

---

## Proposed Implementation Sketch

```tsx
'use client'

import React, { useEffect, useState, useMemo, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { notFound, useSearchParams } from 'next/navigation'
import { SubdomainPublicInfo } from '@/lib/subdomainApi'
import { setSiteOwnerId, setSiteItem, setPublicSiteItem, getSiteOwnerId } from '@/lib/storage'
import { pharmacyApi } from '@/lib/pharmacy'
import { getPharmacyThemeCssVariables, normalizePharmacyThemeSettings } from '@/lib/pharmacyTheme'

const templatePages: Record<number, React.LazyExoticComponent<React.ComponentType<{}>>> = {
  1: dynamic(() => import('@/app/templates/pharmacy/1/page'), {
    loading: () => <div className="min-h-screen flex items-center justify-center">Loading template...</div>,
  }),
  2: dynamic(() => import('@/app/templates/pharmacy/2/page')),
  3: dynamic(() => import('@/app/templates/pharmacy/3/page')),
  4: dynamic(() => import('@/app/templates/pharmacy/4/page')),
  5: dynamic(() => import('@/app/templates/pharmacy/5/page')),
  6: dynamic(() => import('@/app/templates/pharmacy/6/page')),
}

interface Props {
  subdomainInfo: SubdomainPublicInfo
}

export default function PharmacySubdomainWrapper({ subdomainInfo }: Props) {
  const [themeSettings, setThemeSettings] = useState(() => normalizePharmacyThemeSettings(null))
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    setSiteOwnerId(subdomainInfo.owner_id)

    const init = async () => {
      try {
        const profileRes = await pharmacyApi.getProfile()
        if (profileRes.data?.theme_settings) {
          setThemeSettings(normalizePharmacyThemeSettings(profileRes.data.theme_settings))
        }
      } catch {
        // fall back to cached
      } finally {
        setIsInitializing(false)
      }
    }

    init()
  }, [subdomainInfo])

  const themeVariables = useMemo(
    () => getPharmacyThemeCssVariables(themeSettings),
    [themeSettings],
  )

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center">Loading pharmacy...</div>
  }

  const TemplateComponent = templatePages[subdomainInfo.template_id] ?? templatePages[1]

  return (
    <div className="pharmacy-theme-root" style={themeVariables as React.CSSProperties}>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading template...</div>}>
        <TemplateComponent />
      </Suspense>
    </div>
  )
}
```

---

## Caller Impact

Zero. The `Props` interface (`{ subdomainInfo: SubdomainPublicInfo }`) is unchanged. The calling page (`[subdomain]/page.tsx`) passes the same prop as before.

---

## Verification

1. `npm run build` — verify each template produces a separate chunk (check terminal output for `chunk` entries per template).
2. `npm run dev` — load a subdomain with `template_id=1`; verify only template 1's JS is loaded in DevTools Network tab (no chunks for templates 2–6).
3. Navigate to a subdomain with `template_id=3`; verify only template 3's chunk loads.
4. Test the fallback — set an unknown `template_id`; template 1 should render as default.
5. Check loading states — the dynamic `loading` fallback should show during chunk fetch.
