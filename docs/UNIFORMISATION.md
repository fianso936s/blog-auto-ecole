# Modifier Le Repère Permis une seule fois

Le dépôt GitHub `fianso936s/blog-auto-ecole`, déjà relié à Vercel, est désormais la source du site, de l’app iOS native et de leur API. Les archives iOS antérieures sont des historiques, pas une seconde branche à maintenir.

| Modification | Source commune | Application |
| --- | --- | --- |
| Cours et références | packages/product/src/courses.ts | Site, iOS et catalogue API généré |
| Questions et explications | packages/assessment/questions.json | Correction sur le serveur ; mêmes questions côté web/iOS |
| Quiz, lecture et objectifs | packages/product/src/hooks.ts, contracts.ts | Contrôleurs communs, rendus HTML et React Native |
| Couleurs, navigation, serveur, version | packages/product/product.json | CSS généré, thème et onglets iOS, configuration de production |
| GPS, GPX, schémas et géométrie du replay | packages/core/src | API, web et iOS |
| Vidéo, curseur, retour au début | packages/ui-web/src/VideoPlayer.tsx | React sur le site et même lecteur compilé dans la WebView iOS |
| Caméra, Meta, GPS en arrière-plan, stockage et connexion | Adaptateurs apps/mobile et src/shared | Intégrations propres au support ; pas de mot de passe ou clé serveur dans le client |

## Travail courant

1. Modifier le module commun. Une fonctionnalité avec deux rendus doit être raccordée des deux côtés.
2. Exécuter `npm run product:generate`. Cette commande produit les couleurs CSS, la configuration iOS, les cours côté API, le lecteur iOS et une empreinte commune.
3. Exécuter `npm run verify:uniformity`, puis `npm run build:ios` avant une livraison native.
4. Pousser la même révision dans Git. Vercel refuse un build si le socle partagé, les fichiers générés, TypeScript ou les tests divergent. GitHub Actions contrôle aussi l’export JavaScript iOS et conserve l’export et l’API sous le même SHA Git.
5. Déployer l’API depuis cette révision lors d’un changement serveur/contenu. Les nouvelles apps iOS 1.7 récupèrent le contenu pédagogique publié toutes les 30 secondes ; hors connexion elles gardent les cours embarqués. Les permissions restent vérifiées par le serveur.

`/product-version.json` sur le site et `/v1/product` sur l’API donnent la version et l’empreinte communes. L’empreinte est aussi incorporée dans la configuration Expo.

## Ce qui reste spécifique à la distribution

Un changement de permission, vidéo ou parcours se voit dès la synchronisation serveur. Un changement de cours devient disponible après déploiement de l’API qui contient ce cours. L’interface native ou une nouvelle bibliothèque nécessitent une nouvelle version iOS, compilée avec la signature existante puis envoyée sur TestFlight/App Store. Vercel ne peut pas remplacer cette étape. Aucun mécanisme de téléchargement de code non validé n’a été ajouté.

Les workflows Codemagic existants et l’intégration Meta/SwiftPM sont conservés. La commande `npm run ios:testflight` utilise EAS et nécessite l’accès Expo/Apple du propriétaire. La CI GitHub ne s’envoie pas elle-même sur l’App Store et ne contient aucun secret de déploiement.

## Vérification

- Contrôleurs de quiz réellement partagés, tentative conservée au retour d’une erreur réseau, correction uniquement sur le serveur.
- Import des marques locales seulement si aucune marque serveur n’existe ; les mises à jour serveur gagnent lors d’un changement d’appareil.
- Contrôles de génération empêchant les copies indépendantes des cours et règles critiques.
- Adaptation native : tactile, VoiceOver, marges sûres, stockage sécurisé et modules matériels. Une uniformité fonctionnelle ne signifie pas forcer les composants HTML dans tous les écrans iOS.
- L’export iOS sur Linux ne prouve pas le fonctionnement des modules Meta/caméra ni une compilation Xcode ; un essai signé sur iPhone reste requis avant distribution.
