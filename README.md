# Le Repère Permis — web, iOS et API

Ce dépôt est la source commune de l’application iOS native et du site déjà relié à Vercel. Version produit : `packages/product/product.json`.

- Site : `src/` ; app iOS et modules Meta : `apps/mobile/` ; API : `apps/api/`.
- Règles partagées : `packages/core/` ; cours, quiz, suivi, navigation et design : `packages/product/`.
- Lecteur vidéo commun : `packages/ui-web/` ; correction des quiz côté serveur : `packages/assessment/`.
- Installation : `npm ci --ignore-scripts`.
- Après une modification : `npm run product:generate`, puis `npm run verify:uniformity`.
- Export iOS : `npm run build:ios` ; compilation/signature Apple : EAS ou Codemagic avec les accès du propriétaire.

Voir [le fonctionnement de l’uniformisation](docs/UNIFORMISATION.md) et les règles de maintenance dans [AGENTS.md](AGENTS.md).

---

# Le Repère Permis — version web

Réplique web de l’application iOS Le Repère Permis 1.6.0, utilisant son API, ses comptes, ses modèles et ses fiches pédagogiques.

Voir [IMPLEMENTATION.md](./IMPLEMENTATION.md) pour les fonctionnalités, la sécurité, les différences imposées par le navigateur et la validation.

Installation : `npm ci`. Compilation : `npm run build`. Vérification : `npx tsc --noEmit && npm test && npm run validate`.

L’artefact autonome est créé dans `dist/server/index.js`. Modifier les sources dans `src/`, jamais le fichier généré.

Déploiement Vercel : `npm run build:vercel` produit les fichiers statiques dans `public/`. `api/site.js` réutilise le serveur et les sessions sécurisées sur Node.js 22, avec les règles de routage de `vercel.json`. Le logo fourni est conservé sans modification dans `src/assets/le-repere-logo.jpeg`.
