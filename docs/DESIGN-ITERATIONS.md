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

## 2026-09-28 — UX refinement pass 2

Base: main at 4ee95a69c286ba24553f1122cdb2cd657853577d. Candidate: ed81cfd433def164839cb18ac1b2b1e6a82f2be8 on design/ux-clarity-pass-2.

### Implemented
- Added a separate additive refinement layer after brand.css/editorial.css, keeping the established direction instead of rebuilding the page.
- Refined the header navigation states, hero scale and automotive visual framing, plus clearer section numbering for offers and method.
- Added more deliberate offer-card, budget, progress-rail and FAQ interaction states while preserving all existing content and business rules.
- Upgraded the blog with sticky sub-navigation, stronger editorial hero scale and restrained article-card image/accent interactions.
- Fixed the smallest mobile budget layout by forcing calculator fields to a single column at 460 px and below; the 13 h/20 h selector remains a two-column touch target.
- No pricing, routes, authentication, Supabase/data access, dependencies, paid assets, analytics, infrastructure or GitHub Actions workflows changed.

### Verification
- Git compare before merge: candidate is exactly one commit ahead of main and zero commits behind; only src/index.css and three new refinement stylesheets changed.
- All three new stylesheet imports resolve on the candidate branch.
- GitHub reports Vercel status success for candidate ed81cfd433def164839cb18ac1b2b1e6a82f2be8. The repository build command remains npm test + build-info + tsc + vite build, so the successful deployment status validates that pipeline for this candidate.
- Direct live visual inspection is still unavailable: the Vercel connector denies this project/team and the public deployment cannot be fetched with the available web tool. Do not infer pixel-perfect rendering from the deployment status alone.

### Next priority
After production promotion is confirmed, inspect the real production rendering on desktop/mobile when project access becomes available. Only then tune spacing or visual motion from observed evidence; keep prices in src/lib/offers.ts and the existing site/project structure unchanged.

## 2026-09-28 — Decision cockpit pass 3

Base: main at 051ae5dd31d8eea47b5c6c91ce42ae9613416fbe. Candidate branch: design/decision-cockpit-pass-3.

### Implemented
- Converted the hero’s decorative three-step line into keyboard-accessible shortcuts to Formules, Budget and Méthode.
- Added a compact selection cockpit between the 13 h/20 h choice and the offer cards. It reflects the current volume and both package prices from the existing PRICES source, then links directly to the local estimator.
- Desktop keeps the cockpit visible while comparing plans; tablet/mobile returns it to normal flow and collapses it cleanly.
- Added explicit focus treatment, reduced-motion handling and narrow-screen overflow protection.
- No tariff, route, authentication, Supabase/data, dependency, workflow or infrastructure change.

### Verification completed
- Git compare against main before merge: candidate is ahead only, zero commits behind; changed production files are WebedriveLanding.tsx plus the new refinement-decision.css.
- The landing imports the new stylesheet directly, so no global stylesheet ordering outside this page was altered.
- Vercel preview status for exact candidate commit 4b9201bdc4c43348b691f79c369e71b10d772acc: success. The project build pipeline still runs npm test, build-info generation, TypeScript build and Vite build.
- Direct public-browser inspection remains unavailable from the current web and Vercel fetch paths; do not treat build success as pixel-level proof.

### Next
Merge only after rechecking main has not advanced unexpectedly, then verify Vercel success for the resulting merge commit. Re-attempt /version.json and live rendering verification after deployment; keep that item open if access remains blocked.

