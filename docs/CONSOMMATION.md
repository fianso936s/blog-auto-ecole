# Réduction des chargements inutiles

Les contrôles d’accès restent exécutés côté serveur. Aucun cache partagé de données privées et aucun délai de révocation de permission n’ont été ajoutés.

- Les listes de repères calculent le nombre de photos dans Postgres et sélectionnent uniquement les champs de résumé : les images ne traversent plus la connexion de base avant d’être supprimées du JSON de réponse. Le détail d’un repère continue à fournir ses photos autorisées.
- Les listes de parcours sélectionnent leurs métadonnées, sans la géométrie inutilisée. Le tracé complet reste disponible à l’ouverture.
- Les deux clients comparent une petite empreinte de publication avant de retélécharger les cours. Un catalogue inchangé n’est plus chargé en entier toutes les 30 secondes. Vérification toutes les cinq minutes sur écran actif, ainsi qu’à l’ouverture ; les demandes concurrentes d’un même transport sont regroupées.
- Sur le site, les notifications de publication restent prioritaires. Le contrôle de secours passe à une minute quand le flux est déconnecté ; un contrôle de sécurité toutes les cinq minutes récupère d’éventuels événements perdus quand il fonctionne. Les notifications reçues restent traitées immédiatement après regroupement des rafales.
- Les onglets masqués ferment le flux de notifications et ne rechargent pas les catalogues. Le retour au premier plan réconcilie les données. Les reconnexions échouées sont espacées progressivement, jusqu’à une minute.
- Sur iPhone, une synchronisation sans écriture n’entraîne plus un rechargement complet du profil, de la configuration et des listes. Les résumés de parcours/repères restent consultés toutes les cinq secondes au premier plan pour les publications et retraits. Une panne espace les nouvelles tentatives jusqu’à une minute.
- Les listes vidéo iOS ne sont plus actualisées en arrière-plan et ne lancent pas de requêtes concurrentes. Le transport du direct et la cadence de lecture ne sont pas ralentis.
- Le suivi pédagogique iOS est actualisé toutes les 60 secondes plutôt que 10 ; les actions locales restent enregistrées immédiatement. Les statistiques détaillées passent de 10 à 30 secondes, les plannings de 10 à 15 secondes. Les contrôleurs sont communs web/iOS et interrompent leur polling hors premier plan.

## Validation et limites

Un test exécute les vraies requêtes de listes dans Postgres embarqué avec une photo de 300 ko et une géométrie de 300 ko. Les listes retournent chacune moins de 4 ko depuis la base ; le détail restitue la photo et le repère privé d’un autre enseignant reste exclu. Cette mesure sur fixture ne prédit pas le pourcentage de réduction de l’application entière.

Les tests vérifient aussi le téléchargement des cours uniquement après changement de révision, le regroupement des requêtes et la fermeture/reprise des notifications quand l’onglet est masqué.

Le quota Neon déjà consommé ne peut pas être récupéré par ces modifications. La base étant suspendue par le quota lors du travail, une mesure de consommation en production après rétablissement reste nécessaire. Les modifications natives nécessitent une nouvelle compilation signée et distribution iOS.
