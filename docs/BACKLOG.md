# Backlog WEBEDRIVE

Priorités maintenues après la passe unified-2.

## P1
- Auditer les politiques RLS et les parcours élève/admin dans un environnement isolé, sans créer de compte de production.
- Sécuriser l’API de notification : autorisation, validation stricte, échappement de sortie et dépendance serveur déclarée. Aucun envoi réel pendant les tests.
- Compléter les cas de robustesse ArticleBody avec contenus malformés et URL non sûres.

## P2
- Terminer l’unification visuelle des écrans connexion, inscription, élève et admin sans toucher aux protections métier.
- Exécuter la recette navigateur complète 320 / 390 / 768 / 1440, navigation clavier, focus, thèmes et reduced-motion lorsque l’environnement de preview est accessible.
- Exécuter un test navigateur isolé de la migration service worker/caches avec plusieurs registrations factices ; la logique source est désormais restreinte aux ressources WEBEDRIVE.

## P3
- Mesurer la scène automobile sur appareil réel avant tout passage à une 3D plus coûteuse.
- Revoir SEO/prérendu et redirections serveur une fois le statut prototype levé.
