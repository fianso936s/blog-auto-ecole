# Journal de livraison

## WEBEDRIVE unified-1 — 28 septembre 2026
Base réelle : 3b50160cfa985c261dcf02c769a897b71509ca4c.
PR #1, branche work/webedrive-unification-20260928.

Unification du design system et des composants publics ; logo raster récupéré ; navigation mobile native ; blog conservé ; redirects legacy ; revue et corrections article/Newsletter/mouvement ; 19 contrats Node + parse syntaxique des sources ajoutés au prebuild. Commande Vercel explicite `npm run build`, sortie `dist`, cache désactivé pour la version et le SW.

Le premier preview 1d1b4a1265e6ec0a920db2002a39f3220833cbe3 est READY sur Vercel. Les logs de build du connecteur sont indisponibles (tool not found). Les Actions GitHub échouent avant les étapes ; cause non établie. La suite Playwright est fournie pour preview local mocké, non déclarée exécutée tant que ses résultats ne sont pas accessibles. Aucun test ne doit écrire en production.

Manrope est référencé via Google Fonts, aucun fichier de police n’est embarqué. Les versions majeures des dépendances et le lockfile restent inchangés ; ne pas annoncer React 19.3 ou Vite 8.1 comme installés. Migration séparée documentée dans WORKFLOWS.md.
