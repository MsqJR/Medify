---
name: Medify
description: The smart clinic platform — build medical websites in minutes
colors:
  primary: "#1B76FF"
  primary-dark: "#0C4EB7"
  primary-light: "#E7F2FF"
  neutral-bg: "#F7F9FC"
  neutral-surface: "#FFFFFF"
  neutral-border: "#DCE3EC"
  neutral-muted: "#556575"
  neutral-ink: "#1A1A1A"
  success: "#28C76F"
  success-light: "#ECFDF5"
  success-border: "#A7F3D0"
  warning: "#FFB020"
  warning-light: "#FFF7ED"
  warning-border: "#FED7AA"
  error: "#FF4C4C"
  error-light: "#FEF2F2"
  error-border: "#FECACA"
  ai-purple: "#7C3AED"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2rem, 4vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-muted}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  input-field:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-ink}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  nav-item:
    rounded: "{rounded.sm}"
    padding: "12px 16px"
---
# Design System: Medify

## 1. Overview

**Creative North Star: "The Smart Clinic"**

Calm, precise, airy. Medify is a medical SaaS platform that feels less like a dashboard and more like a well-run practice — everything has a place, everything is in reach, and nothing demands attention that doesn't deserve it. The atmosphere is clinical-light, not clinical-cold: the white surfaces are pure (unwarmed), the blue is a deliberate trust signal used sparingly, and the Fraunces display face appears only at moments that matter (the landing page hero, section headers that signal a fresh start).

This system explicitly rejects cold institutional aesthetics (no sterile hospital-green, no overused blue-white-gray SaaS trios). It also rejects decoration that doesn't carry meaning — buttons fill only when they're the primary action, cards lift only when they're interactive, and the palette stays restrained so the content (the user's medical brand) does the talking.

**Key Characteristics:**

- Restrained color strategy: one blue accent used at ≤10% of any screen, reserved for primary actions and active state indicators
- Pure neutral background (chroma 0), cool only by the reflected blue from accent elements — no warm tint
- Hybrid elevation: layout surfaces separate via background shifts (white on off-white), interactive surfaces get a shadow
- One type pairing with a clear contrast axis: Fraunces serif (display) + Manrope sans (everything else)
- Consistent form vocabulary across every screen — same radii, same padding, same label position
- Generous whitespace in layout, tighter density where users are in a task (tables, order lists, product grids)

## 2. Colors

The palette has one named accent — Trust Blue — and a pure neutral scale at chroma 0. The neutrals carry no temperature; the blue brings all the emotional weight.

### Primary

- **Trust Blue** (#1B76FF): The accent. Used for primary buttons, active/current navigation items, toggle ON states, focus rings, and blue noise links. Never used decoratively. At ≥4.5:1 against white and ≥3:1 against large text, this blue passes WCAG AA at all required sizes.
- **Trust Blue Dark** (#0C4EB7): Hover state for primary buttons and active nav. The darkened shift is deliberate — the system communicates interactivity through value, not chroma.
- **Trust Blue Light** (#E7F2FF): Background wash for selected navigation items, active filter pills, and light-container highlights. Never used as a text color.

### Neutral

- **Page Background** (#F7F9FC): The base canvas. Chroma 0 white with a barely-there cool reflection. This is the resting surface — dashboards, settings panels, forms.
- **Surface White** (#FFFFFF): Elevated containers — cards, modals, sidebar, dropdowns. On page bg, the 8% lightness shift creates a clean tonal separation without a shadow.
- **Border** (#DCE3EC): Dividers, input strokes, card outlines. Light enough to be present, dark enough to define edges at 2.1:1 against white.
- **Muted** (#556575): Secondary text, placeholder text, icons at rest, disabled labels. At 5.5:1 against white and 5.3:1 against page bg (#F7F9FC), this passes WCAG AA body-text contrast with comfortable margin.
- **Ink** (#1A1A1A): Primary body text, headings, data values. Near-black for maximum readability.

### Semantic

- **Success Green** (#28C76F): Positive confirmations, checkmarks, status badges. Used against white only.
- **Success Light** (#ECFDF5): Background wash for success badges and confirmation banners.
- **Success Border** (#A7F3D0): Border for success containers. Combined with Success Light.
- **Warning Amber** (#FFB020): Star ratings, cautionary indicators, pending states.
- **Warning Light** (#FFF7ED): Background wash for warning badges and cautionary alerts.
- **Warning Border** (#FED7AA): Border for warning containers.
- **Error Red** (#FF4C4C): Destructive actions, validation errors, required-field markers.
- **Error Light** (#FEF2F2): Background wash for error badges and validation alert containers.
- **Error Border** (#FECACA): Border for error containers. Combined with Error Light.
- **AI Purple** (#7C3AED): The chatbot and AI-assistant surfaces. Deliberately distinct from the blue system so users visually distinguish "talking to AI" from "using the platform."

### Named Rules

**The Rarity Rule.** Trust Blue is used on no more than 10% of any given screen. Its scarcity is the point: when the user sees blue, they know something is actionable or active. An interface with scattered blue text, blue borders, and blue icons everywhere has failed this rule.

## 3. Typography

**Display Font:** Fraunces (Georgia, serif)
**Body Font:** Manrope (system-ui, sans-serif)

**Character:** Fraunces brings the personality — a graceful serif with a sharp, contemporary cut that keeps it from feeling old-fashioned. Manrope is the workhorse: clean, wide-aperture modern sans that stays legible at every weight and size. The pairing works because the contrast axis is clear — serif vs. sans, expressive vs. utilitarian, rare vs. everywhere. They never compete for the same job.

### Hierarchy

- **Display** (Fraunces 600, clamp(2rem, 4vw, 3.5rem), 1.15): Landing page hero, section title banners, milestone or welcome screens. The only place Fraunces appears. `text-wrap: balance` applied. Letter-spacing never tighter than -0.02em.
- **Headline** (Manrope 700, 1.5rem, 1.25): Dashboard page titles, modal headers, settings section headings. Fixed rem, no fluid sizing.
- **Title** (Manrope 600, 1.125rem, 1.4): Card titles, sidebar section labels, list item headings.
- **Body** (Manrope 400, 1rem, 1.6): Long-form text, page content, feature descriptions. Max line length 65–75ch; `text-wrap: pretty` applied.
- **Label** (Manrope 500, 0.875rem, 1.4): Form labels, sidebar nav items, button text, table headers, tab labels. Compact and scannable.

### Named Rules

**The One-Family Rule.** Everything except display-grade headings uses Manrope. Using Fraunces for a sidebar label, a button, or a table header is prohibited. The serif earns its place through scarcity.

**The Fixed Rem Rule.** Product UI uses fixed rem sizes. No clamp() on anything below the display tier. Users view at consistent DPI; fluid sizing on a sidebar heading or a table cell helps no one.

## 4. Elevation

Hybrid system: layout surfaces separate through tonal layering (background color shifts), while interactive surfaces earn a shadow. At rest, a card container is distinguished from the page background purely by its white fill against #F7F9FC — no shadow needed. Buttons, toasts, dropdowns, and modals get a defined shadow to signal their interactive or layered nature.

### Shadow Vocabulary

- **Interactive lift** (`0 4px 12px rgba(16, 38, 43, 0.12)`): Dropdown panels, search results, tooltips. Low blur, tight y-offset — feels like the element is close to the surface.
- **Toast / Modal** (`0 8px 24px rgba(0, 0, 0, 0.12)`): Notifications and modals appear above all other content with a medium-lift shadow.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. No element casts a shadow unless it is interactive (dropdown, input on focus) or layered (modal, toast). Cards, buttons, and containers earn their visibility from the border + fill shift, not from a shadow.

## 5. Components

### Buttons

- **Shape:** Gently curved (12px radius). Consistent across all variants.
- **Primary:** Trust Blue fill, white text, 600 weight, 12px 24px padding. On hover, background shifts to Trust Blue Dark and the button lifts 2px (translateY). Focus ring is 2px Trust Blue with 2px offset.
- **Secondary:** White fill, 2px Trust Blue stroke, Trust Blue text. Hover fills the background with Trust Blue Light. No lift movement — secondary actions stay grounded.
- **Ghost:** Transparent background, Muted (#6C7A8A) text. Hover fills with neutral-light. Used for dismiss, cancel, and tertiary actions only.
- **All variants:** 200ms ease transition. `font-weight: 600`. Disabled at 50% opacity with `cursor: not-allowed`.

### Inputs / Fields

- **Style:** 1px Border (#DCE3EC) stroke, white fill, 8px radius. Typography is Label size (0.875rem/500) for the value.
- **Label:** Above the field, 0.875rem/500 Manrope, Ink (#1A1A1A), 8px gap below.
- **Focus:** 2px Trust Blue ring, border disappears (transparent), 12px 16px padding retained.
- **Error:** Border switches to Error Red (#FF4C4C), error message appears below in 0.75rem/500 Error Red, 4px gap above.
- **Disabled:** 50% opacity, Muted (#6C7A8A) text, no focus ring.

### Cards / Containers

- **Corner Style:** Generous curve (20px radius). The only 20px-radius element in the system; cards are visually distinct from buttons and inputs.
- **Background:** Surface White (#FFFFFF) on Page Background (#F7F9FC). No shadow at rest.
- **Border:** 1px solid Border (#DCE3EC). Gives the card a defined edge even against white backgrounds.
- **Internal Padding:** 24px (spacing.lg).
- **States:** Cards that are clickable (onClick prop) gain a pointer cursor. Non-clickable cards have no hover treatment.

### Toggle

- **Shape:** Pill (full border-radius), 11px wide by 6px tall. Track fills Trust Blue when ON, Border (#DCE3EC) when OFF.
- **Thumb:** 4px white circle, 6px translate-x offset when ON, 1px when OFF. 200ms ease transition.
- **Label + description stack:** Label above, description below in Muted (#6C7A8A). 4px gap between them.

### Navigation (Sidebar)

- **Style:** Full-width horizontal items, 8px radius, 12px 16px padding.
- **Default:** Muted (#6C7A8A) text, no background.
- **Hover:** Background fills Trust Blue Light (#E7F2FF), text switches to Ink (#1A1A1A).
- **Active:** Same as hover, plus text weight shifts to 600. A blue badge count appears to the right for orders.
- **Icon:** Lucide icons at 20px, same color as the text label. Active items get the Trust Blue icon tint.

## 6. Do's and Don'ts

### Do:

- **Do** use Trust Blue for exactly one primary action per viewport. Additional actions use Secondary or Ghost.
- **Do** keep neutral backgrounds at chroma 0. No warm tint in the page canvas.
- **Do** use Fraunces only for display-grade headings (hero, welcome screen, section title banners).
- **Do** prefer tonal separation over shadows for layout hierarchy — white cards on off-white background.
- **Do** show skeleton states for loading content, not spinners in the middle of the page.
- **Do** use the same form vocabulary (radii, padding, label position) on every screen.
- **Do** respect reduced motion: animations reduce to instant transitions or none.

### Don't:

- **Don't** use cold or clinical aesthetics — no sterile hospital-green, no overused blue-white-gray SaaS trios.
- **Don't** use Trust Blue decoratively. If it's not indicating action, active state, or focus, it doesn't need blue.
- **Don't** use Fraunces for UI labels, buttons, data, or sidebar items.
- **Don't** use clamp() or fluid sizing below the display typography tier.
- **Don't** put shadows on surfaces that aren't interactive or layered.
- **Don't** decorate with side-stripe borders, gradient text, glassmorphism, uppercase tracked eyebrow labels, or numbered section markers as default scaffolding.
- **Don't** use modal as the first interaction pattern. Exhaust inline and progressive alternatives first.
- **Don't** use same-sized cards with icon + heading + text repeated endlessly.
- **Don't** ship decorative motion that doesn't convey state.
