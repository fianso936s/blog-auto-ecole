# Statistiques, planning et lunettes Meta

Dans **Mon espace**, les comptes administrateur et enseignant ont deux entrées : **Statistiques par élève** et **Planning enseignant**. L’administrateur voit tous les élèves et les plannings des enseignants ; un enseignant ne voit que ses élèves et ne peut modifier que son propre planning.

Les statistiques distinguent les fiches lues, les quiz réussis, le nombre de tentatives, le score des meilleurs essais, les objectifs validés en leçon et la progression des replays. La progression théorique ne prétend pas mesurer la compétence de conduite.

Le planning affiche les heures de Paris. Choisir le jour, puis appuyer sur un créneau : vert ouvert, gris fermé. Un second appui le ferme. Les disponibilités sont enregistrées au serveur commun, avec contrôle de version pour empêcher un autre appareil d’écraser une modification récente. Les créneaux passés sont désactivés. Il s’agit de disponibilités, pas d’une réservation automatique pour un élève.

## Meta depuis le site

La caméra des lunettes utilise le Device Access Toolkit natif dans l’app iOS. La documentation Meta distingue ce SDK iOS/Android des Web Apps pour les lunettes Display : https://developers.meta.com/wearables/device-access-toolkit/ et https://developers.meta.com/wearables/faq/.

La rubrique **Vidéos** du site affiche une carte **Lunettes Meta** avec le lien **Ouvrir l’app iPhone** et l’état remonté par l’app : module présent/absent, enregistrement auprès de Meta, connexion lunettes et présence d’images. Cette remontée nécessite la nouvelle version native ; l’absence de retour ne prouve pas que le module manque dans une ancienne version.

1. Ouvrir la rubrique Vidéos sur l’iPhone avec le même compte enseignant que sur le site.
2. Dans la connexion Meta, choisir les lunettes et accepter les autorisations de Meta AI.
3. Choisir les élèves et lancer le direct depuis l’iPhone.
4. Ouvrir le direct dans la vidéothèque du site pour le surveiller.

Le site rejoint désormais un direct existant comme spectateur, y compris pour son propriétaire. Cette session de surveillance a une identité LiveKit différente de celle de l’iPhone. Elle ne démarre pas la caméra du navigateur et sa fermeture n’arrête pas le diffuseur. Un direct créé expressément avec la caméra du navigateur reste un diffuseur.

Les états matériels sont ceux déclarés par l’app de l’utilisateur, pas une certification distante du SDK. Aucune connexion à de vraies lunettes ni diffusion entre deux appareils physiques n’a été validée dans cette session. Une nouvelle compilation signée iOS reste nécessaire pour distribuer ces adaptations natives.
