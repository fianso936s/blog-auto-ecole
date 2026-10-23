# Synchronisation et lecteur — 23 octobre 2026

Le site et le profil EAS production de l’app iOS 1.6.0 utilisent la même API :
`https://br-fragrant-lake-b9utxdv6-spotapi.compute.c-7.eu-central-1.aws.neon.tech`.
Le proxy web transmet la session applicative au même serveur et conserve les règles d’accès.
La base existante est `repere_spot` dans le projet Neon `wild-smoke-57329375`, branche `br-fragrant-lake-b9utxdv6`.
Aucune base supplémentaire, migration de données ou publication de contenu privé effectuée.

## Constat initial en lecture seule (avant la publication demandée)

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

## Correctif de premier lancement sur Safari

Signalement : capture IMG_7446.png, carte partiellement rendue au premier Play.
Le dialogue est maintenant ouvert avant l’initialisation de la carte. Un observateur redimensionne le canvas aux dimensions réelles de son conteneur et lors des changements du viewport Safari ; la lecture attend la disponibilité de la carte. La carte de fond est démontée pendant le lecteur pour éviter un deuxième rendu cartographique inutile.

Street View conserve son iframe entre Carte et Street View. Un échange de disponibilité répété et borné récupère un premier message manqué ; les temporisations de démarrage et de position sont distinctes. Le tracé est transmis une seule fois par iframe. Réessayer une position ne recharge pas Google.

21 tests web passent, dont ouverture du dialogue avant la carte, attente de disponibilité avant Play, changement de taille portrait/paysage et viewport, récupération d’un message initial manqué, réutilisation de l’iframe, omission des géométries répétées. TypeScript et compilation de production vérifiés. Le rendu sur un iPhone physique reste à confirmer par l’utilisateur.

## Cours, quiz et suivi connecté

La rubrique Fiches pédagogiques propose désormais un parcours théorique, les marques de lecture/révision synchronisées, 38 questions écrites d’après les 19 fiches déjà publiées et leurs corrections explicatives. Les questions et les bonnes réponses de référence sont versionnées dans le catalogue serveur. Le serveur calcule les scores ; un identifiant d’essai rend les reprises réseau idempotentes. Une ancienne révision de quiz est refusée. Les marques historiques du navigateur sont importées uniquement en absence d’entrée serveur et l’import s’arrête si le compte change.

Les enseignants disposent d’un onglet Suivi des élèves : fiche lue, meilleur score et nombre d’essais, objectifs ajoutés au parcours, consigne et validation en leçon. Les élèves ne peuvent pas se donner une validation d’enseignant. Le suivi des replays de parcours cartographiques est visible pour les enseignants autorisés. Les comptes enseignants sont limités aux élèves rattachés ; l’administrateur voit les élèves du service. Les vérifications d’autorisation sont effectuées côté API avant les lectures et écritures.

Migration additive `015-course-progress.sql` testée sur la branche `br-falling-bar-b95ckl23`, puis appliquée à la base existante `repere_spot`. Elle crée trois tables privées avec effacement en cascade lors de la suppression d’un compte et droits limités au rôle serveur. Aucune donnée élève synthétique ajoutée en production. Le backend est au déploiement 29, avec les variables précédentes conservées. Les modifications reproductibles sont dans `backend/courses-progress.patch` et l’archive de sources iOS.

L’ajout de repères se fait maintenant en choisissant un emplacement sur la carte après le bouton Ajouter, avec une option Utiliser le centre et une annulation. Le parcours courant est conservé pour rattacher le repère. Une erreur de rattachement ne masque plus la réussite de sa création dans le catalogue. Le formulaire de position s’adapte sur deux colonnes à petite largeur ; les nouvelles commandes et réponses aux quiz sont dimensionnées pour le tactile.

Validation : 23 tests web passent (dont création réelle du formulaire, choix exact de coordonnées, rafraîchissement serveur, quiz et reprise réseau, chargement de la progression d’un autre profil), TypeScript web/API, 22 tests API et sécurité incluant une base Postgres embarquée exécutant les vraies requêtes du suivi. Les vérifications de mise en page sur un iPhone physique et la vérification avec la session réelle de l’utilisateur restent à effectuer. L’application iOS native bénéficie du même backend, mais cette livraison d’interface concerne le site web ; elle ne constitue pas une nouvelle version App Store.

## Publication des parcours pour les élèves

À la demande explicite de l’utilisateur, les cinq parcours existants de Nanterre/Gennevilliers ont été publiés. Les versions ont été incrémentées pour empêcher une ancienne copie de les remettre silencieusement en privé ; les repères de ces parcours ont été partagés, sans restaurer les éléments archivés ou masqués par modération. Contrôle en lecture seule : chacun des sept comptes élèves actuels dispose de cinq parcours visibles selon les filtres de modération/blocage du serveur. Il ne s’agit pas d’un essai dans la session réelle d’un élève. Un bouton direct « Publier pour les élèves » est proposé sur les prochains parcours privés et un badge explicite indique leur publication.

## Retour au départ
Bouton explicite dans le lecteur carte/Street View : pause, premier point, recentrage et sauvegarde de la position zéro. Le panorama intégré reste monté. Les vidéos enregistrées ont aussi un bouton Retour au début. Sur mobile, les actions passent sur une ligne dédiée. Test de régression : retour Street View à zéro, conservation iframe, sauvegarde zéro et carte au départ.

## Vidéos, visibilité et direct — 23 octobre 2026
- Import MP4/MOV : copie locale conservée, envoi privé automatique si stockage disponible, puis choix Privé / Tous mes élèves actuels / Élèves sélectionnés. Aucun contenu n’est publié automatiquement.
- Publication/retrait des vidéos et parcours accessibles directement. Le lecteur élève se ferme si le catalogue ne l’autorise plus. Les liens vidéo déjà signés peuvent rester valables jusqu’à leur expiration (5 minutes).
- Notifications PostgreSQL après validation des écritures, diffusées par SSE authentifié ; reprise à la reconnexion et secours 10 secondes. Rafraîchissement des catalogues et du parcours ouvert, sans rechargement manuel.
- Stockage Neon privé activé, signature S3 compatible, CORS limité au domaine de production. Envoi, HEAD, lecture avec CORS et suppression d’un objet technique vérifiés. Fichiers historiques uniquement présents sur un iPhone à téléverser depuis cet appareil.
- Correction droits administrateur : même périmètre d’élèves que son annuaire. Enseignant limité aux élèves liés, élève limité à une autorisation explicite. Test API avec administrateur/enseignant/élèves, JWT diffuseur vs spectateur et révocation SFU.
- Direct web : aperçu local muet, vidéo mobile inline, commande son, état reconnexion, heartbeat lancé avant la caméra, tolérance de deux erreurs réseau transitoires.
- Vérifications : TypeScript web/API, 25 tests web et 23 tests API ciblés ; trois suites statiques vidéo/direct. Aucun test de caméra/réseau avec deux vrais appareils ou session élève réelle.

- Contrôle production /health : stockage vidéo actif et service LiveKit configuré/joignable. Test navigateur automatisé du formulaire réel : publication à tous les élèves actuels, badge actualisé, puis retrait privé.

## Curseur vidéo et quiz mobile — 23 octobre 2026

| Avant | Après | Pourquoi |
| --- | --- | --- |
| Curseur dépendant des commandes natives masquées | Barre visible avec position/durée, déplacement dans les deux sens et raccourcis −10/+10 secondes | Navigation tactile et clavier accessible sans interrompre la lecture |
| Boutons radio ciblés par le style des champs texte | Radios de 20 px dans des lignes tactiles de 52 px, sans padding de champ texte | Évite les réponses décalées et le débordement horizontal |
| Validation sans indication du nombre de choix | Compteur de réponses, validation après toutes les réponses, boutons pleine largeur sur mobile | Compréhension et usage à une main |

- Composant vidéo limité aux enregistrements : le direct reste sans recherche temporelle.
- Durée inconnue : recherche désactivée jusqu’aux métadonnées ; bornes début/fin respectées. La recherche conserve la lecture en cours, le retour au début met en pause.
- Quiz : colonne de texte réductible, retours à la ligne sur questions/réponses/corrections, focus visible et formulaires sans largeur minimale intrinsèque.
- Tests ciblés réels React/DOM : avance/recul au curseur, raccourcis bornés, pause uniquement au retour au début ; styles calculés du radio avec la feuille CSS complète ; compteur, validation et conservation d’une tentative après erreur réseau.
- Limite : aucun contrôle tactile sur un iPhone physique dans cette session.
