# Audit WEBEDRIVE — 28 septembre 2026

## Périmètre et méthode
Revue statique du dépôt réellement lu à 3b50160, puis refonte transversale sur branche. Ce document n’est ni un audit de sécurité complet ni une validation de données en production. La lecture HTTP du déploiement via le connecteur Vercel a été refusée ; aucune visite live n’est revendiquée.

## Corrigé dans l’incrément d’unification
| Sujet | Constat initial | Correction | Recette prévue |
|---|---|---|---|
| Identité | Arial sur landing, Syne/Outfit et terracotta sur blog | Manrope/fallback commun, tokens bleu/ivoire/sable, thèmes partagés | Contrats CSS + contrôle navigateur |
| Logo | Nom retapé dans la landing, symbole générique dans blog | Une référence raster direction 10 dans BrandMark | Hash binaire + inspection visuelle |
| Navigation | Deux en-têtes et pieds distincts ; menu mobile landing absent | Header/Footer réutilisés, cinq entrées, dialogue mobile natif | Source + clavier/dialogue à tester |
| Routage | Liens ArticleCard/CategoryBadge encore /articles | URLs /blog normalisées et redirects legacy | Tests helpers/routes |
| Métadonnées | Titres Blog Auto-École, canonical example.com, favicon absent | PageMeta WEBEDRIVE, canonical route, fin des placeholders | Contrats HTML |
| Pied de page | Coordonnées fictives et liens juridiques vers les articles | Suppression des faux contacts ; note explicite de validation restante | Contrat de contenu |
| Articles | Pas de filtre published dans détail ; état précédent possible | Filtre publié, reset/cancellation au changement de slug | Contrats source + futur parcours API mocké |
| Rendu HTML | Injection HTML brute dans détail | Vocabulaire éditorial rendu en éléments React, attributs non transmis | Contrat source ; tests d’attaques navigateur restent nécessaires |
| Newsletter | Placeholder sans label ; gradient jaune divergent | Label permanent, erreurs associées, styles communs | Source ; ne pas envoyer de test en production |
| Thème | localStorage non protégé | Gestion de stockage indisponible sans crash | Source ; navigateur à compléter |
| Animation | Boucle permanente hors écran ; taille flottante du canvas | Suspendre hors écran/onglet masqué ; observer resize ; préférence mouvement | Contrats source ; mesurer sur appareil réel |

## Couverture de revue
Lecture approfondie : App, PublicLayout, Header, Footer, WebedriveLanding, main, index.css, index.html, ArticleCard, ArticleDetailPage, ArticlesPage, Newsletter, CategoryBadge, ThemeContext, PageMeta, types, supabase, AuthContext, API send-notification, vercel.json. Les composants créés dans cette itération sont également examinés.
La compilation/syntaxe couvre les sources applicatives, mais ne vaut pas revue logique de chaque fichier. Le contenu pédagogique des articles n’est pas réécrit ou revérifié réglementairement dans cette passe.

## Priorités restantes
- P1 : AuthContext/register peut construire un utilisateur sans session confirmée ; le callback auth gère seulement logout. Examiner avec tests isolés avant modification.
- P1 : api/send-notification ne contrôle pas l’identité/autorisation et interpole des champs dans du HTML ; resend n’apparaît pas dans les dépendances déclarées. Vérifier configuration, limiter/valider l’entrée, appliquer authentification et échapper HTML. Aucun appel d’envoi n’a été effectué.
- P1 : revue réelle des politiques RLS Supabase, espaces admin/élève, récupération de compte ; accès et données non audités ici.
- P1 : couvrir ArticleBody avec cas XSS, HTML mal formé, liens et tableaux ; la liste des éléments autorisés ne conserve pas scripts, embeds ou styles inline. Le texte et la mise en forme éditoriale standard sont conservés, les embeds ne le sont pas.
- P2 : compléter l’unification fine des écrans de connexion, inscription, cours et administration (leurs tokens et polices sont déjà communs).
- P2 : les exemples d’articles restent un fallback historique ; distinguer contenu de démonstration et publication réelle avant lancement commercial.
- P2 : nettoyage du service worker de migration trop large ; restreindre les caches/enregistrements à ceux du blog après test de migration.
- P2 : tester vrais parcours clavier/VoiceOver, Safari/iPhone, Firefox, rendu physique GPU et bfcache ; aucune réussite implicite.
- P2 : passer les redirections côté serveur après test des règles SPA ; canonical/SEO SSR/prérendu à décider.
- P3 : affiner l’illustration automobile. La scène actuelle est Canvas2D et CSS, pas WebGL.

## Infrastructure de test
Un workflow GitHub Actions a été créé sur la branche de travail. Son premier run 36405763188 échoue avant les étapes (liste vide), sans logs récupérables ; cause non établie. Ne pas payer un plan ni désactiver un contrôle pour masquer cela. Les tests Node font aussi partie du prebuild Vercel. Le build et ses journaux doivent être vérifiés avant fusion.


## Passe budget & transparence éditoriale — 28 septembre 2026
- **Conversion / compréhension — `src/pages/WebedriveLanding.tsx`** : les tarifs étaient exacts mais l’utilisateur devait calculer mentalement les heures complémentaires et tentatives de code. Ajout d’un estimateur strictement local : 13/20 h, heures complémentaires à 65 € et code à 30 € ; aucune réservation, aucun envoi et aucun paiement.
- **Accessibilité — estimateur** : champs numériques nommés, aides liées par `aria-describedby`, bornes de saisie et total annoncé via une zone live. Le changement de volume 13/20 h met à jour les deux rythmes sans modifier les options saisies.
- **Véracité éditoriale — `src/pages/public/HomePage.tsx`** : le fallback `sampleArticles` pouvait ressembler à une publication réelle lorsque l’API était vide ou indisponible. Un avertissement visible indique désormais explicitement le mode démonstration et disparaît seulement quand des articles publiés réels sont chargés.
- **Design system — `src/styles/brand.css`** : l’estimateur et la note éditoriale utilisent exclusivement les tokens WEBEDRIVE existants et restent sur une colonne en petit écran.

### Recette visée
Les contrats Node couvrent le modèle de calcul et le marquage du fallback. Le build Vercel de la branche doit valider ces contrats, TypeScript et Vite avant toute fusion. La visite navigateur live reste non revendiquée tant que l’accès HTTP Vercel est refusé au connecteur.


## Passe migration cache / indexation — 28 septembre 2026
- **Non-régression stockage navigateur — `src/main.tsx`** : le nettoyage de migration ne désinscrit plus tous les service workers du même origin. Il cible uniquement les chemins historiques WEBEDRIVE (`/sw.js`, `/service-worker.js`) et ne supprime que les caches portant les préfixes du projet.
- **Service worker de migration — `public/sw.js`** : l’activation ne vide plus tous les caches disponibles ; seuls les caches `auto-blog-` et `webedrive-migration-` sont concernés.
- **Prototype / SEO — `public/robots.txt`** : ajout d’un blocage crawler global cohérent avec le statut non validé du site. Cette mesure complète les métadonnées `noindex` mais ne constitue pas une garantie de désindexation d’URL déjà connues.
- **Recette source** : contrats ajoutés pour empêcher le retour d’un nettoyage global du stockage et pour conserver la politique robots du prototype.

### Limite
Aucun navigateur réel n’a été utilisé pour créer des registrations/caches factices sur le déploiement de production. Le contrôle reste source/build jusqu’à disponibilité d’un environnement navigateur isolé.
