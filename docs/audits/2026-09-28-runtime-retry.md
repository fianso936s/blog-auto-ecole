# Reprise runtime / publication — 28 septembre 2026

## Sources, concurrence et manifeste
Dépôt canonique fianso936s/blog-auto-ecole. HEAD main effectivement lu : 6886d8c60b5673559672766c16c48fe804da5efc. PR #1 fusionnée, aucune PR ouverte au début de la passe ; issue #2 relue. Reprise de work/webedrive-service-worker-scope-20260928 au SHA 17b7496b5f1c99ea52ff4315d2d27b92e9e77a10, recontrôlé identique avant écriture. Aucun force-push, aucune modification des automatisations, permissions, dépendances ou données clients. L’archive reste intacte.

README, CONTINUITY, AUDIT, WORKFLOWS, CHANGELOG, BACKLOG et workflow qualité ont été relus. Skills réellement lus : vercel/deployments-cicd et vercel/vercel-api. Aucun agent parallèle ni navigateur réel n’est revendiqué.

## Problème → impact → solution → recette
| Gravité | Fichier / preuve | Impact | Correction / critère |
|---|---|---|---|
| P1 publication | scripts/quality.test.mjs:140 à 17b7496 ; node --check exit 1, SyntaxError: missing ) after argument list | npm test ne peut pas démarrer ; le build le lance en premier | Parenthèse corrigée ; contrôle syntaxique exit 0, aucun test retiré |
| P2 robustesse | src/main.tsx, bloc load ; public/sw.js, activate ; deux tests isolés échouent avant correction | Un refus du stockage navigateur laisse une promesse rejetée et peut interrompre le nettoyage | Rejets de lecture traités ; suppressions indépendantes via allSettled ; 8 tests de comportement réussis |
| P2 prototype | public/robots.txt de 17b7496 ne contient que Disallow: / | Un blocage d’exploration n’est pas une directive de non-indexation ; le robot ne peut pas lire noindex | X-Robots-Tag global noindex, nofollow ; exploration autorisée ; contrat de configuration exécuté avec succès |

Le comportement ciblé conserve les enregistrements d’autres chemins/origines et les caches sans préfixe WEBEDRIVE. Les tests exécutent le vrai bloc de migration et le vrai public/sw.js dans des VM Node avec doubles des API navigateur. Ils ne prouvent pas le cycle de vie natif d’un service worker.

## Preuves locales
Node 22.16.0, TypeScript 5.8.3 préinstallé pour les tests isolés. Il ne s’agit pas d’une installation npm ci du lockfile. Les trois sources récupérées ont été vérifiées par leur hash Git avant modification :
- quality.test.mjs : 1adc8afdbc7518c8a12414af1a1746d4fa64f4da.
- main.tsx : c89de8fe855d76b21aecaaa969c5ea1b2a38567c.
- sw.js : 4beab2885fb466800fb389732969c0222de27ed5.

Commandes et résultats :
- node --check scripts/quality.test.mjs : avant exit 1 ligne 140 ; après exit 0.
- node --check scripts/migration.test.mjs et node --check public/sw.js : exit 0.
- node --test scripts/migration.test.mjs : avant 6 réussites / 2 échecs ; après 8 réussites / 0 échec, exit 0.
- Contrat noindex extrait du vrai quality.test.mjs et exécuté contre les vrais fichiers JSON/robots : réussite, exit 0.
- Transpilation syntaxique du main.tsx complet : aucune erreur. Ce n’est pas tsc -b.

Les huit nouveaux tests sont importés par quality.test.mjs et font donc partie du npm test existant et du build Vercel. Aucun remplacement d’un check GitHub par un statut artificiellement vert.

## Couverture datée et non-régression
Approfondi dans cette passe : main.tsx, public/sw.js, tests qualité/migration, vercel.json, robots.txt, workflow de publication. Contrats transversaux existants conservés pour accueil/blog/articles/quiz, redirections, menu mobile, tokens/typo, tarifs, logo, HTML éditorial, newsletter et mouvement ; leur exécution intégrale doit être confirmée par le build du nouveau commit.

Les composants de pages, tarifs, articles, quiz, comptes, règles d’accès, logo et fichiers CSS ne sont pas modifiés par ce correctif. Pas de nouvelle revue exhaustive des écrans privés. Responsive 320/390/768/1440, clavier/focus, thème rendu, URL directes, vrais clics, absence d’erreurs console live, contraste rendu et performances avant/après restent non exécutés dans cette passe.

## Blocages dédupliqués et publication
Le clone local a échoué par résolution DNS ; pas de copie complète installée ni de build projet local revendiqués. Le connecteur Vercel renvoie encore 403 sur barsis-projects. Son refus a été respecté, sans proxy, secret ou lien de contournement. Le statut Vercel du commit précédent a été lu via GitHub : failure. La SyntaxError ci-dessus suffit à bloquer le build ; les logs Vercel n’ont pas été lus et aucune autre cause n’est inventée.

Après commit : lire son statut Vercel, les runs GitHub et la PR, puis fusionner seulement selon les contrôles/protections applicables. Si des contrôles équivalents ne peuvent pas être exécutés, conserver la branche testée sans la présenter comme déployée. Enregistrer les résultats finaux dans la PR pour éviter un nouveau commit documentaire et un redéploiement sans changement utile.

La branche work/webedrive-noindex-20260928 contient l’ancien simple Disallow ; ne pas la fusionner séparément par-dessus la politique corrigée de cette passe. Conserver son historique, pas de suppression requise.

## Documentation primaire consultée
- https://developers.google.com/search/docs/crawling-indexing/block-indexing : noindex doit pouvoir être lu ; robots.txt n’est pas une garantie de désindexation.
- https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/getRegistrations : portée de la liste des registrations.

Prochaine priorité indépendante : P1 auth/API et quiz selon l’issue #2, avec données et envois exclusivement simulés.
