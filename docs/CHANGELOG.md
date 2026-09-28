# Journal de livraison

## WEBEDRIVE unified-1 — 28 septembre 2026
Base réelle : 3b50160cfa985c261dcf02c769a897b71509ca4c.
PR #1, branche work/webedrive-unification-20260928.

Unification du design system et des composants publics ; logo raster récupéré ; navigation mobile native ; blog conservé ; redirects legacy ; revue et corrections article/Newsletter/mouvement ; 19 contrats Node + parse syntaxique des sources ajoutés au prebuild. Commande Vercel explicite `npm run build`, sortie `dist`, cache désactivé pour la version et le SW.

Le premier preview 1d1b4a1265e6ec0a920db2002a39f3220833cbe3 est READY sur Vercel. Les logs de build du connecteur sont indisponibles (tool not found). Les Actions GitHub échouent avant les étapes ; cause non établie. La suite Playwright est fournie pour preview local mocké, non déclarée exécutée tant que ses résultats ne sont pas accessibles. Aucun test ne doit écrire en production.

Manrope est référencé via Google Fonts, aucun fichier de police n’est embarqué. Les versions majeures des dépendances et le lockfile restent inchangés ; ne pas annoncer React 19.3 ou Vite 8.1 comme installés. Migration séparée documentée dans WORKFLOWS.md.


## WEBEDRIVE unified-2 — 28 septembre 2026
Ajout d’un estimateur de budget local sur l’accueil : heures complémentaires et tentatives de code mettent à jour les totaux Classique/Accélérée à partir des tarifs approuvés, sans collecte ni réservation. Le blog identifie maintenant explicitement les articles de démonstration lorsque la base de contenu réel n’a rien fourni. Styles responsive partagés et contrats de régression ajoutés.


## WEBEDRIVE unified-3 — 28 septembre 2026
Migration navigateur rendue non destructive : retrait ciblé des anciens service workers WEBEDRIVE et suppression limitée aux caches appartenant au projet. Ajout d’un `robots.txt` globalement bloquant tant que le site reste un prototype non validé. Contrats de régression associés ajoutés.

## Reprise unified-3 — 28 septembre 2026
Le commit 17b7496 n’était pas livré : Vercel failure et erreur syntaxique du test reproduite localement (`quality.test.mjs:140`, parenthèse manquante). Correction sans retirer aucun contrôle. Huit tests comportementaux isolés sont ajoutés et passent après correction de la gestion des refus de stockage. La politique prototype est rectifiée : directive HTTP globale `X-Robots-Tag: noindex, nofollow`, avec exploration autorisée pour que les robots lisent cette directive, et non simple `Disallow: /`.

Preuves, couverture, critères et limites : [audit de reprise](audits/2026-09-28-runtime-retry.md). Le statut de publication doit être lu dans la PR et les statuts du commit ; ce journal ne déclare pas par anticipation une fusion ou une recette navigateur réussie.
