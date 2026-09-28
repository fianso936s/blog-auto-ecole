# Workflows — un seul site, plusieurs passes de qualité

## Boucle horaire
Lire HEAD/PR/journal → audit transversal → choisir 1 à 3 corrections prioritaires → skill adapté → changement sur branche → tests → preview → contrôle → fusion main → Vercel → compte rendu et registre.
Un seul producteur écrit. Le contrôleur de publication ne crée ni commit ni déploiement. Aucun changement arbitraire pour occuper l’heure. Les articles, comptes et archives restent préservés.

| Pipeline | Entrée | Livrable | Acceptation |
|---|---|---|---|
| Direction artistique | Charte Drive + écrans actuels | Tokens/composants communs | Même famille typo, couleurs, états sur / et /blog |
| UX/navigation | Carte des routes + parcours | Menu, ancrages, retour, redirections | Pas de double header, aucun lien orphelin, clavier utilisable |
| Qualité code | Diff + revue des modules | Correction ciblée + test régression | Syntaxe/typecheck/build et tests verts |
| Accessibilité | Clavier, contraste, erreurs, HTML | Labels/focus/états/mouvement | Mesures et parcours réels ; pas de score fictif |
| Sécurité/données | Auth, API, contenu dynamique | Validation/autorisation/sortie sûre | Tests isolés ; aucun email ni compte réel créé |
| Motion/3D | Performance réelle + préférences | Animation utile et suspendable | Repli, pause, reduced-motion, pas de scroll forcé |
| Performance/SEO | Poids, routes, mesures comparables | Optimisation et métadonnées | LCP/CLS/INP quand mesurables ; noindex prototype |
| Publication | Commit testé | Même commit déployé sur Vercel | SHA + READY + URL/contenu si accessible |

## Skills réellement lus pour cette passe
- vercel/agent-browser : protocole navigation, snapshot, clics, captures.
- vercel/deployments-cicd : preview, build, contrôle avant promotion.
- Documentation officielle Tailwind : @theme inline et variables partagées.
Ce sont des guides utilisés, pas des agents parallèles prétendument lancés.

## Versions de frameworks : découverte ≠ migration
Le besoin utilisateur est un site moderne et uniforme, pas une nouvelle rupture de code à chaque heure. Le lockfile existant est préservé pour cet incrément visuel.
Recherche du 28/09/2026 : React 19.3 figure sur https://react.dev/versions ; Vite 8.1 est annoncé sur https://vite.dev/blog/announcing-vite8-1 ; Tailwind CSS 4 fournit le système CSS-first utilisé ici (https://tailwindcss.com/docs/theme).
Le dépôt utilise encore les dépendances React 18, Router 6, Vite 5 et Tailwind 4 de son lockfile. Ne pas annoncer les versions nouvelles comme installées.
Prochaine migration technique : relever les versions exactes et advisories, choisir une version stable compatible de Node/plugins/React/Router/Vite, régénérer le lockfile dans un environnement autorisé, tester l’auth et les routes puis fusionner. Pas de @latest ni de canary en production, pas d’upgrade forcé npm audit fix --force. Les fonctionnalités expérimentales de Vite 8.1 ne sont pas nécessaires à ce petit site.
