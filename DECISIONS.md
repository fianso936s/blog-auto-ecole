# DECISIONS — WEBEDRIVE / Expérience 3D

## D01 — Continuité
La branche `feature/ribbon-progression-p0-p1` n’est pas fusionnée directement car elle est en retard sur `main`. Les contrats et composants utiles sont réconciliés dans `design/experience3d-master-pass-21` afin de conserver les améliorations WEBEDRIVE publiées depuis.

## D02 — Direction
La direction reste « Le ruban de progression » : route sculpturale, compacte bleu WEBEDRIVE, trois chapitres Comprendre / Organiser / Avancer. Pas de ville, jeu de conduite, particules, néons ou logo 3D.

## D03 — Runtime
La scène est chargée à la demande depuis un module isolé. Three.js 0.186.1 et GSAP 3.15.0 sont épinglés dans les URLs ESM de la couche différée ; ils ne font pas partie du chemin critique initial. Aucun React Three Fiber, Next.js ou second projet n’est ajouté.

## D04 — Dégradation
Le poster est toujours le premier rendu. Mobile : activation explicite. Reduced motion ou Save-Data : poster uniquement. Erreur, timeout ou perte du contexte WebGL : retour au poster.

## D05 — Commerce
Les prix, le sélecteur 13 h / 20 h, Classique / Accélérée, le simulateur et le blog restent inchangés. Aucun avis, taux de réussite, agrément, disponibilité ou coordonnées ne sont inventés.

## D06 — Assets
Le générateur procédural GitHub demeure la source éditable de la compacte et de la route. La première intégration WebGL reproduit cette géométrie dans le runtime pour rendre la direction visible immédiatement ; l’export GLB final reste un lot distinct à valider visuellement avant de le déclarer final.

## D07 — Publication
Le développement et l’enregistrement GitHub sont prioritaires. Une preview Vercel verte valide la compilation du SHA correspondant, pas la qualité visuelle finale.
