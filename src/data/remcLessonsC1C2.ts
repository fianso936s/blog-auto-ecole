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
    readingTime: "8 min",
    sections: [
      {
        type: "intro",
        title: "Pourquoi bien s'installer ?",
        content:
          "Avant de tourner la clé de contact, votre première mission est de vous installer correctement. Un mauvais réglage du siège ou des rétroviseurs peut vous empêcher d'avoir les bons réflexes en situation d'urgence. Les études de la Sécurité routière montrent qu'un conducteur mal installé réagit jusqu'à 30 % plus lentement en cas d'urgence. L'examinateur observe votre installation dès le moment où vous montez dans le véhicule : jusqu'à 2 points supplémentaires peuvent être accordés à un candidat qui procède correctement et dans le bon ordre. Prenez toujours le temps de régler votre poste avant de démarrer.",
      },
      {
        type: "rule",
        title: "L'ordre officiel des réglages — siège en premier",
        content:
          "L'ordre des réglages n'est pas anodin : régler les rétroviseurs avant le siège vous obligera à les recommencer après. L'ordre enseigné dans toutes les auto-écoles françaises est : Siège → Appuie-tête → Volant → Rétroviseurs → Ceinture.",
        rules: [
          "Siège d'abord : reculez ou avancez le siège via la manette sous le coussin. Appuyez à fond sur la pédale d'embrayage (boîte manuelle) ou de frein (boîte automatique) — la jambe doit être légèrement fléchie, jamais tendue. La cuisse doit rester posée à plat sur le coussin du siège.",
          "Dossier : inclinez-le légèrement en arrière (environ 100 à 110°). Le dos doit être entièrement calé. Ne jamais s'allonger ni se pencher en avant pour attraper le volant : signe que le siège est trop loin.",
          "Hauteur du siège (si disponible) : réglez-la pour avoir une bonne visibilité par-dessus le tableau de bord, tout en gardant la tête au moins 10 cm sous le pavillon.",
          "Volant : réglez sa hauteur et sa profondeur (si réglable). Les bras doivent être légèrement fléchis lorsqu'ils tiennent le volant à 9h15 ou à 10h10. Les mains ne doivent pas frôler les genoux dans les virages.",
          "Le moniteur conseille : vérifiez que vous pouvez appuyer à fond sur chaque pédale sans décoller la cuisse du siège ni déhancher le bassin. Sinon, rapprochez le siège.",
        ],
        highlight: "Ordre officiel : Siège → Appuie-tête → Volant → Rétroviseurs → Ceinture",
      },
      {
        type: "rule",
        title: "La ceinture de sécurité — obligation légale (article R412-1)",
        content:
          "Le port de la ceinture est obligatoire pour le conducteur et tous les passagers, à l'avant comme à l'arrière (article R412-1 du Code de la route). Le conducteur est responsable du port de la ceinture pour les passagers de moins de 18 ans. En cas d'accident, une ceinture mal portée peut provoquer des lésions internes graves (décélération sur le ventre au lieu des os).",
        rules: [
          "La sangle abdominale doit passer sur les hanches (les os iliaques), jamais sur le ventre. En cas de choc frontal violent, la ceinture doit bloquer le bassin, pas les organes.",
          "La sangle thoracique doit passer entre l'épaule et le cou, en contact avec le sternum et la clavicule — jamais derrière le dos ni sous le bras.",
          "Ne jamais mettre le clip dans la ceinture sans l'avoir passée : le système de retenue est alors totalement inefficace.",
          "Une ceinture tordue ne protège pas correctement : vérifiez qu'elle est bien à plat sur toute sa longueur.",
          "En tant que conducteur, vérifiez d'abord que vos passagers ont bouclé leur ceinture, puis attachez la vôtre.",
          "Sanction pour absence de ceinture : 135 € d'amende et 3 points retirés par infraction constatée (une infraction par passager sans ceinture pour les moins de 18 ans).",
        ],
        highlight: "135 € et 3 points par infraction — vérifier les passagers avant vous",
      },
      {
        type: "rule",
        title: "Réglage des rétroviseurs — éliminer les angles morts",
        content:
          "Les rétroviseurs couvrent environ 70 % de ce qui se passe derrière vous. Le reste constitue les angles morts, zones invisibles de 3 à 5 m sur les côtés. Réglez-les toujours après le siège et le volant, car un déplacement du siège modifie votre ligne de vision.",
        rules: [
          "Rétroviseur intérieur : cadrez la lunette arrière entièrement, en positionnant son bord bas au tiers inférieur du miroir. Votre tête ne doit pas bouger pour voir l'intégralité de la vitre. Certains rétroviseurs modernes ont un mode anti-éblouissement automatique (position nuit).",
          "Rétroviseur extérieur gauche : orientez-le de manière à voir une fine bande de la carrosserie (environ 1/5) sur le bord gauche. Vous devez apercevoir la poignée de portière passager dans le coin inférieur droit du miroir. L'horizon doit apparaître au tiers supérieur.",
          "Rétroviseur extérieur droit : même principe. Fine bande de carrosserie, sol visible à partir du tiers inférieur. La poignée de portière côté droit doit être visible dans le coin inférieur gauche du miroir.",
          "Certains rétroviseurs modernes possèdent une diode qui s'allume en présence d'un véhicule dans l'angle mort — aide utile, mais elle ne remplace pas le contrôle direct.",
          "Les zones non couvertes par les rétroviseurs constituent les angles morts. Complétez toujours par une rotation de la tête avant tout changement de voie, démarrage ou ouverture de portière.",
        ],
        highlight: "Angles morts = contrôle direct obligatoire — les rétroviseurs couvrent 70 % seulement",
      },
      {
        type: "rule",
        title: "L'appuie-tête — dispositif anti-coup du lapin",
        content:
          "L'appuie-tête n'est pas un accessoire de confort : c'est un dispositif de sécurité passif homologué qui réduit de 40 % le risque de lésion cervicale grave (coup du lapin) en cas de choc arrière. Selon les données de la Sécurité routière, le coup du lapin représente 30 % des accidents de la route avec séquelles durables.",
        rules: [
          "Le centre de l'appuie-tête doit être au niveau du haut des oreilles, idéalement à la hauteur du centre de gravité de la tête (sommet des oreilles).",
          "La distance maximale acceptable entre l'arrière de la tête et l'appuie-tête est de 4 cm. Plus loin, la tête bascule en arrière avant d'être stoppée — ce mouvement provoque l'entorse cervicale.",
          "Un appuie-tête trop bas est plus dangereux qu'un appuie-tête absent : en cas de choc, la tête passe par-dessus et la nuque prend tout le choc, aggravant les lésions.",
          "Vérifiez également l'appuie-tête des passagers arrière, notamment si vous transportez des enfants ou des adolescents.",
          "Le moniteur conseille : après avoir réglé l'appuie-tête, essayez de poser la tête en arrière pour vérifier qu'il est bien en contact ou très proche — si votre tête trouve un vide, rapprochez-le.",
        ],
        highlight: "Distance maxi tête / appuie-tête : 4 cm — trop bas est pire qu'absent",
      },
      {
        type: "example",
        title: "Scénario type à l'examen : le rituel d'installation observé par l'inspecteur",
        content:
          "L'examinateur monte dans le véhicule et vous demande de prendre place. Il observe chacun de vos gestes. Voici ce qu'il note et ce qu'il sanctionne :",
        rules: [
          "Ce qu'il note positivement : vous régler le siège sans être invité à le faire, vous vérifier chaque rétroviseur en tournant la tête, vous boucler la ceinture correctement avant de démarrer.",
          "Ce qu'il sanctionne : oublier l'appuie-tête, ne pas vérifier les rétroviseurs extérieurs, porter la ceinture sous le bras ou la bloquer derrière le dos.",
          "Erreur fréquente n°1 : démarrer sans avoir réglé les rétroviseurs. L'inspecteur le voit immédiatement et note une absence de vérification du poste.",
          "Erreur fréquente n°2 : régler les rétroviseurs avant le siège, puis ne pas les re-régler après avoir bougé le siège.",
          "Erreur fréquente n°3 : ajuster la ceinture sous le bras pour gagner en confort. En cas de choc, la sangle coupe les côtes et l'abdomen.",
          "Le conseil du moniteur : répétez l'ordre SAVRC (Siège, Appuie-tête, Volant, Rétroviseurs, Ceinture) comme une formule avant chaque montée en véhicule jusqu'à ce que ce soit automatique.",
        ],
        highlight: "Mémo SAVRC : Siège — Appuie-tête — Volant — Rétroviseurs — Ceinture",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "Avant tout démarrage, le rituel SAVRC prend 30 secondes et peut vous sauver la vie. L'examinateur observe chaque geste dès que vous montez dans le véhicule.",
        rules: [
          "Ordre officiel : Siège → Appuie-tête → Volant → Rétroviseurs → Ceinture (mémo SAVRC).",
          "Siège : jambe légèrement fléchie sur la pédale, dos entièrement calé, bras fléchis sur le volant.",
          "Ceinture : sangle abdominale sur les os des hanches, thoracique sur la clavicule. Vérifier les passagers avant vous. 135 € et 3 points.",
          "Rétroviseurs : fine bande de carrosserie sur les côtés, lunette arrière cadrée. Les angles morts = contrôle direct obligatoire.",
          "Appuie-tête : au niveau du sommet des oreilles, moins de 4 cm de la nuque. Trop bas = plus dangereux qu'absent.",
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
    readingTime: "7 min",
    sections: [
      {
        type: "intro",
        title: "Un rituel à ne jamais négliger",
        content:
          "Démarrer un véhicule, ça ne se résume pas à tourner une clé. Il y a une procédure précise qui garantit que le véhicule ne bougera pas de façon intempestive et que le moteur démarrera sans incident. Cette procédure change selon que vous conduisez une boîte manuelle ou une boîte automatique. À noter : selon les statistiques de l'examen pratique du permis B, le calage au démarrage et les erreurs sur boîte automatique représentent l'une des principales causes de fautes éliminatoires lors des premières manœuvres. Maîtriser les deux cas est donc indispensable.",
      },
      {
        type: "rule",
        title: "Procédure de démarrage — boîte manuelle",
        content:
          "Sur un véhicule à boîte de vitesses manuelle, suivez ces étapes dans l'ordre exact. Ne les sautez jamais, même si vous êtes pressé. Mémo : Point mort — Frein à main — Embrayage — Contact.",
        rules: [
          "1. Vérifiez que le levier de vitesses est au point mort (N) : il doit se balancer librement de gauche à droite. Si vous mettez le contact avec une vitesse engagée et l'embrayage non enfoncé, le véhicule bondira en avant.",
          "2. Serrez le frein à main (ou vérifiez que le frein de stationnement électrique est activé).",
          "3. Appuyez à fond sur la pédale d'embrayage avec le pied gauche — jusqu'au plancher, le talon bien au sol. Sur les véhicules modernes, un anti-démarrage empêche le moteur de partir sans l'embrayage enfoncé.",
          "4. Tournez la clé (ou appuyez sur le bouton Start/Stop) jusqu'à la position démarrage. Relâchez dès que le moteur tourne.",
          "5. Vérifiez les voyants du tableau de bord : le voyant de charge batterie et celui de pression d'huile doivent s'éteindre dans les secondes qui suivent. S'ils restent allumés, coupez le moteur et appelez un professionnel.",
          "6. Attendez que le régime se stabilise avant de desserrer le frein à main et de passer en première.",
        ],
        highlight: "Mémo : Point mort — Frein à main — Embrayage — Contact",
      },
      {
        type: "rule",
        title: "Procédure de démarrage — boîte automatique",
        content:
          "Sur une boîte automatique, la procédure est plus simple mais les erreurs sont différentes et souvent héritées des habitudes de la boîte manuelle. Attention : selon les moniteurs de conduite, les candidats formés uniquement sur boîte manuelle commettent 3 fois plus d'erreurs sur une boîte automatique lors des premières séances.",
        rules: [
          "1. Le sélecteur doit être en position P (Parking). La plupart des boîtes modernes n'autorisent le démarrage qu'en P.",
          "2. Appuyez sur la pédale de frein (pédale de droite uniquement — il n'y a pas d'embrayage). Maintenez-la enfoncée.",
          "3. Tournez la clé ou appuyez sur Start/Stop tout en maintenant le frein.",
          "4. Passez en D (Drive) pour avancer ou en R (Reverse) pour reculer, toujours en maintenant le frein enfoncé avant de relâcher.",
          "5. Ne jamais passer de D à R (ou inversement) sans être à l'arrêt complet : le mécanisme de verrouillage de stationnement n'est pas conçu pour stopper un véhicule en mouvement — cela l'endommage gravement.",
          "6. En attente prolongée (feux, embouteillage), restez en D pied au frein, ou passez en N si l'arrêt dure plus de 2 minutes pour protéger la boîte.",
          "7. Ne jamais freiner avec le pied gauche sur une boîte automatique : cette habitude crée des à-coups dangereux et use les freins prématurément.",
        ],
        highlight: "Sélecteur en P + pied au frein avant le contact — jamais D à R en mouvement",
      },
      {
        type: "rule",
        title: "Procédure d'arrêt et extinction du moteur",
        content:
          "Arrêter correctement le moteur est tout aussi important que de bien démarrer. Une mauvaise procédure peut laisser le véhicule dériver ou endommager certains organes mécaniques :",
        rules: [
          "1. Immobilisez complètement le véhicule avant d'agir sur le levier de vitesses ou le sélecteur.",
          "2. Boîte manuelle : passez au point mort, serrez le frein à main, puis coupez le contact. En côte, laissez une vitesse engagée ET serrez le frein à main pour sécuriser le véhicule.",
          "3. Boîte automatique : passez en P, serrez le frein de stationnement, puis coupez le contact.",
          "4. Retirez la clé et assurez-vous que le véhicule est bien immobilisé avant de sortir.",
          "5. Ne jamais couper le contact moteur en roulant : vous perdriez instantanément l'assistance de direction (direction assistée) et de freinage (servofrein). La force nécessaire pour freiner multiplie par 5.",
          "6. Sur voiture Start/Stop : le moteur peut se couper automatiquement à l'arrêt. Ce n'est pas un arrêt définitif — le véhicule est toujours actif.",
        ],
        highlight: "Frein à main + point mort avant de couper le contact — jamais couper en roulant",
      },
      {
        type: "warning",
        title: "Erreurs fréquentes à l'examen et chez les débutants",
        content:
          "Ces erreurs reviennent systématiquement lors des premières leçons et à l'examen pratique. Le moniteur les repère immédiatement :",
        rules: [
          "Lâcher l'embrayage trop vite en première : le moteur cale brutalement. La technique : montez l'embrayage très lentement jusqu'au point de friction (le moteur commence à « ronronner » différemment), attendez 1 seconde, puis desserrez le frein à main. Ce point de friction est la clé.",
          "Oublier de désengager le frein à main avant de partir : le véhicule avance avec le frein serré, surchauffe les tambours ou disques et use les garnitures. Le voyant rouge de frein à main reste allumé — vérifiez-le toujours avant de partir.",
          "Sur boîte automatique : confondre la pédale de frein et l'accélérateur. Les deux pédales sont rapprochées et leur position diffère de la boîte manuelle. Regardez les pédales au début.",
          "Ne pas vérifier les voyants au démarrage : un voyant d'huile qui reste allumé peut signaler une pression insuffisante — rouler avec ce voyant peut détruire le moteur en quelques minutes.",
          "Sur boîte automatique : ne pas laisser chauffer brièvement le moteur par temps froid (-5°C et moins) avant de solliciter la boîte. L'huile de boîte froide est plus visqueuse et protège moins bien.",
        ],
        highlight: "Voyant huile allumé après démarrage = ne pas rouler, appeler un professionnel",
      },
      {
        type: "tip",
        title: "Trouver le point de friction — technique du moniteur",
        content:
          "Le point de friction (ou point de patinage) est le moment précis où l'embrayage commence à transmettre la puissance du moteur aux roues. C'est la compétence clé du démarrage en boîte manuelle :",
        rules: [
          "Embrayage enfoncé à fond, première engagée, frein à main serré. Remontez l'embrayage très lentement — 1 cm par seconde environ.",
          "Signal sonore : vous entendrez le régime moteur légèrement baisser (le moteur « tire »). C'est le point de friction. Restez là.",
          "Signal mécanique : si vous n'avez pas serré le frein à main, le véhicule commencera à avancer doucement. C'est le point de friction.",
          "À ce stade, desserrez le frein à main d'une main pendant que l'autre reste sur le volant. La voiture s'élance doucement.",
          "Le moniteur conseille : entraînez-vous à trouver ce point en parking vide jusqu'à le sentir sans y penser. C'est un automatisme qui s'acquiert en 2 à 3 heures de conduite.",
        ],
        highlight: "Point de friction = régime qui baisse légèrement — restez là, puis desserrez le frein",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "Chaque type de boîte a sa propre procédure. Mémorisez les deux et ne les mélangez jamais. Le calage est la première cause d'échec à l'examen sur les manœuvres de départ.",
        rules: [
          "Boîte manuelle : Point mort — Frein à main — Embrayage enfoncé — Contact. Trouver le point de friction avant de desserrer le frein.",
          "Boîte automatique : Sélecteur en P — Pied au frein — Contact. Passer en D ou R toujours à l'arrêt complet.",
          "À l'arrêt définitif : immobiliser, point mort ou P, frein à main, couper le contact.",
          "Toujours vérifier les voyants du tableau de bord après le démarrage. Voyant huile = ne pas rouler.",
          "Ne jamais couper le contact pendant que le véhicule roule : perte immédiate de l'assistance direction et freinage.",
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
    readingTime: "8 min",
    sections: [
      {
        type: "intro",
        title: "La trajectoire, ça s'apprend",
        content:
          "Un virage mal négocié, c'est la première cause de sorties de route. En France, selon l'analyse de l'IFSTTAR, 65 % des accidents en virage résultent d'une vitesse trop élevée par rapport aux capacités du conducteur, du véhicule ou de la route. Chez les deux-roues motorisés, 42 % des accidents mortels se produisent dans un virage. Pourtant, la bonne trajectoire n'est pas une question de feeling : c'est une technique précise, répétable, que vous allez apprendre ici. La règle universelle : regarder loin, adapter la vitesse avant d'entrer, maintenir une trajectoire régulière. Pas de freinage en virage, jamais.",
      },
      {
        type: "rule",
        title: "Les trois phases d'un virage — Approche, Passage, Sortie",
        content:
          "Chaque virage se décompose en trois phases distinctes. Les identifier à l'avance vous permettra de ne jamais être pris par surprise. Mémo : APS (Approche, Passage, Sortie).",
        rules: [
          "Phase 1 — Approche : repérez le virage le plus tôt possible en portant le regard loin, là où part la route. Adaptez votre vitesse AVANT d'entrer dans la courbe. La logique est simple : plus on tourne le volant, moins les pneus peuvent freiner efficacement. On ne freine jamais en virage.",
          "Phase 2 — Passage : dès que vous entrez dans le virage, regardez vers la sortie. Le regard guide naturellement les mains vers la bonne trajectoire. Gardez une trajectoire régulière, sans brusquer le volant. Toute accélération doit être douce et progressive.",
          "Phase 3 — Sortie : redressez le volant progressivement en même temps que vous accélérez doucement. La voiture retrouve sa trajectoire rectiligne. Ne débrayez jamais en sortie de virage (risque de blocage de roue et perte d'adhérence).",
          "La trajectoire idéale : Extérieur → Apex (intérieur) → Extérieur. Ce principe, dit « extérieur-intérieur-extérieur », réduit l'angle de virage effectif et donc les forces centrifuges.",
        ],
        highlight: "Mémo APS : Approche (vitesse) — Passage (regard sortie) — Sortie (redresser + accélérer)",
      },
      {
        type: "rule",
        title: "Virage à droite — serrer à droite, surveiller l'intérieur",
        content:
          "Sur une voie à sens unique ou sur la moitié droite d'une route à double sens, aborder un virage à droite nécessite de bien gérer sa position latérale et sa vitesse :",
        rules: [
          "Positionnez-vous légèrement sur la droite de votre voie avant d'entrer dans le virage, sans déborder sur l'accotement ni frôler le bas-côté.",
          "Regardez vers l'intérieur du virage (vers la droite) pour anticiper la présence de cyclistes, piétons ou animaux qui surgissent de derrière la haie ou le talus.",
          "La trajectoire idéale : abordez depuis l'extérieur (gauche de votre voie), passez au plus près de l'apex (côté droit) puis ressortez vers l'extérieur. Cela réduit l'angle réel de braquage.",
          "Cette trajectoire ne doit jamais vous amener à mordre sur la voie en face sur route à double sens. Restez strictement sur votre moitié de chaussée — une ligne blanche continue l'interdit formellement.",
          "En agglomération, le virage à droite est souvent très serré. Ralentissez suffisamment (15 à 20 km/h) et vérifiez les angles morts pour les deux-roues ou les piétons qui se glissent entre le trottoir et vous.",
        ],
        highlight: "Rester dans sa voie — ne jamais mordre sur la voie d'en face",
      },
      {
        type: "rule",
        title: "Virage à gauche — la plus dangereuse des deux situations",
        content:
          "Le virage à gauche est plus délicat car vous vous rapprochez de la voie des véhicules venant en sens inverse. Statistiquement, les collisions frontales en virage à gauche mal coupé sont parmi les plus meurtrières, car les vitesses s'additionnent au choc.",
        rules: [
          "Positionnez-vous légèrement sur la gauche de votre voie (vers l'axe central) avant d'entrer dans le virage.",
          "Regardez vers la gauche et scrutez la sortie du virage pour détecter les véhicules en face. En virage aveugle, décélérez davantage et serrez-vous à droite.",
          "Ne coupez jamais un virage à gauche : cela vous projette sur la voie en sens inverse. La trajectoire doit impérativement rester à droite de l'axe de la chaussée.",
          "Par mauvaise visibilité (virage en aveugle, haie haute, brouillard), réduisez la vitesse pour pouvoir vous arrêter dans la distance que vous voyez. C'est la règle de la distance de visibilité.",
          "Sur route de montagne avec virages en épingle : ne pas couper, klaxonner brièvement si la visibilité est nulle (un court avertisseur sonore est autorisé hors agglomération selon l'article R416-1).",
        ],
        highlight: "Ne jamais couper un virage à gauche — rester à droite de l'axe de la chaussée",
      },
      {
        type: "warning",
        title: "Les erreurs qui provoquent des sorties de route",
        content:
          "Ces erreurs figurent en tête des causes d'accidents en virage relevées par la Sécurité routière. Selon l'analyse de l'IFSTTAR, 35 % des accidents en virage sont liés à un problème de guidage (mauvais choix de trajectoire) et 65 % à une vitesse d'entrée trop élevée.",
        rules: [
          "Freiner en virage : les pneus doivent gérer à la fois la force centrifuge et l'effort de freinage. Au-delà d'un seuil, ils décrochent et vous perdez le contrôle. Freinez toujours avant le virage, jamais dedans.",
          "Regarder trop près devant soi : si vous regardez juste devant le capot, vous réagissez 0,5 à 1 seconde trop tard. Portez le regard vers la sortie du virage, pas la bordure immédiate.",
          "Entrer trop vite : la plupart des accidents en virage se produisent chez des conducteurs qui ne dépassaient pas les 20° d'inclinaison — la physique faisait le reste.",
          "Braquer sec en urgence : un coup de volant brusque à vitesse élevée peut provoquer un tête-à-queue ou un tonneau. Le braquage doit toujours être progressif et continu.",
          "Sous-estimer le dévers (pente transversale) : sur une route déversée dans le mauvais sens par rapport au virage (route en toit), la limite d'adhérence est réduite de 20 à 30 % par rapport à une route plane.",
          "Relâcher l'accélérateur brutalement en virage (lift-off oversteer) : cela transfère le poids sur les roues avant et peut faire pivoter l'arrière. Relâchez l'accélérateur progressivement si nécessaire.",
        ],
        highlight: "Freiner AVANT — jamais EN virage. 65 % des accidents : vitesse d'entrée trop élevée.",
      },
      {
        type: "example",
        title: "Scénario concret à l'examen : virage sur route départementale",
        content:
          "Vous roulez à 80 km/h sur une route départementale. Un virage à droite apparaît à 150 m. Pas de panneau de vitesse. Décrivez votre procédure complète :",
        rules: [
          "À 150 m : repérez le virage, évaluez son angle (serré ou large). Si vous ne voyez pas la sortie, c'est un virage aveugle — réduisez davantage.",
          "Entre 150 m et 80 m : phase d'approche. Freinage doux et progressif avant la courbe. Passez de 80 à 50-60 km/h selon l'angle apparent du virage.",
          "Positionnement : légèrement à droite de votre voie (voie de droite sur route à double sens). Préparez l'apex.",
          "Entrée dans la courbe : relâchez les freins avant d'entrer. Regardez vers la sortie du virage, pas le bord immédiat.",
          "Passage : accélération légère et progressive pour maintenir la trajectoire. Le regard porte loin vers la sortie visible.",
          "Erreur à l'examen : freiner dans la courbe parce que la vitesse semble trop élevée. L'inspecteur sanctionne ce geste comme une mauvaise anticipation de la phase d'approche.",
        ],
        highlight: "Freinage progressif avant la courbe — accélération douce en sortie",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "Un virage bien négocié, c'est regarder loin, ralentir avant, maintenir l'allure dans la courbe, accélérer en sortie. La trajectoire extérieur-intérieur-extérieur réduit l'effort de braquage.",
        rules: [
          "Mémo APS : Approche (adapter la vitesse), Passage (regarder la sortie), Sortie (redresser et accélérer doucement).",
          "Trajectoire universelle : extérieur → apex (intérieur) → extérieur. Réduit l'angle de braquage.",
          "Virage à droite : serrer à droite, regarder l'intérieur, rester dans sa voie.",
          "Virage à gauche : ne jamais couper, rester à droite de l'axe, surveiller les véhicules en face.",
          "On ne freine JAMAIS en virage : toujours freiner avant. 65 % des accidents en virage = vitesse d'entrée excessive.",
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
    subtitle: "Procédures légales, zones interdites, sanctions et techniques sûres",
    icon: "⬅️",
    readingTime: "8 min",
    sections: [
      {
        type: "intro",
        title: "Reculer, ça aussi ça s'apprend",
        content:
          "La marche arrière et le demi-tour sont des manœuvres que beaucoup d'élèves redoutent, mais elles obéissent à des règles précises et à une technique répétable. La loi encadre strictement où et comment effectuer ces manœuvres, car elles constituent un risque élevé pour les autres usagers — en particulier les piétons et les enfants qui se trouvent dans des angles morts importants. Selon la convention IRSA (règlement des sinistres automobile), le véhicule effectuant une marche arrière est reconnu responsable à 100 % en cas d'accident, sauf circonstance très particulière.",
      },
      {
        type: "rule",
        title: "La marche arrière — obligations légales (article R414-13)",
        content:
          "L'article R414-13 du Code de la route fixe les conditions de la marche arrière. Ces obligations s'appliquent même sur une distance de quelques mètres :",
        rules: [
          "Ne vous engager en marche arrière que si vous avez la certitude absolue que la voie est libre sur toute la distance que vous allez parcourir.",
          "Désigner un guide si votre visibilité arrière est insuffisante : un passager ou un tiers qui se positionne derrière le véhicule et guide la manœuvre par gestes.",
          "La marche arrière est toujours une manœuvre : vous devez céder le passage à tous les véhicules qui circulent normalement. Vous n'avez aucune priorité.",
          "Les feux de recul (feux blancs à l'arrière) s'allument automatiquement lorsque vous passez la marche arrière. Vérifiez leur fonctionnement lors de la vérification extérieure du véhicule.",
          "Vitesse maximale recommandée : au pas (5 à 10 km/h). Aucune valeur légale n'est fixée, mais toute vitesse excessive engage votre responsabilité civile et pénale en cas d'accident.",
          "En cas d'accident lors d'une marche arrière : responsabilité à 100 % pour le recul. Si le véhicule était à l'arrêt avec clignotant allumé en attente, le partage peut passer à 50/50.",
        ],
        highlight: "Marche arrière = responsabilité à 100 % en cas d'accident — voie libre sur toute la distance",
      },
      {
        type: "rule",
        title: "Zones où la marche arrière est formellement interdite",
        content:
          "Certains endroits sont formellement interdits par le Code de la route pour effectuer une marche arrière. Les sanctions sont lourdes :",
        rules: [
          "Autoroute et voie express (article R421-6) : interdiction absolue de faire marche arrière, même si vous avez raté votre sortie, même sur la bande d'arrêt d'urgence ou l'accotement. Continuez jusqu'à la prochaine sortie. Sanction : 135 € d'amende et 4 points retirés. Peine complémentaire : suspension du permis jusqu'à 3 ans.",
          "Bretelles d'entrée et de sortie d'autoroute : la même interdiction s'applique. Si vous vous êtes engagé par erreur sur une bretelle de sortie, continuez jusqu'au bout.",
          "Passages à niveau : ne jamais s'engager ou faire marche arrière sur un passage à niveau. Le risque est mortel.",
          "En sommet de côte et dans les virages : la visibilité est réduite et vous seriez invisible pour les autres véhicules arrivant en sens inverse.",
          "En sens interdit en marche arrière (article R412-28) : rouler en marche arrière dans un sens interdit est une infraction. Sanction : 135 € et suspension possible jusqu'à 3 ans.",
          "En zone de péage : la marche arrière est interdite même face à une borne défaillante. Sanction identique : 135 € et 4 points.",
        ],
        highlight: "Marche arrière sur autoroute : 135 € et 4 points + suspension jusqu'à 3 ans",
      },
      {
        type: "rule",
        title: "Le demi-tour — règles légales et procédure (article R412-19)",
        content:
          "Le demi-tour est autorisé sous conditions. Il est interdit s'il nécessite de franchir une ligne blanche continue (article R412-19). Il est également interdit aux mêmes endroits que la marche arrière (virages, sommets de côte, autoroutes).",
        rules: [
          "Avant d'engager un demi-tour, évaluez la largeur de la chaussée. Si elle permet un demi-tour en un seul arc (braquage complet), c'est idéal. Sinon, prévoyez une manœuvre en plusieurs fois avec marche arrière.",
          "Vérifiez dans les deux sens que la route est dégagée sur une distance suffisante pour effectuer la manœuvre sans hâte. À 80 km/h, un véhicule parcourt 22 m par seconde.",
          "Activez le clignotant à gauche avant de vous déporter pour amorcer le demi-tour. Maintenez-le pendant toute la manœuvre.",
          "Effectuez la manœuvre lentement et avec précision. Pas de précipitation. Un demi-tour se fait au pas (5 km/h maximum).",
          "Après le demi-tour, repartez normalement en vous insérant dans la circulation dans votre nouveau sens de marche avec le clignotant approprié.",
          "Cas particulier en montagne (article R414-3) : sur route de montagne, le véhicule descendant s'arrête en premier si le croisement est difficile. En cas d'impossibilité de croiser, le véhicule le plus léger fait marche arrière.",
        ],
        highlight: "Clignotant gauche + vérifier dans les deux sens + jamais sur ligne continue",
      },
      {
        type: "tip",
        title: "Technique pour la marche arrière en ligne droite",
        content:
          "Pour reculer droit, voici la technique recommandée par les moniteurs de conduite. Elle fonctionne pour tous les gabarits de voitures :",
        rules: [
          "Regardez par-dessus votre épaule droite (en tournant la tête physiquement, pas uniquement les yeux) pour surveiller la trajectoire arrière droite. C'est votre référence principale.",
          "Utilisez simultanément le rétroviseur intérieur pour le centre et les rétroviseurs extérieurs pour les côtés. Alternez le regard entre l'épaule et les rétroviseurs toutes les 2 secondes.",
          "Ne regardez pas uniquement par la lunette arrière : les angles morts bas sont dangereux (enfants, animaux, deux-roues). La lunette ne couvre pas le sol proche de l'arrière du véhicule.",
          "Pour corriger la trajectoire : si l'arrière part à droite, tournez le volant à droite pour ramener l'arrière vers la gauche. C'est contre-intuitif au début — entraînez-vous sur un parking vide.",
          "Réglez les rétroviseurs extérieurs légèrement vers le bas avant la manœuvre si nécessaire pour voir le sol et le bord du trottoir.",
          "Le moniteur conseille : utilisez des repères fixes au sol (lignes de parking, bordures) comme guides visuels. Un repère dans le rétroviseur vaut mieux qu'une estimation.",
        ],
        highlight: "Regarder par-dessus l'épaule + rétroviseurs alternés toutes les 2 secondes",
      },
      {
        type: "example",
        title: "Scénario type à l'examen : marche arrière demandée par l'inspecteur",
        content:
          "L'inspecteur vous demande d'effectuer une marche arrière en ligne droite sur une dizaine de mètres. Voici la procédure attendue :",
        rules: [
          "Avant de commencer : vérifiez par-dessus l'épaule droite et par les rétroviseurs que la voie est libre sur toute la distance. Regardez également les côtés.",
          "Passez en marche arrière, pied au frein. Regardez à nouveau par-dessus l'épaule.",
          "Relâchez le frein très doucement. La voiture recule au ralenti sans accélération.",
          "Alternez le regard : épaule droite, rétroviseur intérieur, rétroviseur gauche, rétroviseur droit. Cycle de 2 secondes.",
          "Correction de trajectoire si nécessaire : volant dans le sens où l'arrière doit aller.",
          "Erreur fréquente à l'examen : ne regarder que dans le rétroviseur intérieur sans jamais tourner la tête. L'inspecteur sanctionne l'absence de contrôle direct par-dessus l'épaule.",
        ],
        highlight: "Examen : contrôle par-dessus l'épaule obligatoire — rétroviseur seul insuffisant",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "Marche arrière et demi-tour sont des manœuvres à faible allure mais à risque élevé. Responsabilité à 100 % en cas d'accident en marche arrière. Méthode et vigilance sont les maîtres mots.",
        rules: [
          "Marche arrière : voie libre sur toute la distance, céder le passage, feux de recul allumés automatiquement.",
          "Jamais de marche arrière sur autoroute (135 €, 4 pts, suspension 3 ans), voie express ou passage à niveau.",
          "Demi-tour : clignotant gauche, vérifier dans les deux sens, au pas, jamais sur ligne continue.",
          "Guide obligatoire si la visibilité arrière est insuffisante (article R414-13).",
          "Technique : regarder par-dessus l'épaule + alterner avec les rétroviseurs. Correction du volant vers où doit aller l'arrière.",
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
    subtitle: "Zones bleues, interdictions, distances réglementaires et techniques de créneau et bataille",
    icon: "🅿️",
    readingTime: "9 min",
    sections: [
      {
        type: "intro",
        title: "Se garer, une compétence à part entière",
        content:
          "Le stationnement est l'un des sujets les plus riches du Code de la route : il touche à la sécurité des autres usagers, au respect des riverains et à la réglementation locale. À l'examen pratique du permis B, l'inspecteur vous demande au minimum 2 manœuvres dont au moins une de stationnement (créneau, bataille ou épi). Se garer incorrectement peut générer des amendes allant de 35 € à 375 € selon la gravité, et jusqu'à 3 points retirés pour stationnement dangereux. Nous allons voir toutes les règles essentielles, les zones interdites, les distances à respecter et les techniques pratiques.",
      },
      {
        type: "rule",
        title: "Les zones de stationnement interdit — articles R417-9 et R417-10",
        content:
          "Le Code de la route distingue le stationnement dangereux (R417-9) et le stationnement gênant (R417-10). Ces interdictions existent pour maintenir la fluidité du trafic et la sécurité de tous :",
        rules: [
          "À moins de 5 mètres d'un carrefour, d'une intersection ou d'un croisement : votre véhicule masquerait la visibilité des conducteurs qui s'engagent. Infraction R417-10 : 35 € (gênant).",
          "À moins de 5 mètres avant un passage piéton (article R417-10) : les piétons qui traversent doivent être visibles des conducteurs qui approchent.",
          "Devant un accès pompiers, une sortie de véhicules, une rampe d'accès PMR : stationnement très gênant (R417-11) — amende 135 €, majorée à 375 €. Mise en fourrière possible.",
          "Sur les voies de tramway, les passages à niveau, les voies réservées aux bus (stationnement gênant R417-10 : 35 €).",
          "Sur les trottoirs (sauf autorisation locale explicite signalée par panneau), les pistes cyclables, les refuges pour piétons.",
          "En double file : toléré très brièvement uniquement si le conducteur reste présent et peut manœuvrer immédiatement à la demande.",
          "Stationnement dangereux (R417-9) : à proximité des intersections avec visibilité insuffisante, des virages, des sommets de côte. Amende 135 € et 3 points retirés.",
        ],
        highlight: "Stationnement dangereux : 135 € et 3 points — stationnement gênant : 35 €, aucun point",
      },
      {
        type: "rule",
        title: "Zones bleues et stationnement réglementé",
        content:
          "Les zones bleues sont signalées par un panneau B6a2 (panneau carré bleu avec disque blanc) et parfois un marquage au sol (ligne jaune tiretée). Les règles y sont strictes et contrôlées régulièrement :",
        rules: [
          "Le disque de stationnement (disque bleu) est obligatoire et doit être affiché derrière le pare-brise côté conducteur, visible de l'extérieur.",
          "Indiquez l'heure d'arrivée sur le disque en l'arrondissant aux 30 minutes supérieures. Exemple : arrivée à 14h10 → affichez 14h30. Arrivée à 14h30 → affichez 15h00.",
          "La durée maximale autorisée est précisée sur le panneau local (généralement 1h30). Ne la dépassez pas même de quelques minutes.",
          "Stationnement payant (horodateur) : achetez un ticket pour la durée souhaitée et affichez-le derrière le pare-brise côté conducteur. La durée commence à courir dès la validation du ticket.",
          "Amende pour non-respect de zone bleue ou d'horodateur : contravention de 2e classe, 35 € forfaitaire (17 € si payée dans les 15 jours, 75 € si majorée). Aucun point retiré.",
          "Bon à savoir : même si vous dépassez la durée de plusieurs heures ou jours, l'amende ne peut être dressée qu'une seule fois pour la même infraction. Payez la première et contestez les suivantes.",
        ],
        highlight: "Disque bleu : heure arrondie aux 30 min supérieures — 35 € d'amende, aucun point",
      },
      {
        type: "rule",
        title: "Distances réglementaires et règles complémentaires",
        content:
          "En dehors des interdictions formelles, certaines distances et règles spécifiques doivent être respectées pour ne pas bloquer la circulation ou masquer la signalisation :",
        rules: [
          "Au moins 10 mètres de part et d'autre d'un arrêt de bus ou de tramway signalisé : pour que les bus puissent manœuvrer et que les usagers puissent monter et descendre en sécurité.",
          "Au moins 5 mètres d'un panneau de signalisation ou d'un feu tricolore : pour ne pas masquer la signalisation aux autres usagers.",
          "50 cm minimum du bord du trottoir : un espace insuffisant gêne les piétons et peut endommager le trottoir. C'est aussi un critère noté à l'examen du permis.",
          "En côte, bloquez le véhicule mécaniquement en plus du frein à main : en montée, braquage vers le trottoir (si les roues bloquent contre le trottoir, le véhicule ne peut pas descendre). En descente, braquage vers la chaussée (les roues butent contre le trottoir).",
          "De nuit, en dehors des agglomérations, tout véhicule stationné doit être visible (éclairé ou équipé de réflecteurs réglementaires). Sinon : risque de collision arrière pour les autres conducteurs.",
          "Sens de stationnement : l'article R417-1 interdit le stationnement en contresens. Stationnez toujours dans le sens de la circulation, y compris en bataille.",
        ],
        highlight: "10 m d'un arrêt de bus — en côte : roues vers le trottoir (montée), vers la chaussée (descente)",
      },
      {
        type: "tip",
        title: "Technique du créneau — stationnement longitudinal",
        content:
          "Le créneau est la manœuvre la plus redoutée à l'examen du permis. Avec la bonne méthode, elle s'apprend en 2 à 3 heures d'entraînement. L'espace minimum requis est 1,5 fois la longueur de votre véhicule (environ 7 à 8 m pour une berline standard de 4,5 m).",
        rules: [
          "1. Repérez l'espace et signalez votre intention avec le clignotant du côté du stationnement. Vous n'êtes jamais prioritaire pendant la manœuvre.",
          "2. Arrêtez-vous en parallèle du véhicule de devant, roues à la même hauteur, à environ 50-80 cm de lui.",
          "3. Passez en marche arrière. Regardez par-dessus l'épaule droite. Braquage à fond à droite. Reculez jusqu'à ce que l'arrière du véhicule de devant soit au milieu de votre vitre arrière latérale droite — premier repère clé.",
          "4. Braquage à fond à gauche : l'arrière s'insère dans la place pendant que l'avant pivote. Surveillez le coin avant gauche pour ne pas percuter le véhicule de devant.",
          "5. Redressez le volant progressivement pour vous aligner parallèlement au trottoir.",
          "6. Avancez légèrement pour vous centrer dans la place. Distance trottoir : 30 à 50 cm. Serrez le frein à main.",
          "Erreur fréquente à l'examen : commencer à braquer trop tôt ou trop tard. Attendez le repère visuel (arrière du véhicule de devant au milieu de la vitre) avant de braquer.",
        ],
        highlight: "Espace minimum créneau : 1,5 fois la longueur — repère : arrière du véhicule devant au milieu de la vitre",
      },
      {
        type: "tip",
        title: "Technique du stationnement en bataille — 90° par rapport à la chaussée",
        content:
          "Le stationnement en bataille positionne le véhicule à 90° de la chaussée. Il peut s'effectuer en marche avant ou en marche arrière. Les moniteurs recommandent la marche arrière : meilleure visibilité à la sortie de la place.",
        rules: [
          "En marche arrière (méthode recommandée) : dépassez la place choisie, arrêtez-vous à la hauteur du 3e véhicule garé qui suit, à environ 1,50 m de distance des véhicules garés.",
          "Signalez votre intention avec le clignotant correspondant au côté de la place.",
          "Passez en marche arrière. Le repère clé : le phare arrière du véhicule voisin doit apparaître dans votre rétroviseur extérieur au moment de commencer à braquer.",
          "Braquez à fond vers la place et reculez lentement. Alternez les rétroviseurs pour surveiller les deux véhicules voisins.",
          "Redressez le volant progressivement pour rentrer droit dans la place. Arrêtez-vous à au moins 30 cm du fond de la place.",
          "Vérifiez avant de sortir du véhicule que vous ne dépassez pas les marquages au sol des deux côtés.",
          "Erreur fréquente : réaliser la manœuvre en marche avant uniquement. En sortie de place, la visibilité est très réduite sur les côtés, ce qui est dangereux dans un parking animé.",
        ],
        highlight: "Bataille en marche arrière : meilleure visibilité à la sortie — repère : phare voisin dans le rétroviseur",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "Bien se garer, c'est respecter les autres et la loi. Un stationnement gênant peut bloquer les secours et coûter jusqu'à 375 €. À l'examen, au moins une manœuvre de stationnement est obligatoire.",
        rules: [
          "Stationnement dangereux (R417-9) : 135 € et 3 points. Gênant (R417-10) : 35 €, aucun point. Très gênant (R417-11) : 135 € à 375 €.",
          "Interdit : à moins de 5 m d'un carrefour ou d'un passage piétons, devant une sortie de secours, en double file durable.",
          "Zone bleue : disque obligatoire, heure arrondie aux 30 min supérieures, 35 €, aucun point.",
          "10 m minimum d'un arrêt de bus de chaque côté. 50 cm du trottoir minimum.",
          "Créneau : 1,5× la longueur du véhicule, repère visuel au milieu de la vitre arrière. Bataille : marche arrière recommandée, repère phare voisin dans le rétroviseur.",
          "En côte : roues vers le trottoir (montée) ou vers la chaussée (descente) pour bloquer mécaniquement le véhicule.",
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
    readingTime: "8 min",
    sections: [
      {
        type: "intro",
        title: "La vitesse, première cause d'accidents mortels",
        content:
          "La vitesse est impliquée dans environ un tiers des accidents mortels en France. Comprendre les limites légales ne suffit pas : il faut aussi saisir pourquoi elles existent et les adapter aux conditions réelles. Les vitesses maximales autorisées sont fixées par les articles R413-1 et suivants du Code de la route. Depuis le 1er juillet 2018, la grande nouveauté est l'abaissement à 80 km/h sur les routes bidirectionnelles sans séparateur central (Décret n° 2018-487 du 15 juin 2018). De nombreux candidats au permis confondent encore avec l'ancienne limite de 90 km/h : attention, celle-ci ne s'applique plus sur ces routes, sauf dans les rares départements qui ont obtenu une dérogation officielle. Moyen mémo : retenez « 50 — 80 — 110 — 130 » dans l'ordre croissant d'urbanisation : ville, route, voie rapide, autoroute.",
      },
      {
        type: "rule",
        title: "Les limites de vitesse par type de voie (temps sec, permis confirmé)",
        content:
          "Tableau complet des vitesses maximales pour un conducteur titulaire du permis depuis plus de 2 ans, par temps sec (article R413-2 du Code de la route) :",
        rules: [
          "Zone de rencontre : 20 km/h. Les piétons sont prioritaires sur toute la chaussée et peuvent la traverser n'importe où. Exemple : une zone piétonne semi-partagée avec des potelets colorés.",
          "Zone 30 : 30 km/h. Panneaux B30 à l'entrée et B51 à la sortie. Fréquente aux abords des écoles, parcs et centres-villes rénovés.",
          "Agglomération : 50 km/h. Signalé par les panneaux d'entrée d'agglomération (EB10). Applicable dès le panneau de nom de commune.",
          "Hors agglomération, route bidirectionnelle sans séparateur central : 80 km/h depuis le 1er juillet 2018. C'est la limite la plus souvent oubliée ou confondue avec 90 km/h. Elle couvre les routes de campagne classiques.",
          "Route à 3 voies (2 voies dans un sens, 1 dans l'autre) : 90 km/h sur les 2 voies, 80 km/h sur la voie unique en sens inverse.",
          "Hors agglomération, route à deux chaussées séparées par un terre-plein central (2x2 voies hors autoroute) : 110 km/h.",
          "Route express ou voie rapide avec séparateur central : 110 km/h.",
          "Autoroute : 130 km/h. Reconnaissable aux panneaux fond vert et aux péages.",
        ],
        highlight: "Moyen mémo : 20 — 30 — 50 — 80 — 110 — 130",
      },
      {
        type: "example",
        title: "Scénario concret : identifier sa limite sur la route",
        content:
          "Exercice mental : vous quittez un village (panneau de sortie d'agglomération), vous entrez sur une route départementale à double sens sans terre-plein central, sans panneau de limitation spécifique. Quelle est votre vitesse maximale autorisée ?",
        rules: [
          "Réponse : 80 km/h. La sortie du panneau d'agglomération suffit à passer de 50 à 80 km/h sur route bidirectionnelle.",
          "Si cette même route avait eu un séparateur béton ou un terre-plein central, la limite serait passée à 110 km/h.",
          "Si un panneau B14 (rond rouge avec un chiffre) s'affiche, il remplace la limite générale par la valeur indiquée, quelle qu'elle soit.",
          "La fin de limitation est signalée par un panneau B31 (cercle blanc barré) ou implicitement par un panneau d'entrée d'agglomération.",
          "Erreur fréquente à l'examen : maintenir 90 km/h en pensant à l'ancienne règle. Depuis 2018, c'est 80 km/h — toujours vérifier.",
        ],
        highlight: "Dès la sortie d'agglomération sur route classique : 80 km/h",
      },
      {
        type: "rule",
        title: "Vitesses pour les conducteurs novices (permis probatoire)",
        content:
          "Durant la période probatoire (3 ans pour un permis classique, 2 ans pour l'AAC/conduite accompagnée), les limites sont abaissées sur les voies rapides :",
        rules: [
          "Autoroute : 110 km/h au lieu de 130 km/h pour les conducteurs confirmés.",
          "Routes à deux chaussées séparées / voie express : 100 km/h au lieu de 110 km/h.",
          "Routes hors agglomération à double sens : 80 km/h — identique aux conducteurs confirmés.",
          "En agglomération : 50 km/h — identique aux conducteurs confirmés.",
          "Taux d'alcoolémie maximal pour les novices : 0,2 g/L de sang (contre 0,5 g/L pour les confirmés). Tolérance quasi nulle.",
          "Astuce : en permis probatoire, retenez que vous avez « 20 km/h de moins sur les voies rapides ». Sur autoroute 130 → 110, sur route express 110 → 100.",
        ],
        highlight: "Novice : autoroute 110 km/h, voie express 100 km/h",
      },
      {
        type: "rule",
        title: "Vitesses par temps de pluie et conditions dégradées",
        content:
          "Par mauvais temps, la distance de freinage augmente de 30 à 50 %. La loi impose des réductions automatiques de vitesse indépendamment de tout panneau :",
        rules: [
          "Autoroute sous pluie ou précipitations : 110 km/h (au lieu de 130 km/h). Réduction obligatoire dès les premières gouttes.",
          "Route express / 2x2 voies sous pluie : 100 km/h (au lieu de 110 km/h).",
          "Routes hors agglomération bidirectionnelles sous pluie : 80 km/h — déjà la limite standard, pas de changement.",
          "Visibilité inférieure à 50 m (brouillard dense, neige, tempête) : 50 km/h sur TOUTES les voies, autoroute incluse. C'est la règle la plus méconnue : même sur autoroute à 130, vous devez passer à 50.",
          "Neige et verglas : aucune limite légale spécifique en dessous de 50 km/h, mais une vitesse non adaptée engage votre responsabilité pénale en cas d'accident. La règle : si vous ne maîtrisez pas votre trajectoire, vous roulez trop vite.",
          "Conducteurs novices sous pluie : 110 km/h sur autoroute et 100 km/h sur route express restent leurs limites maximales, même par temps sec. En pluie, les réductions générales s'appliquent en plus.",
        ],
        highlight: "Visibilité < 50 m : 50 km/h partout sans exception",
      },
      {
        type: "warning",
        title: "Sanctions pour excès de vitesse — barème progressif",
        content:
          "Les sanctions sont progressives selon l'écart constaté (articles L413-1 et R413-14 du Code de la route). Voici le barème exact :",
        rules: [
          "Dépassement < 20 km/h hors agglomération : amende forfaitaire 68 € (minorée 45 €), 1 point retiré.",
          "Dépassement < 20 km/h en agglomération : amende forfaitaire 135 €, 1 point retiré.",
          "Dépassement de 20 à 29 km/h : amende forfaitaire 135 € (minorée 90 €, majorée 375 €), 2 points retirés.",
          "Dépassement de 30 à 39 km/h : amende forfaitaire 135 € (majorée 375 €), 3 points retirés.",
          "Dépassement de 40 à 49 km/h : amende forfaitaire 135 € (majorée 375 €), 4 points retirés. Suspension de permis possible.",
          "Dépassement de 50 km/h et plus : amende jusqu'à 1 500 € (3 000 € en récidive dans l'année), 6 points retirés, suspension jusqu'à 3 ans, rétention immédiate du permis. En récidive : annulation judiciaire du permis.",
          "Rappel important : pour les conducteurs novices (12 points maxi en début de permis), 6 points retirés en une seule infraction signifie la perte immédiate du permis et l'obligation de repasser l'examen complet.",
        ],
        highlight: "+50 km/h : 1 500 €, 6 points, suspension 3 ans",
      },
      {
        type: "tip",
        title: "Moyen mémo pour retenir les vitesses",
        content:
          "Pour ne plus jamais confondre les limites de vitesse, voici la règle des 4 chiffres croissants à mémoriser une fois pour toutes :",
        rules: [
          "La séquence : 50 — 80 — 110 — 130. En ville, route, voie rapide, autoroute.",
          "Pour les novices : on enlève 20 km/h sur les 2 dernières valeurs → 50 — 80 — 100 — 110.",
          "Par pluie : on enlève 20 km/h sur autoroute et route express → 50 — 80 — 100 — 110.",
          "Par visibilité < 50 m : tout passe à 50 km/h, sans exception.",
          "Le 80 km/h est la limite la plus récente (2018) et la plus souvent testée à l'examen théorique. Ne jamais écrire ou dire 90 km/h hors agglo sur route classique.",
        ],
        highlight: "50 — 80 — 110 — 130 : la séquence à retenir",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "Les limites de vitesse sont un plafond légal, pas un objectif à atteindre. Adaptez toujours votre allure aux conditions réelles — route mouillée, visibilité réduite, trafic, fatigue.",
        rules: [
          "Zone de rencontre : 20 km/h. Zone 30 : 30 km/h. Agglomération : 50 km/h.",
          "Hors agglo route bidirectionnelle sans séparateur : 80 km/h depuis le 1er juillet 2018.",
          "2x2 voies / route express : 110 km/h. Autoroute : 130 km/h.",
          "Novices : 100 km/h sur voie express, 110 km/h sur autoroute.",
          "Visibilité < 50 m : 50 km/h sur toutes les voies sans exception.",
          "Amende max excès +50 km/h : 1 500 € et 6 points retirés.",
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
    readingTime: "9 min",
    sections: [
      {
        type: "intro",
        title: "Les intersections, zone de tous les dangers",
        content:
          "Les intersections concentrent environ 30 % des accidents de la route en France. Comprendre et appliquer correctement les règles de priorité est donc absolument fondamental. La règle de base — la priorité à droite — est souvent mal comprise : elle ne s'applique pas partout et est très fréquemment modifiée par la signalisation. Avant chaque intersection, posez-vous cette question en deux temps : 1) Y a-t-il un panneau ? 2) Sinon, qui est à ma droite ? Ce réflexe en deux étapes suffit à éviter la majorité des erreurs. Résultat à l'examen : un non-respect de priorité entraîne une faute grave éliminatoire.",
      },
      {
        type: "rule",
        title: "La priorité à droite — règle de base (article R415-5)",
        content:
          "En l'absence de toute signalisation, la règle de priorité à droite s'applique. Cette règle s'avère souvent contre-intuitive car elle ignore la taille ou l'importance apparente des voies :",
        rules: [
          "Tout véhicule arrivant de votre droite a priorité sur vous à l'intersection, quelle que soit la largeur respective des rues.",
          "Exemple concret : vous roulez sur un boulevard à 4 voies. Une petite ruelle débouche sur votre droite sans aucun panneau. Le conducteur de la ruelle EST prioritaire sur vous.",
          "Cette règle s'applique aux intersections en X, en T, en Y — dès lors qu'aucun panneau ne dit autre chose.",
          "Elle s'applique aussi la nuit et par mauvais temps : la visibilité réduite ne supprime pas la priorité à droite.",
          "Exception clé : un chemin de terre ou une allée privée ne bénéficie pas de la priorité à droite. Sur votre gauche comme votre droite, si un conducteur arrive depuis un chemin non revêtu, c'est vous qui avez la priorité.",
          "Sanction pour refus de priorité à droite : 135 € d'amende et 4 points retirés (contravention de 4e classe, article R415-5).",
        ],
        highlight: "Priorité à droite : 135 € et 4 points si non-respect",
      },
      {
        type: "rule",
        title: "Les panneaux de priorité — les 5 à connaître absolument",
        content:
          "Les panneaux de priorité modifient ou confirment la règle de base. Ils se lisent à l'approche de l'intersection. Voici les 5 incontournables :",
        rules: [
          "Panneau AB6 — Cédez-le-passage (triangle inversé rouge et blanc) : vous devez laisser passer tous les véhicules circulant sur la voie que vous croisez. L'arrêt n'est pas obligatoire si la voie est libre, mais vous devez être prêt à vous arrêter. Valable pour une seule intersection.",
          "Panneau AB1 — Stop (octogone rouge) : arrêt complet OBLIGATOIRE avant la ligne d'arrêt peinte au sol, même si aucun véhicule n'est visible. Les roues doivent être immobiles. Puis céder le passage. Sanction sans arrêt : 135 € et 4 points.",
          "Panneau AB4 — Passage protégé (losange jaune plein) : vous êtes sur une voie prioritaire à cette intersection précise. Vous avez la priorité sur tous les véhicules venant des voies secondaires.",
          "Panneau AB3 — Route prioritaire (losange jaune avec bande blanche) : vous êtes sur une voie prioritaire sur toute sa longueur, jusqu'au panneau de fin (AB7 = losange barré). Vous avez la priorité à chaque intersection sans avoir à chercher le panneau à chaque fois.",
          "Croix de Saint-André (AB2) : signalise un passage à niveau. Priorité absolue au train. S'arrêter si les barrières sont fermées ou si un train approche. Ne jamais s'engager si vous ne pouvez pas traverser complètement.",
          "Panneau AB7 — Fin de priorité (losange barré) : vous repassez sous la règle générale de priorité à droite. Ne relâchez pas l'attention.",
        ],
        highlight: "Stop sans arrêt complet : 135 € et 4 points",
      },
      {
        type: "example",
        title: "Scénario type à l'examen : lire une intersection inconnue",
        content:
          "Vous approchez d'une intersection que vous n'avez jamais vue. Voici la méthode pas à pas que tout moniteur enseigne :",
        rules: [
          "Étape 1 — Regarder loin : repérez les panneaux 50 à 100 m avant l'intersection. Un losange jaune = vous êtes prioritaire. Un triangle inversé ou un Stop = vous cédez.",
          "Étape 2 — Regarder les marquages au sol : une ligne continue transversale = Stop. Une ligne tiretée transversale ou un triangle pointé vers vous = Cédez-le-passage.",
          "Étape 3 — Si aucun panneau, aucun marquage : priorité à droite. Réduisez la vitesse, regardez à droite avant de vous engager.",
          "Étape 4 — Même si vous êtes prioritaire : assurez-vous que l'autre conducteur a bien vu votre priorité avant de vous engager. La priorité n'empêche pas un accident si l'autre grille le Stop.",
          "Erreur fréquente à l'examen : s'engager sur un Stop sans arrêt complet parce que la voie semble libre. C'est éliminatoire.",
          "Erreur fréquente 2 : sur une route prioritaire (AB3), croire que la priorité s'arrête après un feu ou un carrefour complexe. La route prioritaire continue jusqu'au panneau AB7.",
        ],
        highlight: "Méthode : panneaux → marquages → priorité à droite",
      },
      {
        type: "rule",
        title: "Priorités absolues — les usagers qui priment sur tout",
        content:
          "Certains usagers bénéficient d'une priorité absolue, indépendamment de tout panneau ou règle :",
        rules: [
          "Véhicules d'urgence avec gyrophare et sirène (pompiers, SAMU, police, gendarmerie) : dégagez immédiatement, serrez à droite ou arrêtez-vous. Même s'ils grillent un feu rouge, vous devez leur céder le passage. Obstruction : 135 €.",
          "Piétons engagés sur un passage piéton (article R415-11) : arrêt absolu obligatoire. Vous devez attendre que le piéton ait terminé de traverser, même si cela prend du temps. Sanction : 135 € et 6 points.",
          "Piétons manifestant l'intention de traverser (se positionnent sur le trottoir au bord du passage) : vous devez déjà vous arrêter si leur intention est claire, même avant qu'ils aient posé le pied sur la chaussée.",
          "Tramways en marche : ne jamais s'engager sur les rails sans être certain de pouvoir les dégager entièrement. Le tramway ne peut pas dévier.",
          "Agents de la circulation (policiers en faction) : leurs gestes priment sur les feux, les panneaux, et toutes les règles. Un policier bras horizontal = stop. Bras levé = stop côté face. Bras baissé de face = passage autorisé.",
        ],
        highlight: "Piéton sur passage piéton : 135 € et 6 points",
      },
      {
        type: "warning",
        title: "Les pièges classiques aux intersections — erreurs éliminatoires",
        content:
          "Ces erreurs reviennent systématiquement lors de l'examen pratique. Entraînez-vous à les éviter en simulation avant le jour J :",
        rules: [
          "Stop sans arrêt complet : les roues doivent être à zéro. Un ralentissement, même lent, n'est pas un arrêt. L'inspecteur le voit immédiatement. Résultat : faute grave éliminatoire.",
          "Priorité à droite oubliée en ville : le conducteur sur le boulevard croit avoir la priorité sur la petite rue. Sans panneau, c'est la petite rue qui a la priorité si elle est à droite.",
          "Cédez-le-passage mal anticipé : ne pas regarder assez loin pour s'arrêter en douceur. Si vous freinez fort au dernier moment, c'est que vous avez attendu trop longtemps.",
          "Confusion AB4 / AB3 : le losange simple (AB4) ne vaut que pour une intersection. Le losange avec bande blanche (AB3) vaut pour toute la route. Vérifiez quel panneau vous avez vu.",
          "Sous-estimer le danger même en étant prioritaire : votre priorité ne vous protège pas si l'autre conducteur ne la respecte pas. Regardez toujours.",
        ],
        highlight: "Toute erreur de priorité à l'examen = faute grave éliminatoire",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "À chaque intersection, réflexe en 2 temps : panneau présent → le suivre. Pas de panneau → priorité à droite. Et toujours vérifier que l'autre conducteur vous cède bien le passage avant de vous engager.",
        rules: [
          "Sans signalisation : priorité à droite. Chemin de terre à droite : vous êtes prioritaire.",
          "Cédez-le-passage (AB6) : ralentir, s'arrêter si nécessaire, céder à tous.",
          "Stop (AB1) : arrêt complet obligatoire même voie libre. 135 € et 4 points.",
          "Losange jaune (AB4/AB3) : vous êtes prioritaire sur tous les véhicules secondaires.",
          "Piétons sur passage piéton : arrêt obligatoire. 135 € et 6 points.",
          "Priorité à droite non-respect : 135 € et 4 points.",
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
    readingTime: "9 min",
    sections: [
      {
        type: "intro",
        title: "Lire la route comme un livre",
        content:
          "La signalisation routière est un langage structuré en trois familles qui se complètent : la signalisation verticale (panneaux), la signalisation horizontale (marquage au sol) et la signalisation lumineuse (feux). Un conducteur expérimenté les lit dans cet ordre : d'abord les panneaux à l'approche, puis les feux au niveau de l'intersection, puis le marquage au sol pour confirmer. Cette lecture en couches permet d'anticiper sans être surpris. À l'examen, la méconnaissance des feux ou des marquages est l'une des sources les plus fréquentes de fautes rédhibitoires.",
      },
      {
        type: "rule",
        title: "Les feux tricolores et leurs variantes (article R412-30)",
        content:
          "Chaque signal lumineux impose un comportement précis. Attention : plusieurs variantes existent au-delà du simple rouge-orange-vert :",
        rules: [
          "Feu rouge fixe : arrêt obligatoire avant la ligne d'arrêt blanche au sol. Passer un feu rouge : 135 € et 4 points retirés. En cas d'accident, responsabilité pénale engagée.",
          "Feu orange fixe : vous devez vous arrêter. Exception : si vous êtes déjà trop engagé et qu'un arrêt créerait un danger (freinage brutal, risque de collision arrière), vous pouvez continuer. Ce n'est PAS un signal d'accélération.",
          "Feu vert fixe : vous pouvez passer. Mais vous cédez le passage aux piétons qui traversent légalement et aux véhicules déjà engagés dans l'intersection avant vous.",
          "Feu rouge clignotant : présent aux passages à niveau et certains passages piétons scolaires. Arrêt absolu, sans exception possible. Ne jamais s'engager tant que le clignotant est actif.",
          "Feu orange clignotant : régime de nuit ou hors service. Appliquez la priorité à droite et ralentissez systématiquement.",
          "Flèche verte clignotante : vous pouvez tourner dans la direction indiquée même si le feu circulaire est rouge. MAIS vous devez impérativement céder le passage aux piétons traversant dans cette direction — ils restent prioritaires absolus.",
          "Feux pour voies réversibles (lentille en croix ou flèche verte) : croix rouge = voie interdite dans votre sens. Flèche verte = voie autorisée. En cas de doute, quittez immédiatement la voie signalée en croix rouge.",
        ],
        highlight: "Feu rouge grillé : 135 € et 4 points",
      },
      {
        type: "example",
        title: "Scénario : que faire face à un feu orange ?",
        content:
          "Vous approchez d'un carrefour à 50 km/h. Le feu passe à l'orange alors que vous êtes à 30 mètres. Quelle est la bonne décision ?",
        rules: [
          "À 30 m, à 50 km/h, vous avez environ 2 secondes avant le feu. Votre distance de freinage est d'environ 20 à 25 m. Vous POUVEZ vous arrêter sans risque. Réponse : freinez et arrêtez-vous.",
          "Si vous étiez à 5 m du carrefour et déjà en phase de passage, un freinage brutal risquerait une collision arrière. Dans ce cas précis : passez en accélérant légèrement mais sans excès.",
          "La règle est donc de toujours évaluer : est-ce que je peux m'arrêter sans danger ? Si oui, je m'arrête. Si non, je passe.",
          "Erreur fréquente : appuyer sur l'accélérateur dès que le feu passe à l'orange pour 'passer avant le rouge'. C'est une infraction si vous n'étiez pas déjà engagé.",
          "À retenir pour l'examen : l'inspecteur évalue votre anticipation. Freiner tôt et progressivement à l'orange montre une bonne lecture de la signalisation.",
        ],
        highlight: "Orange : s'arrêter si possible — passer si l'arrêt est dangereux",
      },
      {
        type: "rule",
        title: "Le marquage au sol — lignes longitudinales",
        content:
          "Les lignes tracées dans le sens de la circulation régissent les dépassements et les changements de voie. Leur lecture est fondamentale avant tout dépassement :",
        rules: [
          "Ligne blanche continue (axiale ou de rive) : interdiction absolue de la franchir ou de l'empiéter. Elle est tracée là où la visibilité est insuffisante ou la dangerosité trop élevée. Aucune exception. Franchissement : 135 € et 3 points.",
          "Ligne blanche tiretée (traits courts, espaces longs) : séparation de voies de même sens ou axiale en zone de dépassement autorisé. Franchissement autorisé avec prudence.",
          "Ligne axiale tiretée d'avertissement (traits longs, espaces courts) : annonce l'approche d'une ligne continue. Renoncez au dépassement dès que vous voyez ces traits longs.",
          "Double ligne (continue + tiretée côte à côte) : vous pouvez franchir du côté tireté seulement. Interdit depuis le côté continu.",
          "Ligne jaune continue au bord de la chaussée : interdiction de s'arrêter ou de stationner (abords de bus, zones de livraison, virages dangereux).",
          "Ligne jaune tiretée au bord : stationnement interdit mais arrêt bref autorisé (dépose passager, livraison courte).",
        ],
        highlight: "Ligne continue : franchissement interdit — 135 € et 3 points",
      },
      {
        type: "rule",
        title: "Le marquage au sol — lignes transversales et symboles",
        content:
          "Les lignes transversales et symboles précisent les obligations à des points précis de la chaussée. Ils doublent et confirment la signalisation verticale :",
        rules: [
          "Ligne d'arrêt (trait blanc continu transversal, épais) : s'immobiliser avant cette ligne au Stop ou au feu rouge. Votre avant-droit doit rester en deçà.",
          "Ligne de cédez-le-passage (tirets blancs transversaux larges ou triangle pointé vers vous) : ralentir, s'arrêter si nécessaire, céder le passage.",
          "Passages piétons (larges zébrures blanches) : zones de traversée prioritaires pour piétons. Arrêt obligatoire dès qu'un piéton manifeste l'intention de traverser.",
          "Flèches de sélection sur la chaussée : indiquent les directions autorisées depuis chaque voie. Vous devez être dans la bonne voie AVANT l'intersection, pas au dernier moment. Un changement de voie tardif est une faute grave.",
          "Losange jaune peint sur la chaussée : annonce une voie prioritaire, correspond au panneau AB4. Présence de ce losange = vous avez la priorité.",
          "Marquage STOP en lettres sur la chaussée : confirmation visuelle du panneau AB1. L'arrêt des roues reste obligatoire.",
        ],
        highlight: "Flèches de sélection : se positionner dans la bonne voie avant l'intersection",
      },
      {
        type: "rule",
        title: "Les catégories de panneaux verticaux",
        content:
          "Les panneaux sont classés en grandes familles reconnaissables à leur forme et couleur. Mémoriser ces familles permet de comprendre un panneau inconnu en 2 secondes :",
        rules: [
          "Panneaux de danger (triangles, fond blanc, bord rouge) : avertissent d'un danger. Ne sont pas des interdictions mais des alertes. Ex : A1a (virage à droite), A4 (chaussée glissante), A13b (passage piétons), A14 (travaux).",
          "Panneaux d'interdiction (ronds, fond blanc, bord rouge) : imposent des interdictions. Ex : B14 (limitation de vitesse), B1 (sens interdit), B3a (dépassement interdit).",
          "Panneaux d'obligation (ronds bleus, symbole blanc) : imposent une obligation de comportement. Ex : B21 (sens obligatoire), voie réservée aux piétons ou aux bus.",
          "Panneaux de prescription temporaire (fond jaune) : remplacent les panneaux permanents lors de travaux ou d'événements. Ils ont la même valeur légale. Une limitation jaune de 50 sur autoroute en travaux doit être respectée comme n'importe quelle limitation.",
          "Panneaux d'information et de direction (fonds bleu ou vert) : indications de direction, distance, services. Fond vert pour autoroute, fond bleu pour routes nationales et départementales.",
          "Panneau B31 (cercle barré) : fin de toutes les interdictions précédemment signalées — vitesse, dépassement, klaxon. Très présent en sortie de zone.",
        ],
        highlight: "Triangle rouge = danger | Rond rouge = interdiction | Rond bleu = obligation",
      },
      {
        type: "tip",
        title: "Moyen mémo pour les feux et lignes",
        content:
          "Pour retenir les règles des feux et des lignes, voici deux astuces pédagogiques utilisées en auto-école :",
        rules: [
          "Pour les feux, retenez la règle des 3 C : Continue (rouge = arrêt complet), Choisir (orange = évaluer si arrêt possible), Céder (vert = passer en cédant aux piétons).",
          "Pour les lignes : CONTINUE = CAPITULE. Une ligne continue, c'est l'interdiction de passer. Une ligne tiretée, vous êtes autorisé mais avec prudence.",
          "Pour les panneaux : Triangle = Tentation de danger (avertissement). Rond rouge = Règle restrictive. Rond bleu = Bonne conduite obligatoire.",
          "Pour les flèches de sélection au sol : pensez aux files d'un supermarché. On choisit sa file avant la caisse, pas au dernier moment. Sur la route, même principe : anticipez votre voie.",
        ],
        highlight: "Ligne continue = interdit de franchir. Tiretée = autorisé avec prudence.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "La signalisation se lit dans l'ordre : panneaux (à l'approche), feux (au niveau de l'intersection), marquage au sol (confirmation au dernier instant).",
        rules: [
          "Feux : rouge = stop (135 €, 4 points), orange = s'arrêter sauf si impossible, vert = passer en cédant aux piétons.",
          "Flèche verte clignotante : tourner autorisé même feu rouge, mais piétons restent prioritaires.",
          "Ligne continue : ne pas franchir (135 €, 3 points). Tiretée : franchissement autorisé.",
          "Triangle rouge = danger. Rond rouge = interdiction. Rond bleu = obligation.",
          "Flèches de sélection au sol : se positionner dans la bonne voie avant l'intersection.",
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
    subtitle: "Procédure PCSRD, interdictions légales, panneau B3a et situations dangereuses",
    icon: "⏩",
    readingTime: "9 min",
    sections: [
      {
        type: "intro",
        title: "Dépasser, une manœuvre qui engage votre responsabilité",
        content:
          "Le dépassement est l'une des manœuvres les plus dangereuses sur route. En France, environ 10 % des accidents mortels impliquent un dépassement. L'article R414-4 du Code de la route encadre strictement cette manœuvre : «  Avant de dépasser, tout conducteur doit s'assurer qu'il peut le faire sans danger. » Dépasser correctement, c'est appliquer une procédure en 5 étapes mémorisables grâce au sigle PCSRD : se Positionner, vérifier la Circulation, mettre le Signal, Regarder de nouveau, Dépasser. Un dépassement raté peut coûter des vies — la règle d'or est simple : en cas de doute, on renonce.",
      },
      {
        type: "rule",
        title: "La procédure de dépassement — méthode PCSRD",
        content:
          "Ne dépassez jamais de façon impulsive. Voici la procédure complète à appliquer systématiquement. Moyen mémo : PCSRD (Positionner, Circulation, Signal, Rétroviseur, Dépasser) :",
        rules: [
          "P — Positionner : évaluez la distance de visibilité libre devant ET derrière. Pour dépasser un véhicule ordinaire à 80 km/h, il faut au minimum 500 à 600 m de visibilité libre. Pour dépasser un camion (18 m), comptez 800 m minimum.",
          "C — Circulation : vérifiez les rétroviseurs intérieur et gauche. Cherchez aussi à droite si un autre véhicule veut vous dépasser en même temps (dépassement croisé dangereux).",
          "S — Signal : activez le clignotant gauche. Maintien du clignotant pendant tout le déport. L'absence de clignotant est une infraction de 2e classe : 35 € et 3 points retirés.",
          "R — Rétroviseur + angle mort : juste avant de vous déporter, tournez brièvement la tête pour vérifier l'angle mort gauche. Cette étape est non négociable.",
          "D — Dépasser : déportez-vous progressivement, accélérez pour minimiser le temps sur la voie adverse. Dès que vous voyez les phares du véhicule doublé entiers dans votre rétroviseur intérieur, activez le clignotant droit et revenez progressivement à droite.",
        ],
        highlight: "Méthode PCSRD : Positionner, Circulation, Signal, Rétro, Dépasser",
      },
      {
        type: "example",
        title: "Scénario concret : dépasser un tracteur agricole à 80 km/h",
        content:
          "Vous êtes derrière un tracteur roulant à 30 km/h sur une route bidirectionnelle. La route est droite mais vous n'avez que 400 m de visibilité. Que faire ?",
        rules: [
          "400 m de visibilité libre est insuffisant pour dépasser en sécurité à 80 km/h (il en faut 500 à 600 m minimum). Résultat : vous ne dépassez pas.",
          "Si la visibilité passe à 600 m et qu'aucune ligne continue n'est présente au sol : appliquez PCSRD. Accélérez franchement pour réduire le temps côté gauche.",
          "Différence de vitesse favorable : vous êtes à 80 km/h, le tracteur à 30 km/h. Vous avez un différentiel de 50 km/h, ce qui accélère le dépassement.",
          "Règle des engins lents : un conducteur roulant à moins de 50 km/h doit se ranger à droite pour faciliter le dépassement dès que possible (article R414-7).",
          "Erreur fréquente : démarrer le dépassement sans avoir évalué la distance, en comptant sur la chance. C'est l'erreur la plus mortelle.",
        ],
        highlight: "Tracteur à moins de 50 km/h : il doit se ranger pour faciliter le dépassement",
      },
      {
        type: "rule",
        title: "Les interdictions absolues de dépassement",
        content:
          "Les articles R414-4 à R414-17 du Code de la route listent toutes les situations où le dépassement est formellement interdit :",
        rules: [
          "En cas de visibilité insuffisante : virage, sommet de côte, brouillard épais, pluie intense, nuit sans éclairage suffisant.",
          "Sur une ligne blanche continue au sol (axiale ou de guidage) : aucune exception, même pour doubler un cycliste ou un engin lent.",
          "Aux passages à niveau : dans les 50 m avant et après un passage à niveau.",
          "Aux passages piétons : dès qu'un piéton est présent ou manifeste l'intention de traverser.",
          "Aux intersections (sauf si vous êtes sur une voie prioritaire AB3/AB4 et que le dépassement est sans danger).",
          "Lorsque le véhicule devant a son clignotant gauche allumé (il tourne à gauche). Exception : si sa voie de sortie gauche est séparée et que vous pouvez passer à droite sans risque.",
          "Panneau B3a (cercle rouge, deux voitures, celle de gauche barrée) : interdiction de dépasser les véhicules à moteur. La fin de cette interdiction est signalée par un panneau B31.",
          "Lorsque le véhicule devant est arrêté pour laisser traverser un piéton sur un passage piéton.",
        ],
        highlight: "Panneau B3a = interdiction absolue de dépasser",
      },
      {
        type: "rule",
        title: "Être dépassé — obligations du véhicule dépassé (article R414-7)",
        content:
          "La loi impose des obligations non seulement au véhicule qui dépasse, mais aussi au conducteur qui est dépassé :",
        rules: [
          "Il est formellement interdit d'accélérer pendant qu'un autre véhicule vous dépasse. Vous ne devez pas compliquer ou rendre dangereux le dépassement.",
          "Si vous roulez lentement (en dessous de 50 km/h) pour une raison quelconque (chargement, panne, précaution), serrez à droite dès que possible pour laisser passer les véhicules qui s'accumulent derrière vous.",
          "Les conducteurs de poids lourds, véhicules avec remorque et engins agricoles doivent activer leurs feux de détresse s'ils bloquent le trafic et qu'ils ne peuvent pas s'arrêter immédiatement.",
          "Bloquer volontairement le dépassement (accélérer pour empêcher quelqu'un de vous dépasser) est une faute susceptible d'engager votre responsabilité civile et pénale.",
        ],
        highlight: "Interdit d'accélérer pendant qu'on est dépassé",
      },
      {
        type: "warning",
        title: "Situations piège et erreurs éliminatoires",
        content:
          "Ces erreurs sont les plus fréquentes dans les accidents de dépassement et dans les échecs à l'examen pratique :",
        rules: [
          "Dépasser en sommet de côte : même si la route semble libre devant vous, un véhicule peut surgir juste de l'autre côté. Sans vision complète au-delà du sommet, c'est interdit.",
          "Dépasser en file : dépasser deux véhicules ou plus en même temps multiplie la distance nécessaire et le temps sur la voie adverse. Un dépassement = un seul véhicule à la fois.",
          "Revenir trop tôt : se rabattre à droite avant d'avoir entièrement dépassé le véhicule est extrêmement dangereux. Attendez que les phares du véhicule doublé soient entièrement visibles dans votre rétroviseur intérieur.",
          "Oublier l'angle mort : les rétroviseurs ont des zones aveugles de 3 à 5 m sur les côtés. Un motard ou cycliste peut s'y trouver. La rotation de tête est obligatoire.",
          "Franchir une ligne continue : contravention de 4e classe, 135 € et 3 points retirés. Faute grave à l'examen pratique.",
          "Dépassement sans clignotant : 35 € et 3 points retirés (article R412-10). Aussi noté faute grave à l'examen.",
        ],
        highlight: "Franchir une ligne continue : 135 € et 3 points",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "En cas de doute, ne dépassez pas. C'est la règle d'or. Apprenez PCSRD par cœur et appliquez-le à chaque dépassement.",
        rules: [
          "Méthode PCSRD : Positionner (évaluer 500-600 m), Circulation (rétros), Signal (clignotant gauche), Rétroviseur + angle mort, Dépasser.",
          "Interdit : virage, sommet de côte, ligne continue (135 €, 3 pts), passage à niveau, passage piéton, panneau B3a.",
          "Interdit d'accélérer quand on est dépassé.",
          "Oublier le clignotant gauche : 35 € et 3 points.",
          "Revenir trop tôt à droite = risque de collision mortel. Attendre les phares dans le rétro intérieur.",
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
    readingTime: "7 min",
    sections: [
      {
        type: "intro",
        title: "Le rond-point, une spécialité française",
        content:
          "La France compte plus de 65 000 ronds-points, ce qui en fait le pays au monde qui en possède le plus. Depuis le décret du 27 octobre 1983, la priorité a été inversée : ce sont les véhicules déjà dans l'anneau qui sont prioritaires, et non plus ceux qui entrent. Ce changement a divisé par 3 le nombre d'accidents mortels dans ces zones. Pourtant, les infractions restent fréquentes — notamment chez les conducteurs qui pensent encore que « qui entre a la priorité ». Attention à la distinction : un carrefour giratoire (le plus courant, avec panneau Cédez-le-passage) n'est pas identique à un vieux « rond-point » sans signalisation. Dans 99 % des cas en France, vous rencontrez un carrefour giratoire : l'anneau est prioritaire.",
      },
      {
        type: "rule",
        title: "La règle de priorité : l'anneau prime sur les entrées",
        content:
          "La règle de priorité dans les ronds-points est fixée par les articles R415-10 et R415-11 du Code de la route. Elle est simple mais impérative :",
        rules: [
          "Tout véhicule circulant dans l'anneau est prioritaire sur les véhicules qui souhaitent entrer. Cette règle est signalée par le panneau AB6 (Cédez-le-passage) ou AB1 (Stop) à chaque entrée.",
          "À l'entrée : regardez vers la gauche pour évaluer le trafic dans l'anneau. Si l'anneau est libre, vous pouvez vous engager. Si un véhicule arrive dans l'anneau, vous attendez.",
          "Il n'y a pas de priorité à droite dans un carrefour giratoire réglementaire. La notion de droite ne s'applique plus : c'est l'anneau entier qui est prioritaire sur toutes les entrées.",
          "Cas très rare : certains vieux ronds-points non signalisés appliquent encore la priorité à droite (le véhicule entrant a la priorité sur celui qui est dans l'anneau). Un panneau AB4 (losange jaune) à l'intérieur l'indique. Ces ronds-points sont très rares et toujours explicitement signalisés.",
          "Sanction pour refus de priorité à l'entrée d'un giratoire : 135 € et 4 points retirés. Suspension de permis possible jusqu'à 3 ans.",
        ],
        highlight: "Anneau prioritaire = céder à l'entrée — 135 € et 4 pts si infraction",
      },
      {
        type: "rule",
        title: "Utilisation des clignotants — la règle officielle",
        content:
          "L'usage des clignotants dans les ronds-points est fréquemment mal appliqué, y compris par des conducteurs expérimentés. Voici la règle issue du Code de la route :",
        rules: [
          "Première sortie (vous tournez à droite, moins d'un quart de tour) : activez le clignotant droit dès l'entrée dans le rond-point pour informer les autres conducteurs de votre sortie imminente.",
          "Sortie tout droit (deuxième sortie environ) : pas de clignotant à l'entrée. Activez le clignotant droit juste avant de quitter l'anneau, une fois que vous avez dépassé la sortie précédente.",
          "Sortie à gauche ou demi-tour (troisième sortie ou plus) : activez le clignotant gauche à l'entrée pour signaler que vous allez rester dans l'anneau. Activez le clignotant droit juste avant votre sortie.",
          "Règle d'or à retenir : le clignotant droit doit toujours être activé avant de quitter l'anneau, quelle que soit votre sortie. C'est la seule règle vraiment universelle.",
          "Absence de clignotant à la sortie : infraction de 2e classe, 35 € d'amende. Mais surtout, cela crée un risque d'accident avec les conducteurs qui attendent à l'entrée.",
        ],
        highlight: "Clignotant droit AVANT chaque sortie du rond-point",
      },
      {
        type: "tip",
        title: "Quelle voie choisir à l'entrée d'un giratoire à deux voies ?",
        content:
          "Sur les ronds-points à deux voies, le choix de la voie avant d'entrer détermine votre facilité à sortir. Anticipez :",
        rules: [
          "Première sortie (à droite, quart de tour) : prenez la voie extérieure droite. Restez sur la voie extérieure dans l'anneau. Sortez directement sans changer de voie.",
          "Deuxième sortie (tout droit, demi-tour environ) : préférez la voie intérieure gauche à l'entrée. Cela vous laisse plus de marge pour sortir sans couper les véhicules extérieurs.",
          "Troisième sortie ou plus (à gauche, plus de la moitié du tour) : voie intérieure gauche obligatoirement. Déportez-vous vers la voie extérieure droite juste avant votre sortie.",
          "Si vous n'êtes pas sûr de votre sortie : prenez la voie intérieure. Vous pouvez toujours faire un tour complet sans danger. Ce n'est pas une infraction.",
          "Jamais de changement de voie dans l'anneau sans vérifier les rétroviseurs et les angles morts. Les accidents dans l'anneau sont presque toujours dus à un changement de voie non anticipé.",
          "Sur les ronds-points à une seule voie (la majorité en France) : pas de choix à faire. Respectez uniquement la priorité à l'entrée et les clignotants.",
        ],
        highlight: "1re sortie : voie extérieure. 2e sortie ou plus : voie intérieure",
      },
      {
        type: "example",
        title: "Scénario type à l'examen : traversée d'un giratoire à 4 branches",
        content:
          "Vous approchez d'un giratoire à 4 sorties. Vous devez prendre la 3e sortie (à gauche). Décrivez la manœuvre complète :",
        rules: [
          "Approche : réduisez la vitesse à 20-30 km/h. Activez le clignotant gauche pour signaler que vous allez rester dans l'anneau.",
          "Entrée : vérifiez l'anneau vers la gauche. Cédez le passage aux véhicules dans l'anneau. Prenez la voie intérieure gauche si disponible.",
          "Dans l'anneau : restez en voie intérieure. Passez devant la 1re sortie, puis la 2e. Regardez les véhicules qui sortent depuis l'extérieur.",
          "Avant la 3e sortie (votre sortie) : juste après avoir dépassé la 2e sortie, activez le clignotant droit. Déportez-vous progressivement vers la voie extérieure.",
          "Sortie : quittez l'anneau en cédant le passage aux piétons qui traversent à la sortie. Éteignez le clignotant.",
          "Erreur à l'examen : oublier d'activer le clignotant gauche à l'entrée. L'inspecteur note l'absence de communication avec les autres conducteurs.",
        ],
        highlight: "Giratoire : clignotant gauche à l'entrée si sortie après la 2e",
      },
      {
        type: "warning",
        title: "Erreurs fréquentes et fautes à l'examen",
        content:
          "Ces erreurs sont quasi systématiques chez les candidats au permis dans les ronds-points. Entraînez-vous spécifiquement sur ces points :",
        rules: [
          "S'engager sans regarder l'anneau : regarder uniquement à droite à l'entrée au lieu de regarder vers la gauche dans l'anneau. Le véhicule prioritaire arrive de votre gauche dans l'anneau.",
          "Croire que l'on a la priorité parce qu'on arrive de droite : c'est l'erreur la plus répandue et la plus dangereuse. Dans un carrefour giratoire, la priorité à droite ne s'applique pas.",
          "Oublier le clignotant droit à la sortie : faute notée systématiquement à l'examen. Les conducteurs qui attendent à l'entrée ne savent pas si vous allez sortir ou continuer.",
          "Changer de voie dans l'anneau sans vérifier : risque de collision avec un véhicule sur la voie extérieure. Toujours tourner la tête avant de se déporter.",
          "Rouler trop vite dans l'anneau : vitesse maximale conseillée 20 à 30 km/h. Au-delà, la force centrifuge augmente et les distances de réaction diminuent.",
          "Ignorer les piétons à la sortie : les passages piétons aux sorties de giratoires sont souvent négligés. Un piéton s'engageant sur le passage reste prioritaire.",
        ],
        highlight: "Absence de clignotant droit à la sortie = faute grave à l'examen",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "Le giratoire est conçu pour fluidifier et sécuriser la circulation. Maîtrisez ces 4 règles fondamentales et vous n'aurez plus aucun problème dans un rond-point.",
        rules: [
          "Priorité à ceux dans l'anneau. Céder à l'entrée. 135 € et 4 points si non-respect.",
          "Clignotant gauche à l'entrée si vous prenez la 3e sortie ou plus. Clignotant droit avant chaque sortie.",
          "1re sortie : voie extérieure. 2e sortie ou plus : voie intérieure à l'entrée.",
          "Jamais de changement de voie dans l'anneau sans vérifier les angles morts.",
          "Vitesse dans l'anneau : 20 à 30 km/h maximum.",
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
    subtitle: "Clignotants, procédure 3M, voies d'insertion autoroute et fermeture de voie",
    icon: "↪️",
    readingTime: "8 min",
    sections: [
      {
        type: "intro",
        title: "Changer de direction sans surprendre personne",
        content:
          "Les changements de direction — tourner, changer de voie, s'insérer sur autoroute — sont des actes quotidiens qui, mal exécutés, causent des accidents graves. Le principe fondamental est simple mais exigeant : informer les autres conducteurs de vos intentions avant d'agir, vérifier que la manœuvre est sûre, puis l'exécuter avec fluidité. Le clignotant est votre unique outil de communication sur la route. Sans lui, vous êtes imprévisible. La méthode 3M (Miroir — Manette — Manœuvre) est la technique enseignée dans toutes les auto-écoles françaises pour structurer chaque changement de voie.",
      },
      {
        type: "rule",
        title: "Les clignotants — obligation légale et timing (article R412-6)",
        content:
          "L'utilisation des clignotants est obligatoire pour tout changement de direction, changement de voie ou démarrage. Voici les règles précises :",
        rules: [
          "Le clignotant doit être activé AVANT de commencer la manœuvre, jamais pendant. Délai minimal : 3 secondes en agglomération, 5 à 8 secondes sur route ou autoroute.",
          "Le clignotant doit rester allumé pendant toute la durée du déplacement latéral. Il se coupe automatiquement après un virage prononcé, mais pas après un changement de voie. Éteignez-le manuellement.",
          "Activer le clignotant ne vous donne aucun droit de passage. Il informe — il ne protège pas. Vous devez toujours vous assurer que la manœuvre est sûre avant de vous déporter.",
          "Infraction pour absence de clignotant : amende de 2e classe, 35 €. À l'examen pratique, c'est une faute grave notée systématiquement par l'inspecteur.",
          "Cas particulier : clignotant sur parking ou parking souterrain. Même hors chaussée publique, signaler vos intentions évite les accrochages. Bonne habitude à prendre dès le début.",
        ],
        highlight: "Clignotant avant la manœuvre — jamais pendant",
      },
      {
        type: "rule",
        title: "Changement de voie — méthode 3M (Miroir, Manette, Manœuvre)",
        content:
          "La méthode 3M est la procédure standard enseignée en France pour tout changement de voie. Elle s'applique sur route, autoroute et en agglomération :",
        rules: [
          "M1 — Miroir : regardez le rétroviseur intérieur (vue générale arrière), puis le rétroviseur extérieur du côté où vous allez vous déplacer.",
          "Angle mort : tournez brièvement la tête dans la direction du déplacement. Les rétroviseurs couvrent environ 70 % de ce qui est derrière vous — l'angle mort reste invisible sans rotation de tête.",
          "M2 — Manette (clignotant) : activez le clignotant du côté du déplacement. Attendez 3 à 5 secondes pour que les autres conducteurs voient votre intention.",
          "M3 — Miroir de contrôle final : juste avant de vous déporter, regardez une dernière fois le rétroviseur et l'angle mort. La situation peut avoir changé.",
          "Manœuvre : déportez-vous progressivement, sans coup de volant sec. Un changement de voie fluide prend 2 à 3 secondes.",
          "Désactivez le clignotant dès que vous êtes dans la nouvelle voie.",
        ],
        highlight: "Méthode 3M : Miroir — Manette — Manœuvre",
      },
      {
        type: "rule",
        title: "Insertion sur autoroute — technique complète",
        content:
          "L'insertion sur autoroute via la bretelle d'accélération est une manœuvre à part entière. C'est une faute éliminatoire à l'examen pratique si elle est mal exécutée :",
        rules: [
          "Étape 1 — Anticiper : dès l'entrée sur la bretelle, regardez à gauche pour évaluer la densité et la vitesse du trafic sur la voie principale. Cherchez un espace libre.",
          "Étape 2 — Accélérer : utilisez la totalité de la bretelle d'accélération. Accélérez progressivement pour atteindre la vitesse du flux (généralement 110 à 130 km/h). Ne vous insérez jamais lentement dans un flux rapide.",
          "Étape 3 — Clignotant gauche : activez-le dès que vous avez évalué votre espace d'insertion. Maintenez-le pendant toute la phase d'insertion.",
          "Étape 4 — Rétroviseur et angle mort gauche : vérifiez une dernière fois juste avant de vous déporter.",
          "Étape 5 — S'insérer derrière un véhicule : préférez vous glisser derrière un véhicule de la voie principale plutôt que devant. Cela évite de le forcer à freiner.",
          "Si la bretelle est trop courte ou le trafic trop dense : arrêtez-vous complètement en bout de bretelle et attendez une ouverture. Ne jamais s'insérer de force.",
          "Les conducteurs de la voie principale n'ont pas l'obligation légale de vous faciliter l'insertion, mais le Code recommande cette solidarité. Non-respect des distances de sécurité : 135 € et 3 points.",
        ],
        highlight: "Insertion autoroute : atteindre la vitesse du flux sur la bretelle",
      },
      {
        type: "example",
        title: "Scénario type : insertion sur autoroute à l'heure de pointe",
        content:
          "Il est 18h, trafic dense. Vous entrez sur la bretelle d'accélération d'une autoroute à 130 km/h. Les véhicules se suivent à environ 80 m d'intervalle. Que faites-vous ?",
        rules: [
          "Vous accélérez sur la bretelle tout en observant les espaces disponibles entre les véhicules de la voie de droite.",
          "Vous activez le clignotant gauche pour signaler votre intention aux conducteurs qui vous suivent sur la bretelle et aux conducteurs de la voie principale.",
          "Vous repérez un espace de 80 m entre deux véhicules. Vous vous glissez derrière le premier en calant votre vitesse sur la sienne.",
          "Vous ne forcez pas le second véhicule de la voie principale à freiner. Si l'espace est trop court, vous attendez le suivant.",
          "Une fois inséré, vous vérifiez vos rétroviseurs, désactivez le clignotant et maintenez la distance de sécurité réglementaire (2 secondes, soit environ 70 à 80 m à 130 km/h).",
          "Erreur fréquente : s'arrêter au bout de la bretelle et attendre passivement au lieu d'utiliser toute la longueur disponible pour s'accélérer et trouver un espace.",
        ],
        highlight: "S'insérer derrière un véhicule, jamais devant",
      },
      {
        type: "rule",
        title: "Fermeture de voie — règle du zipper et signalisation de travaux",
        content:
          "Lorsqu'une voie se ferme (travaux, accident, rétrécissement de chaussée), la circulation doit s'organiser coopérativement :",
        rules: [
          "La règle du zipper (fermeture éclair) : les véhicules des voies encore ouvertes laissent entrer les véhicules de la voie fermée, un par un, alternativement.",
          "Il est parfaitement légal de rester dans la voie qui se ferme jusqu'à son extrémité avant de s'insérer. Ce comportement est plus efficace que de changer de voie trop tôt : il réduit la congestion.",
          "Activez votre clignotant tôt pour signaler votre intention d'insertion avant l'extrémité de la voie fermée.",
          "Bloquer intentionnellement un conducteur qui cherche à s'insérer correctement est dangereux et peut être qualifié d'entrave à la circulation.",
          "En présence de signalisation de chantier (panneaux AK5 avec flèches lumineuses) : le changement de voie est imposé à l'endroit indiqué. Ne pas attendre — suivre les flèches dès qu'elles apparaissent.",
          "Vitesse dans les zones de travaux : respectez les limitations temporaires (fond jaune). Elles ont la même valeur légale que les panneaux permanents. Infraction sanctionnée identiquement.",
        ],
        highlight: "Règle du zipper : rester dans sa voie jusqu'au bout, puis alterner",
      },
      {
        type: "tip",
        title: "Tourner à gauche sur une route à double sens — la manœuvre la plus risquée",
        content:
          "Tourner à gauche depuis une route à double sens est statistiquement l'une des manœuvres les plus accidentogènes en conduite quotidienne. Voici la méthode complète :",
        rules: [
          "Anticipez : activez le clignotant gauche au moins 50 m avant le virage en agglomération, 150 m hors agglomération.",
          "Vérifiez le rétroviseur intérieur, puis le rétroviseur gauche, puis l'angle mort gauche.",
          "Serrez progressivement vers l'axe de la chaussée pour vous positionner en attente de tourner. Vous êtes maintenant à cheval sur l'axe.",
          "Regardez à gauche vers la rue dans laquelle vous allez tourner, ET vers la droite pour détecter les véhicules venant en sens inverse.",
          "Attendez une ouverture suffisante dans le trafic venant en sens inverse : les véhicules en face sont prioritaires sur vous.",
          "Si deux véhicules tournent à gauche simultanément (vous et le véhicule en face) : croisez-vous par l'arrière (passez derrière le nez de l'autre). Cela améliore la visibilité sur la voie dans laquelle vous vous engagez.",
        ],
        highlight: "Clignotant gauche 50 m avant en ville, 150 m hors agglomération",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content:
          "Changer de direction ou de voie, c'est communiquer et anticiper. Le clignotant est votre seul outil de communication sur la route. La méthode 3M est votre procédure universelle.",
        rules: [
          "Clignotant avant la manœuvre, jamais pendant. Il informe, ne protège pas. Absent : 35 €.",
          "Changement de voie : méthode 3M — Miroir, Manette, Manœuvre. Angle mort obligatoire.",
          "Insertion autoroute : accélérer sur la bretelle, atteindre la vitesse du flux, s'insérer derrière. Non-respect distances : 135 € et 3 pts.",
          "Fermeture de voie : rester dans la voie jusqu'au bout, puis zipper un par un.",
          "Tourner à gauche : clignotant à l'avance, axe de chaussée, attendre ouverture dans le trafic venant en face.",
        ],
      },
    ],
  },
];
