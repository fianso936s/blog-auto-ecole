# INVENTAIRE — WEBEDRIVE / Ruban de progression

Date de lecture : 29 septembre 2026
Branche de travail : `feature/ribbon-progression-p0-p1`
Base : `main@403cb45e1b758140ff37b81250846138110b7e03`

## 1. Dépôt et stack vérifiés

- Dépôt canonique : `fianso936s/blog-auto-ecole`
- Branche de production : `main`
- React 18.3.1, React DOM 18.3.1
- Vite 5.4.x
- TypeScript 5.5.x
- React Router 6.26.x
- Supabase 2.45.x
- Tailwind 4 est présent comme dépendance de développement
- Aucune dépendance `three`, `gsap` ou React Three Fiber n'est déclarée à cette étape
- Scripts existants : `npm run dev`, `npm test`, `npm run build`, `npm run preview`

## 2. Routage à préserver

- `/` → `WebedriveLanding`
- `/blog`
- `/blog/articles`
- `/blog/articles/:slug`
- `/blog/quiz`
- redirections legacy `/articles`, `/articles/:slug`, `/quiz`
- `/login`, `/inscription`, `/reset-password`, `/auth/confirm`
- routes protégées élève : `/eleve`, `/eleve/cours`, `/eleve/quiz`
- routes protégées admin sous `/admin`

Aucune migration de routeur n'est nécessaire ni autorisée dans ce lot.

## 3. Identité existante

- Police déclarée : Manrope avec fallback Arial
- Palette actuelle : bleu `#153D58`, blanc chaud `#F6F3ED`, sable `#D7B98E`, encre `#172D3A`
- Logo public : `public/brand/webedrive.png`, utilisé par `BrandMark`
- Les tokens communs vivent dans `src/styles/brand.css`

## 4. Landing actuelle

`src/pages/WebedriveLanding.tsx` contient actuellement :
- un hero éditorial
- une illustration de route/voiture via `src/components/DriveVisual.tsx`
- les formules 13 h / 20 h
- le comparateur Classique / Accélérée
- l'estimateur local de budget
- la méthode en trois étapes
- FAQ
- passage éditorial vers le blog

Le visuel `DriveVisual` est une illustration SVG/CSS décorative. Il ne constitue pas une scène 3D.

Le dépôt contient aussi `src/components/RoadScene.tsx`, explicitement décrit dans son code comme une illustration Canvas2D et non comme une scène WebGL.

## 5. Données commerciales actuellement vérifiées dans le dépôt

`src/lib/offers.ts` :
- Classique 13 h : 890 €
- Classique 20 h : 1 290 €
- Accélérée 13 h : 1 090 €
- Accélérée 20 h : 1 490 €
- Heure complémentaire : 65 €
- Examen du code : 30 € / tentative

Ces données restent inchangées dans ce lot.

## 6. Contact

Aucun ancrage `#contact`, téléphone, email ou endpoint public de contact exploitable n'a été trouvé dans la landing ou la navigation lues pendant cet inventaire.

Conséquence : ne pas inventer un canal de contact. La composition peut prévoir son emplacement mais l'action reste non livrable tant qu'une source réelle n'est pas vérifiée.

## 7. Assets et contrats 3D disponibles

Le PDF « WEBEDRIVE / Direction Web & 3D » est disponible dans la mission et définit la direction « Le ruban de progression », les valeurs de caméra, la route, les budgets, la palette, les contraintes d'accessibilité et le pipeline P0→P7.

En revanche, le ZIP mentionné dans le PDF et ses fichiers `MASTER_EXECUTION.md`, `BENCHMARK.md`, `PROMPT_DEMARRAGE.md`, `contracts/*`, `reference/*` et les assets 3D finaux ne sont pas joints à cette session.

Conséquence :
- ne pas prétendre disposer des contrats originaux du ZIP ;
- ne reconstruire que les valeurs explicitement présentes dans le PDF ;
- ne pas déclarer un asset 3D final sans modèle vérifiable et droit d'usage ;
- continuer les phases indépendantes, notamment P1.

## 8. Décision de ce lot

Ce lot exécute :
- P0 : inventaire vérifié
- P1 : composition fixe conforme à la direction du cahier

Il ne déclare pas P2/P3 terminés tant que le modèle 3D et les contrats/ressources manquants n'existent pas réellement.

## 9. Fichiers à préserver pendant P1

- `src/App.tsx`
- `src/lib/offers.ts`
- routes d'authentification / élève / admin
- `Header`, `Footer`, `BrandMark`
- blog et composants existants
- règles d'accès Supabase

## 10. Commandes de vérification attendues

- `npm test`
- `npm run build`

La branche doit ensuite être vérifiée par le pipeline existant. Une réussite de build ne remplace pas une inspection visuelle navigateur.


## 11. État après exécution P1

Implémenté sur la branche :
- `src/features/experience3d/ExperiencePoster.tsx`
- `src/features/experience3d/experience3d.css`
- landing restructurée autour des trois chapitres
- comparaison des quatre tarifs en une seule vue
- header 72 px desktop / 64 px petit mobile
- contrats reconstruits depuis le PDF
- math de progression déterministe et tests associés

Statuts :
- P0 : IMPLÉMENTÉ
- P1 : IMPLÉMENTÉ, vérification build à confirmer sur le dernier commit
- P2 : ASSET MANQUANT
- P3 : NON IMPLÉMENTÉ
- Publication : NON PUBLIÉE
