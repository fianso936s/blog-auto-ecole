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
