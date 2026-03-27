import type { REMCLesson } from "./remcLessonsTypes";

// ─────────────────────────────────────────────────────────────────────────────
// C1 — Maniement du véhicule (competence_id: 1)
// ─────────────────────────────────────────────────────────────────────────────

export const lessonsC1: REMCLesson[] = [
  // ── C1 / Leçon 1 ────────────────────────────────────────────────────────────
  {
    id: "c1_l1",
    competence_id: 1,
    chapter: 1,
    title: "Installation au poste de conduite",
    subtitle: "Siège, ceinture, rétroviseurs et appuie-tête : les réglages qui sauvent la vie",
    icon: "🪑",
    readingTime: "6 min",
    sections: [
      {
        type: "intro",
        title: "Pourquoi bien s'installer ?",
        content:
          "Avant de tourner la clé de contact, votre première mission est de vous installer correctement. Un mauvais réglage du siège ou des rétroviseurs peut vous empêcher d'avoir les bons réflexes en situation d'urgence. C'est la base de tout ce que vous apprendrez ensuite : si vous n'êtes pas à l'aise dans votre position de conduite, vous ne pouvez pas conduire en sécurité. Prenez toujours le temps de régler votre poste avant de démarrer.",
      },
      {
        type: "rule",
        title: "Réglage du siège conducteur",
        content:
          "Le siège doit être réglé en distance et en hauteur (quand cela est possible) avant chaque trajet si plusieurs personnes utilisent le véhicule. Voici la procédure correcte :",
        rules: [
          "Reculez le siège suffisamment pour pouvoir appuyer à fond sur la pédale d'embrayage (boîte manuelle) ou de frein (boîte automatique) avec la jambe légèrement fléchie — jamais la jambe tendue.",
          "Le dos doit être bien calé contre le dossier, légèrement incliné en arrière (environ 100 à 110°). Ne jamais s'allonger ni se pencher en avant.",
          "Le haut du volant doit se trouver à la hauteur des épaules. Les bras doivent être légèrement fléchis lorsqu'ils tiennent le volant à 9h15 ou à 10h10.",
          "Les mains ne doivent pas frôler les genoux lors des virages. Si c'est le cas, le siège est trop près du volant.",
          "Réglez la hauteur du siège si disponible pour avoir une bonne visibilité par-dessus le tableau de bord, tout en ayant la tête au moins 10 cm sous le pavillon.",
        ],
        highlight: "Jambe légèrement fléchie sur l'embrayage",
      },
      {
        type: "rule",
        title: "La ceinture de sécurité — obligation légale",
        content:
          "Le port de la ceinture est obligatoire pour le conducteur et tous les passagers, à l'avant comme à l'arrière (article R412-1 du Code de la route). Le conducteur est responsable du port de la ceinture pour les passagers de moins de 18 ans. Pour bien la porter :",
        rules: [
          "La sangle abdominale doit passer sur les hanches (les os iliaques), jamais sur le ventre.",
          "La sangle thoracique doit passer entre l'épaule et le cou, en contact avec le thorax — jamais derrière le dos ni sous le bras.",
          "Ne jamais mettre le clip dans la ceinture sans l'avoir passée : cela fausse le système de retenue.",
          "Une ceinture tordue ne protège pas correctement : vérifiez qu'elle est bien à plat.",
          "Sanction pour absence de ceinture : 135 € d'amende et 3 points retirés par infraction constatée.",
        ],
        highlight: "135 € et 3 points par infraction",
      },
      {
        type: "rule",
        title: "Réglage des rétroviseurs",
        content:
          "Les rétroviseurs sont vos yeux sur ce qui se passe derrière vous. Un mauvais réglage crée des angles morts dangereux. Réglez-les toujours après le siège, dans cet ordre :",
        rules: [
          "Rétroviseur intérieur : cadrez la lunette arrière entièrement, en positionnant son bord bas au tiers inférieur du miroir. Votre tête ne doit pas bouger pour voir l'intégralité de la lunette.",
          "Rétroviseur extérieur gauche : orientez-le de manière à voir une fine bande de la carrosserie (environ 1/5) sur le côté gauche et l'horizon au tiers supérieur du miroir.",
          "Rétroviseur extérieur droit : même principe. On doit voir une fine bande de carrosserie et le sol à partir du tiers inférieur.",
          "Les zones non couvertes par les rétroviseurs constituent les angles morts. Complétez toujours par un contrôle direct (rotation de la tête) avant tout changement de voie ou démarrage.",
        ],
        highlight: "Angles morts = contrôle direct obligatoire",
      },
      {
        type: "rule",
        title: "L'appuie-tête — dispositif anti-coup du lapin",
        content:
          "L'appuie-tête n'est pas un accessoire de confort : c'est un dispositif de sécurité passif qui limite les blessures cervicales en cas de choc arrière (coup du lapin). Son réglage est simple mais crucial :",
        rules: [
          "Le centre de l'appuie-tête doit être au niveau du haut des oreilles, idéalement à la hauteur du centre de gravité de la tête.",
          "Il doit être le plus proche possible de l'arrière de la tête : la distance maximale acceptable est de 4 cm.",
          "Un appuie-tête trop bas est plus dangereux qu'un appuie-tête absent : en cas de choc, la tête bascule par-dessus et cela aggrave les lésions cervicales.",
          "Vérifiez également l'appuie-tête des passagers arrière, notamment si vous transportez des enfants.",
        ],
        highlight: "Distance maxi entre la tête et l'appuie-tête : 4 cm",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "Avant tout démarrage, pensez au rituel CRAP : Ceinture, Rétroviseurs, Appuie-tête, Position du siège. Ces 30 secondes peuvent vous sauver la vie.",
        rules: [
          "Siège : jambe légèrement fléchie sur la pédale, dos calé, bras fléchis sur le volant.",
          "Ceinture : sangle abdominale sur les hanches, thoracique sur le thorax. Obligatoire pour tous. 135 € et 3 points.",
          "Rétroviseurs : cadrer la lunette arrière, fine bande de carrosserie sur les côtés. Angles morts = contrôle direct.",
          "Appuie-tête : au niveau des oreilles, moins de 4 cm de la nuque.",
          "Ces réglages prennent 30 secondes et peuvent vous sauver la vie.",
        ],
      },
    ],
  },

  // ── C1 / Leçon 2 ────────────────────────────────────────────────────────────
  {
    id: "c1_l2",
    competence_id: 1,
    chapter: 2,
    title: "Démarrage et arrêt du moteur",
    subtitle: "Procédures sur boîte manuelle et automatique, sécurité au départ",
    icon: "🔑",
    readingTime: "5 min",
    sections: [
      {
        type: "intro",
        title: "Un rituel à ne jamais négliger",
        content:
          "Démarrer un véhicule, ça ne se résume pas à tourner une clé. Il y a une procédure précise qui garantit que le véhicule ne bougera pas de façon intempestive et que le moteur démarrera sans incident. Cette procédure change légèrement selon que vous conduisez une boîte manuelle ou une boîte automatique. Maîtriser ces deux cas est indispensable aujourd'hui car vous serez peut-être amené à conduire les deux types de véhicules.",
      },
      {
        type: "rule",
        title: "Procédure de démarrage — boîte manuelle",
        content:
          "Sur un véhicule à boîte de vitesses manuelle, suivez ces étapes dans l'ordre. Ne les sautez jamais, même si vous êtes pressé :",
        rules: [
          "1. Vérifiez que le levier de vitesses est au point mort (N). Si vous mettez le contact avec une vitesse engagée et l'embrayage non enfoncé, le véhicule bondira en avant.",
          "2. Serrez le frein à main (ou vérifiez que le frein de stationnement est activé).",
          "3. Appuyez à fond sur la pédale d'embrayage. Sur les véhicules modernes, un anti-démarrage empêche le moteur de partir sans l'embrayage enfoncé.",
          "4. Tournez la clé (ou appuyez sur le bouton Start/Stop) jusqu'à la position démarrage. Relâchez dès que le moteur tourne.",
          "5. Vérifiez les voyants du tableau de bord : le voyant de charge batterie et celui de pression d'huile doivent s'éteindre dans les secondes qui suivent le démarrage.",
          "6. Attendez quelques secondes que le régime moteur se stabilise avant de desserrer le frein à main et de passer en première.",
        ],
        highlight: "Point mort + embrayage enfoncé avant le contact",
      },
      {
        type: "rule",
        title: "Procédure de démarrage — boîte automatique",
        content:
          "Sur un véhicule à boîte automatique, la procédure diffère. Attention : beaucoup d'accidents ont lieu parce que des conducteurs habitués à la boîte manuelle oublient les spécificités de la boîte automatique :",
        rules: [
          "1. Le sélecteur doit être en position P (Parking) ou N (Neutre). La plupart des boîtes automatiques modernes n'autorisent le démarrage qu'en P.",
          "2. Appuyez sur la pédale de frein (il n'y a pas d'embrayage sur une boîte automatique). C'est la pédale de droite.",
          "3. Tournez la clé ou appuyez sur Start/Stop tout en maintenant le frein.",
          "4. Passez en D (Drive) pour avancer ou en R (Reverse) pour reculer, toujours en maintenant le frein enfoncé avant de relâcher.",
          "5. Ne jamais passer de D à R (ou inversement) sans être à l'arrêt complet : cela endommage la boîte et peut créer un mouvement brusque non maîtrisé.",
          "6. En attente prolongée (feux, embouteillage), restez en D avec le frein enfoncé ou passez en N si l'arrêt dure plus de 2 minutes.",
        ],
        highlight: "Sélecteur en P + pied au frein avant le contact",
      },
      {
        type: "rule",
        title: "Procédure d'arrêt et extinction du moteur",
        content:
          "Arrêter correctement le moteur est tout aussi important que de bien démarrer. Une mauvaise procédure peut laisser le véhicule en mouvement ou endommager certains organes :",
        rules: [
          "1. Immobilisez complètement le véhicule avant d'agir sur le levier de vitesses ou le sélecteur.",
          "2. Boîte manuelle : passez au point mort, serrez le frein à main, puis coupez le contact. En côte, laissez une vitesse engagée ET serrez le frein à main.",
          "3. Boîte automatique : passez en P, serrez le frein de stationnement, puis coupez le contact.",
          "4. Retirez la clé et assurez-vous que le véhicule est bien immobilisé avant de sortir.",
          "5. Ne jamais couper le contact moteur en roulant : vous perdriez l'assistance de direction et de freinage.",
        ],
        highlight: "Frein à main + point mort avant de couper le contact",
      },
      {
        type: "warning",
        title: "Erreurs fréquentes à éviter",
        content:
          "Voici les erreurs que je vois le plus souvent chez les élèves lors des premières leçons de démarrage :",
        rules: [
          "Lâcher l'embrayage trop vite en première : le moteur cale et le véhicule s'immobilise brutalement. Montez l'embrayage lentement jusqu'au point de friction, attendez que le régime baisse légèrement, puis desserrez le frein à main.",
          "Oublier de désengager le frein à main : le véhicule avance avec le frein serré, ce qui use les patins et peut provoquer une surchauffe.",
          "Sur boîte automatique, poser le pied sur l'accélérateur au lieu du frein : les pédales sont rapprochées, la confusion est fréquente au début.",
          "Ne pas vérifier les voyants au démarrage : un voyant d'huile qui reste allumé peut signaler un problème mécanique grave — ne jamais rouler dans ce cas, appelez un garagiste.",
        ],
        highlight: "Voyant huile allumé après démarrage = ne pas rouler",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "Chaque type de boîte a sa propre procédure. Mémorisez les deux et ne les mélangez jamais.",
        rules: [
          "Boîte manuelle : point mort, frein à main, embrayage enfoncé, puis contact.",
          "Boîte automatique : sélecteur en P, pied au frein, puis contact. Passer en D ou R toujours à l'arrêt complet.",
          "À l'arrêt définitif : immobiliser, point mort ou P, frein à main, couper le contact.",
          "Toujours vérifier les voyants du tableau de bord après le démarrage.",
          "Ne jamais couper le contact pendant que le véhicule roule.",
        ],
      },
    ],
  },

  // ── C1 / Leçon 3 ────────────────────────────────────────────────────────────
  {
    id: "c1_l3",
    competence_id: 1,
    chapter: 3,
    title: "Trajectoires et virages",
    subtitle: "Comment bien aborder un virage à droite et à gauche en toute sécurité",
    icon: "↩️",
    readingTime: "6 min",
    sections: [
      {
        type: "intro",
        title: "La trajectoire, ça s'apprend",
        content:
          "Un virage mal négocié, c'est la première cause de sorties de route. Pourtant, la bonne trajectoire n'est pas une question de feeling : c'est une technique précise que vous allez apprendre ici. Quel que soit le type de virage — à droite, à gauche, en épingle ou en courbe douce — les principes restent les mêmes : regarder loin, adopter la bonne vitesse avant d'entrer dans la courbe, et maintenir une trajectoire régulière. Pas de freinage en virage, pas de coup de volant sec.",
      },
      {
        type: "rule",
        title: "Les trois phases d'un virage",
        content:
          "Chaque virage se décompose en trois phases distinctes. Bien les distinguer vous permettra de ne jamais être surpris :",
        rules: [
          "Phase 1 — Approche : repérez le virage le plus tôt possible en regardant où part la route, pas juste le bord immédiat. Adaptez votre vitesse AVANT d'entrer dans la courbe : on ne freine jamais en virage, car les roues ont déjà du mal à adhérer en courbe.",
          "Phase 2 — Passage : regardez la sortie du virage dès que vous entrez dedans. Le regard guide inconsciemment la direction des mains. Gardez une trajectoire régulière, sans brusquer le volant. En virage, l'accélération doit être douce et progressive.",
          "Phase 3 — Sortie : redressez le volant progressivement en même temps que vous accélérez doucement. La voiture retrouve sa trajectoire rectiligne.",
        ],
        highlight: "Adapter la vitesse AVANT le virage — jamais en virage",
      },
      {
        type: "rule",
        title: "Virage à droite — serrer à droite",
        content:
          "Sur une voie à sens unique ou sur la moitié droite d'une route à double sens, aborder un virage à droite nécessite de bien gérer sa position latérale :",
        rules: [
          "Positionnez-vous légèrement sur la droite de votre voie avant d'entrer dans le virage, sans déborder sur l'accotement.",
          "Regardez vers l'intérieur du virage (vers la droite) pour anticiper l'éventuelle présence de cyclistes, piétons ou animaux.",
          "La trajectoire idéale consiste à aborder le virage depuis l'extérieur (gauche de votre voie), à passer au plus près de l'intérieur (apex, côté droit) puis à ressortir vers l'extérieur.",
          "Attention : cette trajectoire ne doit jamais vous amener à mordre sur la voie en face. Sur route à double sens, restez strictement sur votre moitié de chaussée.",
          "En agglomération, le virage à droite est souvent serré. Ralentissez suffisamment et vérifiez les angles morts pour les deux-roues qui se glissent entre le trottoir et vous.",
        ],
        highlight: "Rester dans sa voie — ne jamais mordre sur la voie d'en face",
      },
      {
        type: "rule",
        title: "Virage à gauche — attention aux véhicules en face",
        content:
          "Le virage à gauche est plus délicat car vous vous rapprochez de la voie des véhicules venant en sens inverse. Les erreurs ici peuvent avoir des conséquences graves :",
        rules: [
          "Positionnez-vous légèrement sur la gauche de votre voie (centre de la chaussée) avant d'entrer dans le virage.",
          "Regardez vers la gauche et scrutez la sortie de virage pour détecter les véhicules qui arrivent en face.",
          "Ne coupez jamais un virage à gauche : cela vous projette sur la voie en sens inverse. La trajectoire doit rester du côté droit de l'axe de la chaussée.",
          "Par mauvaise visibilité (virage aveugle), ralentissez encore plus et serrez-vous à droite pour maximiser votre visibilité vers la gauche.",
          "Sur route de montagne avec virages en épingle : ne pas couper, et klaxonner brièvement si la visibilité est réduite (un court coup de klaxon est autorisé hors agglomération).",
        ],
        highlight: "Ne jamais couper un virage à gauche",
      },
      {
        type: "warning",
        title: "Les erreurs qui provoquent des sorties de route",
        content:
          "Ces situations reviennent régulièrement dans les statistiques d'accidents en virage. Retenez-les absolument :",
        rules: [
          "Freiner en virage : les pneus doivent gérer à la fois la force centrifuge et le freinage. Au-delà d'un certain seuil, ils décrochent et vous perdez le contrôle. Freinez toujours avant le virage.",
          "Regarder trop près devant soi : si vous regardez juste devant le capot, vous réagissez trop tard. Portez le regard vers la sortie du virage.",
          "Entrer trop vite : la vitesse excessive est la première cause d'accident en virage. Mieux vaut ralentir trop tôt que trop tard.",
          "Braquer sec en urgence : un coup de volant sec à vitesse élevée peut provoquer un tête-à-queue. Le braquage doit toujours être progressif.",
          "Sous-estimer le dévers (pente transversale) sur certaines routes : sur une route déversée dans le mauvais sens par rapport au virage, la limite d'adhérence est beaucoup plus basse.",
        ],
        highlight: "Freiner AVANT — jamais EN virage",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "Un virage bien négocié, c'est regarder loin, ralentir avant, maintenir l'allure dans la courbe, et accélérer en sortie.",
        rules: [
          "Trois phases : approche (adapter la vitesse), passage (regarder la sortie), sortie (redresser et accélérer doucement).",
          "Virage à droite : serrer à droite, regarder l'intérieur, ne jamais déborder sur la voie d'en face.",
          "Virage à gauche : ne jamais couper, rester à droite de l'axe, surveiller les véhicules en face.",
          "On ne freine JAMAIS en virage : toujours freiner avant.",
          "Le regard guide la trajectoire : regardez toujours où vous voulez aller.",
        ],
      },
    ],
  },

  // ── C1 / Leçon 4 ────────────────────────────────────────────────────────────
  {
    id: "c1_l4",
    competence_id: 1,
    chapter: 4,
    title: "Marche arrière et demi-tour",
    subtitle: "Procédures légales, zones interdites et techniques sûres",
    icon: "⬅️",
    readingTime: "6 min",
    sections: [
      {
        type: "intro",
        title: "Reculer, ça aussi ça s'apprend",
        content:
          "La marche arrière et le demi-tour sont des manœuvres que beaucoup d'élèves redoutent, mais elles obéissent à des règles précises et à une technique répétable. La loi encadre strictement où et comment effectuer ces manœuvres, car elles constituent un risque élevé pour les autres usagers — en particulier les piétons et les enfants qui se trouvent dans des angles morts importants.",
      },
      {
        type: "rule",
        title: "La marche arrière — obligations légales",
        content:
          "L'article R414-13 du Code de la route fixe les conditions de la marche arrière. Vous devez respecter ces obligations :",
        rules: [
          "Ne vous engager en marche arrière que si vous avez la certitude que la voie est libre, sur toute la distance que vous allez parcourir.",
          "Désigner un guide si votre visibilité arrière est insuffisante : un passager ou un tiers qui s'assure que le passage est dégagé.",
          "La marche arrière est toujours considérée comme une manœuvre : vous devez céder le passage à tous les véhicules qui circulent normalement.",
          "Les feux de recul (feux blancs à l'arrière) s'allument automatiquement lorsque vous passez la marche arrière : vérifiez qu'ils fonctionnent.",
          "Vitesse maximale recommandée : au pas (5 à 10 km/h). Aucune valeur légale n'est fixée mais toute vitesse excessive engage votre responsabilité en cas d'accident.",
        ],
        highlight: "Voie libre sur toute la distance + céder le passage",
      },
      {
        type: "rule",
        title: "Zones où la marche arrière est interdite",
        content:
          "Certains endroits sont formellement interdits ou extrêmement déconseillés pour effectuer une marche arrière :",
        rules: [
          "Interdit sur autoroute et voie express : il est absolument interdit de faire marche arrière sur une autoroute ou une voie express, même si vous avez raté votre sortie (article R412-8). Continuez jusqu'à la prochaine sortie.",
          "Interdit sur les embranchements d'autoroute, les bretelles de sortie et d'entrée.",
          "Interdit sur passage à niveau : ne jamais s'engager ou faire marche arrière sur un passage à niveau.",
          "Fortement déconseillé en sommet de côte et dans les virages : la visibilité est réduite et vous seriez invisible pour les autres véhicules.",
        ],
        highlight: "Marche arrière interdite sur autoroute — même si raté la sortie",
      },
      {
        type: "rule",
        title: "Le demi-tour — règles et procédure",
        content:
          "Le demi-tour est une manœuvre de retournement à 180°. Il est plus risqué qu'il n'y paraît, car il mobilise toute la largeur de la chaussée pendant plusieurs secondes :",
        rules: [
          "Avant d'engager un demi-tour, évaluez la largeur de la chaussée. Si la voiture peut effectuer le demi-tour en un seul arc (braquage complet), c'est idéal. Sinon, il faudra faire une manœuvre en plusieurs fois avec marche arrière.",
          "Vérifiez dans les deux sens que la route est dégagée sur une distance suffisante pour effectuer la manœuvre sans hâte.",
          "Activez le clignotant à gauche avant de vous déporter pour amorcer le demi-tour.",
          "Effectuez la manœuvre lentement et avec précision. Pas de précipitation.",
          "Interdictions de demi-tour : aux endroits où la visibilité est insuffisante (virages, sommets de côtes), sur les passages à niveau, sur les autoroutes et voies express.",
          "Après le demi-tour, repartez normalement en vous insérant dans la circulation dans votre nouveau sens de marche.",
        ],
        highlight: "Clignotant gauche + vérifier dans les deux sens",
      },
      {
        type: "tip",
        title: "Technique pour la marche arrière en ligne droite",
        content:
          "Pour reculer droit, voici la technique recommandée. Elle fonctionne pour tous les gabarits de voitures :",
        rules: [
          "Regardez par-dessus votre épaule droite (en tournant la tête, pas seulement les yeux) pour surveiller la trajectoire arrière droite.",
          "Utilisez simultanément le rétroviseur intérieur pour le centre et les rétroviseurs extérieurs pour les côtés.",
          "Ne regardez pas uniquement par la lunette arrière : les angles morts bas sont dangereux (enfants, animaux, deux-roues).",
          "Pour corriger la trajectoire : si l'arrière part à droite, tournez le volant à droite. Entraînez-vous sur un parking vide.",
          "Réglez les rétroviseurs extérieurs légèrement vers le bas avant la manœuvre si nécessaire pour voir le sol et le bord du trottoir.",
        ],
        highlight: "Regarder par-dessus l'épaule ET utiliser les rétroviseurs",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "Marche arrière et demi-tour sont des manœuvres à faible allure mais à risque élevé. Méthode et vigilance sont les maîtres mots.",
        rules: [
          "Marche arrière : voie libre sur toute la distance, céder le passage, feux de recul allumés automatiquement.",
          "Jamais de marche arrière sur autoroute, voie express ou passage à niveau.",
          "Demi-tour : clignotant gauche, vérifier dans les deux sens, manœuvre lente et précise.",
          "Guide obligatoire si la visibilité arrière est insuffisante.",
          "En cas de doute (angle mort, passant), sortez du véhicule pour vérifier.",
        ],
      },
    ],
  },

  // ── C1 / Leçon 5 ────────────────────────────────────────────────────────────
  {
    id: "c1_l5",
    competence_id: 1,
    chapter: 5,
    title: "Stationnement",
    subtitle: "Zones bleues, interdictions, distances à respecter et techniques de créneau",
    icon: "🅿️",
    readingTime: "7 min",
    sections: [
      {
        type: "intro",
        title: "Se garer, une compétence à part entière",
        content:
          "Le stationnement est l'un des sujets les plus riches du Code de la route : il touche à la fois à la sécurité des autres usagers, au respect des riverains et à la réglementation locale. Se garer incorrectement peut générer des amendes, des situations dangereuses et des blocages de circulation. Nous allons voir ensemble toutes les règles essentielles, les zones interdites, les distances à respecter et les techniques pour se garer en créneau et en épi.",
      },
      {
        type: "rule",
        title: "Les zones de stationnement interdit",
        content:
          "L'article R417-3 du Code de la route liste les endroits où le stationnement est interdit. Ces interdictions existent pour maintenir la fluidité du trafic et la sécurité de tous :",
        rules: [
          "À moins de 5 mètres d'un carrefour, d'une intersection ou d'un croisement : pour ne pas masquer la visibilité des conducteurs.",
          "À moins de 5 mètres avant un passage piétons : les piétons doivent être visibles par les conducteurs qui approchent.",
          "Devant un accès pompiers, une sortie de véhicules, une rampe d'accès PMR (Personne à Mobilité Réduite).",
          "Sur les voies de tramway, les passages à niveau, les voies réservées aux bus.",
          "Sur les trottoirs (sauf autorisation locale explicite), les pistes cyclables, les refuges pour piétons.",
          "En double file, sauf pour une durée très brève et si le conducteur reste présent et peut manœuvrer immédiatement.",
        ],
        highlight: "5 m avant un carrefour et avant un passage piétons",
      },
      {
        type: "rule",
        title: "Zones bleues et stationnement réglementé",
        content:
          "Les zones bleues sont signalées par un panneau B6a2 (disque bleu) et un marquage au sol (ligne jaune tiretée). Les règles y sont strictes :",
        rules: [
          "Le disque de stationnement (disque bleu) est obligatoire et doit être affiché derrière le pare-brise côté conducteur.",
          "Indiquez l'heure d'arrivée sur le disque en l'arrondissant aux 30 minutes supérieures. Exemple : si vous arrivez à 14h10, affichez 14h30.",
          "La durée maximale autorisée est généralement de 1h30 (précisée sur le panneau local). Ne dépassez pas cette durée.",
          "Stationnement payant (horodateur) : achetez un ticket pour la durée souhaitée et affichez-le derrière le pare-brise. La durée commence à courir dès la validation.",
          "Amende pour non-respect : contravention de 2e classe (35 € forfaitaire, 17 € si payée dans les 15 jours).",
        ],
        highlight: "Disque bleu : heure arrondie aux 30 min supérieures",
      },
      {
        type: "rule",
        title: "Distances de sécurité et règles complémentaires",
        content:
          "En dehors des interdictions formelles, certaines distances et règles doivent être respectées :",
        rules: [
          "Au moins 10 mètres d'un arrêt de bus ou de tramway signalisé (de part et d'autre) : pour que les bus puissent s'arrêter et que les usagers puissent monter et descendre en sécurité.",
          "Au moins 5 mètres d'un panneau de signalisation ou d'un feu tricolore (pour ne pas le masquer).",
          "50 cm minimum du bord du trottoir : laisser un espace pour les piétons et ne pas endommager le trottoir.",
          "Sur une pente, orientez les roues vers le trottoir (en montée) ou vers la chaussée (en descente) pour bloquer le véhicule si le frein à main lâche.",
          "De nuit, en dehors des agglomérations, tout véhicule stationné doit être visible (éclairé ou équipé de réflecteurs réglementaires).",
        ],
        highlight: "10 m d'un arrêt de bus de chaque côté",
      },
      {
        type: "tip",
        title: "Technique du créneau (stationnement longitudinal)",
        content:
          "Le créneau est la manœuvre la plus redoutée au permis, pourtant elle s'apprend avec une méthode simple. Voici les étapes :",
        rules: [
          "1. Repérez un espace d'au moins 1,5 fois la longueur de votre véhicule (environ 7 à 8 m pour une berline standard).",
          "2. Arrêtez-vous à côté du véhicule de devant, en parallèle, roues à la même hauteur, à environ 50-80 cm de lui.",
          "3. Passez en marche arrière. Regardez par-dessus l'épaule droite. Braquage à fond à droite jusqu'à avoir un angle d'environ 45° avec le trottoir.",
          "4. Braquage à fond à gauche : l'arrière entre dans la place pendant que l'avant pivote. Surveillez le coin avant gauche pour ne pas toucher le véhicule de devant.",
          "5. Redressez le volant progressivement pour vous aligner parallèlement au trottoir.",
          "6. Avancez légèrement pour vous centrer dans la place. Serrez le frein à main.",
        ],
        highlight: "Espace minimum créneau : 1,5 fois la longueur du véhicule",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "Bien se garer, c'est respecter les autres et la loi. Un stationnement gênant peut bloquer les secours et coûter cher.",
        rules: [
          "Interdit : à moins de 5 m d'un carrefour ou d'un passage piétons, devant une sortie de secours, en double file durable.",
          "Zone bleue : disque obligatoire, heure arrondie aux 30 min supérieures.",
          "10 m minimum d'un arrêt de bus, 50 cm du trottoir.",
          "Créneau : espace de 1,5 fois la longueur du véhicule, manœuvre lente en plusieurs temps.",
          "En côte, orienter les roues vers le trottoir (montée) ou vers la chaussée (descente).",
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// C2 — Circuler normalement (competence_id: 2)
// ─────────────────────────────────────────────────────────────────────────────

export const lessonsC2: REMCLesson[] = [
  // ── C2 / Leçon 1 ────────────────────────────────────────────────────────────
  {
    id: "c2_l1",
    competence_id: 2,
    chapter: 1,
    title: "Les vitesses autorisées en France",
    subtitle: "Toutes les limites, conducteurs novices, conditions météo et sanctions",
    icon: "🚦",
    readingTime: "7 min",
    sections: [
      {
        type: "intro",
        title: "La vitesse, première cause d'accidents mortels",
        content:
          "La vitesse est impliquée dans environ un tiers des accidents mortels en France. Connaître les limites légales n'est pas suffisant : il faut aussi comprendre pourquoi ces limites existent et savoir les adapter aux conditions réelles. En France, les vitesses maximales autorisées sont fixées par les articles R413-1 et suivants du Code de la route. Depuis le 1er juillet 2018, la vitesse hors agglomération sur route bidirectionnelle sans séparateur central a été abaissée à 80 km/h. Beaucoup de conducteurs confondent encore avec l'ancienne limite de 90 km/h : cette dernière ne s'applique plus.",
      },
      {
        type: "rule",
        title: "Les limites de vitesse par type de voie",
        content:
          "Voici le tableau complet des vitesses maximales autorisées en France (article R413-2 du Code de la route) pour un conducteur titulaire du permis depuis plus de 2 ans, par temps sec :",
        rules: [
          "Agglomération : 50 km/h. Signalé par les panneaux d'entrée d'agglomération (EB10).",
          "Zone 30 : 30 km/h. Panneaux B30 à l'entrée et B51 à la sortie.",
          "Zone de rencontre : 20 km/h. Les piétons y sont prioritaires sur toute la chaussée.",
          "Hors agglomération, route à deux voies sans séparateur central : 80 km/h (depuis le 1er juillet 2018 — plus 90 km/h).",
          "Hors agglomération, route à deux chaussées séparées par un terre-plein central (2x2 voies sans panneau autoroute) : 110 km/h.",
          "Route express (voie rapide non-autoroute, deux chaussées séparées) : 110 km/h.",
          "Autoroute : 130 km/h. Par temps de pluie ou brouillard léger : 110 km/h. Si visibilité inférieure à 50 m : 50 km/h.",
        ],
        highlight: "80 km/h hors agglo depuis le 1er juillet 2018",
      },
      {
        type: "rule",
        title: "Vitesses pour les conducteurs novices (permis probatoire)",
        content:
          "Durant la période probatoire (3 premières années pour un permis classique, 2 ans pour l'AAC/conduite accompagnée), les limites sont abaissées :",
        rules: [
          "Autoroute : 110 km/h au lieu de 130 km/h.",
          "Routes à deux chaussées séparées (hors autoroute) : 100 km/h au lieu de 110 km/h.",
          "Autres routes hors agglomération : 80 km/h — identique aux conducteurs confirmés.",
          "En agglomération : 50 km/h — identique aux conducteurs confirmés.",
          "Ces limitations s'appliquent pendant 3 ans après l'obtention du permis (2 ans si vous avez fait la conduite accompagnée).",
          "Taux d'alcoolémie maximal autorisé pour les conducteurs novices : 0,2 g/L de sang (contre 0,5 g/L pour les conducteurs confirmés).",
        ],
        highlight: "Autoroute novice : 110 km/h — route express : 100 km/h",
      },
      {
        type: "rule",
        title: "Vitesses par temps de pluie et conditions dégradées",
        content:
          "Par mauvais temps, les distances de freinage augmentent considérablement. La loi impose des réductions de vitesse :",
        rules: [
          "Autoroute sous la pluie : 110 km/h (au lieu de 130 km/h).",
          "Route express sous la pluie : 100 km/h (au lieu de 110 km/h).",
          "Routes hors agglomération sous la pluie : 80 km/h (déjà la limite standard, pas de changement).",
          "Visibilité inférieure à 50 m (brouillard dense, tempête de neige) : 50 km/h sur TOUTES les voies, autoroute incluse.",
          "Neige ou verglas : pas de limite légale spécifique, mais la vitesse doit absolument être adaptée aux conditions. Une vitesse excessive sur chaussée glissante engage la responsabilité pénale du conducteur.",
        ],
        highlight: "Visibilité < 50 m : 50 km/h partout",
      },
      {
        type: "warning",
        title: "Sanctions pour excès de vitesse",
        content:
          "Les sanctions sont progressives selon le dépassement constaté (article L413-1 du Code de la route) :",
        rules: [
          "Dépassement inférieur à 20 km/h (hors agglomération) : amende forfaitaire 68 €, 1 point retiré.",
          "Dépassement de 20 à 29 km/h : amende forfaitaire 135 €, 2 points retirés.",
          "Dépassement de 30 à 39 km/h : amende forfaitaire 135 €, 3 points retirés.",
          "Dépassement de 40 à 49 km/h : amende forfaitaire 135 € (majoration possible à 375 €), 4 points retirés.",
          "Dépassement de 50 km/h et plus : amende jusqu'à 1 500 € (3 000 € en récidive), 6 points retirés, suspension du permis jusqu'à 3 ans, rétention immédiate du permis possible.",
          "En récidive dans l'année, les sanctions sont doublées et l'annulation judiciaire du permis est possible.",
        ],
        highlight: "+50 km/h : jusqu'à 1 500 € et 6 points",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "Les limites de vitesse sont un minimum de sécurité, pas un objectif à atteindre. Adaptez toujours votre allure aux conditions réelles.",
        rules: [
          "Agglomération : 50 km/h. Zone 30 : 30 km/h. Zone de rencontre : 20 km/h.",
          "Hors agglo (route bidirectionnelle) : 80 km/h depuis le 1er juillet 2018 — plus 90 km/h.",
          "2x2 voies / route express : 110 km/h. Autoroute : 130 km/h.",
          "Conducteurs novices : 110 km/h autoroute, 100 km/h 2x2 voies.",
          "Visibilité < 50 m : 50 km/h partout, quelle que soit la voie.",
        ],
      },
    ],
  },

  // ── C2 / Leçon 2 ────────────────────────────────────────────────────────────
  {
    id: "c2_l2",
    competence_id: 2,
    chapter: 2,
    title: "Les priorités et intersections",
    subtitle: "Priorité à droite, panneaux de priorité, règles spéciales et cas particuliers",
    icon: "🔀",
    readingTime: "7 min",
    sections: [
      {
        type: "intro",
        title: "Les intersections, zone de tous les dangers",
        content:
          "Les intersections concentrent environ 30 % des accidents de la route en France. Comprendre et appliquer correctement les règles de priorité est donc absolument essentiel. La règle de base en France — la priorité à droite — est souvent mal comprise, car elle ne s'applique pas partout et elle est fréquemment modifiée par la signalisation. Vous devez savoir lire cette signalisation pour savoir, à chaque intersection, qui passe en premier.",
      },
      {
        type: "rule",
        title: "La priorité à droite — règle de base",
        content:
          "En l'absence de toute signalisation, la règle de priorité à droite s'applique (article R415-5 du Code de la route). Cette règle signifie :",
        rules: [
          "Tout véhicule venant de votre droite a priorité sur vous à une intersection, quelle que soit la largeur des voies.",
          "Cette règle s'applique sur les voies de même importance, notamment en agglomération là où aucune signalisation ne précise la priorité.",
          "Elle s'applique aussi entre un boulevard et une petite rue : si la rue débouche sur votre droite sans signalisation, le conducteur venant de cette rue a priorité sur vous.",
          "À un croisement en X ou en T, analysez systématiquement ce qui vient de votre droite et de votre gauche.",
          "Exception : les véhicules sur une voie prioritaire (marquée par un panneau) ont priorité sur ceux qui viennent de toutes les directions, y compris de droite.",
        ],
        highlight: "Priorité à droite : règle de base en l'absence de signalisation",
      },
      {
        type: "rule",
        title: "Les panneaux de priorité",
        content:
          "Les panneaux de priorité modifient la règle de base. Voici les principaux à connaître :",
        rules: [
          "Panneau AB6 (triangle pointe en bas, bord rouge) — Cédez le passage : vous devez laisser passer tous les véhicules sur la voie que vous vous apprêtez à croiser.",
          "Panneau AB1 — Stop (octogone rouge) : vous devez vous arrêter complètement avant la ligne d'arrêt, même si aucun véhicule n'est en vue, puis céder le passage.",
          "Panneau AB4 — Passage protégé (losange jaune) : vous êtes sur une voie prioritaire. Vous avez la priorité sur tous les véhicules venant des voies secondaires.",
          "Panneau AB3 — Route prioritaire (losange jaune, bande blanche) : même principe que AB4, mais s'applique sur toute la route jusqu'au panneau de fin.",
          "Croix de Saint-André (panneau AB2) : signale un passage à niveau. Priorité absolue au train.",
          "Panneau AB7 (AB4 barré) : fin de priorité. Vous repassez sous la règle de priorité à droite.",
        ],
        highlight: "Stop : arrêt complet obligatoire même si la voie est libre",
      },
      {
        type: "rule",
        title: "Priorités absolues — les usagers qui priment sur tout",
        content:
          "Certains usagers ou véhicules bénéficient d'une priorité absolue, quels que soient les panneaux :",
        rules: [
          "Véhicules d'urgence avec gyrophare et sirène (VSAV, SAMU, police, gendarmerie, pompiers) : priorité de passage absolue. Vous devez vous dégager immédiatement en serrant à droite ou en vous arrêtant.",
          "Les piétons engagés sur un passage piéton ont la priorité absolue (article R415-11). Vous devez vous arrêter et leur laisser traverser en toute sécurité. Sanction : 135 € et 6 points.",
          "Les piétons voulant traverser sur un passage piéton (même non encore engagés sur la chaussée) : vous devez vous arrêter si leur intention de traverser est manifeste.",
          "Les tramways : priorité de passage dans leur voie. Ne jamais s'engager sur les rails sans être sûr de pouvoir les dégager entièrement.",
        ],
        highlight: "Piéton sur passage piéton : 135 € et 6 points si non-respect",
      },
      {
        type: "warning",
        title: "Les pièges classiques aux intersections",
        content:
          "Ces situations génèrent des accidents fréquents parce que les conducteurs croient connaître la règle mais l'appliquent mal :",
        rules: [
          "Le Stop sans arrêt complet : même si la route est libre, le Stop impose un arrêt complet derrière la ligne d'arrêt. Infraction : 135 €, 4 points.",
          "La priorité à droite oubliée en ville : beaucoup de conducteurs pensent avoir la priorité parce qu'ils sont sur une grande rue. Sans panneau, c'est la priorité à droite.",
          "Le cédez-le-passage mal anticipé : il faut regarder suffisamment loin pour s'arrêter en douceur si nécessaire.",
          "La confusion entre fin de priorité et voie prioritaire : le panneau AB4 doit se répéter à chaque intersection importante pour confirmer que votre priorité est maintenue.",
        ],
        highlight: "Stop sans arrêt complet : 135 € et 4 points",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "À chaque intersection, posez-vous la question : y a-t-il une signalisation ? Si oui, elle prime. Si non, priorité à droite.",
        rules: [
          "Sans signalisation : priorité à droite, toujours.",
          "Cédez-le-passage (AB6) : laisser passer, s'arrêter si nécessaire.",
          "Stop (AB1) : arrêt complet obligatoire, même voie libre.",
          "Losange jaune (AB4/AB3) : vous êtes prioritaire sur tous les véhicules des voies secondaires.",
          "Piétons sur passage piéton : priorité absolue, arrêt obligatoire.",
        ],
      },
    ],
  },

  // ── C2 / Leçon 3 ────────────────────────────────────────────────────────────
  {
    id: "c2_l3",
    competence_id: 2,
    chapter: 3,
    title: "La signalisation",
    subtitle: "Feux tricolores, lignes de marquage au sol et catégories de panneaux",
    icon: "🚧",
    readingTime: "8 min",
    sections: [
      {
        type: "intro",
        title: "Lire la route comme un livre",
        content:
          "La signalisation routière est un langage universel en France. Elle se compose de trois familles : la signalisation verticale (panneaux), la signalisation horizontale (marquage au sol) et la signalisation lumineuse (feux). Ensemble, ces trois familles vous donnent toutes les informations nécessaires pour circuler en sécurité. Un conducteur attentif lit en permanence la route devant lui et anticipe les changements plutôt que de les subir.",
      },
      {
        type: "rule",
        title: "Les feux tricolores et leurs variantes",
        content:
          "Les feux de signalisation lumineuse sont régis par l'article R412-30 du Code de la route. Voici ce qu'impose chaque couleur :",
        rules: [
          "Feu rouge fixe : arrêt obligatoire avant la ligne d'arrêt. Même si d'autres voies sont libres, vous devez rester arrêté.",
          "Feu orange fixe : vous devez vous arrêter sauf si l'arrêt est impossible sans danger (vous êtes trop engagé). Ce n'est PAS un feu vert accéléré.",
          "Feu vert fixe : vous pouvez passer, mais vous devez céder le passage aux piétons qui traversent légalement et aux véhicules déjà dans l'intersection.",
          "Feu rouge clignotant : présent aux passages à niveau et à certains passages piétons. Arrêt absolu obligatoire.",
          "Feu orange clignotant : le feu n'est pas en service normal (nuit, entretien). Appliquez la règle de priorité à droite.",
          "Flèche verte clignotante : vous pouvez tourner dans la direction indiquée même si le feu général est rouge, MAIS vous devez impérativement céder le passage aux piétons traversant dans cette direction.",
        ],
        highlight: "Feu orange : s'arrêter sauf si l'arrêt est impossible sans danger",
      },
      {
        type: "rule",
        title: "Le marquage au sol — lignes longitudinales",
        content:
          "Les lignes tracées dans le sens de la circulation régissent les dépassements et les changements de voie :",
        rules: [
          "Ligne blanche continue : interdiction de la franchir ou de l'empiéter. Elle est tracée là où la visibilité est insuffisante ou le danger trop grand.",
          "Ligne blanche tiretée courte (traits courts, espaces longs) : séparation de voies de même sens. Franchissement autorisé avec prudence.",
          "Ligne axiale tiretée longue (traits longs, espaces courts) : avertissement de fin de possibilité de dépassement. La ligne continue approche.",
          "Double ligne blanche (continue + tiretée) : franchissable du côté de la tiretée seulement. Interdit du côté de la continue.",
          "Ligne jaune continue : interdiction de s'arrêter ou de stationner. Présente aux abords des arrêts de bus, zones de livraison.",
          "Ligne jaune tiretée : stationnement interdit mais arrêt bref autorisé (dépose passager, livraison rapide).",
        ],
        highlight: "Ligne blanche continue : franchissement absolument interdit",
      },
      {
        type: "rule",
        title: "Le marquage au sol — lignes transversales et symboles",
        content:
          "Les lignes transversales et symboles précisent les obligations à des points précis de la chaussée :",
        rules: [
          "Ligne d'arrêt (trait continu transversal) : s'arrêter obligatoirement en deçà de cette ligne (avec feux rouges ou panneaux Stop).",
          "Ligne de cédez-le-passage (trait tiré transversal ou triangle en pointe vers vous) : marquer l'arrêt si nécessaire et céder le passage.",
          "Passages piétons (zébrures blanches) : zones de traversée prioritaires pour les piétons.",
          "Flèches de sélection : flèches peintes sur la chaussée indiquant les directions autorisées depuis une voie. Vous devez être dans la bonne voie AVANT l'intersection.",
          "Losange jaune peint sur la chaussée : indique une intersection avec priorité (correspond au panneau AB4).",
        ],
        highlight: "Flèches de sélection : se positionner AVANT l'intersection",
      },
      {
        type: "rule",
        title: "Les catégories de panneaux verticaux",
        content:
          "Les panneaux sont classés en grandes familles reconnaissables à leur forme et couleur :",
        rules: [
          "Panneaux de danger (triangles rouges, fond blanc) : avertissent d'un danger sur la route. Ex : virage à droite (A1a), chaussée glissante (A4), passage piétons (A13b), travaux (A14).",
          "Panneaux d'interdiction (ronds rouges, fond blanc) : imposent des interdictions. Ex : limitation de vitesse (B14), sens interdit (B1), dépassement interdit (B3a).",
          "Panneaux d'obligation (ronds bleus) : imposent des obligations. Ex : sens obligatoire (B21), voie réservée aux véhicules lents.",
          "Panneaux de prescription temporaire (fond jaune) : remplacent les panneaux permanents lors de travaux ou d'événements.",
          "Panneaux d'information et de direction (fonds bleu ou vert) : indications de direction, distance, services. Vert pour autoroute, bleu pour routes ordinaires.",
          "Panneau B31 (cercle blanc barré) : fin de toutes les interdictions (vitesse, dépassement, etc.).",
        ],
        highlight: "Triangle rouge = danger | Rond rouge = interdiction | Rond bleu = obligation",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "La signalisation se lit dans l'ordre : panneaux (en approche), feux (au niveau de l'intersection), marquage au sol (confirmation).",
        rules: [
          "Feux : rouge = stop, orange = s'arrêter sauf si impossible, vert = passer avec prudence.",
          "Flèche verte clignotante : tourner autorisé mais priorité absolue aux piétons.",
          "Ligne blanche continue : ne pas franchir. Ligne tiretée : franchissement autorisé.",
          "Triangle rouge = danger. Rond rouge = interdiction. Rond bleu = obligation.",
          "Flèches de sélection au sol : se mettre dans la bonne voie avant l'intersection.",
        ],
      },
    ],
  },

  // ── C2 / Leçon 4 ────────────────────────────────────────────────────────────
  {
    id: "c2_l4",
    competence_id: 2,
    chapter: 4,
    title: "Les dépassements",
    subtitle: "Procédure complète, interdictions légales, panneau B3 et situations dangereuses",
    icon: "⏩",
    readingTime: "7 min",
    sections: [
      {
        type: "intro",
        title: "Dépasser, une manœuvre qui engage votre responsabilité",
        content:
          "Le dépassement est l'une des manœuvres les plus dangereuses sur route. En France, environ 10 % des accidents mortels impliquent un dépassement. L'article R414-4 du Code de la route encadre strictement cette manœuvre. Dépasser correctement, c'est appliquer une procédure en plusieurs étapes, évaluer des distances et des vitesses, et savoir renoncer si les conditions ne sont pas réunies. Un dépassement mal engagé peut coûter des vies.",
      },
      {
        type: "rule",
        title: "La procédure de dépassement en 7 étapes",
        content:
          "Ne dépassez jamais de façon impulsive. Voici la procédure complète à appliquer systématiquement :",
        rules: [
          "1. Évaluer : assurez-vous que la voie est libre sur une distance suffisante devant ET derrière vous. Pour dépasser un véhicule à 80 km/h, il vous faut au moins 500 à 600 mètres de visibilité libre.",
          "2. Vérifier les rétroviseurs (intérieur, gauche) et l'angle mort gauche par une rotation rapide de la tête.",
          "3. Signaler : activez le clignotant gauche.",
          "4. Se déporter : passez progressivement sur la voie de gauche en maintenant le clignotant.",
          "5. Accélérer : doublez le véhicule en passant à une vitesse nettement supérieure pour minimiser le temps sur la voie adverse.",
          "6. Revenir : dès que vous voyez dans votre rétroviseur intérieur les phares du véhicule doublé, activez le clignotant droit et revenez progressivement sur la droite.",
          "7. Ne jamais forcer un véhicule doublé à ralentir ou à s'écarter pour vous laisser revenir.",
        ],
        highlight: "500 à 600 m de visibilité libre minimum",
      },
      {
        type: "rule",
        title: "Les interdictions absolues de dépassement",
        content:
          "L'article R414-4 interdit formellement le dépassement dans les situations suivantes :",
        rules: [
          "En cas de visibilité insuffisante : virage, sommet de côte, brouillard, pluie intense.",
          "Sur une ligne blanche continue ou une double ligne continue au sol.",
          "Aux passages à niveau (50 m de part et d'autre).",
          "Aux passages piétons.",
          "Aux intersections (sauf si vous êtes sur une voie prioritaire et que le dépassement ne présente aucun danger).",
          "Lorsque le véhicule devant vous est arrêté pour laisser traverser un piéton.",
          "En présence du panneau B3a (rond rouge avec deux voitures, celle de gauche barrée) : interdiction de dépasser les véhicules à moteur.",
          "Lorsque le conducteur devant vous a signalé son intention de tourner à gauche (clignotant gauche activé).",
        ],
        highlight: "Panneau B3a = interdiction de dépasser",
      },
      {
        type: "rule",
        title: "Être dépassé — les obligations du conducteur dépassé",
        content:
          "La loi impose également des obligations au conducteur qui est dépassé (article R414-7) :",
        rules: [
          "Il est interdit d'accélérer pendant qu'un autre véhicule vous dépasse : vous ne devez pas rendre le dépassement impossible ou dangereux.",
          "Vous devez serrer à droite pour faciliter le dépassement si votre véhicule est long (poids lourd, véhicule avec remorque, engin agricole).",
          "Si vous circulez à une vitesse inférieure à 50 km/h pour une raison quelconque, vous devez vous garer dès que possible pour laisser passer les autres véhicules.",
        ],
        highlight: "Interdit d'accélérer quand on est dépassé",
      },
      {
        type: "warning",
        title: "Situations piège à éviter absolument",
        content:
          "Ces erreurs sont responsables de la majorité des accidents de dépassement :",
        rules: [
          "Dépasser en sommet de côte : même si la route semble libre devant, un véhicule peut surgir de l'autre côté. Sans visibilité au-delà du sommet, le dépassement est interdit.",
          "Dépasser en file : dépasser plusieurs véhicules à la fois multiplie le risque. Ne doublez qu'un seul véhicule à la fois.",
          "Dépasser un camion sans calculer la distance : un semi-remorque de 18 mètres à 80 km/h nécessite au moins 800 mètres de visibilité libre.",
          "Revenir trop tôt en file : revenir à droite avant d'avoir complètement dépassé le véhicule est extrêmement dangereux. Attendez de voir ses phares dans votre rétroviseur.",
          "Oublier l'angle mort : de nombreux accidents surviennent parce que le conducteur a cru la voie libre en ne regardant que les rétroviseurs.",
        ],
        highlight: "Sommet de côte : toujours interdit de dépasser",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "En cas de doute, ne dépassez pas. C'est la règle d'or. Un dépassement raté peut être fatal.",
        rules: [
          "Procédure : évaluer la visibilité, rétros + angle mort, clignotant gauche, déport, accélération, clignotant droit, retour à droite.",
          "500 à 600 m de visibilité libre minimum pour dépasser sur route.",
          "Interdit : virage, sommet de côte, ligne continue, passage à niveau, passage piéton, panneau B3a.",
          "Interdit d'accélérer quand on est dépassé.",
          "En cas de doute : ne pas dépasser.",
        ],
      },
    ],
  },

  // ── C2 / Leçon 5 ────────────────────────────────────────────────────────────
  {
    id: "c2_l5",
    competence_id: 2,
    chapter: 5,
    title: "Les ronds-points",
    subtitle: "Règles de priorité françaises, utilisation des clignotants et conduite pratique",
    icon: "🔄",
    readingTime: "5 min",
    sections: [
      {
        type: "intro",
        title: "Le rond-point, une invention française répandue",
        content:
          "La France compte plus de 65 000 ronds-points, ce qui en fait le pays au monde qui en possède le plus. Depuis le décret du 27 octobre 1983, la priorité est accordée aux véhicules déjà dans le rond-point, et non plus aux véhicules qui entrent. Ce changement a considérablement réduit les accidents dans ces zones. Pourtant, les infractions aux règles des ronds-points restent fréquentes.",
      },
      {
        type: "rule",
        title: "La règle de priorité dans les ronds-points",
        content:
          "La règle de priorité dans les ronds-points est fixée par les articles R415-10 et R415-11 du Code de la route. Elle est simple mais impérative :",
        rules: [
          "Tout véhicule circulant dans l'anneau (déjà engagé dans le rond-point) est prioritaire sur les véhicules qui veulent entrer.",
          "À l'entrée du rond-point, un panneau AB6 (Cédez-le-passage) ou AB1 (Stop) vous indique que vous devez laisser passer les véhicules de l'anneau.",
          "Il n'y a pas de priorité à droite dans un rond-point réglementaire : c'est l'anneau qui est prioritaire sur les entrées.",
          "Exception très rare : certains vieux carrefours giratoires en France ont conservé la priorité à droite. Un panneau AB4 (Passage protégé) à l'intérieur l'indique. Ces cas sont très rares et toujours signalisés.",
        ],
        highlight: "Véhicule dans l'anneau = prioritaire sur les entrants",
      },
      {
        type: "rule",
        title: "Utilisation des clignotants dans un rond-point",
        content:
          "L'usage des clignotants dans les ronds-points est souvent mal appliqué. Voici la règle officielle :",
        rules: [
          "À l'entrée dans le rond-point : aucun clignotant n'est légalement obligatoire si vous allez tout droit ou à gauche.",
          "Pour sortir du rond-point : activez le clignotant droit AVANT la sortie que vous souhaitez prendre, dès que vous avez dépassé la sortie précédente.",
          "Si vous prenez la première sortie (à droite) : activer le clignotant droit à l'entrée est une bonne pratique pour informer les autres conducteurs, même si ce n'est pas une obligation légale stricte.",
          "L'objectif est d'informer les autres conducteurs de vos intentions. Le clignotant droit avant votre sortie est la règle essentielle à retenir.",
        ],
        highlight: "Clignotant droit avant de sortir du rond-point",
      },
      {
        type: "tip",
        title: "Quelle voie choisir à l'entrée ?",
        content:
          "Sur les ronds-points à deux voies, le choix de la voie d'entrée est important pour éviter les conflits :",
        rules: [
          "Première sortie (à votre droite, moins d'un quart de tour) : prenez la voie extérieure droite à l'entrée et restez sur la voie extérieure dans l'anneau.",
          "Sortie en face (deuxième sortie environ) ou sortie à gauche (plus de la moitié du tour) : prenez la voie intérieure gauche à l'entrée.",
          "Si vous n'êtes pas sûr de votre sortie, restez en voie intérieure : vous pouvez faire un tour complet en attendant de vous décider.",
          "Ne jamais changer de voie dans l'anneau sans vérifier les rétroviseurs et les angles morts.",
          "Sur un rond-point à voie unique (le plus courant en France), pas de choix à faire : il n'y a qu'une voie.",
        ],
        highlight: "1ère sortie : voie extérieure. Sortie en face ou à gauche : voie intérieure.",
      },
      {
        type: "warning",
        title: "Erreurs fréquentes dans les ronds-points",
        content:
          "Voici les erreurs que je vois le plus souvent chez les élèves, et qui génèrent des accidents ou des situations de conflit :",
        rules: [
          "S'engager sans regarder l'anneau : certains conducteurs s'engagent parce qu'ils ne voient personne à leur droite immédiate, sans voir le véhicule qui arrive dans l'anneau depuis leur gauche.",
          "Ne pas céder le passage en phase d'entrée : l'idée fausse que 'qui entre a priorité' est extrêmement répandue et dangereuse.",
          "Oublier le clignotant droit à la sortie : les conducteurs derrière vous et ceux qui attendent à l'entrée ne savent pas quelle sortie vous allez prendre.",
          "Changer de voie dans l'anneau sans vérifier : les angles morts sont importants. Toujours regarder avant de se déporter.",
          "Rouler trop vite dans l'anneau : la vitesse conseillée est de 20 à 30 km/h dans l'anneau.",
        ],
        highlight: "Priorité à ceux qui sont déjà dans l'anneau — toujours",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "Le rond-point est conçu pour fluidifier la circulation. Respectez ses règles et il sera votre allié.",
        rules: [
          "Priorité aux véhicules dans l'anneau. Vous cédez le passage à l'entrée.",
          "Clignotant droit obligatoire avant de sortir.",
          "Première sortie : voie extérieure. Sortie en face ou à gauche : voie intérieure.",
          "Ne jamais changer de voie dans l'anneau sans vérifier les angles morts.",
          "Vitesse conseillée dans l'anneau : 20 à 30 km/h.",
        ],
      },
    ],
  },

  // ── C2 / Leçon 6 ────────────────────────────────────────────────────────────
  {
    id: "c2_l6",
    competence_id: 2,
    chapter: 6,
    title: "Changements de direction et insertion",
    subtitle: "Clignotants, procédure de changement de voie, voies d'insertion et fermeture",
    icon: "↪️",
    readingTime: "6 min",
    sections: [
      {
        type: "intro",
        title: "Changer de direction sans surprendre personne",
        content:
          "Les changements de direction — tourner à gauche, tourner à droite, changer de voie, s'insérer depuis une voie d'accélération — sont des actes quotidiens qui, mal exécutés, causent de nombreux accidents. Le principe fondamental est simple : informer les autres conducteurs de vos intentions suffisamment à l'avance, vérifier que la manœuvre est possible en toute sécurité, puis l'exécuter avec fluidité. Pas de surprise, pas d'improvisation.",
      },
      {
        type: "rule",
        title: "Les clignotants — obligation et timing",
        content:
          "L'utilisation des clignotants est obligatoire pour tout changement de direction ou changement de voie (article R412-6 du Code de la route). Voici les règles précises :",
        rules: [
          "Vous devez actionner le clignotant avant de commencer la manœuvre, pas pendant. Le délai minimum est d'environ 3 secondes en ville et de 5 à 8 secondes sur route ou voie rapide.",
          "Le clignotant doit rester allumé pendant toute la durée du déplacement latéral.",
          "Vous devez l'éteindre dès que la manœuvre est terminée (la plupart des véhicules le font automatiquement en cas de virage, mais pas en cas de changement de voie).",
          "Activer le clignotant ne vous donne AUCUN droit de passage : il informe, il ne protège pas. Vous devez toujours vous assurer que la manœuvre est sûre avant de l'exécuter.",
          "Sanction pour absence de clignotant : amende de 2e classe (35 €), mais surtout mise en danger des autres usagers.",
        ],
        highlight: "Clignotant AVANT la manœuvre — pas pendant",
      },
      {
        type: "rule",
        title: "Procédure complète pour un changement de voie",
        content:
          "Un changement de voie sur route ou autoroute suit une procédure rigoureuse qui peut se résumer par la méthode 3M : Miroir, Manette, Manœuvre :",
        rules: [
          "1. Miroir : regardez le rétroviseur intérieur, puis le rétroviseur extérieur du côté où vous allez vous déplacer.",
          "2. Angle mort : tournez brièvement la tête pour vérifier l'angle mort. C'est impératif — les rétroviseurs ne couvrent pas tout.",
          "3. Manette (clignotant) : activez le clignotant du côté où vous allez.",
          "4. Attendre : laissez 3 à 5 secondes pour que les autres conducteurs voient votre intention.",
          "5. Miroir + angle mort de nouveau : revérifiez une dernière fois avant de vous déporter.",
          "6. Manœuvre : déportez-vous progressivement. Pas de coup de volant sec.",
          "7. Désactivez le clignotant une fois en voie.",
        ],
        highlight: "Méthode 3M : Miroir — Manette — Manœuvre",
      },
      {
        type: "rule",
        title: "Les voies d'insertion et d'accélération",
        content:
          "Les voies d'insertion (ou voies d'accélération) se trouvent à l'entrée des autoroutes et voies rapides. Leur objectif est de vous permettre d'atteindre la vitesse du flux avant de vous insérer :",
        rules: [
          "Sur la voie d'accélération, accélérez progressivement pour atteindre la vitesse du trafic sur la voie principale avant de vous insérer. Ne vous insérez JAMAIS lentement dans un flux à 110-130 km/h.",
          "L'insertion doit se faire sur la voie de droite de la chaussée principale. Ne coupez pas directement vers la voie centrale.",
          "Si la voie d'insertion est trop courte ou le trafic trop dense pour vous insérer, arrêtez-vous en bout de bretelle et attendez une ouverture sûre.",
          "Les véhicules sur la voie principale n'ont pas l'obligation légale de vous laisser entrer, mais le Code recommande de faciliter l'insertion si possible.",
          "Activez le clignotant gauche pour vous insérer vers la voie principale (vous vous déplacez vers la gauche depuis la bretelle).",
        ],
        highlight: "Atteindre la vitesse du flux AVANT de s'insérer",
      },
      {
        type: "rule",
        title: "La fermeture de voie (rétrécissement)",
        content:
          "Lorsqu'une voie se ferme (travaux, accident, rétrécissement), les conducteurs doivent adopter un comportement coopératif :",
        rules: [
          "La règle du zipper (fermeture éclair) s'applique : les véhicules des voies encore ouvertes doivent alterner un par un pour laisser entrer les véhicules de la voie qui se ferme.",
          "Il est correct et légal de rester dans la voie qui se ferme jusqu'à son extrémité et de s'insérer à son extrémité. Ce n'est pas de la resquille : c'est la méthode efficace.",
          "Vous devez activer votre clignotant tôt pour signaler votre intention d'insertion.",
          "Bloquer volontairement l'accès à quelqu'un qui tente de s'insérer correctement est dangereux et illégal.",
          "En cas de travaux avec signalisation spécifique (flèches lumineuses, panneau AK5), suivez les indications : changez de voie dès que la signalisation le demande.",
        ],
        highlight: "Règle du zipper : alterner un par un",
      },
      {
        type: "tip",
        title: "Tourner à gauche sur une route à double sens",
        content:
          "Tourner à gauche depuis une route à double sens est l'une des manœuvres les plus risquées en conduite quotidienne. Voici la méthode :",
        rules: [
          "Activez le clignotant gauche suffisamment à l'avance (au moins 50 m avant en agglomération, 150 m hors agglomération).",
          "Vérifiez le rétroviseur intérieur, le rétroviseur gauche, et l'angle mort gauche.",
          "Serrez progressivement vers l'axe de la chaussée pour vous positionner en attente de tourner.",
          "Attendez une ouverture suffisante dans le trafic venant en sens inverse. Ne vous précipitez pas : les véhicules en face ont la priorité.",
          "Si deux véhicules tournent à gauche face à face, croisez-vous par l'arrière (nez à gauche) pour avoir une meilleure visibilité sur la voie en face.",
        ],
        highlight: "Clignotant gauche 50 m avant en agglomération",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "Changer de direction ou de voie, c'est communiquer avec les autres conducteurs. Le clignotant est votre seul outil de communication sur la route.",
        rules: [
          "Clignotant avant la manœuvre, jamais pendant. Il informe, il ne protège pas.",
          "Changement de voie : méthode 3M — Miroir, Manette (clignotant), Manœuvre. Angle mort obligatoire.",
          "Insertion sur voie rapide : atteindre la vitesse du flux avant de s'insérer. Clignotant gauche.",
          "Fermeture de voie : règle du zipper, alterner un par un.",
          "Tournage à gauche : serrer à l'axe, clignotant 50 m avant, priorité aux véhicules en face.",
        ],
      },
    ],
  },
];
