# Synchronisation et lecteur — 23 octobre 2026

Le site et le profil EAS production de l’app iOS 1.6.0 utilisent la même API :
`https://br-fragrant-lake-b9utxdv6-spotapi.compute.c-7.eu-central-1.aws.neon.tech`.
Le proxy web transmet la session applicative au même serveur et conserve les règles d’accès.
La base existante est `repere_spot` dans le projet Neon `wild-smoke-57329375`, branche `br-fragrant-lake-b9utxdv6`.
Aucune base supplémentaire, migration de données ou publication de contenu privé effectuée.

## Constat en lecture seule

- 5 parcours serveur ; aucun n’est publié. Les élèves doivent être destinataires d’une attribution, ou les parcours doivent être publiés par leur auteur/admin.
- 19 repères actifs ; leurs photos représentent environ 2,10 Mo de JSON. L’iPhone demande `summary=1`, alors que le site rechargeait toutes les photos à chaque actualisation.
- 11 entrées vidéo, toutes `state=local`, `visibility=private`. Les métadonnées existent sur le serveur, mais les fichiers restent sur les appareils. Le stockage R2 nécessaire aux fichiers distants n’est pas configuré dans le déploiement courant.
- L’API répond au contrôle de santé. Les tests sans session renvoient bien 401.
- La vérification interactive du compte n’a pas été effectuée : la demande de connexion sécurisée a été déclinée. Ne pas présenter ce diagnostic comme une validation complète des données de ce compte.

## Changements

| Avant | Après | But |
| --- | --- | --- |
| Photos chargées dans la liste des repères | `/v1/spots?summary=1`, détail à l’ouverture | Même appel que sur iPhone, moins de données |
| Un échec masquait plusieurs rubriques | Chargements indépendants des listes et réglages | Garder les données disponibles visibles |
| Actualisation uniquement périodique | Reprise réseau, retour à l’onglet, bouton Synchroniser | Retrouver les changements faits sur iPhone |
| Session expirée sur une rubrique privée | Retour à la connexion, message explicite | Éviter une page qui semble bloquée |
| Play dans une fiche superposée | Dialogue plein écran, carte et commandes dans des zones distinctes | Préserver la surface de lecture |
| Lien externe Google Maps | Viewer Street View iOS intégré par iframe | Rester dans le site |

Le lecteur conserve la position, propose Carte/Street View, 2D/3D et le repère suivant.
La progression est enregistrée sur l’API partagée à la pause, au changement manuel, périodiquement et à la fermeture.
Street View attend une vue validée avant d’avancer, conserve l’ancienne vue pendant le chargement et se met en pause si une vue manque.
La géométrie et les contrôles de panorama utilisent les mêmes critères que l’iPhone.

La page publique `/streetview` du backend autorise uniquement son propre domaine et le domaine Vercel de production à l’intégrer. Les pages d’authentification conservent `X-Frame-Options: DENY`. Les messages vérifient à la fois le domaine et la fenêtre source ; seuls les coordonnées/tracés nécessaires sont transmis, sans token ni données de compte.
Les changements backend sont reproduits dans `backend/streetview-web.patch` et dans l’archive iOS existante. Le déploiement conserve toutes les variables d’environnement.

## Validation

- TypeScript web et API.
- 20 tests web, dont lecture, bascule Street View, refus d’un message externe, retour carte et enregistrement de progression.
- 17 tests backend de replay, panoramas, absence de couverture, messages obsolètes, rendu natif et iframe.
- Contrôle des en-têtes sur Street View et les pages de connexion.
- Publication et vérification des réponses publiques ; les actions authentifiées et le rendu sur un iPhone physique restent à vérifier avec une session utilisateur.

La lecture locale des fiches pédagogiques reste propre au navigateur/appareil : l’API actuelle n’expose pas de ressource de synchronisation de ces marqueurs.
Sources techniques : https://developers.google.com/maps/documentation/javascript/streetview et https://neon.com/docs/compute/functions/deploy.
