# WEBEDRIVE — Mobile clarity pass 4

Base production commit: `3d3f15dccc8c1683870702c2a67f6f38ff1c2b7f`.

## Changes delivered in the candidate

- Tightened the mobile hero spacing and made the main CTA full width so the first action is easier to scan and tap.
- Turned the three hero route shortcuts into horizontally scrollable premium chips rather than a compressed text rail.
- Reduced the decorative driving illustration height on small screens to bring the offers into view sooner.
- Made the 13 h / 20 h control occupy the full mobile width with two equal touch targets.
- Reworked the existing selection summary into a sticky mobile decision dock inside the offers section: the selected Classic and Accelerated prices remain visible, with a direct button to the local budget estimator.
- Increased mobile card, budget and FAQ visual separation without changing the desktop information architecture.
- Added a 380 px compact fallback and preserved reduced-motion behavior.

## Guardrails

No prices, offers, routes, authentication, Supabase/data access, dependencies, paid assets, analytics, infrastructure or GitHub Actions workflows are changed. The refinement is CSS-only and additive.

## Verification

The candidate must pass the repository's existing Vercel build pipeline, which runs the existing test command, build-info generation, TypeScript build and Vite build. Before production merge, compare the branch with the current `main` and confirm it is not behind. After merge, verify the Vercel status on the actual production commit.

## Open verification limitation

At the start of this pass, the public production URL and `/version.json` were still inaccessible through the available web reader, while the Vercel connector had previously denied the `barsis-projects` scope. A green build does not replace a direct visual production check; retry those paths when available and keep this limitation open until independently verified.
