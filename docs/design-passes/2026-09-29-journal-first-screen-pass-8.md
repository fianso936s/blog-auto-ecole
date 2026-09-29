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

## Pass 13 — méthode contextualisée et FAQ clavier
- Prolongé le contexte de décision jusque dans la section Méthode : la sélection active affiche désormais le volume, le rythme et l’estimation courante, avec un retour direct vers le budget.
- Resseré la transition visuelle budget → méthode et transformé la séquence en progression plus architecturale avec repères sable continus, sans inventer de disponibilité ni de promesse commerciale.
- Ajouté un vrai focus clavier visible aux résumés de FAQ et conservé des cibles tactiles confortables.
- Adapté le nouveau contexte à 800 px puis 600 px pour éviter les colonnes compressées et garder le CTA lisible sur mobile.
- Aucun tarif, route, contenu éditorial, authentification, paiement, donnée Supabase, dépendance, workflow ou infrastructure n’a été modifié.

### Contrôles réellement effectués pour le pass 13
- Tête distante relue juste avant écriture : `42dedc414c2067e463514355d468afef445234be`, branche toujours 16 commits devant et 0 derrière `main`.
- Prévisualisation Vercel de cette tête signalée `success` par GitHub, mais l’accès direct au projet Vercel a renvoyé 403 ; aucune capture ni validation visuelle pixel par pixel n’est revendiquée.
- Validation statique avant commit : accolades CSS équilibrées, présence du contexte Méthode, règles responsive 800/600 px, focus FAQ et assertion de qualité associée.
- Commit construit contre l’arbre exact de la tête observée et avancé sans force-push.

## Next priority
Si la branche reste non fusionnée, poursuivre sur la même base cumulative. Prochain gain utile : raffiner le bloc FAQ → journal sur mobile (densité, rythme et CTA final) puis contrôler le débordement 320/375/390/768 px si une preview de branche devient lisible.


## Pass 14 — FAQ numérotée et journal mobile premium
- Raffiné la transition FAQ → journal sans toucher aux routes, contenus éditoriaux, tarifs ou engagements : la FAQ gagne des repères numérotés discrets, un état ouvert plus lisible et un rythme plus compact sur petit écran.
- Recompose le bloc final du journal en vraie zone de handoff premium : grille éditoriale, tags de ressources, actions alignées et fond technique subtil, tout en conservant les deux CTA existants.
- Sur tablette et mobile, le panneau d’actions passe sous le texte, prend la largeur disponible et supprime la bordure verticale ; à 600 px puis 380 px, les espacements et tailles sont resserrés pour rester lisibles sans largeur fixe.
- Conservé le focus clavier des résumés FAQ, ajouté un focus explicite au CTA secondaire et neutralisé les nouvelles transitions lorsque `prefers-reduced-motion` est actif.
- Aucun nouveau composant, aucune dépendance, aucun workflow, aucune donnée Supabase, aucun paiement, aucune authentification ni infrastructure n’a été modifié.

### Contrôles réellement effectués pour le pass 14
- Tête distante relue avant écriture : `13262ed36e465101106c56d7e80ba8588cd0c3be`, branche 17 commits devant et 0 derrière `main`.
- Le statut Vercel de cette tête de départ était `success` ; il n’est pas utilisé comme preuve pour les commits de ce passage.
- Validation statique avant écriture : accolades CSS équilibrées (297/297), présence des repères FAQ, des règles 800/600/380 px, du focus secondaire et de la neutralisation reduced-motion.
- Ajout d’une assertion de qualité qui protège les principaux marqueurs de densité mobile et le handoff journal.
- Aucune capture navigateur de la branche n’est revendiquée dans ce passage ; le contrôle de débordement est limité aux contraintes CSS explicites et aux checks distants disponibles.

## Next priority
Si la branche reste non fusionnée, poursuivre sur la même base cumulative. Prochain gain utile : harmoniser la densité du footer et du menu mobile avec ce nouveau niveau de finition, puis vérifier le parcours complet clavier du header au journal si une preview de branche devient directement inspectable.


## Pass 15 — menu mobile et footer unifiés
- Réconcilié d’abord la branche cumulative canonique avec le pass 14 : `design/journal-first-screen-pass-8` a été avancée en fast-forward sur `c53e4cd43146dce38a14bd4a577fa0a7e4771f90`, sans force-push.
- Refondu la hiérarchie du menu mobile partagé sans changer ses routes ni sa logique de dialog : repères numérotés, état actif plus lisible, CTA élève pleine largeur, composition plus premium et panneau scrollable contenu.
- Ajouté des marges tenant compte des safe areas mobiles, une densité spécifique sous 560 px puis 380 px et des cibles tactiles conservées au-dessus du seuil utile.
- Recompose le footer partagé en deux niveaux : introduction de marque + rail de parcours (Formules, Budget, Méthode, Journal), puis liens de formation/ressources. Sur mobile, le rail passe en grille 2 × 2 et les colonnes de liens deviennent une seule colonne pour éviter l’écrasement à 320–390 px.
- Clarifié le bloc « Informations du site » avec un vrai affordance de disclosure, sans inventer de coordonnées, mentions légales, avis ou promesses.
- Aucun tarif, route, authentification, paiement, donnée Supabase, dépendance, workflow GitHub Actions ni infrastructure n’a été modifié.

### Contrôles réellement effectués pour le pass 15
- Lecture de `main`, des deux branches cumulatives, des PR récentes et du journal avant écriture ; `automation/ref-forward-c53e` était exactement un commit devant la branche canonique, puis la réconciliation fast-forward a réussi.
- Le clone local a été retenté et a échoué sur la résolution DNS de `github.com`; aucun build npm local ni capture Chromium de cette branche n’est donc revendiqué.
- Validation statique avant commit : accolades CSS équilibrées, anciennes règles footer/menu remplacées une seule fois, présence des safe areas 560 px, garde-fou 380 px, focus global conservé et reduced-motion neutralisant les translations hover.
- Une assertion de qualité protège désormais les marqueurs JSX/CSS du menu mobile et du footer.

## Next priority
Si la branche reste non fusionnée, poursuivre sur cette même base cumulative. Prochain gain utile : vérifier et raffiner le comportement du header sticky + navigation blog sur les largeurs intermédiaires 768–1099 px, puis réduire les écarts de densité entre la landing et les pages article sans changer le contenu éditorial.


### Correction ciblée du pass 15
- La relecture du CSS après le premier commit du pass a détecté une collision de spécificité : les règles génériques `.site-footer nav` auraient pu écraser la grille et la hauteur des cellules du nouveau rail de parcours.
- Correction appliquée avant validation finale : les règles de colonne sont désormais limitées à `.site-footer-grid nav`, ce qui laisse `.site-footer-route` gouverner sa propre grille 4 colonnes / 2 × 2 mobile.
- Le garde-fou de qualité vérifie désormais explicitement l’absence de cette règle générique conflictuelle.


## Pass 16 — pile sticky cohérente et fin de lecture
- Corrigé un défaut de pile sticky dans le journal : la sous-navigation utilisait des offsets fixes différents du header. Le header et la navigation journal partagent désormais un même token de hauteur pour éviter chevauchement ou espace parasite entre 561 et 1099 px.
- Le scroll-padding suit aussi cette hauteur partagée pour garder les cibles d'ancre cohérentes entre desktop et mobile.
- Amélioré la sous-navigation du journal sur écrans tactiles/intermédiaires avec scroll horizontal contenu, snap léger et scrollbar visuelle masquée.
- Recompose la fin des pages article en panneau éditorial premium avec deux choix explicites : tous les articles ou retour à la une.
- Le panneau repasse en une colonne sur mobile avec actions pleine largeur et focus global conservé.
- Aucun tarif, paiement, authentification, donnée Supabase, dépendance, workflow GitHub Actions ni infrastructure n'a été modifié.

### Contrôles réellement effectués pour le pass 16
- Tête canonique revérifiée avant préparation : `23574837c222a05845e25a534cc6041b03a2924f`, identique à `design/journal-first-screen-pass-8`, 21 commits devant et 0 derrière `main`.
- Le SHA de départ avait un statut Vercel `success`; ce résultat n'est pas utilisé comme validation du nouveau commit.
- Tentative d'inspection directe Vercel : refus 403 sur le scope du projet, donc aucune capture ni validation visuelle navigateur n'est revendiquée.
- Validation statique de la proposition : remplacements uniques contrôlés, accolades CSS équilibrées sur les deux feuilles modifiées, offsets sticky centralisés et structure responsive du panneau article vérifiée.

## Next priority
Si la branche reste non fusionnée, poursuivre sur cette même base cumulative. Prochain gain utile : raffiner les états de chargement/absence du blog et les transitions de densité entre 800 et 1100 px, puis contrôler le parcours clavier complet dès qu'une preview de branche devient inspectable.


## Pass 17 — état éditorial lisible et densité tablette
- Le journal distingue maintenant explicitement la vérification des publications de son état de démonstration : l’aperçu reste visible pendant la lecture, puis le bandeau confirme le fallback éditorial lorsque les publications live ne sont pas disponibles.
- Le bandeau d’information a été recomposé comme un rail éditorial premium avec repère, hiérarchie courte et variante responsive une colonne sur mobile.
- Entre 801 et 1040 px, la grille d’articles passe à deux colonnes au lieu de conserver trois cartes trop étroites ; la carte à la une garde une composition équilibrée avant son basculement une colonne à 800 px.
- Sous 600 px, le raffinement impose explicitement une seule colonne afin d’éviter qu’une règle tablette ne réintroduise deux colonnes.
- Aucun contenu d’article, tarif, route, paiement, authentification, écriture Supabase, dépendance, workflow ou infrastructure n’a été modifié.

### Contrôles réellement effectués pour le pass 17
- Tête distante relue avant chaque écriture, avec avancement séquentiel sur la même branche et sans force-push.
- Le SHA de départ 932078d16073aa7c2867e85efed439deb46238ec avait un statut Vercel success ; ce résultat n’est pas réutilisé comme validation du nouveau code.
- La tentative d’ajouter un garde-fou supplémentaire dans scripts/quality.test.mjs a été refusée par la couche de sécurité du connecteur avant modification ; la suite existante n’a pas été altérée.
- Validation de la proposition par relecture du code distant et contrôle statique des breakpoints et états ; aucune capture navigateur de cette branche n’est revendiquée.

## Next priority
Si la branche reste non fusionnée, poursuivre sur cette même base cumulative. Prochain gain utile : aligner le bandeau de sélection des formules sur le token partagé de hauteur du header, puis améliorer les contrôles numériques du simulateur pour les écrans tactiles sans changer le modèle tarifaire.


## Pass 18 — sélection sticky et simulateur tactile
- Aligné le bandeau sticky des formules sur le token partagé `--wd-header-height` au lieu de conserver l’offset fixe historique. La règle est limitée aux largeurs desktop (`min-width: 801px`) afin de préserver le retour non-sticky déjà prévu sous 800 px.
- Remplacé les deux champs numériques bruts du simulateur par des contrôles tactiles dédiés : boutons − / + de 48 px, saisie directe conservée, bornes 0–20 et 0–10 inchangées et même calcul tarifaire.
- Ajouté des libellés explicites aux commandes, des états disabled aux bornes, un focus visible pour le groupe et les boutons, un rendu tabulaire des chiffres, la suppression des spinners natifs redondants et un fallback forced-colors.
- Le premier ajustement CSS a révélé à la relecture un conflit de spécificité mobile : le nouvel offset sticky aurait pu rester actif sous 800 px. Le correctif `min-width: 801px` a été appliqué avant de considérer la passe comme candidate.
- Aucun tarif, route, contenu éditorial, paiement, authentification, écriture Supabase, dépendance, workflow GitHub Actions ou infrastructure n’a été modifié.

### Contrôles réellement effectués pour le pass 18
- Tête distante relue avant les écritures et branche avancée uniquement par commits normaux, sans force-push.
- Le clone local a été retenté et a encore échoué sur la résolution DNS de `github.com`; aucun `npm test`, `npm run build` local ni capture Chromium n’est donc revendiqué.
- Relecture distante finale de `WebedriveLanding.tsx` et `editorial.css` : composant compteur présent, deux bornes conservées, libellés des boutons présents, sticky limité au desktop, focus/forced-colors présents.
- Contrôle statique de `editorial.css` : 315 accolades ouvrantes / 315 fermantes.
- La tentative d’ajouter un garde-fou supplémentaire dans `scripts/quality.test.mjs` a été refusée par la couche de sécurité du connecteur avant modification ; la suite existante n’a pas été altérée.
- Le SHA de code `b3a064ba3da962acb38eb1b3789e059bef170203` est enregistré sur la branche distante. Son statut Vercel était encore `pending` lors de la vérification de cette passe.

## Next priority
Si la branche reste non fusionnée, poursuivre sur cette même base cumulative. Prochain gain utile : compacter le résumé budget à 320–390 px sans masquer la comparaison Classique/Accélérée, puis raffiner l’ordre de tabulation et les annonces du simulateur si une preview inspectable devient disponible.

## Post-publication pass 19 — mobile budget cockpit
- Previous cumulative branch was merged through PR #9; this pass starts from published `main` at `08646f720bd17d37d2e826374eab6712e71759d4` on new branch `design/mobile-budget-pass-19`.
- Compacted the budget cockpit below 460 px while keeping both Classique and Accélérée totals visible.
- Stacked the two option counters on narrow phones, preserved 48 px −/+ targets, and added a 340 px density safeguard.
- Static CSS validation passed with 331 opening / 331 closing braces before commit.
- Remote diff review confirms only `src/styles/editorial.css` changed in code commit `7de83b84fc662cfbb611a804bef6cc7e7aa47648`; GitHub reports Vercel `success` for that exact SHA.
- The public alias was not readable through the web inspection tool, so no browser screenshot or pixel-level overflow claim is made.
- A quality-test guard write was unavailable in this run; the existing test suite was left unchanged.

### Next priority
Continue on `design/mobile-budget-pass-19` while unmerged. Next useful pass: refine the 320–390 px selection band and plan switch without reducing tap targets, then re-check focus/reduced-motion behavior and preview overflow when inspectable.

