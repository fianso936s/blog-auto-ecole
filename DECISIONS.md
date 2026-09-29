# DECISIONS — WEBEDRIVE / Ruban de progression

## 2026-09-29 — D01 / Source de vérité de cette session

Le PDF `WEBEDRIVE_Benchmark_3D_Cahier_IA v1.0` est disponible. Le ZIP qu'il référence ne l'est pas.

Décision :
- reconstruire uniquement les valeurs explicitement présentes dans le PDF ;
- annoter les contrats reconstruits avec `RECONSTRUCTED_FROM_PDF` ;
- ne jamais présenter ces fichiers comme les originaux du ZIP ;
- ne pas inventer les sous-critères absents d'`acceptance.criteria.json`.

## D02 / Phasage

P0 est terminé : `INVENTAIRE.md` existe avant les modifications de code.

P1 est implémenté sur la branche :
- expérience fixe en trois chapitres ;
- grille desktop 5/7 sur 12 colonnes ;
- panneau visuel sticky limité à la zone narrative ;
- version mobile sans sticky narratif ;
- poster mobile dédié au ratio 5/4 ;
- légende « Illustration du parcours — véhicule non contractuel. » ;
- accès aux formations disponible sans moteur 3D ;
- quatre tarifs visibles simultanément dans la comparaison.

P2 / P3 restent `ASSET MANQUANT` : aucun modèle éditable ni GLB licencié n'a été fourni. Aucun moteur Three.js n'est ajouté avant l'existence d'un modèle vérifiable.

## D03 / Contact

Aucun canal de contact public fiable n'a été trouvé dans le dépôt inspecté.

Décision :
- ne pas inventer email, téléphone, adresse ou endpoint ;
- conserver dans le premier chapitre un état visuel non interactif « Canal de contact à confirmer » ;
- ne pas déclarer l'action contact livrable.

## D04 / Header partagé

Pour respecter la grille d'exécution :
- header desktop : 72 px ;
- header petit mobile : 64 px ;
- la barre sticky du blog suit ces hauteurs.

Le logo et ses proportions ne sont pas modifiés.

## D05 / Formations

La comparaison commerciale affiche désormais les deux rythmes et les volumes 13 h / 20 h en même temps.

Le sélecteur 13 h / 20 h est conservé uniquement dans l'estimateur local de budget pour préserver son usage interactif.

Les valeurs de `src/lib/offers.ts` ne sont pas modifiées.

## D06 / Contrats reconstruits

Créés à partir des seules valeurs explicites du PDF :
- `contracts/scene.config.json`
- `contracts/performance-budgets.json`
- `contracts/content.fr.json`
- `contracts/assets.manifest.json`
- `contracts/acceptance.criteria.json`

Le manifeste marque explicitement les GLB, la source éditable et le manifeste de licences comme manquants.

## D07 / Référence mathématique

`reference/scene-math.mjs` implémente le clamp, smoothstep et l'interpolation des cinq ancrages décrits par le PDF.

`reference/scene-math.test.mjs` est inclus dans `npm test`.

## D08 / Publication

Cette branche est une branche de travail. Aucune publication n'est nécessaire pour déclarer P0/P1 enregistrés.

Une réussite de build confirme les tests/compilation, pas la qualité visuelle finale ni l'existence d'un asset 3D.
