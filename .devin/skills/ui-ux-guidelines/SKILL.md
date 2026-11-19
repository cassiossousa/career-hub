---
name: ui-ux-guidelines
description: Mandatory UI/UX quality bar for all front-end work in this monorepo. Consult before building, restyling, or reviewing any screen, component, form, or layout. Synthesized from 100+ cited sources (design systems, big-tech UX docs, frontend repos). Every rule cites its source; violations are bugs, not taste.
---

# UI/UX Guidelines — Evidence-Based Standard

This skill is the monorepo's UI/UX constitution. It was synthesized from the design systems and UX documentation of major companies (Google/Material, Apple, Microsoft/Fluent, IBM/Carbon, Shopify/Polaris, GitHub/Primer, Atlassian, Adobe/Spectrum, Salesforce/Lightning, Uber/Base Web, GOV.UK, USWDS), accessibility authorities (W3C/WAI, WCAG 2.2, WebAIM, NN/g), performance authorities (web.dev/Core Web Vitals, Chrome for Developers), psychology of UX (Laws of UX, NN/g), and the contributor docs of major frontend repos (facebook/react, mui/material-ui, vercel/next.js, radix-ui, shadcn/ui, adobe/react-spectrum, microsoft/fluentui, atlassian/atlaskit, storybookjs). Full source list at the bottom — cite sources when a decision is contested.

## 0. The Prime Directive

**Never ship a control, layout, or state that the user must fight.** Every rule below exists because real companies measured real failures. When two rules conflict, accessibility and error prevention win. Sources: NN/g heuristics, WCAG 2.2, GOV.UK.

---

## 1. Layout, Grids & Responsive Design

1. **Content must be usable at 360px width without horizontal scrolling of the page.** Horizontal scrolling is acceptable ONLY for explicitly scrollable regions (carousels, code blocks, wide tables) — never as the default way to fit a row of cards. Sources: M3 layout, Primer responsive guidelines, web.dev CLS.
2. **Cards/chips/columns must wrap to new lines when they don't fit.** Use `flex-wrap: wrap` or CSS grid `repeat(auto-fill, minmax(Npx, 1fr))`. Never force `minWidth: 'max-content'` + `overflowX: auto` to cram fixed columns. Sources: M3 grids & spacing, Carbon 2x Grid.
3. **Use a consistent spacing scale (multiples of 4/8px).** Do not invent arbitrary gaps per component. Sources: M3 spacing tokens, Carbon spacing scale, Fluent 2 design tokens.
4. **Spacing groups related content; whitespace separates unrelated content.** Proximity is the primary grouping mechanism before borders/shadows. Sources: M3 grids & spacing, Gestalt principles (Laws of UX).
5. **Desktop layouts get more generous spacing than mobile.** Density is a deliberate choice per breakpoint, not an accident. Source: M3 grids & spacing.
6. **Design for the canonical app shell:** fixed header + scrollable content region + reserved sidebar space. Permanent sidebars must reserve their width (`margin-left`/`padding`) so content never sits under them; temporary drawers on mobile. Sources: M3 canonical layouts, Primer page layout.
7. **Text must survive 200% zoom / large text without clipping or overlap.** Adjacent elements may need to stack vertically; containers must grow in height. Sources: Apple HIG layout (Dynamic Type), WCAG 1.4.4/1.4.10.
8. **Bidirectionality:** layouts must not hard-code left/right assumptions that break RTL. Source: M3 layout overview.
9. **Content width for readability:** long-form text should be capped (~65–75ch); dashboards may go wider. Source: Carbon 2x Grid, typographic conventions.

## 2. Typography

1. **Use a type scale (e.g., 12/14/16/20/24/32/48) with semantic variants — never one-off font sizes.** Sources: M3 type scale, Atlassian typography, Carbon type tokens.
2. **Minimum legible sizes:** 16px body on web is the safe floor for long text; never ship body text under 12px. Sources: Apple HIG typography (11pt min), Atlassian (avoid 12px except fine print), web.dev.
3. **Avoid light font weights for small text** (100–300). Prefer Regular/Medium/Semibold. Source: Apple HIG typography.
4. **Maximize ~2 typefaces; establish hierarchy with size/weight/color, not more fonts.** Source: Apple HIG typography.
5. **Line height scales inversely with size; long-form body ≥ 1.5.** Sources: M3 type, typographic best practice (Bringhurst via web typography guides).
6. **Translated text is longer — size inputs by the longest locale string, not English.** pt-BR and de-DE run 20–35% longer than en-US. Give controls `min-width`, `flex: 1`, and let labels wrap or use `noWrap` only on chips with `textOverflow: ellipsis`. Sources: W3C i18n, WCAG 1.4.4, hard-won repo bug class.
7. **Never truncate critical information silently** — if a label is cut, the control is under-sized, not "fine". Sources: WCAG 1.4.4, NN/g error guidelines applied to labels.

## 3. Color, Contrast & Themes

1. **WCAG 2.2 AA minimums (non-negotiable):** 4.5:1 for normal text, 3:1 for large text (≥24px, or ≥18.66px bold) and for UI component boundaries/states. Source: WCAG 1.4.3/1.4.11, Atlassian color, Chrome color guidance.
2. **Never use color alone to convey state.** Pair color with icon, text, or shape. Colorblind users (~350M) cannot distinguish red/green status. Sources: WCAG 1.4.1, NN/g error guidelines, Chrome color guidance.
3. **Avoid pure white and pure black.** Pure white causes glare; pure black causes halation on dark backgrounds. Use off-whites (e.g., `#fafafa`) and off-blacks for surfaces/text-adjacent. Source: web.dev prefers-color-scheme.
4. **Dark mode is a first-class theme, not an inversion.** Define separate surface/elevation/border tokens; shadows barely read on dark — use lighter surfaces + borders for elevation. Sources: Apple HIG dark mode, Fluent 2 styling (fillColor/layer tokens), Chrome dark mode.
5. **Respect `prefers-color-scheme` and `prefers-contrast` unless the product deliberately forces a theme** — if forcing, do it via an explicit user control, not silently. Sources: Chrome dark mode, MDN prefers-color-scheme.
6. **Selected ≠ focused ≠ hover ≠ error ≠ disabled.** Each interaction state gets a distinct token; never reuse link/brand colors for selection. Sources: Atlassian color states, WCAG 2.4.7/2.4.11.
7. **Destructive actions use a distinct destructive color AND confirmation/undo** — not just red text. Sources: NN/g error prevention, GOV.UK, Carbon.

## 4. Spacing, Elevation, Borders & Surfaces

1. **Elevation is a limited ladder (0–5), not a free parameter.** Resting content sits at 0–1; hover/drag raises one level; modals at top. Source: M3 elevation.
2. **Surfaces need three separation cues: tonal difference, edge (border), or shadow — at least one must be visible.** On dark themes, borders/tonal steps carry more weight than shadows. Source: M3 applying-elevation, Fluent 2 fillColor.
3. **Cards need visible containment**: border (1px, ≥3:1 against adjacent surface where it's the only boundary) OR clearly visible shadow + background difference. A card that "blends into the background" is a bug. Sources: WCAG 1.4.11, M3, user-reported repo bug class.
4. **Radius is standardized per component size** (e.g., 8/12/16px); don't mix radii randomly. Sources: M3 shape scale, Atlassian radius.
5. **Borders define groups; prefer whitespace for grouping, borders for separation of unlike content.** Source: M3 grids & spacing.

## 5. Buttons, Controls & Touch Targets

1. **Minimum touch target: 24×24px CSS (WCAG 2.2 AA, 2.5.8); aim for 44×44px** where space allows (Apple HIG). Source: WCAG 2.5.8, Apple HIG.
2. **One primary action per view/region.** Secondary actions are visually subordinate (tonal/outlined/text). Sources: M3 buttons, GOV.UK, NN/g minimalist design.
3. **Destructive actions are visually distinct, separated from primary flow, and confirmable.** Sources: NN/g error prevention, GOV.UK.
4. **Every interactive element must be reachable and operable by keyboard** with a visible focus indicator (≥3:1 against background, not obscured). Sources: WCAG 2.1.1/2.4.7/2.4.11, Radix accessibility, Primer.
5. **Never build clickable `div`s.** Use `<button>`, `<a>`, or components with correct semantics (MUI `CardActionArea`, Radix primitives). If you must compose, the element must be focusable, have role/aria, and respond to Enter/Space. Sources: Radix accessibility, WAI-ARIA APG, WCAG 4.1.2.
6. **Disabled controls must look disabled AND be actually non-interactive** — don't just gray out; prevent activation. Source: WCAG, M3.
7. **Toggle/switch controls must expose state** (`aria-pressed`, `aria-checked`, or native checked) — a visual-only toggle is inaccessible. Source: WCAG 4.1.2, Radix.
8. **Icon-only buttons require `aria-label`.** Sources: WCAG 4.1.2, WAI-ARIA APG.

## 6. Forms & Inputs

1. **Every input needs a programmatic label** (`<label>`, `aria-label`, or `aria-labelledby`) — placeholder text is NOT a label (it disappears and often fails contrast). Sources: WCAG 1.3.1/3.3.2, GOV.UK, Polaris form layout.
2. **Labels sit above the field, are short (1–3 words), sentence case.** Sources: Polaris form layout, GOV.UK.
3. **Use the right input type** (`email`, `tel`, `url`, `number`, `date`, `search`) for correct mobile keyboards and semantics. Sources: Polaris field types, HTML spec.
4. **Validate on submit, not on blur/keystroke** unless the field is error-prone or the user needs real-time guidance. Never show errors before the user has provided input. Sources: GOV.UK validation, NN/g error guidelines (avoid premature errors).
5. **Errors: state what went wrong + how to fix it, in plain language, next to the field, with a summary at top for long forms.** Never "Something went wrong." Never blame the user. Keep user input on error — never clear fields. Sources: GOV.UK error message/summary/validation, NN/g error-message guidelines + scoring rubric, Agriculture DS.
6. **Errors must not rely on color alone** — icon/text + border. Source: WCAG 1.4.1, NN/g rubric.
7. **Long forms: group with section headings, progressive disclosure, logical order, only required fields.** >5 inputs → sections/cards or separate page. Source: Polaris forms guidance.
8. **Provide hint text for format requirements** (e.g., date format) before the error occurs. Source: GOV.UK, Home Office error guidance.
9. **Autocomplete attributes on personal-data fields** (`name`, `email`, `tel`, `address-line1`…). Source: WCAG 1.3.5.
10. **Inputs must size for their content in every locale** — see Typography §6.

## 7. Feedback, Loading, Empty & Error States

1. **Every async region needs all four states: loading, error, empty, success.** A missing state is a bug. Sources: NN/g empty-state guidelines, Agriculture DS loading/error/empty pattern, Polaris.
2. **Loading:** show skeletons or spinners with accessible status (`role="status"`, `aria-live="polite"`); long operations need determinate progress or honest indeterminate messaging. Source: NN/g visibility of system status, WCAG 4.1.3.
3. **Empty states are onboarding opportunities**: explain what would appear here and give a direct path to create/populate it (link/button). Never a blank area. Source: NN/g empty-state-interface-design.
4. **Filtered-to-zero is different from never-had-data**: say "No results match your filters" + offer to clear filters. Source: NN/g, Agriculture DS.
5. **Errors must name the actual failure** (e.g., "Couldn't load jobs — the server returned 404"), never a generic "An error occurred". Include retry where sensible. Sources: NN/g error guidelines + top-10 mistakes, Agriculture DS.
6. **Success feedback for actions** (toast/snackbar or inline confirmation) — but don't over-toast; persistent state changes should be visible in the UI itself. Sources: NN/g visibility of status, M3 snackbar.
7. **Optimistic UI is allowed only with rollback on failure.** Source: Primer contributor docs, general practice.

## 8. Navigation & Information Architecture

1. **Navigation landmarks**: `<nav>` with accessible label; current page indicated (`aria-current="page"`). Sources: WCAG 1.3.1/4.1.2, WAI-ARIA APG, Primer.
2. **Mobile nav collapses to a drawer/hamburger with an `aria-label`ed trigger and focus management** (focus moves into drawer, Escape closes, focus returns). Sources: Radix Dialog/Navigation Menu, WAI-ARIA APG dialog pattern.
3. **Breadcrumbs/deep links for nested content**; browser back must work. Sources: NN/g, GOV.UK.
4. **Recognition over recall**: keep options visible; don't make users remember commands/paths. Source: NN/g heuristic #6.
5. **Hick's Law: cap choices per decision point** (~7±2); group, prioritize, progressively disclose. Sources: Laws of UX (Hick, Miller), NN/g.
6. **Fitts's Law: frequent/destructive-adjacent targets are large and easy to reach; destructive actions can be placed to reduce accidental hits.** Sources: Laws of UX (Fitts).
7. **User control & freedom: undo > confirm for reversible actions; every modal needs a clear escape.** Sources: NN/g heuristics #3/#5, GOV.UK.

## 9. Accessibility (WCAG 2.2 AA — hard floor)

1. **Target WCAG 2.2 AA.** All success criteria at level AA must pass. Source: WCAG 2.2.
2. **Keyboard:** all functionality operable via keyboard; no keyboard traps; logical tab order; visible focus. Sources: WCAG 2.1.1/2.1.2/2.4.3, WAI-ARIA APG.
3. **Screen readers:** correct landmarks (`header`, `nav`, `main`, `footer`), headings in order (one `h1`, no skipped levels), `alt` text on informative images (`alt=""` on decorative), live regions for async updates. Sources: WCAG 1.3.1/1.1.1/4.1.3, WAI-ARIA APG.
4. **Focus management in overlays:** on open, focus moves inside; while open, focus is contained; on close, focus returns to trigger. Sources: WAI-ARIA APG dialog, Radix.
5. **`prefers-reduced-motion`:** disable non-essential animation; never convey info by motion alone. Sources: WCAG 2.3.3 (AAA but best practice), Atlassian accessibility.
6. **Don't rely on hover for critical content** — touch/keyboard users can't hover. Sources: WCAG 1.4.13, NN/g.
7. **Target size ≥24px; spacing between targets.** WCAG 2.5.8.
8. **Language of page declared** (`<html lang>`); language changes marked (`lang` attr). WCAG 3.1.1/3.1.2.
9. **Motion/animation:** keep purposeful animations 100–500ms; ease, don't bounce excessively. Source: NN/g error rubric (animation timing), M3 motion.
10. **Test with keyboard-only navigation and a screen reader (or axe/Lighthouse) before claiming done.** Sources: repo `audit:deep` precedent, WCAG.

## 10. Content, Microcopy & i18n

1. **Plain language at ~7th–8th grade reading level; no jargon, no internal codes shown to users.** Sources: NN/g error guidelines, GOV.UK content, Atlassian content (ages 12–14).
2. **Buttons say what they do** ("Save changes", not "OK"/"Submit" where ambiguous). Sources: GOV.UK, NN/g.
3. **Sentence case for UI labels; consistent terminology across the app.** Sources: Polaris, GOV.UK, NN/g consistency.
4. **Never show raw enum values or API errors to users** — map to human text. Source: NN/g, GOV.UK.
5. **i18n: all user-visible strings through the i18n layer; no hardcoded literals; pluralization and date/number formatting via `Intl`.** Keys must exist in ALL locales — missing keys are bugs. Sources: W3C i18n, repo i18n architecture.
6. **RTL-ready:** use logical CSS properties (`margin-inline-start`, not `margin-left`) where feasible. Source: M3 bidirectionality, W3C i18n.
7. **Dates/times/numbers via `Intl` with the active locale** — never hand-rolled formats. Source: MDN Intl, W3C i18n.

## 11. Performance & Stability

1. **Core Web Vitals budgets:** LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 (75th percentile). Sources: web.dev vitals + thresholds.
2. **CLS prevention:** reserve space for images/media (`width`/`height`/`aspect-ratio`), skeletons with fixed dimensions, no late-injected banners above content. Source: web.dev optimize-cls.
3. **INP:** keep event handlers cheap; heavy work off the main thread; avoid long tasks >50ms. Source: web.dev inp.
4. **No layout thrash:** batch DOM reads/writes; prefer CSS containment. Source: web.dev.
5. **Responsive images:** `srcset`/`sizes`, modern formats, lazy-load below-fold. Source: web.dev.
6. **Don't ship unused JS/CSS** — tree-shake, code-split routes. Source: web.dev, Vite/Rollup docs.

## 12. Data Display (Tables, Lists, Cards, Kanban)

1. **Tables:** real `<table>` semantics with `<th scope>`; horizontal scroll ONLY inside a dedicated scroll container with a visible affordance; sticky headers for long tables; responsive collapse to cards/list on narrow screens. Sources: Polaris table, WAI-ARIA APG grid/table, M3.
2. **Kanban/pipeline boards:** columns wrap or scroll within the board region only; cards have consistent width, elevation, and truncation rules; drag interactions need keyboard-accessible alternatives (move buttons). Sources: NN/g complex apps, WAI-ARIA APG, Laws of UX (Fitts — drag targets).
3. **Lists:** consistent row height rhythm; metadata secondary; primary info first (scanability). Sources: NN/g scanning research, M3 lists.
4. **Badges/chips:** text label + optional icon; color reinforces, never alone; max ~2–3 per card. Sources: M3 chips, WCAG 1.4.1.
5. **Scores/metrics:** show the number AND its meaning ("82% match — 3 of 5 requirements proven"); never a bare color-coded score. Sources: NN/g recognition, WCAG.

## 13. Component API & Code Quality (repo-facing)

1. **Compose from design-system primitives** (MUI + `packages/ui` theme) before custom CSS; never fight the theme with `!important`. Sources: Primer design guidelines, MUI docs.
2. **Variants via props/`sx` theme-aware values — not per-instance magic numbers.** Sources: MUI customization, Fluent tokens.
3. **Component APIs: ≤6 props; decompose beyond that.** Repo AGENTS.md + Primer API guidance.
4. **Headless-first for complex widgets** (dialog, menu, combobox): behavior from accessible primitives (Radix/MUI), styling ours. Sources: Radix, Primer contributor docs.
5. **No `any`, no `as unknown as`, no `@ts-ignore`** in UI code; narrow API data at boundaries. Repo AGENTS.md.
6. **Every visual change must be verified in BOTH themes/locales and at 360px + desktop widths.** Repo `audit:deep` precedent (360px pt-BR overflow checks).
7. **Dead UI code is a bug** — no commented-out JSX, no unused props/exports. Repo knip/jscpd gates.

## 14. Pre-Ship UI Checklist (run mentally before every UI diff)

- [ ] Works at 360px, 768px, 1280px+ — no page-level horizontal scroll; cards/chips wrap.
- [ ] All strings translated in en + pt-BR; inputs sized for the longest locale; no truncated labels.
- [ ] Every input has a real label; placeholders are examples, not labels.
- [ ] Loading, error (with REAL message), empty, and success states exist for every async region.
- [ ] Keyboard-only walkthrough passes: tab order logical, focus visible, Esc closes overlays, focus returns.
- [ ] Contrast ≥4.5:1 text / ≥3:1 UI boundaries in BOTH themes; status not color-only.
- [ ] Touch targets ≥24px (aim 44px); destructive actions confirmed/undone.
- [ ] No pure-white background glare in dark mode; surfaces/borders give cards visible containment.
- [ ] CLS-safe: images/media have dimensions; skeletons match final layout.
- [ ] `npm run verify:all` (and `audit:deep` for visual/runtime changes) exits 0.

---

## Source Corpus (~100+ cited sources)

### Design systems — layout, spacing, elevation, color

- Material Design 3 — Layout overview: https://m3.material.io/foundations/layout/layout-overview
- M3 — Grids & spacing: https://m3.material.io/foundations/layout/grids-spacing/spacing
- M3 — Spacing tokens: https://m3.material.io/styles/spacing/tokens
- M3 — Elevation tokens: https://m3.material.io/styles/elevation/tokens
- M3 — Applying elevation: https://m3.material.io/styles/elevation/applying-elevation
- Apple HIG — Layout: https://developer.apple.com/design/human-interface-guidelines/layout.md
- Apple HIG — Typography: https://developer.apple.com/design/human-interface-guidelines/typography.md
- Apple HIG — Dark Mode: https://developer.apple.com/design/human-interface-guidelines/dark-mode.md
- Apple — UI Design Dos and Don'ts: https://developer.apple.com/design/tips/
- Fluent 2 — Develop/get started: https://fluent2.microsoft.design/get-started/develop/
- Fluent 2 — Web components (React): https://fluent2.microsoft.design/components/web/react/
- Fluent UI Web Components — Styling/tokens: https://learn.microsoft.com/en-us/fluent-ui/web-components/getting-started/styling
- Carbon — 2x Grid: https://www.carbondesignsystem.com/building-blocks/foundations/2x-grid/guidelines
- Carbon — Spacing: https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview
- Carbon — Components overview: https://www.ibm.com/standards/carbon/components/overview
- Shopify — App Design Guidelines: https://shopify.dev/docs/apps/design
- Shopify Polaris — Forms and saving: https://shopify.dev/docs/apps/design/user-experience/forms
- Shopify Polaris — Web components: https://shopify.dev/docs/api/app-home/latest/web-components
- GitHub Primer — React: https://primer.style/product/getting-started/react/
- Primer — Components: https://primer.github.io/design/components/
- Primer — Contribute/design: https://primer.github.io/design/guides/contribute/design/
- Primer React — contributor style guide: https://github.com/primer/react/blob/main/contributor-docs/style.md
- Atlassian Design — Foundations: https://atlassian.design/foundations
- Atlassian — Accessibility: https://atlassian.design/foundations/accessibility
- Atlassian — Color: https://atlassian.design/foundations/color
- Atlassian — Applying typography: https://atlassian.design/foundations/typography/applying-typography/
- Adobe Spectrum Web Components: https://opensource.adobe.com/spectrum-web-components/
- Spectrum SWC — Styles/tokens: https://opensource.adobe.com/spectrum-web-components/tools/styles/
- GOV.UK — Error message: https://design-system.service.gov.uk/components/error-message/
- GOV.UK — Error summary: https://design-system.service.gov.uk/components/error-summary/
- GOV.UK — Validation pattern: https://design-system.service.gov.uk/patterns/validation/
- GOV.UK — Text input: https://design-system.service.gov.uk/components/text-input/
- Home Office — Error messages: https://design.homeoffice.gov.uk/accessibility/interactivity/error-messages
- USWDS (GSA) — Design system: https://designsystem.digital.gov/
- Agriculture DS — Loading/empty/error pattern: https://design-system.agriculture.gov.au/patterns/loading-error-empty-states

### Accessibility

- WCAG 2.2 (W3C Recommendation): https://www.w3.org/TR/WCAG22/
- W3C WAI — WCAG overview: https://www.w3.org/WAI/standards-guidelines/wcag/
- What's New in WCAG 2.2: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- Understanding WCAG 2.2: https://www.w3.org/WAI/WCAG22/Understanding/
- WAI-ARIA Authoring Practices Guide: https://www.w3.org/WAI/ARIA/apg/
- WebAIM — Contrast ratio: https://webaim.org/articles/contrast/
- WebAIM — Keyboard accessibility: https://webaim.org/articles/keyboard/
- MDN — Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- web.dev — Learn accessibility: https://web.dev/learn/accessibility
- Inclusive Components (Heydon Pickering): https://inclusive-components.design/
- A11y Project: https://www.a11yproject.com/
- Radix UI — Accessibility overview: https://www.radix-ui.com/primitives/docs/overview/accessibility
- Radix UI — Introduction: https://www.radix-ui.com/primitives/docs/overview/introduction
- Radix UI — Composition: https://www.radix-ui.com/primitives/docs/guides/composition

### UX research & heuristics

- NN/g — 10 Usability Heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
- NN/g — Empty-state design: https://www.nngroup.com/articles/empty-state-interface-design/
- NN/g — Error-message guidelines: https://www.nngroup.com/articles/error-message-guidelines/
- NN/g — Error messages scoring rubric: https://www.nngroup.com/articles/error-messages-scoring-rubric/
- NN/g — Top 10 application-design mistakes: https://www.nngroup.com/articles/top-10-application-design-mistakes/
- NN/g — Heuristics for complex applications: https://www.nngroup.com/articles/usability-heuristics-complex-applications/
- Laws of UX — all laws: https://lawsofux.com/laws/
- Laws of UX — Psychology of design: https://lawsofux.com/articles/2018/the-psychology-of-design/
- UX Design Institute — Laws of UX: https://www.uxdesigninstitute.com/blog/laws-of-ux/
- Toptal — Laws of UX infographic: https://www.toptal.com/designers/ux/laws-of-ux-infographic
- Baymard Institute — UX research: https://baymard.com/blog
- Refactoring UI: https://www.refactoringui.com/
- Eight Shapes — content design: https://www.eightshapes.com/

### Performance & platform

- web.dev — Web Vitals: https://web.dev/articles/vitals
- web.dev — Defining Core Web Vitals thresholds: https://web.dev/articles/defining-core-web-vitals-thresholds
- web.dev — Optimize CLS: https://web.dev/articles/optimize-cls
- web.dev — Cumulative Layout Shift: https://web.dev/articles/cls
- web.dev — Interaction to Next Paint: https://web.dev/articles/inp
- web.dev — prefers-color-scheme: https://web.dev/articles/prefers-color-scheme
- Chrome — Dark mode guidance: https://developer.chrome.com/docs/modern-web-guidance/guides/visual-design/dark-mode
- Chrome — Color guidance: https://developer.chrome.com/docs/modern-web-guidance/guides/visual-design/color
- MDN — prefers-color-scheme: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme

### Frontend repo / framework docs

- React docs: https://react.dev/
- React — Learn: https://react.dev/learn
- MUI — Material UI docs: https://mui.com/material-ui/
- MUI — Theme customization: https://mui.com/material-ui/customization/theme-components/
- MUI Base (headless): https://mui.com/base-ui/
- Vite guide: https://vite.dev/guide/
- TanStack Query: https://tanstack.com/query/latest
- Zustand: https://zustand.docs.pmnd.rs/
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/
- Headless UI: https://headlessui.com/
- Radix UI components: https://www.radix-ui.com/primitives/docs/components
- Adobe React Spectrum (React Aria): https://react-spectrum.adobe.com/
- Atlassian — Atlaskit: https://atlassian.design/components
- Salesforce Lightning Design System: https://www.lightningdesignsystem.com/
- Uber Base Web: https://baseweb.design/
- Ant Design: https://ant.design/docs/spec/introduce
- Storybook docs: https://storybook.js.org/docs
- Next.js docs: https://nextjs.org/docs
- floating-ui: https://floating-ui.com/
- inclusive.microsoft.design — Inclusive design: https://inclusive.microsoft.design/
- InVision DesignBetter: https://www.designbetter.co/
- Smashing Magazine: https://www.smashingmagazine.com/
- GOV.UK content/design guidance: https://www.gov.uk/service-manual
- W3C — Internationalization: https://www.w3.org/International/
- MDN — Intl API: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl

### Key repos studied (patterns absorbed)

- facebook/react — composition, hooks rules, concurrent safety
- mui/material-ui — theme tokens, sx system, component API conventions
- vercel/next.js — app router, metadata, image optimization patterns
- radix-ui/primitives — headless accessible behavior layer
- shadcn-ui/ui — copy-in component ownership model
- adobe/react-spectrum + spectrum-web-components — token-driven styling, a11y defaults
- microsoft/fluentui — token layers, controlled/uncontrolled patterns
- atlassian/atlaskit — token-first components, cross-platform parity
- primer/react — SSR-safe components, focus management via events not effects
- Shopify/polaris-react — form/table patterns, host-surface consistency
- carbon-design-system/carbon — grid/spacing/token foundations
- storybookjs/storybook — visual regression + a11y addon testing practices
- TanStack/query — server-state separation (pairs with repo's no-useEffect-fetch rule)
- vitejs/vite — build-time optimization, bundle discipline

## How to use this skill

1. **Before building a screen/component:** read §1–§8 relevant sections; pick the canonical pattern from a cited design system rather than inventing.
2. **During review:** run the §14 checklist; any unchecked item is a defect to fix or explicitly justify.
3. **When rules conflict:** WCAG 2.2 AA > error prevention > user control > aesthetics. Cite the source in the PR/commit when deviating.
4. **Repo gates still apply:** `verify:all`, `audit:deep`, `check:mutate:diff` — this skill guides WHAT to build; AGENTS.md governs HOW it merges.
5. **Keep this file alive:** when a new authoritative source changes a rule, update the rule AND its citation here — never leave stale guidance.

_Last synthesized: 2025. Sources verified via web research; canonical doc URLs are stable but may reorganize — search the org name if a link 404s._
