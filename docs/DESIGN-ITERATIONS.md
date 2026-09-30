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

## 2026-09-30 — Experience polish pass 22

Branch: `design/experience-polish-pass-22`. The branch continues the merged 3D direction; production `main@3fb6c5f84f7ba9544cc522e2a07d66b82adf0e32` differs from its previous head only by a redeploy-only commit, so this candidate is based on the same source tree and keeps that history as its parent.

### Implemented
- Made the 3D opt-out reversible: disabling the live scene returns to the poster and the same explicit “Explorer en 3D” action can start it again.
- Added `aria-busy` while the runtime loads and removed the duplicate SVG image label so the visible figure caption remains the single textual description.
- Converted the poster caption into a compact in-card badge and let the WebGL layer occupy the full artwork surface, removing the hard-coded 31 px caption gap that crowded narrow screens.
- Preserved poster-first fallback, reduced-motion / Save-Data behavior, mobile explicit activation, offers, prices, simulator, routes and blog.

### Checks prepared in this pass
- Added source-level regression guards in `scripts/quality.test.mjs` for reversible controls, singular poster labelling and the full-bleed visual contract.
- Public rendering could not be fetched from the available Vercel/web readers, so no live screenshot is claimed. Validation must rely on the exact branch commit checks plus targeted local syntax/source checks where available.

### Next priority
Inspect the exact built candidate on desktop/mobile when browser access is available, then tune ribbon camera framing and visual density from observed rendering rather than changing direction.


## 2026-09-30 — Mobile automotive continuity pass 23

Branch: `design/experience-polish-pass-22`, continuing cumulatively from the validated pass-22 candidate.

### Diagnosis and correction
The first pass-23 candidate (`7c9f8421d417ac300482860726301bb2df56f766`) failed its Vercel check. A full stylesheet re-read found that the earlier source inspection had stopped before the later runtime mobile override: the real `.wd-experience-visual` is deliberately restored to `display: block` below 1024 px, and `Experience3D` already renders the mobile poster. The failed candidate therefore duplicated that visual and also added an invalid test assumption about the existing 5:4 runtime crop.

### Implemented
- Removed the duplicate landing-level poster from the failed candidate and kept one canonical automotive visual through `Experience3D`.
- Added a compact three-step rail — Comprendre, Organiser, Avancer — directly under the real mobile/tablet 3D/poster stage.
- Kept the existing poster-first fallback, explicit mobile 3D activation, reduced-motion / Save-Data behavior, offers, prices, simulator, routes and blog unchanged.
- Kept the rail hidden on desktop so the existing sticky composition remains untouched.

### Checks before the correction commit
- Re-read the exact failed branch head, the full later mobile runtime CSS override and the four touched source blobs before writing.
- Replaced the guaranteed-failing source assertion with guards for one canonical visual and the mobile journey rail.
- No live screenshot is claimed because the current readers still cannot render the protected/public candidate. The exact correction SHA must pass the existing Vercel build pipeline after commit.

### Next priority
Once the corrected candidate is green, inspect its real desktop/mobile rendering when browser access is available and tune spacing or 3D camera density only from observed evidence.


## 2026-09-30 — Interactive HUD polish pass 24

Branch: `design/experience-polish-pass-22`, continuing cumulatively from pass 23.

### Implemented
- Reworked the 3D control treatment into a full-width automotive HUD instead of a floating button: the visual now exposes a concise “Vue du parcours” state and keeps the action grouped with that state.
- Added live state copy for poster, loading, active 3D, error fallback, reduced-motion and Save-Data modes without changing the underlying progressive-enhancement rules.
- On touch layouts, the HUD now leaves the artwork flow and sits below the stage, preventing the 3D control from covering the car/road composition; at 420 px and below the action expands to the available width.
- Kept the existing three-step mobile rail, one canonical poster/3D surface, reversible opt-out, prices, offers, budget simulator, blog and routes unchanged.

### Checks actually performed
- Re-read `main`, the cumulative branch head, recent PRs, the project journal, the exact 3D component and its responsive stylesheet before writing.
- Added source-level regression coverage in `scripts/quality.test.mjs` for the HUD markers, live status text and small-screen full-width action.
- Attempted a local clone/build environment from GitHub, but the runtime could not resolve `github.com`; therefore no local `npm test`, TypeScript build or browser screenshot is claimed for this pass.
- The exact final branch SHA must be validated through the existing Vercel commit status before treating this candidate as ready to publish.

### Next priority
Once the exact pass-24 SHA is green, inspect the real candidate in a browser-capable environment and tune only observed spacing/camera density issues rather than changing the established direction.


## 2026-09-30 — Runtime visibility & HUD state pass 25

Branch: `design/experience-polish-pass-22`, continuing cumulatively from pass 24.

### Implemented
- Fixed the 3D visibility lifecycle so returning to the tab no longer resumes the renderer merely because the visual is mounted; the loop now follows the last real IntersectionObserver state.
- Added a stable stage target and `aria-controls` links from both 3D actions to the visual surface they control.
- Refined the HUD state indicator with distinct loading, active and blocked treatments while keeping the existing WEBEDRIVE palette and layout.
- Kept poster-first fallback, explicit mobile activation, reversible opt-out, reduced-motion / Save-Data behavior, offers, prices, simulator, routes and blog unchanged.

### Checks actually performed
- Re-read the current `main`, cumulative branch head, recent PRs, project journal, full 3D component and responsive stylesheet before writing.
- Added source-level regression guards for the intersection/visibility lifecycle, stage association and HUD state selectors.
- No local full `npm test`, TypeScript build or browser screenshot is claimed in this pass; the final exact branch SHA must be judged from the existing remote build status plus the source checks recorded here.

### Next priority
When an exact candidate can be rendered in a browser-capable environment, inspect desktop and mobile composition before any further visual spacing changes. Otherwise continue with measurable interaction, accessibility and performance defects rather than decorative churn.


## 2026-09-30 — Interaction reliability & route-focus pass 26

Branch: `design/experience-polish-pass-22`, continuing cumulatively from pass 25.

### Implemented
- Fixed hash-navigation focus so hidden compatibility anchors such as `#formules` are no longer focused directly. The router now scrolls the visible section and places programmatic focus on its first meaningful heading, while the skip-link continues to target `#site-content`.
- Added a restrained WEBEDRIVE focus ring for route-focused headings when keyboard focus is visibly requested.
- Hardened 3D startup against stale desktop auto-start callbacks and duplicate launches by synchronizing status through a ref and a launch generation token.
- Re-checks reduced-motion / Save-Data at the moment the async runtime resolves, so enabling either preference during loading cannot mount the animated scene afterward.
- A successful 3D launch resets the one-retry state, so a later independent context loss can expose a fresh retry instead of inheriting an old failure.
- Prices, offers, simulator rules, routes, blog content, mobile menu and infrastructure remain unchanged.

### Checks actually performed
- Re-read the exact remote branch head and current blobs immediately before preparing the commit; the branch was still based on `07f657f89f3834d3f2659aba44a86a9abfb26e53`.
- Added source-level regression guards for hidden-anchor resolution, route focus styling, launch generation, synchronized status, live preference blocking and retry reset.
- Public production rendering remained inaccessible to the available web reader, and the connected Vercel reader denied this project scope; no live screenshot or pixel-perfect browser validation is claimed.
- The exact resulting SHA must pass the existing remote Vercel/build status before this pass is described as ready to publish.

### Next priority
When the exact candidate can be rendered, inspect the resulting keyboard arrival cue and 3D loading/disable transitions on desktop and mobile. Otherwise continue with observed interaction/accessibility defects rather than decorative churn.


### Pass 26 correction after remote build
- The first pass-26 SHA `f4258e66ba33cc7cec568aa55d43de06da92b91b` failed the existing Vercel build gate.
- Source re-read found a stale quality assertion that still required the pre-refactor string `cleanupScene(); setStatus("poster")`. The interaction itself had intentionally moved to synchronized `setViewStatus` plus retry reset, so the guard—not the behavior—was outdated.
- Updated that guard to assert the new reversible opt-out path (`cleanupScene(); setRetryUsed(false); setViewStatus("poster")`) without removing or weakening the test suite.
- No production merge or infrastructure change is part of this correction; the exact correction SHA must pass the remote build before being treated as ready.


## 2026-09-30 — Mobile journey navigation pass 27

Branch: `design/experience-polish-pass-22`, continuing cumulatively from pass 26.

### Implemented
- Removed a real mobile duplication: the lead-panel proofline and the post-visual journey rail both repeated “Comprendre / Organiser / Avancer”. The proofline now remains a desktop cue while the mobile rail is the single compact progression control.
- Turned that mobile rail into actual internal navigation. Each step now moves to the corresponding visible story stage instead of acting as decorative text.
- Added stable `#organiser` and `#avancer` targets with header-aware scroll margins; the existing route-focus logic can place keyboard focus on the destination heading.
- Added explicit focus treatment, full-cell tap targets and reduced-motion-safe rail micro-interactions while preserving the existing WEBEDRIVE palette and 3D fallback behavior.
- No prices, offers, simulator rules, blog routes, authentication, data layer, dependencies or infrastructure changed.

### Checks actually performed
- Re-read `main`, the exact cumulative branch head, recent PRs, the design journal, landing source, 3D component and responsive stylesheet before writing.
- Verified the branch was still exactly at `92cff2f977f8f98416d05130702592ac15aa4942` immediately before creating this commit, so no concurrent branch work was overwritten.
- Added source-level regression coverage for the new targets, mobile-only de-duplication, internal navigation, focus treatment and reduced-motion behavior.
- Public/browser rendering is still unavailable through the current readers, so no desktop/mobile screenshot or pixel-perfect claim is made. The exact resulting SHA must be judged by the existing remote build status plus the source checks above.

### Next priority
Inspect the exact candidate visually when browser access becomes available. Otherwise continue with measurable decision-flow, keyboard, responsive or performance defects rather than adding decorative layers.


### Pass 27 correction after remote build
- The first pass-27 SHA `f972e464c75ad4dd2161f55357826aa97e69df5c` failed the existing Vercel gate.
- Re-reading the versioned quality suite found the regression immediately: the established 3D contract already asserts the accessible phrase “Les trois étapes du parcours”, while the first pass renamed that label to “Navigation dans les étapes du parcours”.
- Restored the established accessible label and aligned the new pass-27 guard with it. The rail remains a real three-link navigation; no interaction or visual improvement was removed and no test was disabled.
- The correction SHA must pass the same remote build gate before this pass is considered ready to publish.


## 2026-09-30 — Decision continuity pass 28

Branch: `design/experience-polish-pass-22`, continuing cumulatively from the green pass-27 correction.

### Implemented
- Made the sticky decision summary reflect the actual Classique/Accélérée state already used by the offer cards and budget simulator instead of presenting both prices with identical visual weight.
- The selected plan cell now receives a restrained WEBEDRIVE accent treatment and a compact checked “Choisie” cue; on very narrow screens the text collapses to the check while the accessible label remains explicit.
- The handoff action now reads “Ajuster mon choix” and exposes the selected plan plus current computed amount in its accessible label, improving continuity before the budget section.
- Preserved all approved prices, 13 h / 20 h behavior, plan arithmetic, cards, simulator, blog, routes, 3D behavior and infrastructure.

### Checks performed before commit
- Re-read `main`, the cumulative branch head, recent PRs, the design journal and the exact decision-flow source/styles before editing.
- Confirmed the branch head was still `d26e82fc82da3da20b6c5faeccb155c3188d0b3c` immediately before preparing the commit, preventing accidental overwrite of concurrent work.
- Added source-level guards for both selected-plan states, the compact selected cue, narrow-screen treatment, reduced-motion coverage and the budget handoff label.
- Local full clone/build remains unavailable because this runtime cannot resolve `github.com`; no local npm build or browser screenshot is claimed. The exact resulting SHA must be checked through the existing remote Vercel status.

### Next priority
Inspect the exact candidate visually when browser access is available. If not, continue with measurable mobile decision-flow, keyboard and responsive defects rather than adding decorative layers.
