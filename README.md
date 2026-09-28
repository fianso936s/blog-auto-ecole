# WEBEDRIVE

Site WEBEDRIVE + blog existant, dans le même dépôt et projet Vercel.

## Développement

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Le build exécute les tests source/métier avant TypeScript et Vite. `public/version.json` est généré avec le SHA de publication fourni par l’environnement, sans secret. Les dépendances et le lockfile existants sont préservés pour l’unification ; voir `docs/WORKFLOWS.md` pour la migration de frameworks.

## Organisation
- `/` : landing WEBEDRIVE.
- `/blog` : journal conservé, `/blog/articles`, `/blog/articles/:slug`, `/blog/quiz`.
- `/login`, `/inscription`, `/eleve`, `/admin` : parcours existants conservés.
- `src/styles/brand.css` : tokens communs et composants.
- `src/components/Header.tsx`, `Footer.tsx`, `BrandMark.tsx` : mêmes composants publics.
- `docs/CONTINUITY.md` : cible canonique et règles de reprise.
- `docs/AUDIT.md` : constats, corrections, couverture et limites.

Ne jamais committer secrets, données clients ou fichiers de police. Les tests réseau doivent utiliser des mocks ou un environnement de test, jamais envoyer un email ou créer un utilisateur de production. Ne pas supprimer le blog ni les branches d’archive.
