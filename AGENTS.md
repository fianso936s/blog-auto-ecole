# Le Repère Permis — un seul produit, deux supports

Le dépôt contient le site React (src/), l’application Expo native (apps/mobile/), l’API (apps/api/) et les règles communes (packages/).

- Toute demande fonctionnelle concerne web ET iOS, sauf indication explicite du propriétaire. Modifier le module commun en priorité, puis les rendus des deux supports. Ne pas annoncer une parité complète à partir d’une simple comparaison de textes.
- Cours : packages/product/src/courses.ts uniquement. Questions/corrections : packages/assessment/questions.json côté serveur uniquement. Ne jamais importer cette banque dans le client.
- Couleurs, navigation, URL du serveur et version : packages/product/product.json. GPS/GPX, schémas, Street View : packages/core. Quiz/suivi : packages/product/src/hooks.ts et contracts.ts. Lecteur vidéo : packages/ui-web/src/VideoPlayer.tsx (site + bundle WebView iOS).
- Après une modification commune, exécuter npm run product:generate puis npm run verify:uniformity. Ne pas éditer à la main les fichiers générés. npm run build:ios vérifie l’export JavaScript natif ; il ne remplace pas une compilation Xcode ni un essai sur iPhone.
- Préserver les fichiers iOS/SwiftPM/Meta maintenus à la main. Ne pas régénérer aveuglément apps/mobile/ios. Les clés Apple, Meta et LiveKit restent hors du dépôt et hors des clients.
- Les contenus et permissions sont servis par l’API commune. Les modifications natives requièrent une version iOS et sa distribution Apple ; un déploiement Vercel n’est pas une mise à jour App Store.
- Éviter tout contournement d’authentification ou création de session élève de production pour les tests. Utiliser les fixtures locales et des comptes de test consentis.
