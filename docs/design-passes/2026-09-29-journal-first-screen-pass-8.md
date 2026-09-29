# WEBEDRIVE — journal first-screen pass 8

Working branch: `design/journal-first-screen-pass-8`.
Base inspected before work: `main` at `403cb45e1b758140ff37b81250846138110b7e03` (PR #8 already merged).

## Implemented
- Tightened the journal first screen without changing routes, editorial data or the approved brand: stronger headline measure, clearer CTA decision band and more deliberate spacing.
- Reworked the featured article hierarchy with a more premium split layout, stronger title scale, metadata separation and responsive single-column fallback.
- Improved article/card rhythm, category controls and mobile CTA stacking while preserving focus and reduced-motion behavior.
- Prioritized the featured article cover image with eager/high-priority loading; non-featured images remain lazy.
- No prices, offers, authentication, Supabase writes, payments, dependencies, infrastructure, paid assets or GitHub Actions were changed.

## Checks actually run
- `ArticleCard.tsx` was transpiled locally with the installed TypeScript compiler: zero syntax diagnostics; the eager/high-priority and lazy/auto branches were present.
- Full local clone/build could not be run because the container cannot resolve github.com.
- A reconstructed local Chromium preview was attempted at desktop and mobile widths. Chromium timed out in direct headless mode, and the Playwright-managed browser was blocked from loading local/file and localhost URLs by the environment administrator. No screenshot or browser-overflow claim is therefore made from that attempt.
- GitHub/Vercel reported `success` for cumulative branch commit `9c727ab41bb7d1f6f18e40be6bb0422c1fc32c91`, validating the repository pipeline for the code changes present at that commit.

## Pass 9 — journal density and mobile navigation
- Tightened non-featured card spacing and typography while keeping author, date and reading-time metadata visible.
- Changed non-featured metadata to a clearer two-row rhythm; author names wrap instead of being truncated.
- Made category filters horizontally scrollable below 600 px with 44 px targets, contained scroll snapping and no need for page-level horizontal overflow.
- Added stronger active-filter and card focus feedback. Diff review caught an outline suppression and removed it before validation.
- Kept reduced-motion handling and the featured-card hierarchy from pass 8 unchanged.

### Checks actually run for pass 9
- Re-read the remote branch head before each write and only continued from the observed SHA.
- Static CSS checks passed for balanced braces, contained filter scrolling, scroll snapping, focus feedback and reduced-motion handling.
- Diff review found and corrected two issues: suppressed native focus indication and truncated author names.
- A fresh local clone/build remains unavailable because github.com does not resolve in the container. The public /blog alias was also not readable through the web inspection tool, so no screenshot claim is made.
- The code commits are confirmed on GitHub. Vercel was still pending for `a11e059b205d84c6a64d967d7a71042ff83c6f20` at the last check before this journal update.

## Next priority
Continue on this same branch while it is unmerged. Next useful pass: refine the article-detail reading experience (line measure, heading rhythm, media/table overflow and mobile sticky-nav interaction) without changing article data or routes.

## Pass 10 — article reading experience
- Reworked the article-detail page into a dedicated premium reading shell instead of generic utility spacing.
- Tightened title measure and metadata hierarchy, added a framed cover treatment, and constrained long-form text to a comfortable reading width.
- Improved heading rhythm, lists, blockquotes, links, code, tables and embedded-image treatment while keeping the existing constrained ArticleBody renderer unchanged.
- Contained table and code overflow on narrow screens, kept 20 px mobile gutters, and made the final journal CTA full-width on small screens.
- Prioritized the article cover as the above-the-fold image with eager/high-priority loading; article-body images remain lazy.
- No routes, article data, prices, authentication, Supabase writes, dependencies, workflows or infrastructure were changed.

### Checks actually run for pass 10
- Re-read main, the cumulative branch head, recent PR state and this journal before editing; the branch was 8 commits ahead and 0 behind main before the pass.
- A direct container clone was retried and failed because github.com could not be resolved, so no full local checkout/build claim is made.
- The proposed ArticleDetailPage.tsx was transpiled with the locally installed TypeScript 5.8.3 compiler with zero syntax diagnostics.
- Static CSS checks passed for balanced braces, narrow-screen media containment, mobile breakpoint rules and the reduced-motion rule.
- After the two code writes, the remote branch was re-read at 7c5432c3f301298f7682a88912014a3d8cb0a405 and compared against main: 10 commits ahead, 0 behind. The expected files were present in the GitHub diff.
- No Vercel status had been reported yet for that code head when checked, so no deployment/build success is claimed for this pass.
- A repository quality-test assertion was prepared but its write was rejected by the connector before any test-file change occurred; the existing test suite was not modified.

## Next priority
Keep this cumulative branch if it remains unmerged. Next useful pass: inspect the landing mobile first viewport and offer-to-budget handoff for density, tap ergonomics and visual continuity, then refine only defects that are actually observed.


## Pass 11 — mobile hero and offer-to-budget handoff
- Tightened the mobile first viewport without changing the approved brand direction: shorter vertical rhythm, denser title/copy spacing, a full-width primary CTA, a reduced decorative driving canvas and a quieter hero footer.
- Kept the automobile/road visual instead of removing it, but reduced its mobile footprint from 360 px to 300 px (270 px below 380 px) so the offer section arrives sooner.
- Added an explicit `Classique / Accélérée` choice to the budget simulator while preserving the existing 13 h / 20 h selector and all approved prices.
- Connected each offer-card “Simuler mon budget” link to the same plan state, so choosing a card carries that rhythm into the budget step instead of making the user choose again from scratch.
- Kept both totals visible for comparison, while visually marking the active plan and repeating the selected rhythm in the budget summary.
- Added 44 px plan targets, focus-visible treatment, selected-card feedback and reduced-motion coverage. No routes, prices, inclusions, payment, authentication, Supabase data, dependencies or infrastructure were changed.
- Added a repository quality assertion covering the plan handoff markers so future builds guard this interaction.

### Checks actually run for pass 11
- Re-read `main`, the cumulative work branch, recent PR state and this journal before writing. The branch head was confirmed exactly at `c367f03ede877c3b628fad143e3c5ec214b1ffbc` before the code commit.
- Built the change as a Git tree against that exact parent and advanced the branch with a non-force fast-forward only.
- Static CSS validation on the proposed mobile refinements found balanced braces (251 opening / 251 closing) before commit.
- Remote diff review confirmed only the intended landing, decision/editorial CSS and quality-test changes in code commit `0bc34a9b2cc30d2d4a54db391319d5c9ab92f447`.
- GitHub reports the cumulative branch 12 commits ahead and 0 behind `main` at the code commit.
- Vercel reported `success` for `0bc34a9b2cc30d2d4a54db391319d5c9ab92f447`. The repository’s default `npm run build` script is `npm test && node scripts/build-info.mjs && tsc -b && vite build`; direct Vercel build logs were not accessible in this run, so the status is recorded as a successful Vercel signal rather than a claim that each build step was independently observed.
- A direct Vercel project inspection was attempted after GitHub exposed the deployment target, but the connector returned 403 for the project scope. No branch-preview screenshot or browser-overflow claim is therefore made.

## Next priority
Keep this same cumulative branch while unmerged. Next useful pass: refine the desktop offer/budget composition and the transition into the method section, then inspect 320/375/390/768 px overflow and sticky behavior if a branch preview becomes readable; preserve the now-linked plan selector and all approved commercial data.
