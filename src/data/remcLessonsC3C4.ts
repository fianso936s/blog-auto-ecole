import type { REMCLesson } from "./remcLessonsTypes";

export const lessonsC3: REMCLesson[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // C3 – L1  L'autoroute et les voies rapides
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "c3_l1",
    competence_id: 3,
    chapter: 1,
    title: "L'autoroute et les voies rapides",
    subtitle: "Accès, vitesses, distances de sécurité, BAU et tunnels",
    icon: "🛣️",
    readingTime: "8 min",
    sections: [
      {
        type: "intro",
        title: "Pourquoi l'autoroute mérite une leçon à part entière ?",
        content:
          "L'autoroute est statistiquement la route la plus sûre par kilomètre parcouru, mais les accidents qui s'y produisent sont souvent très graves en raison des vitesses élevées. Comprendre ses règles spécifiques, c'est se protéger ET protéger les autres. Ce chapitre reprend point par point ce que votre moniteur vous expliquera lors de votre première leçon d'autoroute.",
      },
      {
        type: "rule",
        title: "Les vitesses maximales autorisées",
        content:
          "La vitesse sur autoroute n'est pas fixe : elle dépend des conditions météorologiques et de l'ancienneté du permis.",
        rules: [
          "130 km/h — chaussée sèche, conducteur expérimenté (permis > 3 ans)",
          "110 km/h — pluie ou chaussée mouillée (tous conducteurs)",
          "110 km/h — conducteurs en période probatoire (permis < 3 ans, même par beau temps)",
          "50 km/h — visibilité inférieure à 50 mètres (brouillard dense, neige épaisse)",
          "Sur voie rapide (2×2 voies hors autoroute) : 110 km/h par temps sec",
        ],
        highlight: "130 / 110 / 50 km/h",
      },
      {
        type: "rule",
        title: "Accéder et quitter l'autoroute",
        content:
          "La bretelle d'accès (voie d'insertion) sert à atteindre la vitesse du trafic autoroutier AVANT de s'insérer. La bretelle de sortie (voie de décélération) sert à ralentir APRÈS avoir quitté la voie de droite.",
        rules: [
          "S'insérer en accélérant sur la bretelle : viser 110-130 km/h avant de rejoindre la voie de droite",
          "Céder le passage aux véhicules déjà sur l'autoroute",
          "Ne JAMAIS s'arrêter en bout de bretelle d'accès sauf impossibilité absolue",
          "Annoncer la sortie suffisamment tôt : clignotant, puis rejoindre la voie de droite, puis la bretelle",
          "Ne pas freiner sur la voie de circulation principale : attendre la voie de décélération",
        ],
        highlight: "Accélérer avant d'entrer, décélérer après être sorti",
      },
      {
        type: "rule",
        title: "Les distances de sécurité",
        content:
          "À grande vitesse, la distance de freinage augmente de façon exponentielle. Le Code de la route impose une distance minimale.",
        rules: [
          "Règle des 2 secondes : laisser au moins 2 secondes de distance avec le véhicule devant",
          "À 130 km/h, 2 secondes = environ 72 mètres (soit 2 grands pointillés blancs)",
          "Par temps de pluie, doubler la distance : 4 secondes minimum",
          "Les marquages au sol délimitent des zones de 50 m : ne jamais rester dans la zone d'un seul marquage",
          "Sanction : 135 € d'amende + 3 points retirés si distance < 50 m à plus de 130 km/h",
        ],
        highlight: "2 secondes minimum",
      },
      {
        type: "warning",
        title: "La bande d'arrêt d'urgence (BAU) : zone interdite sauf urgence",
        content:
          "La BAU est strictement réservée aux arrêts forcés (panne, malaise, urgence) et aux services de secours. Rouler sur la BAU est une infraction grave.",
        rules: [
          "En cas de panne : allumer les feux de détresse, se déporter sur la BAU et s'y arrêter",
          "Mettre le gilet fluorescent AVANT de sortir du véhicule (il doit être dans l'habitacle, pas dans le coffre)",
          "Placer le triangle de présignalisation à au moins 30 m en amont du véhicule",
          "Appeler le 15, 17, 18 ou 112 — et utiliser les bornes d'appel d'urgence (tous les 2 km sur autoroute)",
          "Ne jamais traverser les voies de circulation à pied",
          "Amende pour stationnement abusif sur BAU : 135 € + 3 points",
        ],
        highlight: "Gilet AVANT de sortir du véhicule",
      },
      {
        type: "rule",
        title: "La circulation dans les tunnels",
        content:
          "Les tunnels concentrent des risques spécifiques : fumée, manque d'oxygène, panique. Des règles strictes s'appliquent.",
        rules: [
          "Allumer les feux de croisement dès l'entrée dans le tunnel (obligatoire)",
          "Augmenter la distance de sécurité à 150 m minimum",
          "Interdiction absolue de faire demi-tour ou de reculer dans un tunnel",
          "En cas d'incendie : s'arrêter, couper le moteur, laisser les clés sur le contact, rejoindre la sortie de secours à pied",
          "En cas d'embouteillage dans un tunnel : maintenir une distance suffisante, ne pas couper le moteur immédiatement",
          "Respecter les limitations de vitesse affichées dans le tunnel (souvent 70 ou 90 km/h)",
        ],
        highlight: "Feux de croisement obligatoires",
      },
      {
        type: "tip",
        title: "Conseil de moniteur",
        content:
          "Sur autoroute, la fatigue est le danger numéro un. La monotonie de la route endort. Prévoyez une pause de 15 minutes toutes les 2 heures, ou dès les premiers signes de somnolence : clignements des yeux fréquents, lignes qui bougent, tête qui tombe. La somnolence est aussi dangereuse que l'alcool.",
      },
      {
        type: "example",
        title: "Situation type : insertion sur autoroute",
        content:
          "Vous arrivez sur la bretelle d'accès. Le trafic circule à 120 km/h. Vous devez accélérer jusqu'à environ 110-120 km/h sur la bretelle, activer votre clignotant gauche, vérifier vos rétroviseurs et l'angle mort, puis vous insérer progressivement en vous calant dans un espace suffisant. Si aucun espace ne se présente, ralentissez ou arrêtez-vous en bout de bretelle (exceptionnel), mais ne forcez jamais l'insertion.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Les points clés de l'autoroute :",
        rules: [
          "130 km/h sec | 110 km/h pluie | 50 km/h visibilité < 50 m",
          "2 secondes de distance minimum (4 sous la pluie)",
          "BAU uniquement pour les urgences — gilet avant de sortir",
          "Triangle à 30 m minimum en amont",
          "Feux de croisement obligatoires dans les tunnels",
          "Pause toutes les 2 heures contre la fatigue",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C3 – L2  Conduite sous la pluie et aquaplaning
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "c3_l2",
    competence_id: 3,
    chapter: 2,
    title: "Conduite sous la pluie et aquaplaning",
    subtitle: "Distances, vitesses adaptées, feux et gestion de l'aquaplaning",
    icon: "🌧️",
    readingTime: "7 min",
    sections: [
      {
        type: "intro",
        title: "La pluie : un danger sous-estimé",
        content:
          "La pluie est la première cause d'accidents météorologiques en France. Elle réduit la visibilité, allonge considérablement les distances de freinage et peut provoquer un phénomène redouté : l'aquaplaning. Votre moniteur insistera beaucoup sur l'adaptation de la vitesse, car c'est la clé de votre sécurité.",
      },
      {
        type: "rule",
        title: "Les vitesses adaptées à la pluie",
        content:
          "Le Code de la route impose des vitesses réduites dès que la chaussée est mouillée, non seulement lorsqu'il pleut.",
        rules: [
          "Autoroute : 130 → 110 km/h (chaussée mouillée ou pluie)",
          "Route nationale (2×2 voies sans séparateur) : 110 → 100 km/h",
          "Route hors agglomération : 80 km/h (inchangé, mais la prudence s'impose)",
          "Agglomération : 50 km/h (inchangé mais distance de freinage doublée)",
          "Visibilité inférieure à 50 m : 50 km/h sur tous les réseaux",
        ],
        highlight: "130 → 110 km/h sur autoroute",
      },
      {
        type: "rule",
        title: "Distances de freinage sous la pluie",
        content:
          "L'eau crée un film lubrifiant entre le pneu et la chaussée. La distance de freinage est multipliée par 1,5 à 2 par rapport au sec.",
        rules: [
          "À 50 km/h sec : environ 25 m de freinage | sous la pluie : environ 38 m",
          "À 90 km/h sec : environ 70 m | sous la pluie : environ 105 m",
          "À 130 km/h sec : environ 135 m | sous la pluie : environ 200 m",
          "Appliquer la règle des 4 secondes de distance de sécurité sous la pluie",
          "Éviter les freinages brusques : freiner progressivement en ligne droite avant un virage",
        ],
        highlight: "Distance × 1,5 à 2 sous la pluie",
      },
      {
        type: "rule",
        title: "Les feux à utiliser sous la pluie",
        content:
          "L'utilisation des feux en cas de mauvaise visibilité est réglementée. Une erreur fréquente est d'utiliser les feux antibrouillard par simple pluie.",
        rules: [
          "Feux de croisement (codes) : obligatoires dès que la visibilité est insuffisante",
          "Feux de brouillard ARRIÈRE : autorisés uniquement si la visibilité est inférieure à 50 m",
          "Feux de brouillard AVANT : jamais obligatoires sous la pluie simple, peuvent être gênants pour les autres",
          "Feux de détresse : UNIQUEMENT à l'arrêt ou en cas de danger immédiat, pas en roulant sous la pluie",
          "Utiliser les feux de détresse en roulant sous la pluie masque vos clignotants : interdit et dangereux",
        ],
        highlight: "Feux de détresse = arrêt seulement",
      },
      {
        type: "warning",
        title: "L'aquaplaning : perdre tout contact avec la route",
        content:
          "L'aquaplaning se produit quand une lame d'eau s'interpose entre le pneu et la chaussée. Le véhicule flotte et ne répond plus à la direction. C'est l'un des phénomènes les plus dangereux en conduite.",
        rules: [
          "L'aquaplaning survient surtout au-dessus de 80 km/h sur chaussée très mouillée",
          "Signes : la direction devient légère, le bruit des pneus disparaît, le régime moteur monte",
          "Réaction correcte : relâcher progressivement l'accélérateur, NE PAS freiner ni braquer brutalement",
          "Maintenir le volant droit et laisser la voiture ralentir d'elle-même jusqu'à retrouver l'adhérence",
          "Prévention : pneus en bon état (profondeur > 1,6 mm, idéalement > 3 mm), vitesse adaptée",
          "Les ornières et flaques sont les zones à risque : les repérer et ralentir en amont",
        ],
        highlight: "Ne pas freiner ni braquer",
      },
      {
        type: "tip",
        title: "Conseil pratique du moniteur",
        content:
          "En début de pluie après une longue période sèche, la chaussée est encore plus glissante qu'en pluie établie : les dépôts d'huile et de poussière remontent en surface. Redoublez de prudence lors des 5 à 10 premières minutes de pluie. Vérifiez aussi régulièrement l'état de vos pneus et surtout vos essuie-glaces : des balais usés réduisent drastiquement la visibilité.",
      },
      {
        type: "example",
        title: "Situation : aquaplaning à 90 km/h sur autoroute",
        content:
          "Vous traversez une flaque à 90 km/h. Soudain, la direction devient très légère et vous n'entendez plus le bruit de roulement. Ne paniquez pas. Relâchez doucement l'accélérateur. Gardez le volant droit. N'appuyez pas sur le frein. En quelques secondes, la voiture ralentit et les pneus retrouvent contact avec le sol. Vous pouvez alors reprendre le contrôle normalement.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Conduite sous la pluie en résumé :",
        rules: [
          "Autoroute : 110 km/h max dès que la chaussée est mouillée",
          "Distance de freinage multipliée par 1,5 à 2 — appliquer la règle des 4 secondes",
          "Feux de détresse interdits en roulant, même sous forte pluie",
          "Aquaplaning : relâcher l'accélérateur, ne pas freiner, ne pas braquer",
          "Pneus en bon état = première prévention contre l'aquaplaning",
          "En début de pluie : chaussée plus glissante — redoubler de prudence",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C3 – L3  Conduite de nuit
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "c3_l3",
    competence_id: 3,
    chapter: 3,
    title: "Conduite de nuit",
    subtitle: "Feux de route et de croisement, fatigue, animaux sur la route",
    icon: "🌙",
    readingTime: "7 min",
    sections: [
      {
        type: "intro",
        title: "La nuit : deux fois plus de risques",
        content:
          "Bien que le trafic de nuit représente moins de 20 % du trafic total, il concentre 40 % des accidents mortels. La réduction de la visibilité, la fatigue et les comportements à risque (alcool, excès de vitesse) expliquent ce déséquilibre. Maîtriser la conduite nocturne est une compétence indispensable.",
      },
      {
        type: "rule",
        title: "Feux de route vs feux de croisement",
        content:
          "Utiliser les bons feux au bon moment est une obligation légale et un acte de sécurité.",
        rules: [
          "Feux de croisement (codes) : obligatoires dès la tombée de la nuit et en cas de mauvaise visibilité",
          "Feux de route (pleins phares) : autorisés sur route non éclairée, sans véhicule en sens inverse ni devant",
          "Obligation de passer en feux de croisement dès qu'un véhicule est visible en face ou que vous suivez un véhicule",
          "En agglomération éclairée : les feux de croisement suffisent, les feux de route aveuglent",
          "Feux de position (veilleuses) seuls : INTERDITS en roulant la nuit — amende 35 €",
          "Absence de feux la nuit : amende 135 €, risque d'immobilisation du véhicule",
        ],
        highlight: "Feux de route = aucun véhicule en vue",
      },
      {
        type: "rule",
        title: "Adapter sa vitesse à la portée des phares",
        content:
          "La règle fondamentale de nuit : vous devez toujours pouvoir vous arrêter dans la distance éclairée par vos phares.",
        rules: [
          "Feux de croisement : portée d'environ 30 à 40 m — adapter sa vitesse en conséquence",
          "Feux de route : portée de 100 à 150 m — vitesse peut être maintenue si la route est dégagée",
          "Ne jamais rouler dans les phares d'un autre véhicule : si vous voyez au-delà de votre éclairage, vous êtes trop proche",
          "En cas d'éblouissement par un véhicule en face : regarder le bord droit de la chaussée, ralentir, ne pas répondre par les pleins phares",
          "Après éblouissement : récupération visuelle peut prendre 5 à 6 secondes — ralentir impérativement",
        ],
        highlight: "S'arrêter dans la distance éclairée",
      },
      {
        type: "warning",
        title: "La fatigue au volant la nuit",
        content:
          "La somnolence est responsable de 1 accident mortel sur 3 sur les routes nationales et autoroutes. Elle frappe particulièrement la nuit, entre 2h et 5h du matin, et entre 13h et 15h.",
        rules: [
          "Signes précurseurs : bâillements répétés, picotements aux yeux, tête lourde, oubli d'un tronçon de route parcouru",
          "La seule solution efficace : s'arrêter et dormir 15 à 20 minutes",
          "Café, fenêtre ouverte, musique forte : efficacité limitée à 20-30 minutes maximum",
          "Ne pas forcer si vous avez dormi moins de 6 heures : risque multiplié par 3",
          "Après 20 heures de veille : les effets sont comparables à 0,5 g/L d'alcool",
          "Prévoyez des pauses toutes les 2 heures lors de longs trajets nocturnes",
        ],
        highlight: "S'arrêter et dormir : seule vraie solution",
      },
      {
        type: "warning",
        title: "Les animaux sur la route",
        content:
          "La nuit, les animaux — notamment le gibier (chevreuils, sangliers) — traversent fréquemment les routes. Un choc avec un grand animal à 90 km/h peut être mortel.",
        rules: [
          "Zones à risque : lisières de forêt, champs, routes de campagne, surtout à l'aube et au crépuscule",
          "Les yeux des animaux brillent dans les phares : surveiller les bas-côtés",
          "Un animal seul peut en cacher d'autres : ralentir et rester vigilant après un premier passage",
          "En cas d'animal sur la chaussée : freiner franchement, ne pas faire d'écart brutal qui ferait perdre le contrôle",
          "En cas de collision avec un grand animal : signaler l'obstacle aux autres usagers (feux de détresse), prévenir la gendarmerie",
          "Panneaux de signalisation gibier : réduire la vitesse dans ces zones",
        ],
        highlight: "Freiner, ne pas faire d'écart brutal",
      },
      {
        type: "tip",
        title: "Conseil du moniteur",
        content:
          "Avant un long trajet de nuit, vérifiez le réglage de vos phares. Des phares mal réglés (trop hauts) éblouissent les autres conducteurs et vous exposent à une amende. Des phares trop bas réduisent inutilement votre portée visuelle. Pensez aussi à nettoyer vos optiques : de la saleté peut réduire l'efficacité des phares de 40 %.",
      },
      {
        type: "example",
        title: "Situation : éblouissement par un camion en sens inverse",
        content:
          "Un poids lourd arrive en face avec ses feux de route. Vous êtes ébloui. Action : reportez votre regard sur la ligne blanche de droite ou le bord droit de la chaussée. Réduisez légèrement votre vitesse. Ne répondez JAMAIS par vos propres feux de route : cela ne ferait qu'aggraver la situation. Après le croisement, attendez 5-6 secondes avant de reprendre la vitesse normale le temps que votre vision récupère.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Conduite nocturne en résumé :",
        rules: [
          "Feux de route uniquement si aucun véhicule en vue (sens inverse ou devant)",
          "Veilleuses seules en roulant = interdit",
          "Adapter la vitesse à la portée des phares",
          "Fatigue : s'arrêter et dormir, pas de solution miracle",
          "Animaux : freiner franc, pas d'écart brutal",
          "Éblouissement : regarder le bord droit, ralentir, ne pas répondre avec les pleins phares",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C3 – L4  Brouillard et visibilité réduite
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "c3_l4",
    competence_id: 3,
    chapter: 4,
    title: "Brouillard et visibilité réduite",
    subtitle: "Feux antibrouillard, quand les utiliser, vitesse adaptée",
    icon: "🌫️",
    readingTime: "6 min",
    sections: [
      {
        type: "intro",
        title: "Le brouillard : visibilité réduite = danger décuplé",
        content:
          "Le brouillard est l'une des conditions les plus traîtresses : la distance de visibilité peut passer de plusieurs centaines de mètres à moins de 10 mètres en quelques secondes. Les carambolages autoroutiers par brouillard dense comptent parmi les accidents les plus meurtriers. La règle d'or : voir loin ET être vu.",
      },
      {
        type: "rule",
        title: "Quand utiliser les feux antibrouillard ?",
        content:
          "Les feux antibrouillard ne s'allument pas n'importe quand. Un usage abusif constitue une infraction et gêne les autres conducteurs.",
        rules: [
          "Feux de brouillard ARRIÈRE (rouge) : obligatoires si la visibilité est inférieure à 50 m",
          "Feux de brouillard AVANT (jaune/blanc large) : autorisés si la visibilité est insuffisante, mais pas obligatoires",
          "Les utiliser hors de ces cas : amende de 68 €",
          "Ils ne remplacent PAS les feux de croisement : les deux doivent être allumés simultanément",
          "Les éteindre dès que la visibilité redevient normale (> 50 m)",
          "Avec le brouillard, les feux de route aggravent l'éblouissement par réflexion : n'utilisez que les codes",
        ],
        highlight: "Feux arrière obligatoires si visibilité < 50 m",
      },
      {
        type: "rule",
        title: "La vitesse par visibilité réduite",
        content:
          "Le principe légal est simple : vous devez toujours pouvoir vous arrêter dans la distance que vous voyez.",
        rules: [
          "Visibilité inférieure à 50 m : 50 km/h maximum sur TOUS les réseaux (autoroute incluse)",
          "Cette règle prime sur toutes les autres limites de vitesse",
          "À 50 km/h, la distance de freinage est d'environ 25 m sur chaussée sèche : limite en brouillard dense",
          "Si la visibilité est de 20 m : ralentir à 20-30 km/h maximum",
          "Ne pas se fier à la visibilité du véhicule devant : son éclairage donne une fausse impression de sécurité",
        ],
        highlight: "50 km/h si visibilité < 50 m",
      },
      {
        type: "rule",
        title: "Distances de sécurité en brouillard",
        content:
          "Par brouillard, la tentation est de suivre de près le véhicule devant pour ne pas le perdre de vue. C'est une grave erreur.",
        rules: [
          "Augmenter la distance de sécurité à au moins 4-5 secondes",
          "Si le véhicule devant freine brusquement, vous avez besoin de plus de marge",
          "Ne pas se mettre dans le sillage d'un poids lourd : il masque les obstacles et sa distance de freinage est plus longue",
          "Sur autoroute en brouillard dense : ralentir avant la zone de brouillard si possible",
          "En cas de brouillard soudain très dense : allumer les feux de détresse brièvement pour alerter les véhicules derrière, puis s'arrêter sur la BAU si nécessaire",
        ],
        highlight: "Ne pas suivre de près en brouillard",
      },
      {
        type: "warning",
        title: "Le phénomène d'hypnose par le brouillard",
        content:
          "En brouillard épais, certains conducteurs ont tendance à accélérer inconsciemment pour retrouver une meilleure visibilité. C'est le phénomène inverse à ce qu'il faut faire. Cette hypnose sensorielle est bien documentée. Surveillez régulièrement votre compteur.",
      },
      {
        type: "tip",
        title: "Conseil du moniteur",
        content:
          "Si vous êtes immobilisé ou en panne dans le brouillard : restez dans votre véhicule avec la ceinture attachée, ou éloignez-vous largement de la chaussée (derrière la glissière si possible). Les accidents en carambolage surviennent souvent parce que des personnes se trouvent à l'extérieur de leur véhicule arrêté sur la route. Votre sécurité physique prime.",
      },
      {
        type: "example",
        title: "Situation : entrée dans une nappe de brouillard sur autoroute",
        content:
          "Vous roulez à 130 km/h, visibilité soudainement réduite à 30 m. Freinez progressivement. Passez en feux de croisement + feux antibrouillard arrière. Descendez à 50 km/h maximum. Augmentez votre distance de sécurité. Ne tentez pas de dépasser. Si la visibilité reste très réduite, cherchez la prochaine aire pour vous arrêter et attendre.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Brouillard et visibilité réduite :",
        rules: [
          "Feux de brouillard ARRIÈRE obligatoires si visibilité < 50 m",
          "Feux de brouillard AVANT autorisés mais non obligatoires",
          "Utilisation abusive des antibrouillard : amende 68 €",
          "50 km/h maximum si visibilité < 50 m (tous réseaux)",
          "Feux de route interdits en brouillard : ils éblouissent par réflexion",
          "Ne jamais suivre de près le véhicule devant en brouillard",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C3 – L5  Partage avec les piétons et cyclistes
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "c3_l5",
    competence_id: 3,
    chapter: 5,
    title: "Partage avec les piétons et cyclistes",
    subtitle: "Passages protégés, distances de dépassement, zones partagées",
    icon: "🚶",
    readingTime: "7 min",
    sections: [
      {
        type: "intro",
        title: "Les usagers vulnérables : une priorité absolue",
        content:
          "Les piétons et cyclistes sont les usagers les plus fragiles de la route. En cas de collision avec un véhicule motorisé, les conséquences pour eux sont presque toujours graves. Le Code de la route leur accorde une protection spéciale que chaque conducteur doit connaître et appliquer.",
      },
      {
        type: "rule",
        title: "Priorité aux piétons sur les passages protégés",
        content:
          "Le passage piéton est un droit pour le piéton, une obligation pour le conducteur. Les règles sont strictes.",
        rules: [
          "Obligation de céder le passage à tout piéton qui s'engage sur le passage ou s'apprête à s'y engager",
          "S'apprêter à s'engager : piéton au bord du trottoir clairement en attente de traverser",
          "Vitesse maximale à l'approche : adapter pour pouvoir s'arrêter si un piéton s'engage",
          "Interdiction de dépasser un véhicule arrêté devant un passage piéton",
          "Amende pour non-respect : 135 € + 6 points retirés",
          "En cas d'accident sur un passage piéton : présomption de faute du conducteur",
        ],
        highlight: "135 € + 6 points",
      },
      {
        type: "rule",
        title: "Distance de dépassement des cyclistes",
        content:
          "Dépasser un cycliste sans laisser une distance suffisante est une infraction. Ces distances sont fixées par la loi.",
        rules: [
          "Hors agglomération : minimum 1,5 mètre entre le côté droit de votre véhicule et le cycliste",
          "En agglomération : minimum 1 mètre",
          "Si la distance n'est pas disponible : ne pas dépasser, patienter derrière le cycliste",
          "Amende pour distance insuffisante : 135 € + 3 points",
          "Un cycliste peut légalement rouler en milieu de voie pour sa sécurité : ne pas le forcer à se rabattre",
          "Par vent de côté, les cyclistes peuvent dévier : prévoir une marge supplémentaire",
        ],
        highlight: "1,5 m hors agglo / 1 m en agglo",
      },
      {
        type: "rule",
        title: "Les zones de partage et les pistes cyclables",
        content:
          "La réglementation crée des espaces où la cohabitation est organisée. Il faut les connaître.",
        rules: [
          "Zone de rencontre : vitesse limitée à 20 km/h, piétons prioritaires partout sur la chaussée",
          "Zone 30 : vitesse limitée à 30 km/h, les vélos peuvent circuler côte à côte",
          "Piste cyclable obligatoire : les cyclistes doivent l'utiliser si elle est contiguë à la chaussée",
          "Double sens cyclable : dans les zones 30 et zones de rencontre, les cyclistes peuvent circuler dans les deux sens même si la rue est à sens unique pour les voitures",
          "Sas vélo aux feux : espace réservé aux cyclistes devant les voitures — s'arrêter derrière, jamais dans le sas",
          "Ouverture de portière : regarder dans le rétroviseur et l'angle mort avant d'ouvrir",
        ],
        highlight: "Zone rencontre : 20 km/h",
      },
      {
        type: "warning",
        title: "Les situations particulièrement dangereuses",
        content:
          "Certaines situations concentrent les risques d'accident avec des usagers vulnérables.",
        rules: [
          "Tourne à droite : toujours vérifier l'angle mort droit pour les cyclistes qui continuent tout droit",
          "Croisement d'un bus : des piétons peuvent surgir devant ou derrière le bus",
          "Enfants à proximité d'une école : vitesse réduite, anticipation maximale",
          "Piéton sur téléphone ou avec casque audio : peut ne pas entendre ni voir votre véhicule",
          "Conditions de nuit : cycliste parfois peu ou mal éclairé — réduire la vitesse",
        ],
        highlight: "Angle mort droit lors d'un tourne-à-droite",
      },
      {
        type: "tip",
        title: "Conseil du moniteur",
        content:
          "Lors du dépassement d'un cycliste, n'accélérez pas immédiatement après l'avoir dépassé. Attendez d'être suffisamment en avant avant de vous rabattre progressivement. Un freinage brusque après avoir dépassé un cycliste peut lui couper la route ou le surprendre. Pensez aussi aux trottinettes électriques : elles peuvent rouler jusqu'à 25 km/h sur piste cyclable et 6 km/h en zone piétonne.",
      },
      {
        type: "example",
        title: "Situation : cycliste dans un rond-point",
        content:
          "Un cycliste circule dans un rond-point. Vous voulez sortir au prochain embranchement. Le cycliste continue sur le giratoire. Vous devez attendre qu'il soit passé avant de vous insérer dans votre sortie. Il est prioritaire sur le giratoire tout comme vous l'êtes. Ne tentez pas de le doubler dans le rond-point : l'espace est trop restreint.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Piétons et cyclistes :",
        rules: [
          "Passage piéton : céder le passage si engagé ou sur le point de s'engager — 135 € + 6 pts",
          "Dépassement cycliste : 1,5 m hors agglomération, 1 m en agglomération",
          "Zone de rencontre : 20 km/h, piétons prioritaires partout",
          "Sas vélo aux feux : ne jamais y entrer avec un véhicule motorisé",
          "Double sens cyclable dans les zones 30",
          "Tourne à droite : vérifier l'angle mort pour les cyclistes",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C3 – L6  Partage avec les poids lourds
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "c3_l6",
    competence_id: 3,
    chapter: 6,
    title: "Partage avec les poids lourds",
    subtitle: "Angles morts, distances de sécurité, dépassement, vent latéral",
    icon: "🚛",
    readingTime: "7 min",
    sections: [
      {
        type: "intro",
        title: "Le poids lourd : un partenaire de route à respecter",
        content:
          "Un poids lourd chargé peut peser jusqu'à 44 tonnes. Sa distance de freinage, ses angles morts et ses contraintes de manœuvre sont sans commune mesure avec ceux d'un véhicule léger. La méconnaissance de ces caractéristiques est à l'origine de nombreux accidents graves impliquant des voitures particulières.",
      },
      {
        type: "rule",
        title: "Les angles morts d'un poids lourd",
        content:
          "Un camion possède des zones invisibles bien plus grandes que celles d'une voiture. Si vous ne voyez pas les rétroviseurs du camion, le chauffeur ne vous voit pas non plus.",
        rules: [
          "Angle mort avant : environ 2 m devant la cabine — ne jamais se glisser juste devant un camion",
          "Angle mort arrière : environ 3 m derrière la remorque — zone totalement invisible",
          "Angles morts latéraux droits : très étendus, plusieurs voies de large côté passager",
          "Règle simple : si vous ne voyez pas les rétroviseurs du camion, il ne vous voit pas",
          "Lors d'un dépassement : ne restez pas dans la zone aveugle latérale, dépassez rapidement",
          "Les autocollants Attention angles morts sur les camions signalent ces zones dangereuses",
        ],
        highlight: "Pas de rétroviseur visible = zone invisible",
      },
      {
        type: "rule",
        title: "Distance de sécurité derrière un poids lourd",
        content:
          "La distance de sécurité derrière un poids lourd doit être encore plus grande que derrière une voiture.",
        rules: [
          "Distance minimale légale : 50 m en agglomération, sur voie rapide appliquer la règle des 2 à 4 secondes",
          "Un camion de 40 t à 90 km/h met environ 120 m pour s'arrêter (vs 70 m pour une voiture)",
          "En cas de freinage d'urgence du camion, votre voiture peut passer sous la remorque (accident de type couperet)",
          "Ne jamais suivre de près derrière un camion : vous ne voyez pas la route devant et ne pouvez pas anticiper",
          "La hauteur du plancher de remorque peut trancher le toit d'une voiture lors d'une collision arrière",
          "Certains camions sont équipés de protège-nez anti-encastrement (obligatoire à partir de 2015)",
        ],
        highlight: "120 m de freinage à 90 km/h",
      },
      {
        type: "rule",
        title: "Dépasser un poids lourd en sécurité",
        content:
          "Dépasser un camion de 20 m de long demande une distance libre beaucoup plus grande que pour dépasser une voiture.",
        rules: [
          "Distance nécessaire pour doubler un camion à 90 km/h : environ 500 m de visibilité libre",
          "Évaluer la distance disponible avant de s'engager : ne pas dépasser dans le doute",
          "Accélérer franchement pour réduire le temps passé dans l'angle mort",
          "Se rabattre avec suffisamment d'espace : laisser au moins 3 longueurs de camion",
          "Attention aux projections : le passage d'un camion crée un effet de souffle puis d'aspiration",
          "Nuit ou mauvaise visibilité : éviter de dépasser un camion si possible",
        ],
        highlight: "500 m de visibilité nécessaires",
      },
      {
        type: "warning",
        title: "Le vent latéral et l'effet de souffle",
        content:
          "Un poids lourd agit comme un mur mobile. Lorsque vous le croisez ou le dépassez, votre véhicule subit d'abord une poussée latérale, puis une aspiration. Ces effets sont amplifiés par le vent.",
        rules: [
          "En cas de vent fort : tenir fermement le volant lors du croisement ou dépassement d'un camion",
          "L'effet de souffle est plus fort pour les petits véhicules légers",
          "Les véhicules hautement perchés (monospace, SUV) et les camping-cars sont particulièrement sensibles",
          "Réduire la vitesse par vent latéral fort, surtout sur viaducs et zones dégagées",
          "Les camions bâchés sont plus sensibles au vent : ils peuvent dévier de leur trajectoire",
        ],
        highlight: "Tenir fermement le volant",
      },
      {
        type: "tip",
        title: "Conseil du moniteur",
        content:
          "Lors de votre leçon d'autoroute, observez les camions : regardez leurs rétroviseurs pour évaluer si le chauffeur peut vous voir. En ville, lors d'un tourne-à-droite d'un camion, restez toujours derrière lui et ne tentez jamais de passer entre lui et le trottoir : l'angle mort droit lors des virages est extrêmement dangereux. De nombreux cyclistes et motards sont tués chaque année dans cette configuration.",
      },
      {
        type: "example",
        title: "Situation : dépassement sur route nationale",
        content:
          "Vous suivez un camion à 80 km/h sur une route à 2 voies. Vous souhaitez le dépasser. Évaluation : vérifier que la ligne est discontinue, que la visibilité est d'au moins 500 m, qu'aucun véhicule n'arrive en face. Accélérez franchement (jusqu'à 90 km/h), dépassez rapidement, ne restez pas à côté du camion plus que nécessaire. Rabattez-vous en laissant au moins 3 longueurs de camion (60 m). Si un doute apparaît en cours de dépassement et qu'un véhicule arrive, accélérez encore pour terminer le dépassement plutôt que d'avorter.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Poids lourds sur la route :",
        rules: [
          "Pas de rétroviseur visible = vous êtes dans l'angle mort",
          "Distance de freinage d'un camion : ~120 m à 90 km/h",
          "Dépassement : 500 m de visibilité, accélérer franchement, rabattement avec 60 m de marge",
          "Ne jamais rester dans l'angle mort latéral d'un camion",
          "Vent latéral : tenir le volant fermement lors du croisement",
          "Tourne-à-droite d'un camion : ne jamais se glisser entre le camion et le trottoir",
        ],
      },
    ],
  },
];

export const lessonsC4: REMCLesson[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // C4 – L1  Alcool, stupéfiants et médicaments
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "c4_l1",
    competence_id: 4,
    chapter: 1,
    title: "Alcool, stupéfiants et médicaments",
    subtitle: "Taux légaux, sanctions, tolérance zéro drogues",
    icon: "🍺",
    readingTime: "8 min",
    sections: [
      {
        type: "intro",
        title: "Alcool et drogues : les causes les plus meurtrières",
        content:
          "L'alcool est impliqué dans près de 30 % des accidents mortels en France. Les stupéfiants dans 23 %. Ensemble, ils représentent la première cause de mortalité routière devant la vitesse. Ces chiffres doivent vous parler : sur 10 morts sur la route, 3 sont directement liés à l'alcool. Comprendre les règles et les effets est une question de survie.",
      },
      {
        type: "rule",
        title: "Les taux légaux d'alcoolémie",
        content:
          "La loi française distingue deux niveaux selon l'expérience du conducteur.",
        rules: [
          "Conducteurs expérimentés (permis depuis plus de 3 ans) : taux légal maximum = 0,5 g/L de sang (0,25 mg/L dans l'air expiré)",
          "Conducteurs novices (permis depuis moins de 3 ans, y compris conduite accompagnée) : taux maximum = 0,2 g/L",
          "Conducteurs professionnels (transport en commun, taxi, VTC, ambulance) : taux maximum = 0,2 g/L",
          "À titre indicatif : un verre standard (bière 25 cl, vin 12 cl, whisky 3 cl) élève l'alcoolémie d'environ 0,20 à 0,25 g/L",
          "L'élimination de l'alcool : environ 0,10 à 0,15 g/L par heure, aucun moyen de l'accélérer",
          "Café, eau, sport n'accélèrent PAS l'élimination de l'alcool",
        ],
        highlight: "0,5 g/L (> 3 ans permis) / 0,2 g/L novices et pros",
      },
      {
        type: "rule",
        title: "Les sanctions pour conduite sous l'emprise de l'alcool",
        content:
          "Les sanctions sont échelonnées selon le taux constaté et la récidive.",
        rules: [
          "Taux entre 0,5 et 0,8 g/L : contravention — 135 € d'amende + 6 points retirés",
          "Taux supérieur à 0,8 g/L : délit — jusqu'à 2 ans d'emprisonnement + 4 500 € d'amende + suspension de permis",
          "Refus de se soumettre aux tests : même sanction qu'un taux > 0,8 g/L",
          "Récidive : jusqu'à 4 ans d'emprisonnement + 9 000 € d'amende + confiscation du véhicule",
          "Accident mortel sous alcool : jusqu'à 10 ans d'emprisonnement",
          "Obligation d'installer un éthylotest anti-démarrage (EAD) en cas de condamnation pour certaines infractions",
        ],
        highlight: "Délit à partir de 0,8 g/L",
      },
      {
        type: "rule",
        title: "Stupéfiants : tolérance zéro",
        content:
          "Pour les stupéfiants, il n'existe pas de seuil légal : toute trace détectée constitue une infraction.",
        rules: [
          "Tolérance zéro : le simple fait d'avoir consommé du cannabis, de la cocaïne, des amphétamines ou autres stupéfiants est une infraction, quel que soit le délai écoulé",
          "Le cannabis peut être détectable jusqu'à 30 jours après consommation",
          "Sanctions : jusqu'à 2 ans d'emprisonnement + 4 500 € d'amende + 6 points retirés",
          "Stupéfiants + alcool : circonstance aggravante — sanctions doublées",
          "Dépistage : tests salivaires ou prise de sang lors des contrôles routiers",
          "En cas d'accident : dépistage systématique obligatoire",
        ],
        highlight: "Tolérance zéro — 6 points retirés",
      },
      {
        type: "warning",
        title: "Les médicaments et la conduite",
        content:
          "Certains médicaments altèrent la conduite aussi sûrement que l'alcool. La méconnaissance n'est pas une défense en cas d'accident.",
        rules: [
          "Pictogramme sur les boîtes : niveau 1 (jaune) = soyez prudent, niveau 2 (orange) = soyez très prudent, niveau 3 (rouge) = ne pas conduire",
          "Niveau 3 rouge : certains somnifères, antihistaminiques, anxiolytiques — interdiction de conduire",
          "Demandez toujours l'avis de votre médecin ou pharmacien avant de prendre le volant",
          "L'association médicament + alcool peut multiplier les effets indésirables",
          "En cas d'accident avec médicament impairable : responsabilité pénale engagée",
        ],
        highlight: "Pictogramme rouge = ne pas conduire",
      },
      {
        type: "tip",
        title: "Conseil du moniteur",
        content:
          "Utilisez systématiquement l'éthylotest avant de prendre le volant si vous avez consommé de l'alcool. Les éthylotests NF sont vendus en pharmacie. La règle la plus simple : si vous avez bu, ne conduisez pas. Désignez à l'avance un conducteur sobre (capitaine de soirée), prenez un taxi ou restez sur place. Un permis coûte cher en temps et en argent : ne le sacrifiez pas pour une soirée.",
      },
      {
        type: "example",
        title: "Calcul : combien de verres avant de conduire ?",
        content:
          "Vous avez bu 3 verres de vin standard à 20h. Alcoolémie estimée : 3 × 0,22 g/L = environ 0,66 g/L. Pour descendre sous 0,5 g/L : vous devez éliminer 0,16 g/L minimum, soit environ 1h à 1h30 (à 0,10 g/L/h). Vous pourriez théoriquement conduire vers 21h30. Mais l'alcoolémie varie selon le poids, le sexe, si vous avez mangé. La prudence s'impose : ne conduisez pas si vous n'êtes pas certain.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Alcool, drogues, médicaments :",
        rules: [
          "Alcool : 0,5 g/L max (> 3 ans de permis), 0,2 g/L novices et pros",
          "Entre 0,5 et 0,8 g/L : contravention 135 € + 6 points",
          "Au-delà de 0,8 g/L : délit pénal",
          "Stupéfiants : tolérance ZÉRO — aucun seuil légal",
          "Médicaments : vérifier le pictogramme sur la boîte",
          "Café et eau n'éliminent pas l'alcool",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C4 – L2  Le téléphone et les distractions
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "c4_l2",
    competence_id: 4,
    chapter: 2,
    title: "Le téléphone et les distractions",
    subtitle: "Règles, sanctions, kit mains-libres et autres distractions",
    icon: "📱",
    readingTime: "6 min",
    sections: [
      {
        type: "intro",
        title: "La distraction : la nouvelle épidémie routière",
        content:
          "Lire un SMS prend en moyenne 5 secondes. À 90 km/h, c'est comme rouler les yeux fermés pendant 125 mètres. La distraction au volant est désormais impliquée dans 1 accident mortel sur 10 en France. Le téléphone en est la principale cause, mais d'autres formes de distraction sont tout aussi dangereuses.",
      },
      {
        type: "rule",
        title: "Le téléphone tenu en main : une infraction grave",
        content:
          "La loi est très claire : tenir son téléphone en main au volant est interdit, que le véhicule soit en mouvement ou à l'arrêt moteur allumé.",
        rules: [
          "Amende : 135 € (forfaitaire) + 3 points retirés",
          "Infraction valable même à l'arrêt (feu rouge, embouteillage) si le moteur tourne",
          "Seule exception : le moteur est coupé ET le véhicule est garé",
          "Le kit mains-libres intégré au véhicule ou l'oreillette Bluetooth sont autorisés",
          "Tenir le téléphone pour regarder une carte GPS est aussi interdit — utilisez un support",
          "En cas d'accident avec téléphone en main : circonstance aggravante — sanctions doublées",
        ],
        highlight: "135 € + 3 points (même à l'arrêt moteur allumé)",
      },
      {
        type: "rule",
        title: "Ce qui est autorisé et ce qui ne l'est pas",
        content:
          "Les règles autour du téléphone méritent d'être détaillées pour éviter les confusions.",
        rules: [
          "AUTORISÉ : kit mains-libres intégré (Bluetooth du véhicule), commandes vocales sans toucher l'écran",
          "AUTORISÉ : oreillette Bluetooth (une seule oreille pour conserver la perception des sons extérieurs)",
          "AUTORISÉ : GPS sur téléphone posé dans un support fixe, préconfiguré avant le départ",
          "INTERDIT : tenir le téléphone même pour regarder l'heure",
          "INTERDIT : casque audio couvrant les deux oreilles — amende 135 € + 3 points",
          "INTERDIT : reconfigurer le GPS en roulant même sur support",
        ],
        highlight: "Support fixe obligatoire pour le GPS",
      },
      {
        type: "warning",
        title: "Les autres formes de distraction",
        content:
          "Le téléphone n'est pas la seule distraction. Tout ce qui détourne votre attention de la route est potentiellement dangereux.",
        rules: [
          "Manger ou boire en conduisant : peut être retenu comme conduite inattentive en cas d'accident",
          "Se maquiller, se raser au volant : même conséquence",
          "Régler la radio, le GPS ou la climatisation en roulant : distraction cognitive prouvée",
          "Passagers : une conversation animée avec des passagers réduit l'attention du conducteur",
          "Enfants à l'arrière : s'arrêter pour gérer un enfant agité plutôt que de se retourner",
          "La distraction visuelle (yeux ailleurs) + cognitive (pensée ailleurs) = risque x 4",
        ],
        highlight: "Distraction = risque x 4",
      },
      {
        type: "tip",
        title: "Conseil du moniteur",
        content:
          "Avant de démarrer, configurez votre GPS, sélectionnez votre musique et mettez votre téléphone en mode Ne pas déranger au volant (disponible sur Android et iOS). Ce mode bloque les notifications et répond automatiquement aux appelants que vous conduisez. Mettez également le téléphone hors de portée visuelle : même un téléphone posé sur le tableau de bord capte l'attention et augmente le temps de réaction.",
      },
      {
        type: "example",
        title: "Situation : message urgent en cours de route",
        content:
          "Vous recevez un message que vous pensez urgent. Que faire ? Résistez à l'envie de regarder : le message peut attendre. Ou mieux : cherchez un endroit pour vous arrêter en sécurité (parking, aire, côté de la route sécurisé), coupez le moteur, lisez et répondez. Reprenez la route. Ce n'est pas perdre du temps : c'est éviter un accident.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Téléphone et distractions :",
        rules: [
          "Téléphone tenu en main : 135 € + 3 points, même à l'arrêt moteur allumé",
          "Casque couvrant les deux oreilles : 135 € + 3 points",
          "Kit mains-libres intégré ou oreillette Bluetooth (une oreille) : autorisés",
          "GPS sur support fixe : autorisé si préconfiguré avant le départ",
          "Lire un SMS à 90 km/h = 125 m les yeux fermés",
          "Mode Ne pas déranger au volant : activer systématiquement",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C4 – L3  La ceinture de sécurité
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "c4_l3",
    competence_id: 4,
    chapter: 3,
    title: "La ceinture de sécurité",
    subtitle: "Obligations pour tous, équipement enfants, sanctions",
    icon: "🔒",
    readingTime: "6 min",
    sections: [
      {
        type: "intro",
        title: "La ceinture : le dispositif qui sauve le plus de vies",
        content:
          "La ceinture de sécurité est le dispositif de protection passive le plus efficace jamais inventé pour la route. En cas de choc, sans ceinture, vous devenez un projectile à la vitesse du véhicule au moment de l'impact. Elle réduit le risque de décès en cas d'accident d'environ 45 %. Sa généralisation en France a sauvé des dizaines de milliers de vies depuis 1973.",
      },
      {
        type: "rule",
        title: "L'obligation de la ceinture : pour TOUS",
        content:
          "Le port de la ceinture est obligatoire pour tous les occupants du véhicule, à tous les sièges, sur toutes les routes.",
        rules: [
          "Conducteur ET tous les passagers : obligation de porter la ceinture",
          "Valable à tous les sièges : avant et arrière",
          "Sur toutes les voies : routes, autoroutes, agglomérations",
          "Le conducteur est responsable du port de ceinture des passagers de moins de 18 ans",
          "Pour les passagers majeurs : chacun est responsable de sa propre ceinture",
          "Exception médicale : sur présentation d'un certificat médical — mais un gilet homologué doit être porté",
        ],
        highlight: "Conducteur responsable pour les -18 ans",
      },
      {
        type: "rule",
        title: "Les sanctions en cas de non-port",
        content:
          "Ne pas porter la ceinture est une infraction sanctionnée par retrait de points.",
        rules: [
          "Conducteur sans ceinture : 135 € d'amende + 3 points retirés",
          "Passager adulte sans ceinture : 135 € d'amende (à sa charge)",
          "Passager mineur sans ceinture : 135 € d'amende à la charge du conducteur + 3 points retirés au conducteur",
          "Un passager qui fait perdre des points au conducteur : c'est une responsabilité à prendre au sérieux",
          "En cas d'accident sans ceinture : la responsabilité du passager ou conducteur peut être retenue pour aggravation des dommages",
        ],
        highlight: "135 € + 3 points",
      },
      {
        type: "rule",
        title: "Les enfants et les dispositifs de retenue",
        content:
          "Les enfants ne peuvent pas utiliser la ceinture adulte seule avant un certain âge et taille. Des dispositifs homologués sont obligatoires.",
        rules: [
          "Jusqu'à 10 ans OU moins de 135 cm : siège auto ou rehausseur homologué obligatoire",
          "Moins de 13 kg : siège dos à la route recommandé (siège avant : airbag à désactiver)",
          "De 9 à 18 kg : siège groupe 1, face à la route",
          "De 15 à 36 kg : rehausseur avec dossier puis rehausseur seul",
          "L'airbag frontal passager DOIT être désactivé si un siège bébé dos à la route est placé côté passager avant",
          "Un enfant correctement attaché à l'arrière est mieux protégé que sur le siège avant",
        ],
        highlight: "< 10 ans ou < 135 cm : siège homologué obligatoire",
      },
      {
        type: "warning",
        title: "Les erreurs fréquentes à éviter",
        content:
          "Certaines mauvaises pratiques réduisent considérablement l'efficacité de la ceinture.",
        rules: [
          "Mettre la bretelle passant sur l'épaule derrière le dos : annule complètement la protection thoracique",
          "Rembourrage ou coussin sous la bretière de la ceinture : interdit, réduit l'efficacité",
          "Ceinture tordue : la bretière doit être parfaitement plate",
          "Laisser la ceinture trop lâche : en cas de choc, le corps se déplace trop avant l'arrêt",
          "Femme enceinte : la sangle abdominale passe sous le ventre (sur les hanches, pas sur le ventre) — ne pas supprimer la ceinture",
          "Gros manteau épais sous la ceinture : la ceinture doit comprimer le corps, pas l'épaisse couche de tissu",
        ],
        highlight: "Bretelle derrière le dos = protection nulle",
      },
      {
        type: "tip",
        title: "Conseil du moniteur",
        content:
          "Prenez l'habitude de boucler votre ceinture avant même de démarrer le moteur. C'est un réflexe à acquérir dès les premières leçons. Vérifiez également que tous vos passagers sont attachés avant de partir. En cas d'accident, une fraction de seconde peut faire la différence entre la vie et la mort.",
      },
      {
        type: "example",
        title: "Situation : passager qui refuse de mettre sa ceinture",
        content:
          "Votre ami (adulte) s'installe à l'arrière et refuse de mettre sa ceinture. Que faites-vous ? Expliquez-lui que s'il devient un projectile en cas d'accident, il peut vous tuer en vous percutant par l'arrière. Une personne de 70 kg sans ceinture à 50 km/h exerce une force de 2 tonnes lors d'un choc. Ne démarrez pas tant que tout le monde n'est pas attaché.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Ceinture de sécurité :",
        rules: [
          "Obligatoire pour tous les occupants, à tous les sièges, sur toutes les routes",
          "Conducteur responsable des -18 ans : 135 € + 3 points si non attachés",
          "Enfants < 10 ans ou < 135 cm : siège homologué obligatoire",
          "Airbag passager avant à désactiver avec siège bébé dos à la route",
          "Bretelle derrière le dos = aucune protection thoracique",
          "Femme enceinte : sangle sous le ventre, jamais supprimée",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C4 – L4  Accident et premiers secours — PAS
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "c4_l4",
    competence_id: 4,
    chapter: 4,
    title: "Accident et premiers secours — PAS",
    subtitle: "Protéger, Alerter, Secourir — les numéros d'urgence",
    icon: "🚨",
    readingTime: "7 min",
    sections: [
      {
        type: "intro",
        title: "En cas d'accident : la méthode PAS",
        content:
          "Face à un accident de la route, les premières minutes sont décisives. Les gestes des témoins et des premières personnes arrivées sur les lieux peuvent faire la différence entre la vie et la mort. La méthode PAS — Protéger, Alerter, Secourir — est la procédure standard apprise à tous les secouristes et que chaque conducteur doit maîtriser.",
      },
      {
        type: "rule",
        title: "P — Protéger",
        content:
          "Avant tout geste, il faut sécuriser la zone pour éviter un sur-accident. Un accident sur autoroute attire souvent un second accident.",
        rules: [
          "Garer votre véhicule hors de la chaussée ou au moins le plus à droite possible",
          "Couper le moteur de votre véhicule",
          "Allumer les feux de détresse",
          "Mettre votre gilet fluorescent AVANT de descendre du véhicule",
          "Baliser la zone : placer le triangle de présignalisation à au moins 30 m en amont (200 m sur autoroute si possible)",
          "Ne pas fumer à proximité d'un véhicule accidenté (risque d'incendie)",
          "Ne pas déplacer les victimes sauf danger immédiat (incendie, noyade) — risque d'aggraver une blessure vertébrale",
        ],
        highlight: "Triangle à 30 m minimum en amont",
      },
      {
        type: "rule",
        title: "A — Alerter",
        content:
          "Appeler les secours rapidement permet de réduire le délai d'intervention. Chaque minute compte en cas d'arrêt cardiaque.",
        rules: [
          "15 — SAMU : urgences médicales, blessés graves",
          "17 — Police / Gendarmerie : sécurité, accident, troubles",
          "18 — Sapeurs-Pompiers : incendie, accident, secours",
          "112 — Numéro d'urgence européen : fonctionne dans toute l'Europe, même sans réseau opérateur, gratuit",
          "114 — Urgences pour personnes malentendantes (SMS / visio)",
          "Informations à donner : lieu précis, nature de l'accident, nombre de victimes, état des blessés, vos coordonnées",
          "Ne jamais raccrocher en premier : suivre les instructions du régulateur",
        ],
        highlight: "15 / 17 / 18 / 112",
      },
      {
        type: "rule",
        title: "S — Secourir",
        content:
          "Secourir ne signifie pas médicaliser. Vos gestes doivent se limiter à ce que vous maîtrisez, sauf si vous avez une formation de secouriste (PSC1).",
        rules: [
          "Victime consciente : lui parler, la rassurer, ne pas la déplacer, garder la chaleur (couverture de survie)",
          "Victime inconsciente qui respire : position latérale de sécurité (PLS) si possible sans aggraver une blessure",
          "Victime inconsciente qui ne respire plus : commencer le massage cardiaque (30 compressions / 2 insufflations) si formé",
          "Utiliser un défibrillateur automatisé (DAE) si disponible — il guide vocalement",
          "Hémorragie : compression directe et ferme sur la plaie avec un tissu propre",
          "Ne jamais retirer un casque de moto sauf si la victime ne respire plus (risque de lésion cervicale)",
          "En cas de brûlures : refroidir à l'eau à température ambiante pendant 15 minutes minimum",
        ],
        highlight: "PLS si inconscient et respirant",
      },
      {
        type: "warning",
        title: "Ce qu'il ne faut PAS faire",
        content:
          "Certains réflexes naturels peuvent aggraver la situation d'une victime.",
        rules: [
          "Ne pas déplacer une victime sauf danger immédiat",
          "Ne pas donner à boire à une victime (risque de vomissement et d'inhalation)",
          "Ne pas retirer un corps étranger planté dans une plaie — le laisser en place et comprimer autour",
          "Ne pas se précipiter sans avoir balisé la zone — vous risquez de devenir une victime vous-même",
          "Ne pas laisser une victime inconsciente sur le dos — risque de suffoquer sur sa propre langue",
          "Ne pas abandonner les lieux après un accident impliquant votre véhicule — c'est un délit de fuite (2 ans + 75 000 €)",
        ],
        highlight: "Ne pas déplacer une victime",
      },
      {
        type: "tip",
        title: "Conseil du moniteur",
        content:
          "Passez le PSC1 (Prévention et Secours Civiques de niveau 1). Cette formation de 7 heures vous apprend le massage cardiaque, la PLS, l'utilisation du défibrillateur et la gestion des hémorragies. Elle coûte généralement 30 à 50 € et peut sauver la vie d'un proche ou d'un inconnu. Les défibrillateurs sont désormais présents dans de nombreux lieux publics et sont utilisables par tout le monde sans formation.",
      },
      {
        type: "example",
        title: "Situation : vous arrivez premier sur un accident",
        content:
          "Vous arrivez sur une route nationale où un véhicule a percuté un arbre. Procédure : 1) Garez-vous à distance, mettez les feux de détresse, enfilez le gilet. 2) Posez le triangle à 30 m derrière l'accident. 3) Appelez le 15 ou le 112, donnez la localisation précise. 4) Approchez du véhicule : parlez à la victime, évaluez sa conscience et sa respiration. Si inconsciente et respirant : PLS. Si inconsciente et ne respirant plus : massage cardiaque. 5) Restez auprès des victimes jusqu'à l'arrivée des secours.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Accident — méthode PAS :",
        rules: [
          "P — Protéger : triangle à 30 m minimum, gilet avant de sortir, ne pas fumer",
          "A — Alerter : 15 (SAMU), 17 (Police), 18 (Pompiers), 112 (Europe)",
          "S — Secourir : PLS si inconscient respirant, massage cardiaque si non respirant",
          "Ne pas déplacer une victime sauf danger immédiat",
          "Ne pas donner à boire à une victime",
          "Délit de fuite : 2 ans d'emprisonnement + 75 000 €",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C4 – L5  Éco-conduite et conduite économique
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "c4_l5",
    competence_id: 4,
    chapter: 5,
    title: "Éco-conduite et conduite économique",
    subtitle: "Régimes optimaux, anticipation, économies réelles",
    icon: "🌱",
    readingTime: "6 min",
    sections: [
      {
        type: "intro",
        title: "L'éco-conduite : conduire mieux pour dépenser moins",
        content:
          "L'éco-conduite est une philosophie de conduite qui vise à réduire la consommation de carburant, les émissions de CO2 et l'usure du véhicule. En appliquant ses principes, un conducteur peut réduire sa consommation de 15 à 25 % sans perdre de temps de manière significative. C'est aussi une conduite plus fluide, moins stressante et plus sécurisante.",
      },
      {
        type: "rule",
        title: "Les régimes moteur optimaux",
        content:
          "Le moteur à essence et le moteur diesel n'ont pas les mêmes plages de régimes optimaux. Rouler au bon régime est la clé.",
        rules: [
          "Moteur essence : passer les vitesses entre 2 000 et 2 500 tr/min",
          "Moteur diesel : passer les vitesses entre 1 500 et 2 000 tr/min",
          "Passer le plus rapidement possible en vitesse supérieure : 2e à partir de 20 km/h, 3e à 30 km/h, 4e à 40 km/h, 5e à 50 km/h",
          "En décélération : débrayer le plus tard possible et laisser le frein moteur agir — en vitesse engagée, la consommation tombe à zéro",
          "Éviter les régimes élevés prolongés : au-dessus de 3 000 tr/min, la consommation augmente exponentiellement",
          "Boîte automatique : le mode éco ou D avec accélération douce est plus économique que le mode sport",
        ],
        highlight: "2 000-2 500 tr/min (essence) / 1 500-2 000 (diesel)",
      },
      {
        type: "rule",
        title: "L'anticipation : le geste le plus économique",
        content:
          "Anticiper les ralentissements et les arrêts évite les freinages brusques qui gaspillent l'énergie cinétique du véhicule.",
        rules: [
          "Regarder loin devant : anticiper les feux, les ronds-points, les ralentissements",
          "Lever le pied de l'accélérateur tôt et laisser le véhicule décélérer en frein moteur",
          "Un freinage évité = de l'énergie et du carburant économisés",
          "Maintenir une vitesse stable sur autoroute plutôt que des accélérations/freinages répétés",
          "Sur les descentes légères : laisser le véhicule rouler en frein moteur plutôt qu'accélérer",
          "Le régulateur de vitesse sur autoroute peut réduire la consommation de 5 à 10 %",
        ],
        highlight: "Anticiper = énergie économisée",
      },
      {
        type: "rule",
        title: "Les autres bonnes pratiques d'éco-conduite",
        content:
          "L'éco-conduite ne se limite pas aux gestes au volant. L'entretien du véhicule joue un rôle majeur.",
        rules: [
          "Pression des pneus : un pneu sous-gonflé de 0,5 bar augmente la consommation de 2 %. Vérifier chaque mois",
          "Climatisation : augmente la consommation de 5 à 20 % selon la vitesse. Préférer la ventilation naturelle en dessous de 80 km/h",
          "Charge du véhicule : 100 kg de poids supplémentaire = 0,5 L/100 km de plus. Vider le coffre des objets inutiles",
          "Galerie de toit et coffre de toit : augmentent la traînée aérodynamique de 15 à 30 %. Les retirer quand inutilisés",
          "Arrêt moteur en stationnement : inutile de laisser tourner le moteur à l'arrêt plus de 30 secondes",
          "Démarrage : pas besoin de chauffer un moteur moderne. Partir doucement dès le démarrage suffit",
        ],
        highlight: "Pneus + climatisation + poids = 3 leviers clés",
      },
      {
        type: "tip",
        title: "Conseil du moniteur",
        content:
          "L'éco-conduite s'apprend et s'entretient. Regardez régulièrement l'affichage de la consommation instantanée si votre véhicule en est équipé : c'est un retour immédiat sur votre conduite. Lors de vos leçons, votre moniteur vous fera travailler l'anticipation et les passages de vitesse optimaux. Ces mêmes gestes rendent aussi la conduite plus douce et plus confortable pour vos passagers.",
      },
      {
        type: "example",
        title: "Exemple concret d'économies",
        content:
          "Un conducteur faisant 15 000 km/an consommant en moyenne 7 L/100 km dépense environ 1 575 € de carburant à 1,50 €/L. En adoptant l'éco-conduite et réduisant sa consommation à 6 L/100 km, il économise 225 € par an. Sur 5 ans, c'est 1 125 € d'économie, sans compter la réduction de l'usure des freins et des pneus. L'éco-conduite est un investissement nul pour un retour permanent.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Éco-conduite :",
        rules: [
          "Passer les vitesses tôt : 2e à 20 km/h, 5e à 50 km/h",
          "Régime optimal : 2 000-2 500 tr/min (essence), 1 500-2 000 (diesel)",
          "Anticiper les ralentissements = frein moteur = zéro consommation",
          "Pression des pneus : vérifier mensuellement",
          "Climatisation : couper en dessous de 80 km/h si possible",
          "Économie potentielle : 15-25 % de carburant selon les habitudes",
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C4 – L6  Le permis à points
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "c4_l6",
    competence_id: 4,
    chapter: 6,
    title: "Le permis à points",
    subtitle: "Fonctionnement, infractions, récupération, stage volontaire",
    icon: "⭐",
    readingTime: "7 min",
    sections: [
      {
        type: "intro",
        title: "Le permis à points : un capital à préserver",
        content:
          "Instauré en France en 1992, le permis à points est un système de bonus/malus qui vise à responsabiliser les conducteurs. Vous ne pouvez que perdre des points — vous ne pouvez pas en gagner plus que le capital maximum. L'objectif est simple : les conducteurs dangereux perdent progressivement leur droit à conduire.",
      },
      {
        type: "rule",
        title: "Le capital de points",
        content:
          "Le nombre de points dont vous disposez dépend de votre ancienneté de permis.",
        rules: [
          "Permis obtenu : vous débutez avec 6 points (permis probatoire)",
          "Chaque année sans infraction entraînant une perte de points : gain de 2 points",
          "Capital maximum : 12 points, atteint après 3 ans sans infraction",
          "Conducteurs en conduite accompagnée (AAC) : gain de 3 pts/an — capital de 12 pts atteint en 2 ans",
          "Perte totale de points (0 point) : permis invalidé — obligation de repasser l'examen complet",
          "Notification par lettre recommandée à chaque retrait de points",
        ],
        highlight: "6 points (novice) → 12 points (après 3 ans)",
      },
      {
        type: "rule",
        title: "Récupération des points",
        content:
          "Les points perdus peuvent être récupérés par le temps ou par un stage volontaire.",
        rules: [
          "Récupération automatique : 1 point récupéré par année complète sans infraction",
          "Récupération totale automatique : si vous ne commettez aucune infraction pendant 10 ans — remise à 12 points",
          "Stage volontaire de sensibilisation à la sécurité routière : récupérer jusqu'à 4 points (2 par jour de stage sur 2 jours), maximum 1 stage tous les 2 ans",
          "Coût d'un stage : entre 200 € et 250 € en moyenne",
          "Conditions : avoir au moins 3 points, ne pas être en procédure de suspension ou annulation, ne pas avoir fait un stage il y a moins de 2 ans",
          "Le stage ne remet pas le capital à 12 points : il ajoute 4 points sans dépasser le maximum de 12",
        ],
        highlight: "Stage volontaire = +4 points (max, 1 fois/2 ans)",
      },
      {
        type: "rule",
        title: "Les principales infractions et leurs retraits de points",
        content:
          "Connaître le coût en points de chaque infraction permet de prendre conscience des risques.",
        rules: [
          "Excès de vitesse < 20 km/h (hors agglomération) : 1 point",
          "Excès de vitesse entre 20 et 30 km/h : 2 points",
          "Excès de vitesse entre 30 et 40 km/h : 3 points",
          "Excès de vitesse entre 40 et 50 km/h : 4 points + suspension possible",
          "Excès de vitesse >= 50 km/h : 6 points + suspension obligatoire",
          "Alcool entre 0,5 et 0,8 g/L : 6 points",
          "Alcool > 0,8 g/L : 6 points + annulation possible",
          "Usage du téléphone tenu en main : 3 points",
          "Non-respect d'un feu rouge ou stop : 4 points",
          "Non-port de ceinture : 3 points",
          "Dépassement dangereux : 3 points",
          "Non-respect d'un passage piéton : 6 points",
        ],
        highlight: "Alcool + excès >= 50 km/h = 6 points chacun",
      },
      {
        type: "warning",
        title: "L'invalidation du permis",
        content:
          "Arriver à zéro point entraîne l'invalidation du permis. Les conséquences sont lourdes.",
        rules: [
          "Notification par lettre recommandée : vous avez 10 jours pour remettre votre permis à la préfecture",
          "Interdiction de conduire dès réception de la lettre",
          "Délai d'attente avant de repasser le permis : 6 mois minimum (1 an si récidive dans les 5 ans)",
          "Obligation de repasser le code ET la conduite intégralement",
          "Le nouveau permis est délivré avec 6 points (nouveau permis probatoire)",
          "Conduire malgré l'invalidation : délit pénal — 2 ans d'emprisonnement + 4 500 €",
        ],
        highlight: "0 point = repasser code + conduite",
      },
      {
        type: "tip",
        title: "Conseil du moniteur",
        content:
          "Vous pouvez consulter votre solde de points à tout moment sur le site Télépoints (telepoints.interieur.gouv.fr) via FranceConnect. Cette démarche est gratuite. Pensez à faire un stage volontaire dès que vous êtes à moins de 8 points pour récupérer des points avant d'être dans une situation critique. N'attendez pas d'être à 1 ou 2 points.",
      },
      {
        type: "example",
        title: "Cas concret : un conducteur novice en difficulté",
        content:
          "Marc obtient son permis en janvier avec 6 points. En mars, il est contrôlé à 55 km/h en agglomération (50 km/h) : 1 point retiré, il reste à 5 points. En juin, il grille un feu rouge : 4 points retirés, il est à 1 point. En septembre, il est contrôlé avec son téléphone en main : 3 points de retrait — son capital tombe à 0. Son permis est invalidé. Il doit attendre 6 mois et repasser le code et la conduite. En moins d'un an, son permis est annulé par trois infractions.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Le permis à points :",
        rules: [
          "Départ : 6 points (novice) — maximum : 12 points après 3 ans",
          "Récupération : 1 point/an sans infraction (2 points/an en AAC)",
          "Stage volontaire : +4 points maximum, 1 fois tous les 2 ans, environ 200 €",
          "0 point = invalidation + obligation de repasser code ET conduite",
          "Infractions les plus coûteuses : alcool > 0,5, excès >= 50 km/h, passage piéton = 6 points chacun",
          "Solde consultable gratuitement sur Télépoints (FranceConnect)",
        ],
      },
    ],
  },
];
