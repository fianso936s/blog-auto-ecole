# WEBEDRIVE — source canonique et publication

## Décision actuelle
Accueil WEBEDRIVE et blog forment un même site. Le blog est conservé, pas remplacé. La demande de suppression antérieure est supersédée par cette décision.

- Dépôt : fianso936s/blog-auto-ecole ; branche de production : main.
- Projet Vercel : blog-auto-ecole ; ID prj_iP436yf7tNGYcWwYZHYHdUKuX02q.
- URL : https://blog-auto-ecole.vercel.app
- Le Git push sur main déclenche réellement Vercel ; contrôler le SHA et le statut associé. Un statut réussi ne prouve pas une inspection visuelle.
- Archive à préserver : archive-blog-before-webedrive-2026-09-28.
- Début de l’unification : main 3b50160cfa985c261dcf02c769a897b71509ca4c.
- Branche de travail initiale : work/webedrive-unification-20260928. Examiner sa PR et son état avant tout travail concurrent.

## Architecture
/ : WebedriveLanding avec Header et Footer partagés.
/blog et /blog/* : PublicLayout avec les mêmes Header et Footer, plus une barre de rubriques.
/articles, /articles/:slug et /quiz : redirection côté client vers /blog en conservant query et fragment.
Authentification et routes protégées élève/admin conservées. Ne pas les ouvrir pour tester.

## Sources de vérité
- src/styles/brand.css : tokens et composants communs, thèmes clair/sombre.
- src/index.css : aliases Tailwind des mêmes tokens pour les pages existantes.
- src/lib/navigation.ts : menu et normalisation des catégories.
- src/lib/offers.ts : tarifs et inclusions.
- public/brand/webedrive.png : réduction raster de la référence direction 10 ; pas un master vectoriel.
- Manrope est chargé par une feuille distante Google Fonts, avec fallback Arial. Aucun fichier de police embarqué. Si le réseau police est bloqué, ne pas déclarer Manrope effectivement rendu.

## Contrôle
npm test puis npm run build. Le prebuild exécute les tests et inscrit un identifiant non secret dans /version.json. Lire ce fichier quand l’accès HTTP est autorisé pour comparer au déploiement. Ne pas contourner de restriction d’accès Vercel.

L’itération en cours ajoute un contrat de tests source/métier et compilation ; ne pas le présenter comme une recette exhaustive navigateur, matériel ou authentification. Le journal et docs/AUDIT.md distinguent ces niveaux.
