# Backlog WEBEDRIVE

Priorités après la reprise du 28 septembre 2026. Voir [les preuves de reprise](audits/2026-09-28-runtime-retry.md) et le statut réel de sa PR avant de déclarer un point livré.

## P1
- Auditer les politiques RLS et les parcours élève/admin dans un environnement isolé, sans créer de compte de production.
- Sécuriser l’API de notification : autorisation, validation stricte, échappement de sortie et dépendance serveur déclarée. Aucun envoi réel pendant les tests.
- Compléter les cas de robustesse ArticleBody avec contenus malformés et URL non sûres.
- Reprendre les constats du quiz et de ses fixtures navigateur dans l’issue #2 ; ne pas supprimer les quiz ni annoncer une génération IA lorsqu’il s’agit du texte enregistré.

## P2
- Terminer l’unification visuelle des écrans connexion, inscription, élève et admin sans toucher aux protections métier.
- Exécuter la recette navigateur complète 320 / 390 / 768 / 1440, navigation clavier, focus, thèmes et reduced-motion dans un environnement local isolé lorsque disponible. Les tests Node ne remplacent pas ce parcours.
- Migration service worker : huit tests comportementaux isolés réussis sur la branche de reprise, dont refus de stockage ; validation avec des registrations réelles en navigateur encore à faire.
- Vérifier en HTTP la directive globale X-Robots-Tag du prototype quand l’accès au déploiement est autorisé. Ne pas réintroduire Disallow: / comme substitut de noindex.

## P3
- Mesurer la scène automobile sur appareil réel avant tout passage à une 3D plus coûteuse.
- Revoir SEO/prérendu et redirections serveur une fois le statut prototype levé.
