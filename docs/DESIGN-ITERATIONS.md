# WEBEDRIVE — Design iterations

## 2026-09-28 — Editorial automotive direction

Base: main at 54d725e00f4b25348973bd2c01cdedfd4ce594fb. Existing project: fianso936s/blog-auto-ecole, production alias https://blog-auto-ecole.vercel.app. Landing remains /; journal remains /blog.

### Implemented in this candidate
- Full-width deep-blue hero, clearer typographic hierarchy, ivory/sand highlights, self-contained SVG road/car illustration replacing the CSS toy-car and Canvas hero.
- Clearer 13h/20h offer cards with accessible headings, real links to the local budget estimator, revised method section and native disclosure FAQ.
- Shared header/footer and journal typography/cards styled consistently through a separate editorial stylesheet. Existing logo, font, palette tokens, tariffs, inclusions, application routes and authentication are unchanged.
- No dependencies, external image requests, analytics, paid assets, database changes or GitHub Actions workflows added.

### Checks actually performed before this commit
- TypeScript transpile/parse diagnostics: zero errors for the two changed/new TSX components. PostCSS parsed the editorial stylesheet successfully.
- Isolated source-level state harness: 13h/20h change, local budget arithmetic, negative/empty/over-limit extra-hour input handling, pause state passed. This is not the complete React runtime.
- Chromium local snapshot: 1440, 768, 390 and 320 px widths; no document horizontal overflow, native FAQ opens, reduced-motion disables the road animation. Desktop and mobile snapshots visually inspected.
- Snapshot caveats: header/footer and icon modules were stubbed, base layout primitives reconstructed, fallback font used. It is NOT a capture of the complete Vite application or live production. End-to-end authentication, blog data, menu and full application build are not validated by this harness.
- Original quality.test.mjs, package build script and existing safeguards preserved. Actual Vercel preview status must be checked before merging; production status checked after merging. Never infer deployment success from a commit alone.

### Access limitations and next priorities
The Vercel connector returned no authorized teams and denied the project URL. Use the existing Git integration and its GitHub commit status to observe build/deploy results; do not claim a live visual check or bypass protections. Direct production rendering and the exact production alias revision remain to be verified when authorized access is available.

Next: verify the fully built site on mobile/desktop including blog, theme toggle, menu and all anchors, then refine spacing/micro-interactions on this same design rather than restarting from scratch. Keep approved prices in src/lib/offers.ts unchanged. Do not create another project or reinstate removed CI workflows.
