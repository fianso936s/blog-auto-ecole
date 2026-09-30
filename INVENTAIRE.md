# INVENTAIRE — WEBEDRIVE / Ruban de progression

Date : 30 septembre 2026  
Branche cumulative : `design/experience3d-master-pass-21`  
Base de production lue avant intégration : `main@6770a3a730b245432527e99603287e084c16f5ed`

## Sources GitHub suivies

La branche `feature/ribbon-progression-p0-p1` contient le travail P0/P1 du cahier 3D : contrats, référence mathématique, poster, styles, générateur procédural et documentation d’asset. Elle diverge du `main` courant ; ses fichiers utiles sont donc repris sélectivement au lieu d’une fusion aveugle.

## État constaté avant cette passe

- `/` utilise `WebedriveLanding.tsx`; `/blog` et les routes élève/admin restent dans le même dépôt.
- Le visuel public était encore `DriveVisual.tsx`, une illustration SVG 2D.
- `RoadScene.tsx` est un Canvas2D, pas une scène WebGL.
- Les tarifs et fonctions du simulateur actuels doivent rester inchangés.
- Aucun nouveau dépôt, projet Vercel ou workflow CI n’est créé.

## État de la branche cumulative

Implémenté :
- composition « Le ruban de progression » en trois chapitres ;
- poster fixe et fallback explicite ;
- scène WebGL Three.js différée et isolée ;
- route centripète, compacte illustrative, matériaux et lumière issus du contrat ;
- cinq ancrages de caméra et progression déterministe ;
- GSAP/ScrollTrigger uniquement pour la progression brute du scroll ;
- desktop automatique après load/idle ; mobile uniquement sur action ;
- reduced-motion, Save-Data, WebGL2 indisponible, perte de contexte et timeout reviennent au poster ;
- suspension hors viewport / onglet masqué ;
- contrôles HTML et contenu commercial hors canvas ;
- contrats et fonctions de référence versionnés avec le site.

À vérifier avant publication :
- build Vercel du SHA final ;
- rendu réel desktop/mobile et cadrage ;
- mesures de performance terrain ;
- export GLB final si la scène procédurale doit être remplacée par les exports du générateur.

## Commandes prévues par le dépôt

- `npm test`
- `npm run build`

Aucun test ou capture n’est déclaré exécuté tant qu’un statut de build ou une inspection réelle ne le confirme.
