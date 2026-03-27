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
    readingTime: "10 min",
    sections: [
      {
        type: "intro",
        title: "Pourquoi l'autoroute mérite une leçon à part entière ?",
        content:
          "L'autoroute est statistiquement la route la plus sûre par kilomètre parcouru (environ 2 fois moins mortelle que la route nationale), mais les accidents qui s'y produisent sont presque toujours très graves en raison des vitesses élevées. À 130 km/h, la distance de freinage totale dépasse 135 mètres : une fraction de seconde d'inattention peut devenir irréversible. Ce chapitre détaille les règles spécifiques à l'autoroute et les techniques concrètes que votre moniteur vous expliquera lors de votre première leçon.",
      },
      {
        type: "rule",
        title: "Les vitesses maximales autorisées",
        content:
          "La vitesse sur autoroute n'est pas fixe : elle dépend des conditions météorologiques, de l'ancienneté du permis et de la visibilité. Ces limites sont définies par le Code de la route et leur non-respect est sévèrement sanctionné.",
        rules: [
          "130 km/h — chaussée sèche, conducteur expérimenté (permis > 3 ans)",
          "110 km/h — pluie, chaussée mouillée ou conducteur en période probatoire (permis < 3 ans)",
          "50 km/h — visibilité inférieure à 50 mètres (brouillard dense, neige épaisse) : cette limite prime sur tout",
          "Sur voie rapide (2×2 voies hors autoroute sans péage) : 110 km/h par temps sec, 100 km/h sous la pluie",
          "Excès de vitesse >= 50 km/h au-dessus de la limite : délit pénal, 6 points, suspension immédiate",
          "Radar tronçon sur autoroute : calcule la vitesse moyenne entre deux points — impossible de freiner avant le radar",
        ],
        highlight: "130 / 110 / 50 km/h selon les conditions",
      },
      {
        type: "rule",
        title: "Protocole d'insertion sur autoroute : étape par étape",
        content:
          "L'insertion sur autoroute est la manœuvre la plus stressante pour un débutant. La maîtriser repose sur un protocole précis que votre moniteur vous fera répéter jusqu'à ce qu'il devienne automatique.",
        rules: [
          "Étape 1 — Observation dès le début de la bretelle : regarder dans le rétroviseur gauche et identifier les véhicules sur la voie de droite",
          "Étape 2 — Accélération progressive : atteindre 100-120 km/h sur la bretelle avant de rejoindre la voie de circulation",
          "Étape 3 — Clignotant gauche activé dès que l'intention d'insérer est formée",
          "Étape 4 — Vérification angle mort gauche juste avant de déporter le volant",
          "Étape 5 — S'insérer dans un espace suffisant sans forcer le passage ; céder le passage aux véhicules déjà sur l'autoroute",
          "Étape 6 — Ne JAMAIS s'arrêter en bout de bretelle sauf impossibilité absolue : vous devenez un obstacle invisible",
          "Erreur fatale à éviter : s'insérer à 70 km/h alors que le trafic roule à 130 km/h — différentiel de vitesse dangereux",
        ],
        highlight: "Accélérer à 100-120 km/h AVANT de s'insérer",
      },
      {
        type: "rule",
        title: "Quitter l'autoroute : le protocole de sortie",
        content:
          "La bretelle de sortie est une voie de décélération. Elle sert à ralentir APRÈS avoir quitté la voie de droite, et non avant.",
        rules: [
          "Anticiper la sortie : regarder les panneaux de pré-signalisation (3 km, 2 km, 1 km avant la sortie)",
          "Se rabattre sur la voie de droite suffisamment tôt, clignotant activé",
          "Ne freiner qu'une fois la bretelle de sortie engagée, pas sur la voie de circulation principale",
          "Erreur classique : ralentir brusquement sur la voie principale en approchant de la sortie — risque de collision par l'arrière",
          "Après l'autoroute, les vitesses paraissent plus lentes qu'elles ne sont : surveiller attentivement le compteur",
          "Première intersection après autoroute : vigilance maximale — la vitesse ressentie est faussée",
        ],
        highlight: "Décélérer sur la bretelle de sortie, pas avant",
      },
      {
        type: "rule",
        title: "Les distances de sécurité : la physique des grands nombres",
        content:
          "À grande vitesse, la distance de freinage n'augmente pas de façon linéaire mais de façon exponentielle (proportionnelle au carré de la vitesse). C'est pourquoi une légère augmentation de vitesse a des conséquences dramatiques sur la distance nécessaire pour s'arrêter.",
        rules: [
          "Règle des 2 secondes : laisser au moins 2 secondes de distance avec le véhicule devant (chronométrer avec un repère fixe)",
          "À 130 km/h, 2 secondes = 72 mètres — soit 2 grands pointillés blancs au sol",
          "À 130 km/h sec : distance de freinage d'urgence environ 135 m + temps de réaction 36 m = 171 m au total",
          "Par temps de pluie, doubler la distance : appliquer la règle des 4 secondes",
          "Les marquages au sol délimitent des zones de 50 m : ne jamais se trouver à moins d'une zone de distance",
          "Sanction distance insuffisante : 135 € + 3 points si distance < 50 m à vitesse > 130 km/h",
        ],
        highlight: "2 secondes minimum (4 sous la pluie)",
      },
      {
        type: "warning",
        title: "La bande d'arrêt d'urgence (BAU) : protocole de panne",
        content:
          "La BAU est strictement réservée aux arrêts forcés et aux services de secours. Statistiquement, les accidents impliquant des véhicules arrêtés sur BAU sont souvent mortels car les vitesses des véhicules en circulation sont élevées. Un protocole strict s'applique.",
        rules: [
          "Dès les premiers signes de problème : allumer les feux de détresse, se déporter progressivement sur la BAU",
          "Mettre le gilet de haute visibilité AVANT de sortir du véhicule (il doit toujours être dans l'habitacle, jamais dans le coffre)",
          "Sortir du côté de la glissière de sécurité (côté droit), jamais côté voies de circulation",
          "Placer le triangle de présignalisation à au moins 30 m en amont — ou utiliser les feux de détresse si impossibilité de poser le triangle en sécurité",
          "Appeler le 15, 17, 18 ou 112 — bornes d'appel d'urgence orange tous les 2 km sur autoroute",
          "Ne jamais traverser les voies de circulation à pied pour rejoindre le terre-plein central",
          "Amende pour stationnement abusif sur BAU (arrêt non justifié) : 135 € + 3 points",
        ],
        highlight: "Gilet AVANT de sortir — côté glissière uniquement",
      },
      {
        type: "rule",
        title: "La circulation dans les tunnels",
        content:
          "Les tunnels concentrent des risques spécifiques : manque d'oxygène en cas d'incendie, panique, absence d'issue latérale. Les accidents de tunnel sont souvent catastrophiques car les victimes se trouvent dans un espace confiné.",
        rules: [
          "Allumer les feux de croisement dès l'entrée dans le tunnel (obligatoire même en plein jour)",
          "Augmenter la distance de sécurité à 150 m minimum — un incendie se propage rapidement dans un tunnel",
          "Interdiction absolue de faire demi-tour ou de reculer dans un tunnel, quelle que soit la situation",
          "En cas d'incendie : s'arrêter immédiatement, couper le moteur, laisser les clés sur le contact (pour faciliter l'évacuation du véhicule par les secours), rejoindre la sortie de secours à pied",
          "Désactiver la climatisation à recycling d'air en cas de fumée détectée",
          "Respecter les limitations affichées : souvent 70 ou 90 km/h dans les tunnels longs",
        ],
        highlight: "Feux de croisement obligatoires — clés sur le contact en cas d'incendie",
      },
      {
        type: "rule",
        title: "Les voies et le principe de la voie de droite",
        content:
          "Sur autoroute à 3 voies ou plus, la discipline de circulation est essentielle pour maintenir un trafic fluide et sécurisé.",
        rules: [
          "Principe fondamental : circuler sur la voie la plus à droite disponible (obligation légale en France)",
          "La voie du milieu et la voie de gauche sont des voies de dépassement, pas des voies de circulation permanente",
          "Rester sur la voie de gauche sans dépasser est une infraction : 135 € + 3 points",
          "Dépasser par la droite est interdit sur autoroute française (sauf en cas d'embouteillage circulant lentement)",
          "Signaler tout changement de voie avec le clignotant et vérification des angles morts",
          "Fermeture de voie (balisage orange) : se rabattre tôt et en douceur, faciliter la fermeture en accordéon",
        ],
        highlight: "Voie de droite = voie normale. Gauche = dépassement uniquement",
      },
      {
        type: "tip",
        title: "Conseils de moniteur : les pièges de l'autoroute",
        content:
          "Trois phénomènes spécifiques à l'autoroute piègent régulièrement les conducteurs novices. Premier piège : la vitesse se banalise. Après 1 heure à 130 km/h, 100 km/h paraît lent — restez vigilant sur le compteur. Deuxième piège : la monotonie endort. La somnolence est responsable de 1 accident mortel sur 3 sur autoroute. Pause de 15 minutes toutes les 2 heures minimum. Troisième piège : les travaux. Les zones de travaux réduisent les voies et abaissent les limites — respectez scrupuleusement les vitesses affichées, elles sont doublées en infraction en zone de travaux.",
      },
      {
        type: "example",
        title: "Situation type : insertion sur autoroute chargée",
        content:
          "Vous arrivez sur la bretelle d'accès. Le trafic circule à 120 km/h sur la voie de droite avec des espaces de 3-4 secondes entre les véhicules. Protocole : accélérez jusqu'à 110-115 km/h sur la bretelle, clignotant gauche activé, rétroviseur puis angle mort gauche vérifiés. Identifiez un espace entre deux véhicules et adaptez votre vitesse pour vous y glisser. Insérez-vous sans forcer. Si l'espace est trop court, ralentissez légèrement pour attendre le suivant. Une fois inséré, accélérez progressivement pour atteindre 130 km/h et rejoignez la vitesse du flux.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Les points clés de l'autoroute :",
        rules: [
          "130 km/h sec | 110 km/h pluie ou probatoire | 50 km/h visibilité < 50 m",
          "Insertion : accélérer à 100-120 km/h sur la bretelle avant de s'insérer",
          "Sortie : décélérer sur la bretelle de sortie uniquement",
          "Distance : 2 secondes minimum (4 sous la pluie) — environ 72 m à 130 km/h",
          "BAU : gilet avant de sortir, côté glissière, triangle à 30 m",
          "Tunnel : feux de croisement obligatoires, 150 m de distance, clés sur le contact en cas d'incendie",
          "Voie de droite par défaut — voie gauche = dépassement uniquement",
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
    readingTime: "9 min",
    sections: [
      {
        type: "intro",
        title: "La pluie : un danger sous-estimé par les conducteurs",
        content:
          "La pluie est la première cause d'accidents météorologiques en France. Elle réduit la visibilité, allonge considérablement les distances de freinage et peut provoquer un phénomène redouté : l'aquaplaning. Pourtant, la majorité des conducteurs ne réduisent pas suffisamment leur vitesse sous la pluie. Ce chapitre explique les mécanismes physiques en jeu et les bonnes pratiques indispensables.",
      },
      {
        type: "rule",
        title: "Les vitesses légales sous la pluie",
        content:
          "Le Code de la route impose des vitesses réduites dès que la chaussée est mouillée, indépendamment du fait qu'il pleuve au moment du contrôle.",
        rules: [
          "Autoroute : 130 → 110 km/h dès que la chaussée est mouillée",
          "Route nationale (2×2 voies sans séparateur central) : 110 → 100 km/h",
          "Route hors agglomération : 80 km/h (inchangé, mais la prudence s'impose plus que jamais)",
          "Agglomération : 50 km/h (inchangé réglementairement, mais distance de freinage doublée)",
          "Visibilité inférieure à 50 m (pluie battante, brouillard) : 50 km/h sur tous les réseaux sans exception",
          "Sanction : mêmes amendes que les excès de vitesse standard sur la base de la limite réduite",
        ],
        highlight: "Autoroute : 130 → 110 km/h dès chaussée mouillée",
      },
      {
        type: "rule",
        title: "Physique du freinage sous la pluie",
        content:
          "L'eau forme un film lubrifiant entre le pneu et la chaussée, réduisant drastiquement le coefficient de friction. La distance de freinage est multipliée par 1,5 à 2 par rapport au sec. Ces chiffres sont à mémoriser.",
        rules: [
          "À 50 km/h sec : distance de freinage environ 25 m — sous la pluie : environ 38 m (+52 %)",
          "À 80 km/h sec : environ 50 m — sous la pluie : environ 75 à 90 m",
          "À 110 km/h sec : environ 100 m — sous la pluie : environ 150 à 165 m",
          "À 130 km/h sec : environ 135 m — sous la pluie : environ 200 m",
          "Pneus usés (sculpture < 2 mm) : la distance de freinage sur mouillé peut être allongée de 6 à 9 mètres supplémentaires",
          "Appliquer systématiquement la règle des 4 secondes de distance de sécurité sous la pluie",
        ],
        highlight: "Distance de freinage × 1,5 à 2 sous la pluie",
      },
      {
        type: "rule",
        title: "Technique de conduite adaptée à la pluie",
        content:
          "Adapter sa conduite sous la pluie ne se limite pas à réduire la vitesse. Chaque geste au volant doit être plus progressif et anticipé.",
        rules: [
          "Freinage : toujours progressif, en ligne droite si possible, avant d'aborder les virages",
          "Désactiver le régulateur de vitesse sur chaussée mouillée : le système peut mal réagir à une perte d'adhérence",
          "Accélération : progressive à la sortie des virages pour éviter de faire patiner les roues motrices",
          "Rouler dans les traces des véhicules précédents : l'eau a déjà été partiellement dispersée",
          "Éviter les flaques et ornières : ralentir avant de les traverser",
          "En début de pluie après longue période sèche : les dépôts d'huile et de poussière remontent — chaussée encore plus glissante pendant 5 à 15 minutes",
        ],
        highlight: "Tout geste plus progressif — régulateur désactivé",
      },
      {
        type: "rule",
        title: "Les feux à utiliser sous la pluie : règles précises",
        content:
          "L'utilisation des feux en cas de mauvaise visibilité est strictement réglementée. Plusieurs erreurs courantes exposent à des amendes et mettent en danger les autres conducteurs.",
        rules: [
          "Feux de croisement (codes) : obligatoires dès que la visibilité est insuffisante sous la pluie",
          "Feux de brouillard ARRIÈRE (rouge) : autorisés uniquement si visibilité inférieure à 50 m — interdit en simple pluie",
          "Feux de brouillard AVANT : autorisés si visibilité insuffisante, mais pas obligatoires — leur usage abusif gêne les autres",
          "Feux de détresse : UNIQUEMENT à l'arrêt ou danger immédiat — les utiliser en roulant masque vos clignotants et est interdit",
          "Usage abusif des feux antibrouillard : amende forfaitaire 135 €",
          "Utiliser les feux de détresse en roulant sous la pluie : erreur fréquente et dangereuse — 135 € d'amende",
        ],
        highlight: "Feux de détresse = arrêt uniquement",
      },
      {
        type: "warning",
        title: "L'aquaplaning : physique et protocole de réaction",
        content:
          "L'aquaplaning est un phénomène physique précis : lorsque la quantité d'eau sous le pneu est telle que les rainures ne peuvent plus l'évacuer, la pression de l'eau soulève le pneu et supprime tout contact avec la chaussée. Le véhicule flotte littéralement sur une lame d'eau. C'est l'un des phénomènes les plus soudains et dangereux de la conduite.",
        rules: [
          "Physique : à 80 km/h, des pneus neufs évacuent jusqu'à 30 litres d'eau par seconde — en dessous de 50 km/h, le risque est quasi nul",
          "Risque significatif à partir de 80 km/h ; au-dessus de cette vitesse, la capacité d'évacuation des pneus peut être dépassée",
          "Signes précurseurs : la direction devient anormalement légère, le bruit de roulement disparaît, le régime moteur peut monter (roues motrices qui dérapent)",
          "Protocole de réaction (dans l'ordre strict) : (1) relâcher DOUCEMENT l'accélérateur — ne surtout pas freiner ni braquer brutalement",
          "(2) Garder le volant dans la direction souhaitée sans le bouger brutalement",
          "(3) Laisser le véhicule ralentir naturellement jusqu'à retrouver l'adhérence — l'épisode dure généralement quelques secondes",
          "Freinage brusque pendant l'aquaplaning : bloque les roues, aggrave dramatiquement la perte de contrôle, risque de tête-à-queue",
          "Prévention n°1 : pneus avec sculpture > 3 mm (minimum légal 1,6 mm mais insuffisant sur mouillé) ; pneus bien gonflés",
        ],
        highlight: "Aquaplaning : relâcher accélérateur — ne jamais freiner ni braquer brutalement",
      },
      {
        type: "tip",
        title: "Conseils de moniteur : les erreurs qui tuent sous la pluie",
        content:
          "Trois erreurs classiques causent la majorité des accidents sous la pluie. Première erreur : maintenir la vitesse en se disant 'j'ai des bons pneus'. Les pneus neufs ne font que réduire le risque — ils ne l'éliminent pas. Deuxième erreur : utiliser les feux de détresse en roulant. Cela vous rend moins visible (clignotants masqués) et vous expose à une amende. Troisième erreur : paniquer lors d'un aquaplaning et freiner brusquement. Entraînez-vous mentalement à la réaction correcte : relâcher l'accélérateur, volant droit, attendre. Vérifiez aussi régulièrement vos essuie-glaces : des balais usés ou encrassés réduisent la visibilité de façon critique.",
      },
      {
        type: "example",
        title: "Situation type : aquaplaning à 90 km/h sur autoroute",
        content:
          "Vous traversez une zone d'accumulation d'eau sur l'autoroute à 90 km/h. Soudain la direction devient étrangement légère, le bruit de roulement cesse et vous sentez le véhicule 'dériver'. Protocole immédiat : pied droit qui lève DOUCEMENT l'accélérateur (ne pas freiner). Mains qui maintiennent le volant stable dans votre direction de circulation. Corps qui reste décontracté pour ne pas transmettre de tremblements au volant. En 2 à 4 secondes, la vitesse baisse, les pneus retrouvent le bitume, la direction redevient normale. Vous pouvez alors reprendre le contrôle progressivement.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Conduite sous la pluie en résumé :",
        rules: [
          "Autoroute : 110 km/h max dès que la chaussée est mouillée",
          "Distance de freinage multipliée par 1,5 à 2 — règle des 4 secondes",
          "Feux antibrouillard arrière uniquement si visibilité < 50 m — pas pour la pluie simple",
          "Feux de détresse : uniquement à l'arrêt — jamais en roulant",
          "Aquaplaning : relâcher l'accélérateur, volant droit, ne jamais freiner brusquement",
          "Pneus avec sculpture > 3 mm : première protection contre l'aquaplaning",
          "Début de pluie après période sèche : chaussée particulièrement glissante 5-15 premières minutes",
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
    subtitle: "Feux, éblouissement, fatigue au volant et animaux sur la route",
    icon: "🌙",
    readingTime: "9 min",
    sections: [
      {
        type: "intro",
        title: "La nuit : 10 % du trafic, près de la moitié des tués",
        content:
          "Les chiffres de la Sécurité routière française sont sans appel : la nuit représente environ 10 % du trafic total mais concentre près de 46 % des accidents mortels. Le risque d'avoir un accident mortel à la tombée du jour est sept fois supérieur au risque diurne. Trois facteurs expliquent cette surmortalité : la réduction drastique de la visibilité, la fatigue accrue des conducteurs, et une plus grande prise de risques (alcool, vitesse excessive). Maîtriser la conduite nocturne est une compétence de survie.",
      },
      {
        type: "rule",
        title: "Feux de route vs feux de croisement : règles précises",
        content:
          "Utiliser les bons feux au bon moment est une obligation légale ET un acte de sécurité. Les feux de croisement portent à 30-40 m, les feux de route à 100-150 m — le choix a donc un impact direct sur votre capacité à anticiper.",
        rules: [
          "Feux de croisement (codes) : obligatoires dès la tombée de la nuit, en tunnel, et dès que la visibilité devient insuffisante",
          "Feux de route (pleins phares) : autorisés sur route non éclairée, sans véhicule visible devant ni en sens inverse",
          "Obligation de repasser en feux de croisement dès qu'un véhicule apparaît en face ou que vous suivez un véhicule",
          "En agglomération éclairée : feux de croisement suffisent — les feux de route aveuglent et sont interdits",
          "Veilleuses (feux de position) seules en roulant la nuit : INTERDITS — amende 35 €",
          "Absence totale de feux la nuit : amende 135 €, risque d'immobilisation immédiate du véhicule",
        ],
        highlight: "Feux de route = aucun véhicule visible dans un rayon de 150 m",
      },
      {
        type: "rule",
        title: "La règle d'or : s'arrêter dans la distance éclairée",
        content:
          "Cette règle fondamentale de la conduite nocturne s'appelle parfois la règle de la 'distance utile'. Elle implique d'adapter continuellement sa vitesse à la portée de ses phares.",
        rules: [
          "Feux de croisement : portée 30 à 40 m — la distance de freinage à 50 km/h est déjà de 25-38 m : limite critique",
          "Feux de route : portée 100 à 150 m — permettent de maintenir une vitesse plus élevée en toute sécurité",
          "Si des crêtes de virages ou des courbes masquent la route au-delà de 40 m : réduire la vitesse sous 50 km/h",
          "Ne jamais 'rouler dans les phares' d'un autre véhicule pour profiter de son éclairage : c'est signe d'une distance trop courte",
          "Entretien des phares : une vitre optique encrassée réduit l'efficacité des phares de 30 à 40 % — nettoyage régulier obligatoire",
          "Phares mal réglés (trop hauts) : éblouissent les autres conducteurs et exposent à une amende de 90 €",
        ],
        highlight: "Adapter la vitesse à la portée des phares — toujours",
      },
      {
        type: "rule",
        title: "Gestion de l'éblouissement",
        content:
          "L'éblouissement par un véhicule en sens inverse est l'une des situations les plus dangereuses de la conduite nocturne. La récupération visuelle après éblouissement peut prendre 5 à 6 secondes.",
        rules: [
          "Lors de l'approche : si le véhicule en face ne passe pas en feux de croisement, réduire sa vitesse",
          "Au moment de l'éblouissement : reporter le regard sur le bord droit de la chaussée ou la ligne blanche de droite",
          "Ne jamais répondre à l'éblouissement par ses propres feux de route : cela aggrave la situation pour les deux conducteurs",
          "Réduire légèrement la vitesse pendant et juste après l'éblouissement",
          "Après le croisement : attendre 5 à 6 secondes de récupération visuelle avant de reprendre la vitesse normale",
          "Cas particulier des camions : leur hauteur de phares crée un éblouissement plus intense — anticiper et ralentir",
        ],
        highlight: "Éblouissement : regard bord droit, ne pas répondre avec les pleins phares",
      },
      {
        type: "warning",
        title: "La fatigue nocturne : la somnolence tue",
        content:
          "La somnolence au volant est responsable de 1 accident mortel sur 3 sur autoroute et routes nationales. Les conducteurs surestiment systématiquement leur capacité à maintenir l'attention. La période 2h-6h du matin est la plus dangereuse : c'est la zone de creux circadien, indépendamment du temps de sommeil.",
        rules: [
          "Statistique clé : 30 % des accidents mortels de nuit impliquent l'alcool — 10 à 20 % impliquent la fatigue ou l'inattention",
          "Après 20 heures de veille : les effets cognitifs sont comparables à 0,5 g/L d'alcool dans le sang",
          "Signes avant-coureurs : bâillements répétés, picotements des yeux, difficultés à maintenir la trajectoire, 'trous' de mémoire sur la route parcourue",
          "Seule solution efficace : s'arrêter et dormir 15 à 20 minutes (micro-sieste) dans un lieu sûr",
          "Café ou boissons énergisantes : effet d'alerte limité à 20-30 minutes maximum — ne résout pas le problème",
          "Ne pas forcer si vous avez dormi moins de 6 heures la nuit précédente : le risque d'accident est multiplié par 3",
          "Pause obligatoire toutes les 2 heures lors de longs trajets nocturnes — préventive, pas en réaction à la fatigue",
        ],
        highlight: "Seule solution : s'arrêter et dormir — café = 30 minutes maximum",
      },
      {
        type: "warning",
        title: "Les animaux sur la route : 100 000 collisions par an en France",
        content:
          "Chaque année en France, environ 100 000 collisions entre véhicules et grande faune sont recensées (dont 45 000 avec des sangliers). La nuit, les animaux sont plus actifs et le crépuscule et l'aurore concentrent les risques. Un choc avec un sanglier ou un chevreuil à 90 km/h peut être mortel.",
        rules: [
          "Périodes à risque : crépuscule et aurore — activité maximale de la grande faune",
          "Zones à risque : lisières de forêt, bords de champs, routes de campagne, signalisation 'animaux sauvages'",
          "Les yeux des animaux réfléchissent les phares à grande distance : surveiller les bas-côtés continuellement",
          "Un animal seul est souvent suivi par d'autres — ralentir et rester vigilant après le premier passage",
          "Protocole si animal sur la chaussée : freinage franchi progressif, maintien de la trajectoire — ne jamais faire d'écart brutal qui ferait perdre le contrôle",
          "Écart brutal = risque de sortie de route souvent plus grave que la collision avec l'animal",
          "Après collision avec un grand animal : baliser la zone (feux de détresse), prévenir la gendarmerie (obligation légale)",
        ],
        highlight: "Freiner sans écart brutal — l'écart tue plus que l'animal",
      },
      {
        type: "tip",
        title: "Conseils de moniteur pour les trajets nocturnes",
        content:
          "Avant tout long trajet de nuit, faites ces 4 vérifications : (1) Vos phares sont-ils propres et bien réglés ? (2) Votre pare-brise est-il propre intérieur et extérieur ? Un pare-brise sale crée des halos éblouissants la nuit. (3) Avez-vous dormi au moins 7 heures ? (4) Avez-vous prévu des pauses toutes les 2 heures ? Pendant le trajet, baissez légèrement l'intensité de l'éclairage intérieur du tableau de bord pour réduire la fatigue visuelle. Et si vous ressentez le moindre signe de somnolence, ne négociez pas avec vous-même : arrêtez-vous.",
      },
      {
        type: "example",
        title: "Situation : éblouissement par un poids lourd en sens inverse",
        content:
          "Un poids lourd arrive en sens inverse avec ses feux de route allumés. L'éblouissement est intense. Protocole précis : (1) Regardez le bord droit de la chaussée ou la ligne blanche de droite — ne fixez pas les phares. (2) Réduisez légèrement votre vitesse (pied droit prêt sur le frein). (3) Ne répondez PAS par vos feux de route : cela ne servirait qu'à aveugler le camionneur. (4) Après le croisement, attendez 5 à 6 secondes avant de remettre vos feux de route et de reprendre la vitesse habituelle. La récupération visuelle n'est pas instantanée.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Conduite nocturne en résumé :",
        rules: [
          "Nuit = 10 % du trafic mais 46 % des accidents mortels — risque x7 par rapport au jour",
          "Feux de route uniquement si aucun véhicule visible devant ni en sens inverse",
          "Veilleuses seules en roulant = interdit (amende 35 €)",
          "Adapter la vitesse à la portée des phares — règle d'or nocturne",
          "Éblouissement : regarder le bord droit, ralentir, ne jamais répondre par les pleins phares",
          "Fatigue : s'arrêter et dormir 15-20 min — seule vraie solution",
          "Animaux : 100 000 collisions/an en France — freiner franc sans écart brutal",
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
    subtitle: "Feux antibrouillard, réglementation, vitesse et pièges psychologiques",
    icon: "🌫️",
    readingTime: "8 min",
    sections: [
      {
        type: "intro",
        title: "Le brouillard : l'accident invisible",
        content:
          "Le brouillard est la condition météorologique la plus traîtresse pour le conducteur. La visibilité peut passer de plusieurs centaines de mètres à moins de 20 mètres en quelques secondes, sans signe avant-coureur. Les carambolages autoroutiers dans le brouillard comptent parmi les accidents les plus meurtriers en France : la pluralité de véhicules à grande vitesse incapables de s'arrêter dans la distance visible crée des scénarios catastrophiques en chaîne. La règle d'or est double : réduire sa vitesse ET être visible des autres.",
      },
      {
        type: "rule",
        title: "Réglementation précise sur les feux antibrouillard",
        content:
          "Les feux antibrouillard sont régis par l'article R416-7 du Code de la route. Leur mauvaise utilisation est une infraction et une source de danger pour les autres conducteurs.",
        rules: [
          "Feux de brouillard ARRIÈRE (rouge, intense) : utilisables uniquement en cas de brouillard ou de chute de neige réduisant la visibilité à moins de 50 m",
          "Feux de brouillard AVANT (large et bas) : utilisables en cas de brouillard, forte pluie ou neige — autorisés mais non obligatoires",
          "INTERDIT : utiliser les feux arrière antibrouillard sous la pluie même forte (leur intensité éblouit dangereusement les conducteurs qui suivent)",
          "Amende pour usage abusif (hors conditions prescrites) : 135 € — sans retrait de points",
          "Ils ne remplacent PAS les feux de croisement : les deux doivent fonctionner simultanément",
          "Les éteindre impérativement dès que la visibilité redevient supérieure à 50 m",
          "Feux de route en brouillard : strictement contre-indiqués — ils éblouissent par réflexion sur les gouttelettes",
        ],
        highlight: "Feux arrière antibrouillard : brouillard/neige uniquement, pas la pluie",
      },
      {
        type: "rule",
        title: "La limite de 50 km/h : une règle absolue",
        content:
          "La limite de 50 km/h en cas de visibilité inférieure à 50 mètres n'est pas une recommandation : c'est une obligation légale qui prime sur toutes les autres limitations de vitesse, y compris sur autoroute. Elle repose sur un calcul physique simple.",
        rules: [
          "Si visibilité < 50 m : 50 km/h maximum sur TOUS les réseaux (autoroute, voie rapide, nationale, agglomération)",
          "Calcul physique : à 50 km/h, la distance de freinage totale (réaction + freinage) est d'environ 35-40 m sur chaussée mouillée — correspond à la visibilité disponible",
          "Si visibilité est de 20 m : réduire à 20-30 km/h maximum pour pouvoir s'arrêter dans la distance vue",
          "Ne pas se fier à la visibilité du véhicule devant vous : ses feux arrière donnent une fausse impression de sécurité — il peut freiner brusquement",
          "Cette règle est difficile psychologiquement à respecter sur autoroute : 50 km/h à la place de 130 km/h semble excessif. Pourtant elle est mathématiquement juste",
          "Infraction : même amende et retrait de points que les excès de vitesse classiques",
        ],
        highlight: "Visibilité < 50 m = 50 km/h max sur TOUS les réseaux",
      },
      {
        type: "rule",
        title: "Distances de sécurité en brouillard : le piège mortel",
        content:
          "Par brouillard, le réflexe naturel — mais fatal — est de se rapprocher du véhicule devant pour ne pas le perdre de vue. Ce comportement est à l'origine de la majorité des carambolages. Plus un conducteur est proche du véhicule devant, moins il a de marge pour réagir en cas de freinage brutal.",
        rules: [
          "Règle absolue : augmenter la distance de sécurité à au minimum 4 à 5 secondes en brouillard",
          "Se rapprocher du véhicule devant 'pour ne pas le perdre' = erreur mortelle",
          "Ne pas se coller à un poids lourd en brouillard : il masque les obstacles, sa distance de freinage est 2 fois plus longue que votre voiture",
          "Sur autoroute en brouillard dense : ralentir progressivement avant la nappe si vous la voyez arriver",
          "Si brouillard soudain très dense : allumer les feux antibrouillard, freiner progressivement, chercher à se déporter sur la BAU ou une aire",
          "En cas d'arrêt forcé en brouillard sur voie rapide : rester dans le véhicule ceinturé, ou s'éloigner largement derrière la glissière de sécurité",
        ],
        highlight: "4 à 5 secondes de distance minimum — jamais se coller au véhicule devant",
      },
      {
        type: "warning",
        title: "Les pièges psychologiques du brouillard",
        content:
          "Le brouillard crée deux phénomènes psychologiques bien documentés qui induisent les conducteurs en erreur et doivent être connus pour être combattus.",
        rules: [
          "Phénomène d'hypnose : en brouillard épais et uniforme, certains conducteurs accélèrent inconsciemment pour 'retrouver' une meilleure visibilité. L'uniformité visuelle perturbe la perception de vitesse",
          "Phénomène de fausse sécurité : suivre de près un véhicule visible devant donne l'impression d'être guidé et protégé — c'est l'opposé de la réalité",
          "Contre-mesure : regarder régulièrement le compteur toutes les 30 secondes et se forcer à respecter la limite réglementaire",
          "Contre-mesure : se concentrer sur le bord droit de la chaussée plutôt que sur les feux arrière du véhicule devant",
          "Brouillard de vallée : peut se densifier soudainement dans les creux de terrain — anticiper en réduisant la vitesse avant de descendre",
          "Statistique : les carambolages en brouillard impliquent en moyenne 7 à 15 véhicules car les conducteurs trop proches ne peuvent réagir à temps",
        ],
        highlight: "Regarder son compteur régulièrement — le brouillard trompe la perception de vitesse",
      },
      {
        type: "tip",
        title: "Conseil du moniteur : si vous êtes pris dans le brouillard",
        content:
          "Si vous vous retrouvez immobilisé ou en panne dans le brouillard sur une voie rapide, voici la procédure qui peut vous sauver la vie : (1) Activer les feux de détresse. (2) Se déporter sur la BAU. (3) Une fois arrêté, sortir du véhicule par le côté droit uniquement et franchir immédiatement la glissière de sécurité. (4) Rester derrière la glissière, jamais entre votre véhicule et les voies de circulation. Les accidents en carambolage causent des victimes parmi les personnes qui restaient debout près de leur voiture. Si vous ne pouvez pas sortir en sécurité : restez dans le véhicule, ceinture attachée, feux de détresse allumés.",
      },
      {
        type: "example",
        title: "Situation : nappe de brouillard soudaine sur autoroute à 130 km/h",
        content:
          "Vous roulez à 130 km/h, visibilité qui passe soudainement à 30 m. Protocole immédiat : (1) Pied sur le frein progressivement — ni brusquement ni panique. (2) Allumer feux de croisement + feux antibrouillard arrière. (3) Descendre à 50 km/h maximum (limite légale, physiquement nécessaire). (4) Augmenter la distance de sécurité à 5 secondes. (5) Ne pas dépasser quelque distance que ce soit. (6) Si la nappe est longue et dense, chercher la prochaine aire de repos pour s'arrêter en sécurité et attendre la dissipation. Ne jamais allumer les feux de route dans le brouillard.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Brouillard et visibilité réduite :",
        rules: [
          "Feux antibrouillard ARRIÈRE : brouillard ou neige uniquement — pas la pluie (interdit + 135 €)",
          "Feux antibrouillard AVANT : autorisés si visibilité insuffisante, non obligatoires",
          "Visibilité < 50 m : 50 km/h maximum sur TOUS les réseaux — loi absolue",
          "Distance de sécurité : 4 à 5 secondes minimum en brouillard — jamais se coller au véhicule devant",
          "Feux de route interdits dans le brouillard : éblouissement par réflexion",
          "Hypnose par brouillard : regarder son compteur régulièrement pour contrer la fausse perception de vitesse",
          "Panne en brouillard : franchir la glissière immédiatement, jamais rester entre voiture et voies",
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
    subtitle: "Passages protégés, distances légales de dépassement, zones partagées",
    icon: "🚶",
    readingTime: "9 min",
    sections: [
      {
        type: "intro",
        title: "Les usagers vulnérables : une priorité légale et morale",
        content:
          "Les piétons et cyclistes sont les usagers les plus fragiles de la route. En cas de collision avec un véhicule motorisé, les conséquences pour eux sont quasi systématiquement graves voire mortelles. Pour cette raison, le Code de la route leur accorde une protection spéciale croissante depuis 2018. La méconnaissance de ces règles est à l'origine de nombreuses infractions non intentionnelles mais lourdement sanctionnées.",
      },
      {
        type: "rule",
        title: "Priorité absolue aux piétons sur les passages protégés",
        content:
          "Le passage piéton est un espace de droit pour le piéton et d'obligation pour le conducteur. Depuis la réforme de 2018, les règles ont été renforcées avec des sanctions alourdies.",
        rules: [
          "Obligation de céder le passage à tout piéton qui s'engage sur le passage OU qui manifeste clairement l'intention de s'y engager",
          "S'apprêter à s'engager : piéton positionné sur le bord du trottoir, tourné vers la chaussée, en attente de traverser",
          "Vitesse maximale à l'approche : adapter pour pouvoir s'arrêter complètement si un piéton s'engage à tout moment",
          "Interdiction absolue de dépasser un véhicule qui s'est arrêté devant un passage piéton",
          "Amende pour non-respect : 135 € + 6 points retirés (parmi les infractions les plus pénalisées)",
          "En cas d'accident sur un passage piéton : présomption de faute du conducteur motorisé",
          "Les passages piétons à feux clignotants orange : traiter comme un passage classique avec la même obligation de céder",
        ],
        highlight: "135 € + 6 points — parmi les infractions les plus coûteuses",
      },
      {
        type: "rule",
        title: "Distances de dépassement des cyclistes : règle légale précise",
        content:
          "Les distances légales de dépassement des cyclistes sont fixées par l'article R414-4 du Code de la route depuis 2015. Ces distances sont minimales et peuvent être augmentées selon les conditions.",
        rules: [
          "Hors agglomération : 1,5 mètre minimum entre le côté droit de votre véhicule et le cycliste",
          "En agglomération : 1 mètre minimum — soit environ l'empattement d'une portière de voiture ouverte",
          "Si la distance ne peut être respectée (route trop étroite) : ne pas dépasser et patienter derrière le cycliste",
          "Depuis 2015, il est légalement autorisé de franchir une ligne continue pour dépasser un cycliste en respectant ces distances et en sécurité",
          "Groupe de cyclistes : les dépasser comme une seule unité — ne pas s'intercaler entre eux",
          "Amende pour distance insuffisante : 135 € + 3 points — jusqu'à 750 € et suspension en cas de mise en danger",
          "Un cycliste roule légalement en milieu de voie pour sa sécurité : ne pas le forcer à se rabattre",
        ],
        highlight: "1,5 m hors agglomération / 1 m en agglomération (article R414-4)",
      },
      {
        type: "rule",
        title: "Technique de dépassement d'un cycliste",
        content:
          "Dépasser un cycliste requiert une technique précise pour respecter les distances tout en sécurisant la manœuvre pour toutes les parties.",
        rules: [
          "Anticiper : regarder loin devant pour évaluer la visibilité disponible et les véhicules en sens inverse",
          "Signaler : clignotant gauche pour prévenir le cycliste et les autres usagers",
          "Adapter sa vitesse : réduire légèrement pour réduire les turbulences créées par votre véhicule",
          "Déporter franchement à gauche pour créer la distance réglementaire (1 m en ville, 1,5 m hors agglomération)",
          "Après le dépassement : ne pas se rabattre trop tôt — attendre d'être nettement devant",
          "Ne pas accélérer brusquement après le dépassement : les turbulences peuvent déstabiliser le cycliste",
          "Par vent de côté : le cycliste peut dévier brusquement — prévoir une marge supplémentaire",
        ],
        highlight: "Signaler + déporter + marge + rabattement progressif",
      },
      {
        type: "rule",
        title: "Les zones de partage et leurs règles spécifiques",
        content:
          "La réglementation française crée des espaces de cohabitation avec leurs propres règles. Les connaître évite des infractions et protège les usagers vulnérables.",
        rules: [
          "Zone de rencontre (panneau carré bleu avec piétons) : vitesse limitée à 20 km/h, piétons prioritaires partout sur toute la chaussée",
          "Zone 30 : vitesse limitée à 30 km/h, les vélos peuvent circuler côte à côte légalement",
          "Double sens cyclable : dans les zones 30 et de rencontre, les cyclistes circulent dans les deux sens même en rue à sens unique",
          "Sas vélo aux feux tricolores : espace rectangulaire blanc devant les voitures — s'arrêter derrière la ligne, jamais dans le sas",
          "Piste cyclable obligatoire (avec panneau bleu) : les cyclistes doivent l'emprunter si elle est contiguë à la chaussée",
          "Ouverture de portière : vérification rétroviseur + angle mort avant chaque ouverture — le 'dooring' peut tuer un cycliste",
          "Trottinettes électriques : 25 km/h max sur piste cyclable, 6 km/h en zone piétonne, 20 km/h max en voie partagée",
        ],
        highlight: "Zone de rencontre : 20 km/h, piétons prioritaires partout",
      },
      {
        type: "warning",
        title: "Les situations qui concentrent les accidents avec usagers vulnérables",
        content:
          "Certaines configurations routières sont statistiquement associées à une forte proportion d'accidents impliquant des piétons et cyclistes. Les connaître permet de renforcer la vigilance au bon moment.",
        rules: [
          "Tourne-à-droite aux feux : toujours vérifier l'angle mort droit pour les cyclistes qui continuent tout droit — configuration responsable de nombreux accidents mortels",
          "Sortie de bus arrêté : des piétons peuvent surgir devant ou derrière le bus — freiner et céder le passage",
          "Zones scolaires : enfants imprévisibles, vitesse réfléchie réduire à 30 km/h ou moins, arrêt au moindre doute",
          "Piéton avec casque audio ou téléphone : ne vous attend pas à ce qu'il perçoive votre véhicule",
          "Cycliste de nuit peu ou mal éclairé (absence de feux obligatoires après le coucher du soleil) : réduire la vitesse impérativement",
          "Piéton âgé ou personne handicapée : traversée potentiellement lente — rester arrêté le temps nécessaire",
        ],
        highlight: "Tourne-à-droite : vérifier l'angle mort droit pour les cyclistes",
      },
      {
        type: "tip",
        title: "Conseil du moniteur : l'angle mort de la portière",
        content:
          "L'accident de 'dooring' (ouverture de portière sur un cycliste) est une des causes d'accidents mortels les plus sous-estimées en ville. Voici la technique 'Dutch Reach' enseignée dans plusieurs pays européens : lorsque vous garez votre véhicule, ouvrez la portière avec la main droite (si vous êtes conducteur) en passant par-dessus votre corps. Ce mouvement vous oblige à tourner la tête et le tronc, vous permettant de voir naturellement dans l'angle mort et le rétroviseur. Adoptez ce réflexe systématiquement — une fraction de seconde peut sauver la vie d'un cycliste.",
      },
      {
        type: "example",
        title: "Situation : cycliste dans un carrefour giratoire",
        content:
          "Vous circulez dans un rond-point et un cycliste est devant vous sur le giratoire. Vous souhaitez sortir à la prochaine voie. Le cycliste continue sur le giratoire. Votre obligation : attendre que le cycliste soit passé devant votre sortie avant de vous y engager. Il bénéficie exactement des mêmes règles de priorité que vous dans le giratoire. Ne tentez pas de le doubler dans le rond-point : l'espace est insuffisant pour respecter la distance de 1,5 m et vous le mettriez en danger.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Piétons et cyclistes :",
        rules: [
          "Passage piéton : céder si engagé OU sur le point de s'engager — 135 € + 6 points",
          "Dépassement cycliste : 1,5 m hors agglo / 1 m en agglo (article R414-4) — 135 € + 3 points si non respecté",
          "Ligne continue franchissable légalement pour dépasser un cycliste (depuis 2015)",
          "Zone de rencontre : 20 km/h, piétons prioritaires partout sur la chaussée",
          "Sas vélo aux feux : s'arrêter derrière, jamais dans le sas",
          "Double sens cyclable dans les zones 30 et de rencontre",
          "Tourne-à-droite : vérifier l'angle mort droit pour les cyclistes — configuration d'accident classique",
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
    subtitle: "Angles morts réglementés, physique du freinage, dépassement sécurisé",
    icon: "🚛",
    readingTime: "10 min",
    sections: [
      {
        type: "intro",
        title: "Le poids lourd : physique et réglementation",
        content:
          "Un poids lourd chargé peut peser jusqu'à 44 tonnes, contre 1,5 tonne pour une voiture ordinaire. Son énergie cinétique à 90 km/h est environ 30 fois supérieure. Sa distance de freinage, ses angles morts étendus et ses contraintes de manœuvre sont sans commune mesure avec ceux d'un véhicule léger. Selon la Sécurité routière, 89 % des victimes d'accidents mortels impliquant un poids lourd sont des usagers de véhicules légers, de deux-roues ou des piétons — pas le chauffeur du camion. La méconnaissance des caractéristiques des poids lourds est directement mortelle.",
      },
      {
        type: "rule",
        title: "Les quatre angles morts d'un poids lourd : cartographie précise",
        content:
          "Un camion possède quatre zones d'invisibilité totale. Depuis le 1er janvier 2021, les poids lourds de plus de 3,5 tonnes doivent obligatoirement être équipés de vignettes signalant ces zones (arrêté du 5 janvier 2021). Cela ne supprime pas le danger : vous devez connaître ces zones.",
        rules: [
          "Angle mort AVANT : environ 2 mètres devant la cabine sous le pare-brise — un véhicule arrêté là est totalement invisible du chauffeur",
          "Angle mort ARRIÈRE : environ 3 mètres derrière la remorque — zone totalement invisible et particulièrement dangereuse",
          "Angle mort latéral DROIT : s'étend sur plusieurs mètres et plusieurs voies — le plus dangereux en milieu urbain lors des virages à droite",
          "Angle mort latéral GAUCHE : moins étendu mais existant — à 2-3 mètres de la cabine côté conducteur",
          "Règle mnémotechnique : si vous ne voyez pas les rétroviseurs du camion dans votre champ de vision, il ne vous voit pas",
          "Depuis 2024, les nouveaux poids lourds homologués doivent être équipés de détecteurs d'angles morts électroniques",
          "Statistique : 10 % des accidents mortels de piétons, 8 % des accidents mortels de cyclistes sont dus à un angle mort de camion",
        ],
        highlight: "Pas de rétroviseur visible = vous êtes dans la zone d'invisibilité",
      },
      {
        type: "rule",
        title: "Physique de la distance de freinage d'un camion",
        content:
          "La distance de freinage d'un poids lourd est déterminée par son poids gigantesque. À poids égal, les freins modernes des camions sont performants — mais l'inertie de 40 tonnes ne peut pas être annulée aussi vite qu'une voiture d'1,5 tonne.",
        rules: [
          "Un camion de 40 tonnes à 90 km/h : distance de freinage d'urgence environ 90 à 120 mètres (vs 70 m pour une voiture)",
          "À 80 km/h pour un camion : environ 70 à 90 mètres de freinage",
          "Conséquence : si vous freinez brusquement devant un camion qui vous suit de près, la collision est quasi certaine",
          "Accident 'sous la remorque' (type couperet) : si une voiture s'arrête brusquement, le plancher de la remorque peut trancher le toit — certains camions ont des protège-nez anti-encastrement (obligatoires depuis 2015)",
          "Ne jamais couper la route à un camion pour vous insérer : sa distance de freinage ne lui permettrait pas de s'arrêter",
          "Distance de sécurité recommandée derrière un camion : 4 à 5 secondes minimum sur route (vs 2 secondes entre voitures)",
        ],
        highlight: "Camion de 40 t = 90 à 120 m de freinage à 90 km/h",
      },
      {
        type: "rule",
        title: "Dépasser un poids lourd en sécurité : protocole complet",
        content:
          "Dépasser un camion de 18 à 22 mètres de long requiert une distance libre bien supérieure à celle nécessaire pour dépasser une voiture. Une erreur d'évaluation dans cette manœuvre peut être mortelle.",
        rules: [
          "Visibilité nécessaire : environ 500 mètres libres devant vous pour dépasser un camion à 90 km/h en toute sécurité",
          "Calcul : le dépassement complet d'un camion (votre voiture + 22 m de camion + distance de sécurité) à 90 km/h prend environ 20 secondes",
          "Étape 1 : vérifier que la ligne est franchissable (discontinue) et la visibilité suffisante (500 m)",
          "Étape 2 : accélérer franchement pour réduire le temps passé dans l'angle mort latéral gauche",
          "Étape 3 : rester dans l'angle mort aussi peu longtemps que possible — ne pas 'croiser' à la même vitesse",
          "Étape 4 : se rabattre à gauche seulement quand vous voyez l'avant du camion dans votre rétroviseur — laisser 3 longueurs de camion (environ 60 m) avant de vous rabattre",
          "Si un véhicule arrive en face en cours de dépassement : accélérer pour terminer plutôt qu'aborter (freiner et se rabattre)",
          "Nuit, brouillard ou pluie forte : ne pas dépasser un camion sauf nécessité absolue",
        ],
        highlight: "500 m de visibilité — accélérer franchement — ne pas traîner dans l'angle mort",
      },
      {
        type: "warning",
        title: "Le danger du tourne-à-droite d'un camion en ville",
        content:
          "Le tourne-à-droite d'un poids lourd en milieu urbain est la configuration la plus meurtrière pour les cyclistes et les piétons. Le chauffeur doit élargir sa trajectoire vers la gauche avant de virer à droite, ce qui crée une illusion dangereuse.",
        rules: [
          "Un camion qui tourne à droite doit d'abord s'écarter légèrement à gauche : ne vous glissez pas dans l'espace créé à sa droite",
          "L'angle mort latéral droit est maximal pendant cette manœuvre : le chauffeur ne voit pas ce qui est à sa droite",
          "Ne jamais passer à droite d'un camion qui ralentit près d'une intersection : il prépare peut-être un tourne-à-droite",
          "À vélo ou à moto : ne jamais longer le côté droit d'un camion à l'approche d'un carrefour",
          "Piéton : même si vous avez le feu vert, vérifiez qu'un camion ne tourne pas à droite sur votre passage",
          "En voiture : si vous suivez un camion qui tourne à droite, attendez qu'il ait terminé avant d'avancer",
        ],
        highlight: "Tourne-à-droite d'un camion : ne jamais se glisser à sa droite",
      },
      {
        type: "warning",
        title: "L'effet de souffle et le vent latéral",
        content:
          "Un poids lourd en mouvement agit comme un mur mobile de 3 à 4 mètres de hauteur. Lorsque vous le croisez ou le dépassez, votre véhicule subit une poussée latérale puis une aspiration. Ces effets peuvent déstabiliser votre trajectoire, particulièrement pour les véhicules légers ou surélevés.",
        rules: [
          "Souffle lors du croisement : d'abord une poussée latérale (dans votre sens de marche), puis une aspiration",
          "Aspiration lors du dépassement : une fois que votre véhicule est à hauteur du camion, une dépression peut vous aspirer vers lui",
          "Tenir fermement le volant lors de tout croisement ou dépassement d'un camion — particulièrement en vent fort",
          "Véhicules les plus sensibles : voitures légères, motos, fourgons hauts, camping-cars, SUV à vide",
          "Viaducs et zones exposées : l'effet de vent latéral est amplifié — réduire la vitesse",
          "Camions bâchés par vent fort : leur voile peut se gonfler et les faire dévier légèrement de trajectoire — garder une distance latérale",
        ],
        highlight: "Tenir fermement le volant — poussée puis aspiration lors du dépassement",
      },
      {
        type: "tip",
        title: "Conseils de moniteur : poids lourds, l'essentiel en 3 règles",
        content:
          "Sur l'autoroute, votre moniteur vous fera observer les camions et vérifier leur rétroviseur pour vous habituer à évaluer si vous êtes dans leur angle mort. En ville, la règle des 3 jamais avec un camion : (1) Jamais à sa droite quand il approche d'un carrefour — risque de tourne-à-droite. (2) Jamais devant sa cabine à l'arrêt ou au ralenti — il peut démarrer sans vous voir. (3) Jamais derrière sa remorque de trop près — accident sous la remorque possible. Ces trois interdits s'appliquent aussi aux bus et cars.",
      },
      {
        type: "example",
        title: "Situation : dépassement sur route nationale à 80 km/h",
        content:
          "Vous suivez un camion à 80 km/h sur une route nationale à 2 voies. Vous souhaitez le dépasser. Vérification préalable : ligne discontinue, visibilité d'au minimum 500 m, aucun véhicule visible en sens inverse. Procédure : clignotant gauche, vérification du rétroviseur gauche et de l'angle mort gauche. Dépassez en accélérant franchement vers 90 km/h pour minimiser le temps dans l'angle mort. Maintenez votre distance latérale. Ne vous rabattez qu'une fois le camion entièrement visible dans votre rétroviseur — laissez 60 m de dégagement. Si en cours de dépassement un véhicule surgit en face : accélérez pour finir le dépassement plutôt que d'effectuer un freinage d'urgence en plein dépassement.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Poids lourds sur la route :",
        rules: [
          "89 % des victimes d'accidents avec poids lourd ne sont pas le chauffeur du camion",
          "4 angles morts : avant (2 m), arrière (3 m), latéral droit (étendu), latéral gauche",
          "Règle des rétroviseurs : si vous ne les voyez pas, il ne vous voit pas",
          "Distance de freinage d'un 40 t à 90 km/h : 90 à 120 mètres — garder 4 à 5 secondes de distance",
          "Dépassement : 500 m de visibilité, accélérer franchement, se rabattre avec 60 m de marge",
          "Tourne-à-droite d'un camion : ne jamais se glisser à sa droite — angle mort maximal",
          "Effet de souffle : tenir fermement le volant lors du croisement et du dépassement",
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
    subtitle: "Taux légaux, sanctions pénales, effets physiologiques réels",
    icon: "🍺",
    readingTime: "11 min",
    sections: [
      {
        type: "intro",
        title: "Alcool et drogues : les tueurs numéro un de la route française",
        content:
          "Selon l'ONISR (Observatoire National Interministériel de la Sécurité Routière), l'alcool est impliqué dans près de 30 % des accidents mortels en France chaque année, soit environ 1 mort sur 3. Les stupéfiants sont présents dans 1 accident mortel sur 5 (20 % en 2024, source ONISR). Combinés, alcool et drogues sont en cause dans 40 % des décès sur les routes françaises — devant la vitesse. En 2023, 168 520 infractions pour alcoolémie au volant ont été constatées, dont 75 % étaient des délits. L'alcool est 3,5 fois plus présent dans les accidents mortels que dans les accidents non mortels. Le week-end, il est en cause dans la moitié des accidents mortels. Ces données officielles ne sont pas des abstractions : sur 3 193 tués en 2024, plus de 900 sont morts dans un accident lié à l'alcool ou aux drogues.",
      },
      {
        type: "rule",
        title: "Les taux légaux d'alcoolémie : chiffres précis et base légale",
        content:
          "La loi française distingue trois catégories de conducteurs selon leur expérience. Ces taux sont fixés par l'article R234-1 du Code de la route. Le dépistage s'effectue par éthylomètre (air expiré) ou par prise de sang.",
        rules: [
          "Conducteurs confirmés (permis > 3 ans) : taux maximum = 0,5 g/L de sang (= 0,25 mg/L d'air expiré)",
          "Conducteurs novices (permis < 3 ans, conduite accompagnée en cours) : taux maximum = 0,2 g/L de sang (= 0,10 mg/L d'air expiré)",
          "Conducteurs professionnels (transport en commun, taxi, VTC, ambulances, convois exceptionnels) : taux maximum = 0,2 g/L",
          "Un verre standard (bière 25 cl à 5°, vin 12 cl à 12°, whisky 3 cl à 40°) élève l'alcoolémie d'environ 0,20 à 0,25 g/L selon le poids et le sexe",
          "Élimination de l'alcool : 0,10 à 0,15 g/L par heure — aucun moyen physiologique connu pour l'accélérer",
          "Café, eau froide, sport, douche n'accélèrent PAS l'élimination — seul le foie élimine l'alcool",
          "À jeun, l'alcoolémie monte plus vite et plus haut qu'après un repas : le repas ralentit l'absorption",
          "Les femmes atteignent une alcoolémie plus haute que les hommes pour une même quantité car leur masse grasse est plus élevée (l'alcool ne se dilue pas dans les graisses)",
        ],
        highlight: "0,5 g/L (> 3 ans) — 0,2 g/L novices et pros — article R234-1",
      },
      {
        type: "rule",
        title: "Effets physiologiques réels de l'alcool sur la conduite",
        content:
          "L'alcool altère les fonctions cognitives avant même d'atteindre le seuil légal. Comprendre ces effets aide à prendre conscience de la dangerosité bien en deçà de 0,5 g/L.",
        rules: [
          "Dès 0,2 g/L : euphorie, légère prise de risques accrue, vision légèrement rétrécie",
          "À 0,5 g/L : temps de réaction allongé de 30 %, champ visuel rétréci de 15 %, perception des distances dégradée",
          "À 0,8 g/L : coordination motrice perturbée, sensibilité aux contrastes divisée par 2, agressivité accrue",
          "À 1,5 g/L : ivresse franche — double vision, difficultés à maintenir la trajectoire",
          "À 2 g/L et plus : état d'ivresse avancé — défaillance des réflexes de survie",
          "L'alcool donne une fausse sensation de compétence : le conducteur ivre se croit souvent plus habile qu'il ne l'est",
          "Alcool + fatigue = effet cumulatif : les deux sont des dépresseurs du système nerveux central",
          "Alcool + médicaments sédatifs : effet démultiplié pouvant provoquer un endormissement soudain",
        ],
        highlight: "Dès 0,2 g/L : temps de réaction dégradé — bien avant le seuil légal",
      },
      {
        type: "rule",
        title: "Les sanctions pour conduite sous l'emprise de l'alcool : tableau complet",
        content:
          "Les sanctions sont échelonnées selon le taux constaté. Depuis juillet 2025, la loi sur l'homicide routier a créé une qualification pénale spécifique pour les accidents mortels causés sous emprise d'alcool ou de stupéfiants.",
        rules: [
          "Taux 0,2 à 0,5 g/L (novices/pros uniquement) : contravention — 135 € + 6 points retirés + possible suspension",
          "Taux 0,5 à 0,8 g/L : contravention de 5e classe — 135 € forfaitaire (réduite à 90 € si paiement rapide) + 6 points retirés",
          "Taux supérieur à 0,8 g/L : délit — jusqu'à 2 ans d'emprisonnement + 4 500 € d'amende + suspension obligatoire",
          "Refus de se soumettre au dépistage (éthylomètre ou sang) : même sanction qu'un taux > 0,8 g/L",
          "Récidive dans les 5 ans : jusqu'à 4 ans d'emprisonnement + 9 000 € d'amende + confiscation obligatoire du véhicule",
          "Accident corporel sous alcool > 0,8 g/L : jusqu'à 7 ans + 100 000 € (blessures graves) ou 10 ans + 150 000 € (décès)",
          "Homicide routier (loi juillet 2025) : jusqu'à 10 ans + 150 000 € pour accident mortel sous alcool",
          "Obligation d'installer un éthylotest anti-démarrage (EAD) en cas de condamnation — coût à la charge du conducteur",
          "L'assurance auto peut refuser d'indemniser un conducteur en infraction — il est personnellement responsable des dommages",
        ],
        highlight: "Délit dès 0,8 g/L — homicide routier depuis juillet 2025",
      },
      {
        type: "rule",
        title: "Stupéfiants au volant : tolérance absolument zéro",
        content:
          "Pour les stupéfiants, il n'existe aucun seuil légal toléré : la seule présence de métabolites dans le sang constitue une infraction, même si la consommation est ancienne. En 2024, 20 % des accidents mortels impliquaient un conducteur sous stupéfiants (ONISR).",
        rules: [
          "Tolérance ZÉRO : toute trace de cannabis, cocaïne, amphétamines, héroïne, MDMA dans le sang = infraction, quel que soit le délai",
          "Le cannabis reste détectable dans le sang jusqu'à 6 heures après un joint pour un consommateur occasionnel, mais les tests salivaires peuvent rester positifs 6 à 12 heures",
          "En 2023, près d'1 million de tests salivaires ont été pratiqués — 13,7 % se sont révélés positifs",
          "Le cannabis est la drogue la plus fréquente dans les accidents mortels : présent dans 6 cas sur 10 de conduite sous stupéfiants",
          "Risque multiplié par 1,8 avec le cannabis seul — multiplié par 29 avec l'association cannabis + alcool (étude SAM, ONISR)",
          "Sanctions 1ère infraction : jusqu'à 3 ans d'emprisonnement + 9 000 € d'amende + 6 points retirés + suspension/annulation",
          "Stupéfiants + alcool : jusqu'à 5 ans + 15 000 € + 9 points retirés + confiscation obligatoire du véhicule",
          "Accident mortel sous stupéfiants : jusqu'à 10 ans + 150 000 € (homicide routier, loi juillet 2025)",
          "Dépistage en cas d'accident : OBLIGATOIRE — refus = même sanction que résultat positif",
          "Depuis mars 2025 (Cour de cassation) : seul le résultat de l'analyse sanguine fait preuve — le test salivaire est une étape préalable",
        ],
        highlight: "Cannabis + alcool = risque x29 d'accident mortel — tolérance ZÉRO",
      },
      {
        type: "warning",
        title: "Les médicaments et la conduite : le danger méconnu",
        content:
          "En France, environ 20 % des médicaments vendus ont un impact sur la capacité à conduire. La méconnaissance de ce risque n'est pas une défense légale en cas d'accident.",
        rules: [
          "Pictogramme niveau 1 (fond jaune) : 'Soyez prudent — conduire avec prudence, renseignez-vous'",
          "Pictogramme niveau 2 (fond orange) : 'Soyez très prudent — ne pas conduire sans avis médical'",
          "Pictogramme niveau 3 (fond rouge) : 'Attention, danger : ne pas conduire' — obligation médicale absolue",
          "Médicaments niveau 3 courants : benzodiazépines (somnifères, anxiolytiques), certains antihistaminiques, certains antidouleurs opioïdes, morphiniques",
          "Même un médicament sans ordonnance (antihistaminiques de 1ère génération contre les allergies) peut impacter sévèrement la vigilance",
          "Association médicament + alcool : potentialisation des effets — une dose anodine peut devenir incapacitante",
          "Demandez toujours à votre médecin ou pharmacien : 'Ce médicament me permet-il de conduire ?'",
          "En cas d'accident avec médicament impairable : responsabilité pénale du conducteur engagée comme pour l'alcool",
        ],
        highlight: "Pictogramme rouge = ne pas conduire — vérifier toujours avant de prendre le volant",
      },
      {
        type: "tip",
        title: "Conseils de moniteur : les erreurs classiques des élèves à l'examen",
        content:
          "À l'examen du code, les questions sur l'alcool piègent souvent par leurs formulations. Erreur n°1 : confondre le taux en g/L de sang et le taux en mg/L d'air expiré (0,5 g/L sang = 0,25 mg/L air). Erreur n°2 : penser que le café ou l'eau 'font passer' l'alcool — faux, seul le temps compte. Erreur n°3 : croire qu'il faut être 'visible ivre' pour être en infraction — un taux de 0,5 g/L peut être atteint après seulement 2 verres sans que le conducteur se sente ivre. Pratiquement : utilisez l'éthylotest NF certifié (en vente en pharmacie, environ 1 €) pour vous auto-tester avant de prendre le volant. La règle des moniteurs : si vous avez bu lors d'une soirée, désignez avant la soirée un 'capitaine de soirée' qui s'abstiendra de boire.",
      },
      {
        type: "example",
        title: "Calcul concret : combien de temps attendre après avoir bu ?",
        content:
          "Scenario réel : Sophie, 55 kg, boit 3 verres de vin entre 20h et 22h lors d'un dîner. Alcoolémie estimée au pic (vers 22h-22h30) : 3 × 0,25 g/L ÷ 0,7 (facteur sexe féminin) ≈ 1,07 g/L. Pour descendre sous 0,5 g/L, il faut éliminer 0,57 g/L, soit environ 4 à 5 heures à 0,12 g/L/h. Elle ne devrait pas conduire avant 2h à 3h du matin. Et pour être à 0,2 g/L (seuil des novices), il faut attendre encore 2h supplémentaires. Morale : prévoir son retour avant la soirée — VTC, taxi, co-voiturage sobre, rester sur place. Un taxi coûte infiniment moins cher qu'un retrait de permis, une assurance refusée ou un accident mortel.",
      },
      {
        type: "tip",
        title: "Moyens mnémotechniques pour retenir les taux et sanctions",
        content:
          "Les moniteurs utilisent ces aide-mémoires pour que leurs élèves ne confondent jamais les taux à l'examen. Moyen 1 — La règle 'ZERO-DEUX-CINQ' : ZERO tolérance stupéfiants, DEUX dixièmes pour les novices et pros (0,2 g/L), CINQ dixièmes pour les confirmés (0,5 g/L). Moyen 2 — 'SIX POINTS dans TOUS les cas graves' : alcool > 0,5 g/L, stupéfiants, non-respect piétons, grand excès de vitesse — retiennent tous 6 points. Moyen 3 — '0,5 sang = 0,25 air' : diviser par 2 pour passer des g/L de sang aux mg/L d'air expiré — piège classique du code. Moyen 4 — Pour l'élimination : 'Le foie fait 10 à 15 par heure' (= 0,10 à 0,15 g/L/heure) — rien d'autre ne fonctionne, pas le café ni l'eau. Moyen 5 — La règle du verre : '1 verre standard = 0,20 à 0,25 g/L' — donc 2 verres suffisent à atteindre 0,5 g/L pour une femme de faible corpulence. Astuce examinateur : les questions du code demandent souvent si le café ou l'eau 'font passer' l'alcool — répondre toujours NON.",
      },
      {
        type: "example",
        title: "Scénarios types à l'examen du code : ce que l'inspecteur cherche",
        content:
          "Scénario 1 — 'Un conducteur a bu 2 verres de vin il y a 2 heures. Peut-il conduire ?' Réponse attendue : non, car l'alcoolémie estimée reste proche de 0,4-0,5 g/L selon son poids et son sexe — et le temps d'élimination n'est pas suffisant. Scénario 2 — 'Un conducteur boit un café avant de prendre le volant après une soirée. Est-il apte à conduire ?' Réponse : NON — le café ne modifie pas l'alcoolémie. Scénario 3 — 'Un conducteur est contrôlé à 0,7 g/L. Quelle est la sanction ?' Réponse : contravention de 5e classe, 135 €, 6 points retirés — PAS un délit (le délit commence à > 0,8 g/L). Scénario 4 — 'Un conducteur de bus est contrôlé à 0,3 g/L. Est-ce une infraction ?' Réponse : OUI — les conducteurs professionnels (transport en commun) ont un seuil à 0,2 g/L. L'inspecteur vérifie que vous distinguez bien les différents seuils et ne confondez pas contravention et délit.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Alcool, stupéfiants, médicaments :",
        rules: [
          "Alcool : 0,5 g/L max (> 3 ans de permis), 0,2 g/L novices et conducteurs pros (article R234-1)",
          "0,5–0,8 g/L : contravention — 135 € + 6 points ; au-delà de 0,8 g/L : délit — 4 500 € + 6 pts + retrait",
          "Homicide routier (loi juillet 2025) : jusqu'à 10 ans + 150 000 € pour accident mortel sous alcool",
          "30 % des accidents mortels impliquent l'alcool — 1 sur 5 implique les stupéfiants (ONISR 2024)",
          "Stupéfiants : tolérance ZÉRO — 6 pts + 2 ans prison + 4 500 € — cannabis + alcool = risque x29",
          "Médicaments : pictogramme rouge = ne pas conduire ; orange = avis médical requis",
          "Café et eau n'éliminent PAS l'alcool — seul le foie, à 0,10–0,15 g/L par heure",
          "Mnémotechnique : 'ZERO-DEUX-CINQ' — 0 stupéfiants, 0,2 novices/pros, 0,5 confirmés",
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
    subtitle: "Article R412-6-1, sanctions, statistiques réelles, bonnes pratiques",
    icon: "📱",
    readingTime: "9 min",
    sections: [
      {
        type: "intro",
        title: "La distraction : 2e cause d'accidents mortels et épidémie silencieuse",
        content:
          "En 2023, l'inattention du conducteur (dont l'usage du téléphone est la cause principale) a été impliquée dans 24 % des accidents corporels en France, causant la mort de 390 personnes (ONISR, bilan 2023). La même année, 474 949 infractions liées à l'usage du téléphone ont été constatées par les forces de l'ordre. Malgré les sanctions, le baromètre AXA Prévention 2024 révèle que 80 % des conducteurs français déclarent utiliser leur téléphone en conduisant. Lire un SMS prend en moyenne 5 secondes — à 90 km/h, c'est 125 mètres parcourus les yeux fermés. L'usage du téléphone réduit le temps de réaction de 30 à 50 %, ce qui est statistiquement comparable à un état d'alcoolémie légère. Le risque d'accident est multiplié par 3 lors d'une conversation téléphonique, et par 23 lors de l'envoi d'un SMS.",
      },
      {
        type: "rule",
        title: "Le téléphone tenu en main : texte de loi et sanctions précises",
        content:
          "L'article R412-6-1 du Code de la route interdit explicitement l'usage d'un téléphone tenu en main par le conducteur d'un véhicule en circulation. La jurisprudence (arrêt Cour de cassation du 23 janvier 2018) précise que cette infraction s'applique même lorsque le véhicule est à l'arrêt sur la voie publique, moteur allumé.",
        rules: [
          "Amende forfaitaire : 135 € (réduite à 90 € si paiement dans les 15 jours, majorée à 375 € si non-paiement) + 3 points retirés",
          "Infraction valable à l'arrêt au feu rouge, en embouteillage, arrêt d'urgence moteur allumé sur voie publique",
          "Seule exception légale : moteur coupé ET véhicule garé hors de la circulation",
          "En cas d'infraction couplée (téléphone + feu rouge grillé) : suspension immédiate du permis possible",
          "Expérimentation depuis fin 2025 dans plusieurs départements (Landes, Lot-et-Garonne, Charente-Maritime) : suspension administrative immédiate du permis par arrêté préfectoral",
          "En cas d'accident avec téléphone en main prouvé : circonstance aggravante, sanctions pénales alourdies",
          "En 2023, 1,7 million de points ont été retirés pour usage du téléphone — 3e cause de retrait de points en France (ONISR)",
        ],
        highlight: "Article R412-6-1 — 135 € + 3 points (même à l'arrêt moteur allumé)",
      },
      {
        type: "rule",
        title: "Ce qui est autorisé, ce qui est interdit : tableau clair",
        content:
          "Les règles autour du téléphone comportent des nuances importantes à maîtriser pour l'examen et la pratique. Le décret n°2015-743 du 24 juin 2015 a précisé et étendu les interdictions.",
        rules: [
          "AUTORISÉ : kit mains-libres intégré au véhicule (Bluetooth constructeur), commandes vocales sans toucher l'écran",
          "AUTORISÉ : oreillette Bluetooth sur une seule oreille — l'autre oreille doit rester libre pour entendre la route",
          "AUTORISÉ : GPS sur téléphone posé dans un support fixe homologué, configuré AVANT le départ",
          "INTERDIT : tenir le téléphone même pour regarder l'heure, la météo, ou lire une notification",
          "INTERDIT : casque audio couvrant les deux oreilles (même sans téléphone) — amende 135 € + 3 points",
          "INTERDIT : reconfigurer le GPS ou changer la destination en roulant, même sur support fixe",
          "INTERDIT : tenir son téléphone posé sur ses genoux ou contre l'oreille sans main, le maintenir avec l'épaule",
          "Oreillette sur les deux oreilles : interdit même pour la musique — prive de la perception des sons extérieurs",
        ],
        highlight: "Support fixe + configuration avant départ = seule solution légale pour le GPS",
      },
      {
        type: "warning",
        title: "Les autres formes de distraction : tout aussi mortelles",
        content:
          "La distraction au volant ne se limite pas au téléphone. La recherche en sécurité routière distingue trois types de distraction : visuelle (yeux qui quittent la route), manuelle (mains qui quittent le volant) et cognitive (pensée qui quitte la conduite). La combinaison des trois est la plus dangereuse.",
        rules: [
          "Manger ou boire en conduisant : distraction visuelle + manuelle — peut constituer une conduite inattentive en cas d'accident",
          "Se maquiller, se raser, se coiffer : même triple distraction — plusieurs accidents mortels documentés chaque année",
          "Régler la radio, le GPS ou la climatisation en roulant : distraction cognitive prouvée, temps de réaction allongé",
          "Passagers agités ou conversations animées : réduisent la vigilance du conducteur — s'arrêter si nécessaire",
          "Enfant qui pleure à l'arrière : s'arrêter en sécurité, gérer la situation, puis reprendre la route",
          "Regard sur un accident en sens inverse ('voyeurisme routier') : cause fréquente de sur-accident",
          "Distraction visuelle + cognitive simultanées : risque d'accident multiplié par 4 (études comportementales CNRS)",
          "Musique très forte : réduit la perception des klaxons, des sirènes et des bruits de la route",
        ],
        highlight: "Triple distraction (visuelle + manuelle + cognitive) = risque x4",
      },
      {
        type: "tip",
        title: "Conseils de moniteur : réflexes à acquérir dès les premières leçons",
        content:
          "Votre moniteur vous demandera dès la 1ère leçon de mettre votre téléphone hors de portée et hors de vue. Ce n'est pas anodin : une étude de l'Université de Virginie a montré que la simple présence d'un téléphone visible sur le tableau de bord, même éteint, suffit à réduire la concentration du conducteur. Avant de démarrer : (1) Configurez votre GPS. (2) Sélectionnez votre musique. (3) Activez le mode 'Ne pas déranger au volant' sur Android (disponible depuis Android 9) ou iOS (depuis iOS 11) — ce mode détecte automatiquement la conduite, bloque les notifications et envoie une réponse automatique aux appelants. (4) Rangez le téléphone en poche ou dans la boîte à gants. Si vous attendez un appel vraiment urgent : prévenez vos proches de votre trajet, ou arrêtez-vous dans un parking pour rappeler.",
      },
      {
        type: "example",
        title: "Scénario : quelle décision prendre face à un appel entrant ?",
        content:
          "Vous roulez sur une nationale à 80 km/h. Votre téléphone sonne — vous voyez que c'est votre employeur. Vous avez 3 secondes pour décider. Option A (mauvaise) : décrocher en tenant le téléphone — 135 € + 3 points et 125 m de route non vue si vous parlez 5 secondes. Option B (mauvaise aussi) : regarder qui appelle en tenant le téléphone — même infraction même si vous ne décrochez pas. Option C (correcte) : laisser sonner, le kit mains-libres prend le relais s'il est configuré, ou vous arrêtez dans les 30 secondes sur le prochain espace sécurisé (parking, aire, bas-côté stable), coupez le moteur, rappellez. Cette décision prend 45 secondes. Un accident évité est une vie sauvée et un permis préservé.",
      },
      {
        type: "tip",
        title: "Moyens mnémotechniques téléphone : ce que retiennent les moniteurs",
        content:
          "Moyen 1 — 'R412-6-1 : trois points, cent trente-cinq euros' : l'article et la sanction, à retenir ensemble comme un bloc. Moyen 2 — 'x23 pour un SMS, x3 pour un appel' : le SMS multiplie le risque par 23 car il combine les trois types de distraction en même temps (visuelle, manuelle, cognitive). Moyen 3 — 'UNE oreille libre = légal, DEUX oreilles = interdit' : l'oreillette sur une seule oreille est tolérée pour garder l'autre oreille sur la route. Moyen 4 — 'Moteur allumé = infraction possible' : même à l'arrêt au feu rouge, le téléphone tenu en main est une infraction — le moteur doit être coupé ET le véhicule hors circulation pour que ce soit légal. Moyen 5 — '5 secondes = 125 mètres à 90 km/h' : visualiser la longueur d'un terrain de rugby parcourue les yeux fermés pour comprendre l'enjeu d'un simple SMS. Ce chiffre est régulièrement utilisé par les inspecteurs lors de l'examen pratique.",
      },
      {
        type: "example",
        title: "Scénarios types à l'examen du code : ce que l'inspecteur cherche",
        content:
          "Scénario 1 — 'Un conducteur est arrêté à un feu rouge, moteur allumé. Il consulte son GPS sur son téléphone tenu en main. Est-ce une infraction ?' Réponse : OUI — l'article R412-6-1 s'applique même à l'arrêt, moteur allumé, sur voie publique. Seul le moteur coupé hors circulation exonère. Scénario 2 — 'Un conducteur utilise une oreillette couvrant les deux oreilles pour écouter de la musique. Est-ce autorisé ?' Réponse : NON — le casque sur deux oreilles est interdit même sans téléphone (135 € + 3 points), car il prive de la perception des sons de la route. Scénario 3 — 'Un conducteur utilise son téléphone posé dans un support fixe sur le tableau de bord, avec la navigation GPS active configurée avant le départ. Est-ce légal ?' Réponse : OUI — c'est la seule configuration légale pour le GPS sur téléphone. Scénario 4 — 'Un conducteur reçoit un appel et utilise son kit mains-libres Bluetooth intégré au véhicule. Est-ce autorisé ?' Réponse : OUI — le kit intégré au véhicule est légal. L'inspecteur cherche à vérifier que vous distinguez 'tenu en main' de toutes les alternatives légales.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Téléphone et distractions :",
        rules: [
          "Article R412-6-1 : téléphone tenu en main interdit — 135 € + 3 points, même à l'arrêt moteur allumé",
          "Risque x3 lors d'un appel, x23 lors de l'envoi d'un SMS — 390 tués liés à la distraction en 2023",
          "474 949 infractions téléphone constatées en 2023 — 80 % des conducteurs avouent l'utiliser (AXA 2024)",
          "Casque deux oreilles : interdit (135 € + 3 points) — oreillette UNE oreille : autorisée",
          "GPS : support fixe obligatoire, configuré avant le départ uniquement",
          "Mode 'Ne pas déranger au volant' : activer systématiquement sur Android et iOS",
          "Triple distraction (visuelle + manuelle + cognitive) = risque d'accident multiplié par 4",
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
    subtitle: "Obligations légales, efficacité prouvée, dispositifs enfants, erreurs fatales",
    icon: "🔒",
    readingTime: "9 min",
    sections: [
      {
        type: "intro",
        title: "La ceinture : le dispositif qui sauve le plus de vies en France",
        content:
          "Depuis son obligation à l'avant en 1973, puis à l'arrière en 1990, la ceinture de sécurité a sauvé des centaines de milliers de vies en France. Selon l'ONISR, environ 20 % des personnes tuées sur les routes françaises ne portaient pas leur ceinture au moment de l'accident — entre 600 et 700 vies perdues chaque année à cause de ce seul manquement. En 2022, 24 % des tués dans un véhicule n'étaient pas ceinturés. Les données scientifiques (Laboratoire d'accidentologie et de biomécanique — LAB) montrent que la ceinture réduit le risque de décès de 40 à 65 % aux places avant et de 25 à 57 % aux places arrière. Sans ceinture, le risque de décès est multiplié par 3, et multiplié par 5 en cas d'éjection du véhicule. À 50 km/h, le risque de décès avec ceinture est inférieur à 2 % — sans ceinture, il est de 20 %.",
      },
      {
        type: "rule",
        title: "L'obligation légale du port de la ceinture : article R412-1",
        content:
          "L'article R412-1 du Code de la route impose le port de la ceinture à tout occupant d'un véhicule en circulation dès lors que le siège en est équipé. Il n'existe pas d'exception géographique (courte distance, ville, parking).",
        rules: [
          "Conducteur ET tous les passagers, à tous les sièges (avant et arrière) sur toutes les routes et autoroutes",
          "Le conducteur est pénalement responsable du port de ceinture des passagers de MOINS de 18 ans",
          "Pour les passagers de 18 ans et plus : chacun est responsable de sa propre ceinture",
          "Obligation en agglomération, sur route, sur autoroute — y compris pour un trajet de 200 mètres",
          "Exception médicale : dispense accordée par certificat médical uniquement — gilet de sécurité homologué obligatoire en remplacement",
          "Ambulanciers en intervention : peuvent bénéficier d'une dérogation — mais doivent remettre la ceinture dès la fin de la manœuvre",
          "Conducteurs de taxis en ville : aucune exception — amende si non-porté",
        ],
        highlight: "Article R412-1 — Conducteur responsable pour les -18 ans",
      },
      {
        type: "rule",
        title: "Sanctions en cas de non-port : article R412-1 du Code de la route",
        content:
          "Le non-port de la ceinture est une contravention de 4e classe. En 2023, 2,5 % de tous les points retirés en France concernaient le non-port de la ceinture, soit des centaines de milliers de contrôles positifs.",
        rules: [
          "Conducteur sans ceinture : amende forfaitaire 135 € + 3 points retirés",
          "Passager adulte sans ceinture : 135 € d'amende à sa propre charge (pas de points au conducteur)",
          "Passager mineur sans ceinture : 135 € d'amende à la charge du conducteur + 3 points retirés au conducteur",
          "Si plusieurs passagers mineurs non ceinturés simultanément : l'amende peut être multipliée",
          "En cas d'accident sans ceinture : la responsabilité du passager ou conducteur peut être retenue pour aggravation de ses propres dommages — l'indemnisation peut être réduite",
          "Vérification par les forces de l'ordre possible à tout moment, y compris en conduite sur route",
          "Trois quarts des accidents mortels surviennent à moins de 50 km du domicile — la fausse sécurité du 'court trajet' est mortelle",
        ],
        highlight: "135 € + 3 points — valable à tous les sièges, tous les trajets",
      },
      {
        type: "rule",
        title: "Dispositifs de retenue enfants : réglementation précise",
        content:
          "Les enfants ne peuvent pas utiliser la ceinture adulte seule avant d'avoir atteint une taille et un poids suffisants. La ceinture adulte non adaptée peut elle-même causer des blessures graves (syndrome de la ceinture) en cas de choc.",
        rules: [
          "Moins de 10 ans OU moins de 135 cm : siège auto ou rehausseur homologué obligatoire — article R412-2",
          "En cas d'accident, les dispositifs de retenue enfants réduisent le risque de décès de 54 à 80 % (ONISR)",
          "Moins de 13 kg (groupe 0 et 0+) : siège coque dos à la route recommandé — meilleure protection en cas de choc frontal",
          "De 9 à 18 kg (groupe 1) : siège face à la route, harnais 5 points — ne pas l'utiliser avec les bras au-dessus de la limite de hauteur",
          "De 15 à 36 kg (groupe 2/3) : rehausseur avec dossier, puis rehausseur simple avec ceinture adulte",
          "L'airbag frontal passager DOIT être désactivé si un siège bébé DOS À LA ROUTE est installé côté passager avant",
          "Système ISOFIX : fixation rigide au châssis du véhicule — plus sûre que la ceinture seule pour fixer le siège",
          "En 2022, 18 des 59 enfants tués à bord d'un véhicule de tourisme n'avaient pas leur ceinture ou dispositif attaché (ONISR)",
        ],
        highlight: "< 10 ans ou < 135 cm : siège homologué obligatoire — ISOFIX recommandé",
      },
      {
        type: "warning",
        title: "Les erreurs fréquentes qui annulent la protection",
        content:
          "La ceinture n'est efficace que si elle est correctement portée. Des erreurs apparemment anodines réduisent dramatiquement ou annulent complètement sa protection.",
        rules: [
          "Bretelle épaule passée derrière le dos ou sous le bras : annule totalement la protection thoracique — en cas de choc frontal, le thorax et la tête ne sont pas retenus",
          "Ceinture lâche (plusieurs centimètres de jeu) : en cas de choc, le corps se déplace trop loin avant que la ceinture ne retienne — traumatismes aggravés",
          "Coussin ou rembourrage sous la bretière : interdit — modifie la géométrie de retenue, la ceinture peut couper plutôt que retenir",
          "Ceinture tordue : doit être parfaitement plate sur toute sa longueur — une torsion concentre les forces et peut couper",
          "Manteau épais entre le corps et la ceinture : laisse trop de jeu — en hiver, enlever le manteau ou l'ajuster sous la ceinture",
          "Femme enceinte : sangle abdominale SOUS le ventre (sur les hanches, jamais sur le ventre) — la sangle épaule reste sur l'épaule — ne jamais supprimer la ceinture",
          "Siège trop incliné (position 'couché') : la ceinture ne peut plus remplir sa fonction — risque de 'sous-marinage' (glissement sous la ceinture)",
        ],
        highlight: "Bretelle derrière le dos = aucune protection — jamais accepter ce compromis",
      },
      {
        type: "tip",
        title: "Conseil du moniteur : le réflexe ceinture avant même de vérifier les rétroviseurs",
        content:
          "Votre moniteur vous apprendra un ordre de démarrage précis : (1) Monter dans le véhicule. (2) Ceinture — avant même de fermer la portière. (3) Régler le siège et les rétroviseurs si nécessaire. (4) Démarrer. Ce réflexe 'ceinture avant tout' est la première habitude à acquérir. Les statistiques sont sans appel : 28,8 % des conducteurs français déclarent ne pas attacher leur ceinture systématiquement, principalement pour les courts trajets ou en ville. Or, les 3/4 des accidents mortels surviennent à moins de 50 km du domicile. Le 'court trajet' n'existe pas en sécurité routière.",
      },
      {
        type: "example",
        title: "Scénario : passager arrière qui refuse la ceinture",
        content:
          "Votre ami de 25 ans s'installe à l'arrière et dit 'laisse, c'est juste 2 km'. Voici ce qu'il ne sait pas : à 50 km/h, une personne de 70 kg sans ceinture devient un projectile exerçant une force de 2 tonnes lors d'un choc frontal. Il peut perforer le siège avant, tuer le conducteur et mourir lui-même par effet de rebond. Réponse correcte du conducteur : 'Je ne pars pas tant que tu n'as pas mis ta ceinture.' Si l'ami insiste : il sort du véhicule ou il accepte. Ce n'est pas être 'chiant' — c'est être responsable légalement (si votre ami a moins de 18 ans, vous perdez 3 points) et moralement (vous pouvez lui sauver la vie).",
      },
      {
        type: "tip",
        title: "Moyens mnémotechniques ceinture : les formules des moniteurs",
        content:
          "Moyen 1 — 'R412-1 : trois points, cent trente-cinq euros' : article et sanction liés, comme pour le téléphone. Moyen 2 — 'La ceinture réduit de 45 % la mortalité' : chiffre ONISR à retenir — la ceinture est le dispositif de sécurité le plus efficace jamais inventé pour les occupants de voiture. Moyen 3 — 'MOINS de 18 ans = MA responsabilité' : le conducteur est responsable de tous les passagers mineurs, quelle que soit leur place (avant ou arrière). Moyen 4 — 'DIX ans ou CENT TRENTE-CINQ centimètres' : les deux seuils pour le siège auto enfant — en dessous de l'un ou de l'autre, le siège homologué est obligatoire. Moyen 5 — 'AVANT de fermer la portière' : le réflexe ceinture s'acquiert en attachant la ceinture avant même de fermer la portière — c'est l'ordre que les moniteurs enseignent systématiquement. Moyen 6 — 'Dos à la route = airbag désactivé' : si le siège bébé est dos à la route côté passager avant, l'airbag doit impérativement être désactivé — l'airbag déployé tuerait l'enfant.",
      },
      {
        type: "example",
        title: "Scénarios types à l'examen du code : ce que l'inspecteur cherche",
        content:
          "Scénario 1 — 'Un conducteur transporte 3 enfants de 8, 12 et 16 ans. Qui est responsable si l'enfant de 12 ans ne porte pas sa ceinture ?' Réponse : le conducteur — tous ont moins de 18 ans, donc le conducteur est pénalement responsable de leur ceinture (135 € + 3 points par enfant non ceinturé). Scénario 2 — 'Un siège bébé dos à la route est installé sur le siège passager avant. Que doit-on obligatoirement faire ?' Réponse : désactiver l'airbag passager avant — sinon l'airbag déployé lors d'un choc tuerait l'enfant. Scénario 3 — 'Un enfant de 11 ans mesure 138 cm. Doit-il utiliser un siège auto ?' Réponse : NON — il mesure plus de 135 cm et a plus de 10 ans, donc la ceinture adulte seule est autorisée (mais un rehausseur reste recommandé pour la sécurité). Scénario 4 — 'Un conducteur a un certificat médical le dispensant de ceinture. Que doit-il porter à la place ?' Réponse : un gilet de sécurité homologué. L'inspecteur vérifie que vous connaissez les responsabilités du conducteur envers les passagers mineurs et les cas particuliers comme l'airbag et le siège dos à la route.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Ceinture de sécurité :",
        rules: [
          "Obligatoire à tous les sièges, tous les trajets — article R412-1 du Code de la route",
          "Efficacité : réduit de 45 % la mortalité — sans ceinture, risque x3 de mourir (x5 si éjection)",
          "Environ 20 % des tués en France ne portaient pas leur ceinture — entre 600 et 700 morts évitables/an",
          "Conducteur responsable des passagers < 18 ans : 135 € + 3 points si non ceinturés",
          "Enfants < 10 ans ou < 135 cm : dispositif homologué obligatoire (ISOFIX recommandé)",
          "Airbag passager avant à désactiver avec siège bébé dos à la route",
          "Bretelle derrière le dos ou ceinture lâche = protection annulée — erreur fréquente et mortelle",
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
    subtitle: "Protéger, Alerter, Secourir — gestes précis, numéros d'urgence, obligation légale",
    icon: "🚨",
    readingTime: "10 min",
    sections: [
      {
        type: "intro",
        title: "En cas d'accident : chaque minute compte",
        content:
          "En France, les secours médicaux arrivent en moyenne en 12 à 15 minutes après l'alerte. En cas d'arrêt cardiaque, le cerveau subit des lésions irréversibles après 4 à 6 minutes sans oxygène. La survie d'une victime d'accident dépend donc directement des gestes des premiers témoins arrivés sur place. La méthode PAS — Protéger, Alerter, Secourir — est la procédure standard enseignée dans le PSC1 (Prévention et Secours Civiques de niveau 1) et au Code de la route. L'article 223-6 du Code pénal crée une obligation légale de porter secours à toute personne en danger, sous peine de 5 ans d'emprisonnement et 75 000 € d'amende pour non-assistance à personne en danger. Ignorer un accident n'est pas une option légale.",
      },
      {
        type: "rule",
        title: "P — Protéger : sécuriser la zone avant tout geste",
        content:
          "La protection est la première étape absolue. Un sur-accident (second accident provoqué par des témoins non protégés) est l'une des causes majeures de victimes supplémentaires. Sur autoroute, 30 % des accidents impliquent un sur-accident.",
        rules: [
          "Garer votre véhicule hors de la chaussée ou au maximum à droite, feux de détresse allumés immédiatement",
          "Mettre le gilet de haute visibilité AVANT de descendre du véhicule — obligation de l'avoir dans l'habitacle (jamais dans le coffre)",
          "Placer le triangle de présignalisation à au moins 30 m en amont de l'accident sur route, 200 m conseillés sur autoroute",
          "EXCEPTION sur autoroute : si la pose du triangle vous expose à traverser des voies actives, NE PAS poser le triangle — utiliser uniquement les feux de détresse",
          "Ne pas fumer à proximité du véhicule accidenté — risque d'incendie du carburant ou des airbags non déclenchés",
          "Ne pas déplacer les victimes sauf danger immédiat évident (incendie actif, noyade imminente) — risque de blesser une lésion vertébrale invisible",
          "Si présence de liquides qui s'écoulent : s'écarter et alerter les secours — risque d'explosion ou de produits chimiques",
          "Se protéger soi-même en premier : un témoin blessé devient une victime supplémentaire",
        ],
        highlight: "Triangle à 30 m minimum — NE PAS poser si cela implique de traverser des voies actives",
      },
      {
        type: "rule",
        title: "A — Alerter : les numéros d'urgence et les informations à donner",
        content:
          "Appeler les secours est une étape qui doit être faite rapidement mais avec les bonnes informations. Un appel bien renseigné permet aux secours d'envoyer les bons moyens sans délai supplémentaire.",
        rules: [
          "15 — SAMU (Service d'Aide Médicale Urgente) : pour les urgences médicales, les blessés nécessitant une médicalisation",
          "17 — Police / Gendarmerie : pour les questions de sécurité, de circulation, d'infraction constatée",
          "18 — Sapeurs-Pompiers : pour les incendies, accidents, secours à personnes",
          "112 — Numéro d'urgence européen : fonctionne dans toute l'UE, même sans réseau opérateur (roaming forcé), gratuit, localisable",
          "114 — Urgence pour personnes malentendantes ou muettes : SMS ou visio disponible",
          "Sur autoroute : bornes d'appel d'urgence orange tous les 2 km — permettent une localisation automatique et précise",
          "Informations INDISPENSABLES à donner : localisation exacte (nom de la route, numéro de sortie, sens de circulation, point kilométrique), nombre de véhicules impliqués, nombre de victimes et leur état apparent (conscient/inconscient, respiration visible), risques spécifiques (incendie, produits dangereux, véhicule dans l'eau)",
          "Ne raccrocher QU'À la demande de l'opérateur — il peut vous guider pour les gestes de secours",
        ],
        highlight: "112 fonctionne sans réseau — donnez localisation précise + nombre de victimes",
      },
      {
        type: "rule",
        title: "S — Secourir : les gestes précis selon l'état de la victime",
        content:
          "Secourir ne signifie pas médicaliser. Les gestes enseignés au PSC1 sont accessibles à tous et peuvent maintenir une victime en vie pendant l'attente des secours professionnels. L'évaluation de l'état de la victime suit un ordre précis.",
        rules: [
          "Étape 1 — Évaluer la conscience : parler fort ('M'entendez-vous ?'), toucher l'épaule fermement — si réponse : victime consciente",
          "Victime CONSCIENTE : parler, rassurer, ne pas déplacer, maintenir au chaud (couverture de survie si disponible), surveiller jusqu'aux secours",
          "Étape 2 si inconscient — Vérifier la respiration : basculer doucement la tête en arrière, écouter/sentir le souffle 10 secondes",
          "Victime INCONSCIENTE qui RESPIRE : position latérale de sécurité (PLS) — coucher sur le côté, bouche vers le bas pour éviter l'asphyxie par la langue ou les vomissements",
          "Victime INCONSCIENTE qui NE RESPIRE PAS : appeler le 15 immédiatement si pas encore fait, commencer le massage cardiaque externe (MCE) : 30 compressions sternales à 5-6 cm de profondeur + 2 insufflations (si formé PSC1) — répéter jusqu'à l'arrivée des secours ou l'utilisation d'un DAE",
          "Défibrillateur Automatisé Externe (DAE) : utiliser dès que disponible — l'appareil guide vocalement, accessible à tous sans formation",
          "Hémorragie visible : compression directe et ferme avec tissu propre sur la plaie — maintenir sans relâcher",
          "Brûlures : refroidir à l'eau à température ambiante (15-20°C) pendant 15 minutes minimum — ne pas percer les cloques ni appliquer de corps gras",
        ],
        highlight: "Conscience → Respiration → PLS ou MCE — DAE utilisable par tous sans formation",
      },
      {
        type: "warning",
        title: "Ce qu'il NE FAUT ABSOLUMENT PAS faire : erreurs mortelles",
        content:
          "Certains réflexes naturels, bien intentionnés, peuvent aggraver l'état d'une victime jusqu'à la tuer. Ces interdits sont enseignés dans tous les cours de secourisme.",
        rules: [
          "Ne pas déplacer une victime sauf danger immédiat prouvé (incendie réel, noyade) — une lésion de la colonne vertébrale peut provoquer une paralysie définitive si la victime est déplacée sans précaution",
          "Ne pas donner à boire à une victime (même consciente) — risque de vomissement et d'inhalation (asphyxie)",
          "Ne pas retirer un casque de moto d'une victime inconsciente — risque de sectionnement de la moelle épinière — exception : si la victime ne respire pas et que l'accès aux voies aériennes est impossible",
          "Ne pas retirer un corps étranger planté dans une plaie — le comprimer autour, ne jamais l'extraire (il fait 'bouchon' et limite l'hémorragie)",
          "Ne pas laisser une victime inconsciente sur le dos — risque d'asphyxie par obstruction des voies aériennes par la langue",
          "Ne pas quitter les lieux si votre véhicule est impliqué dans l'accident — délit de fuite (article 434-10 du Code pénal) : 3 ans d'emprisonnement + 75 000 € d'amende + 6 points retirés + suspension obligatoire",
          "Ne pas se précipiter sans s'être protégé (gilet, triangle) — vous devenez une victime supplémentaire",
        ],
        highlight: "Ne pas déplacer — ne pas donner à boire — ne pas retirer le casque",
      },
      {
        type: "tip",
        title: "Conseil du moniteur : passez le PSC1, c'est 7 heures qui peuvent sauver une vie",
        content:
          "Le PSC1 (Prévention et Secours Civiques de niveau 1) est une formation de 7 heures dispensée par la Croix-Rouge, la Protection Civile, les Sapeurs-Pompiers et de nombreux organismes agréés. Son coût moyen est de 30 à 50 €. Elle vous apprend le massage cardiaque externe, la PLS, l'utilisation du DAE et la gestion des hémorragies. En France, on estime que seulement 40 % de la population est formée aux gestes de premiers secours, contre 90 % en Norvège. Les DAE (défibrillateurs) sont désormais présents dans tous les lieux recevant du public (mairies, centres commerciaux, gares, stades) depuis 2018 — ils sont utilisables par tout le monde sans formation grâce aux instructions vocales. Repérez le DAE le plus proche de votre domicile et de votre lieu de travail.",
      },
      {
        type: "example",
        title: "Scénario complet : vous arrivez le premier sur un accident",
        content:
          "Sur une route nationale, un véhicule a percuté un poteau. Il est 22h, visibilité réduite. Procédure précise : (1) Stopper votre véhicule à 50 m en amont, feux de détresse. (2) Gilet fluorescent avant de sortir. (3) Triangle à 30 m derrière l'accident. (4) Appel au 112 : 'Route nationale D913, sens Bordeaux-Périgueux, km 47, un véhicule a heurté un poteau, 1 victime visible, inconscience probable.' (5) Approcher du véhicule prudemment — vérifier qu'il n'y a pas de fuite d'essence enflammée. (6) Parler à la victime : 'M'entendez-vous ?' — pas de réponse. (7) Vérifier la respiration 10 secondes — la victime respire. (8) PLS si possible sans aggraver une blessure cervicale. (9) Rester auprès de la victime, la parler doucement même inconsciente, surveiller la respiration jusqu'à l'arrivée des secours. Ne jamais s'éloigner.",
      },
      {
        type: "tip",
        title: "Moyens mnémotechniques PAS : les formules incontournables des moniteurs",
        content:
          "Moyen 1 — 'PAS = Protéger, Alerter, Secourir' : l'ordre est impératif — toujours Protéger en premier, jamais Secourir avant d'avoir Protégé. Un sur-accident (second accident) tuerait les témoins venus aider. Moyen 2 — 'TRIANGLE à TRENTE mètres' : le 'T' de Triangle et le 'T' de Trente — la distance minimale réglementaire en amont de l'accident. Moyen 3 — '15-17-18-112' : les quatre numéros à retenir dans l'ordre SAMU-Police-Pompiers-Europe. Le 112 fonctionne sans réseau opérateur dans toute l'UE — c'est le numéro universel à enseigner aux enfants. Moyen 4 — 'Conscience → Respiration → Action' : l'ordre d'évaluation d'une victime en 3 étapes — conscience d'abord (appel + toucher), puis respiration (10 secondes d'écoute), puis action (PLS ou MCE). Moyen 5 — 'Les 10 premières minutes sont cruciales' : l'expression de la 'golden hour' des urgentistes — les interventions dans les 10 premières minutes après l'accident maximisent les chances de survie. Chaque minute sans oxygène au cerveau = lésions irréversibles supplémentaires. Astuce inspecteur : les questions du code demandent souvent si on doit déplacer la victime — répondre presque toujours NON (sauf danger immédiat prouvé).",
      },
      {
        type: "example",
        title: "Scénarios types à l'examen du code : ce que l'inspecteur cherche",
        content:
          "Scénario 1 — 'Vous arrivez sur un accident. La victime est inconsciente et respire. Que faites-vous ?' Réponse : PLS (position latérale de sécurité) — coucher sur le côté, bouche vers le bas, pour éviter l'asphyxie par la langue ou les vomissements. NE PAS la laisser sur le dos. Scénario 2 — 'Un motard inconscient porte un casque. Que faites-vous ?' Réponse : ne pas retirer le casque — risque de lésion de la moelle épinière. Exception uniquement si la victime ne respire pas et que l'accès aux voies aériennes est impossible. Scénario 3 — 'La victime consciente vous demande à boire car elle a soif. Que faites-vous ?' Réponse : refuser — risque de vomissement et d'asphyxie (aspiration dans les poumons). Scénario 4 — 'Vous êtes sur autoroute. Devez-vous poser le triangle pour sécuriser l'accident ?' Réponse : uniquement si vous pouvez le faire sans traverser des voies de circulation actives. Si c'est impossible, utiliser uniquement les feux de détresse. Scénario 5 — 'Quel est le numéro à appeler depuis l'étranger en UE en cas d'accident ?' Réponse : 112 — fonctionne dans toute l'Union Européenne, même sans réseau, localisable, gratuit.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Accident — méthode PAS :",
        rules: [
          "Article 223-6 Code pénal : obligation légale de porter secours — 5 ans + 75 000 € pour non-assistance",
          "P — Protéger : gilet + triangle 30 m en amont (sauf traversée de voies actives sur autoroute)",
          "A — Alerter : 15 (SAMU), 17 (Police), 18 (Pompiers), 112 (Europe sans réseau), 114 (malentendants)",
          "S — Secourir : conscient = rassurer ; inconscient respirant = PLS ; inconscient non-respirant = MCE + DAE",
          "Les 10 premières minutes sont cruciales (golden hour) — chaque minute compte pour le pronostic vital",
          "Interdits absolus : déplacer, donner à boire, retirer le casque, extraire un corps étranger de la plaie",
          "Délit de fuite : 3 ans + 75 000 € + 6 points (article 434-10 Code pénal)",
          "Mnémotechnique : PAS — Triangle à Trente — 15/17/18/112 — Conscience → Respiration → Action",
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
    subtitle: "Régimes optimaux, anticipation, économies prouvées, conduite accompagnée",
    icon: "🌱",
    readingTime: "9 min",
    sections: [
      {
        type: "intro",
        title: "L'éco-conduite : économiser 15 % de carburant sans perdre de temps",
        content:
          "Selon l'ADEME (Agence de la transition écologique), l'éco-conduite permet de réduire la consommation de carburant de 15 % en moyenne, ce qui représente jusqu'à 5 pleins économisés par an. Les ménages français consacrent en moyenne 3 744 € par an à leurs dépenses énergétiques, dont 45 % pour les carburants. Une conduite nerveuse en ville peut générer jusqu'à 40 % de surconsommation par rapport à une conduite souple. L'éco-conduite n'est pas seulement économique : elle est aussi plus sécurisante. En anticipant mieux et en conduisant plus souplement, le risque d'accident est réduit de 10 à 30 % selon les études comportementales. C'est le sens même de l'enseignement REMC (Référentiel pour l'Éducation à une Mobilité Citoyenne) : conduire mieux, c'est conduire plus sûrement.",
      },
      {
        type: "rule",
        title: "Les régimes moteur optimaux : essence et diesel",
        content:
          "Le principal levier de l'éco-conduite est de maintenir le moteur dans sa plage de régimes optimaux. À régime trop bas, le moteur 'cale' ou 'tire' et surconsomme. À régime trop élevé, la consommation explose de façon exponentielle.",
        rules: [
          "Moteur essence : passer les vitesses entre 2 000 et 2 500 tr/min — ne jamais dépasser 3 000 tr/min en conduite normale",
          "Moteur diesel : passer les vitesses entre 1 500 et 2 000 tr/min — le couple élevé permet des montées de rapport plus précoces",
          "Règle des passages de vitesse précoces : 2e à partir de 20 km/h, 3e à 30 km/h, 4e à 40 km/h, 5e à 50 km/h (vitesses indicatives adaptables selon la pente et la charge)",
          "En décélération : débrayer le plus tard possible et laisser le frein moteur agir — en vitesse engagée, les systèmes modernes coupent l'injection : consommation = 0",
          "Éviter les régimes élevés prolongés : au-dessus de 3 000 tr/min, la consommation augmente exponentiellement — conduire à 130 km/h consomme 25 % de plus qu'à 110 km/h",
          "Boîte automatique : utiliser le mode 'Éco' ou maintenir le levier en position 'D' avec une accélération progressive et douce — éviter le mode 'Sport' au quotidien",
          "Moteur froid (premier km) : surconsommation de 45 % au 1er km, 25 % au 2e km — ne pas accélérer fort avant que la température monte",
        ],
        highlight: "2 000-2 500 tr/min (essence) — 1 500-2 000 (diesel) — passer les vitesses tôt",
      },
      {
        type: "rule",
        title: "L'anticipation : le geste le plus puissant de l'éco-conduite",
        content:
          "L'anticipation est le comportement qui différencie le plus un conducteur économe d'un conducteur énergivore. Un freinage inutile = de l'énergie cinétique gaspillée qu'il faudra recréer par l'accélération. Moins on freine inutilement, moins on consomme.",
        rules: [
          "Regarder loin devant (100 à 200 m en ville, plus sur route) : anticiper les feux, ronds-points, ralentissements, cédez-le-passage",
          "Lever le pied de l'accélérateur TÔT : laisser le véhicule décélérer en frein moteur (injection coupée) sans freiner",
          "Un freinage évité = de l'énergie cinétique préservée et du carburant économisé",
          "Feux tricolores : si le feu est rouge visible à 200 m, lever le pied immédiatement — souvent le feu passera au vert avant d'arriver, sans arrêt complet",
          "Maintenir une vitesse stable sur autoroute plutôt que des vagues d'accélérations/freinages : le régulateur de vitesse réduit la consommation de 5 à 10 %",
          "Sur les descentes légères : laisser rouler en frein moteur plutôt qu'accélérer — profiter du relief",
          "Distances de sécurité longues en ville : permettent d'anticiper et d'éviter les arrêts complets",
          "Réduire sa vitesse sur autoroute de 130 à 110 km/h : économie de 3,5 à 4,5 litres aux 100 km selon le véhicule",
        ],
        highlight: "Anticiper = ne pas freiner = ne pas consommer — regarder à 200 m minimum",
      },
      {
        type: "rule",
        title: "Les autres leviers d'éco-conduite : entretien et équipement",
        content:
          "L'éco-conduite dépasse les seuls gestes au volant. L'état du véhicule, son chargement et ses équipements influencent directement la consommation.",
        rules: [
          "Pression des pneus : un pneu sous-gonflé de 0,5 bar augmente la consommation de 2 % — vérifier à froid chaque mois (ou avant chaque long trajet)",
          "Climatisation : augmente la consommation de 5 à 20 % selon la vitesse et la différence de température — préférer la ventilation naturelle en dessous de 80 km/h",
          "Limiter l'écart de température intérieur/extérieur à 5°C maximum — ne pas descendre à 17°C quand il fait 35°C dehors",
          "Charge du véhicule : 100 kg de poids supplémentaire = +0,5 L/100 km — vider le coffre des objets inutiles au quotidien",
          "Galerie de toit, coffre de toit, porte-vélos vides : augmentent la traînée aérodynamique de 10 à 30 % — les retirer lorsqu'inutilisés",
          "Arrêt moteur : inutile de laisser tourner plus de 30 secondes en stationnement — les moteurs modernes ne nécessitent pas de chauffe à froid prolongée",
          "Système Stop & Start : ne pas le désactiver en ville — il coupe le moteur aux arrêts et réduit la consommation de 3 à 8 %",
          "Entretien régulier : filtre à air encrassé = +5 % de consommation ; bougies usées = +15 % de consommation",
        ],
        highlight: "Pneus + climatisation + charge + aérodynamisme = 4 leviers complémentaires",
      },
      {
        type: "rule",
        title: "La conduite accompagnée (AAC) : atout éco-conduite et sécurité",
        content:
          "La conduite accompagnée (Apprentissage Anticipé de la Conduite) forme des conducteurs plus économes et plus sûrs. Les statistiques officielles 2024 le confirment.",
        rules: [
          "Taux de réussite à l'examen pratique en AAC : 74 % contre 55 % en filière classique (source : 2024)",
          "Depuis le 1er janvier 2024 : obtention du permis B possible dès 17 ans en AAC, conduire seul immédiatement après",
          "Période probatoire réduite : 2 ans au lieu de 3 ans — capital de 12 points atteint 1 an plus tôt",
          "Économies sur la formation : 26 heures en moyenne en AAC contre 35 heures en filière classique — économie d'environ 477 € en Île-de-France",
          "Réduction de la surprime d'assurance : -50 % la 1ère année, -25 % la 2e, -12,5 % la 3e pour les conducteurs AAC",
          "L'éco-conduite est enseignée pendant les 3 000 km de conduite accompagnée — les accompagnateurs transmettent leurs habitudes d'anticipation",
          "73 000 jeunes ont bénéficié de l'aide financière à la conduite accompagnée en 2024 (France Compétences)",
        ],
        highlight: "AAC : 74 % de réussite vs 55 % — permis dès 17 ans depuis janvier 2024",
      },
      {
        type: "tip",
        title: "Conseil du moniteur : l'affichage de consommation instantanée comme outil pédagogique",
        content:
          "La plupart des véhicules fabriqués après 2010 disposent d'un affichage de consommation instantanée (en L/100 km) sur le tableau de bord ou l'écran central. Lors de vos leçons, votre moniteur vous demandera de surveiller cet indicateur : il est le retour immédiat de vos gestes. Vous constaterez qu'une accélération franche fait monter la consommation à 15-20 L/100 km, qu'une décélération en frein moteur l'affiche à 0 L/100 km, et qu'une vitesse stable autour de 2 000 tr/min la maintient à 5-6 L/100 km. Ce retour visuel transforme votre conduite plus rapidement que n'importe quelle explication théorique. L'éco-conduite s'apprend en regardant les chiffres se transformer en temps réel.",
      },
      {
        type: "example",
        title: "Calcul concret des économies annuelles",
        content:
          "Mathieu fait 15 000 km par an avec sa voiture essence consommant 8 L/100 km. À 1,85 €/L (prix moyen 2025), il dépense 2 220 € de carburant. Après une formation à l'éco-conduite (passages de vitesse précoces, anticipation, pneus gonflés, climatisation maîtrisée), sa consommation tombe à 6,5 L/100 km. Il dépense désormais 1 804 €/an. Économie annuelle : 416 €. Sur 5 ans : 2 080 € économisés, soit le coût de son permis de conduire. En bonus : ses freins et ses pneus s'usent moins vite (économie supplémentaire de 200 à 400 € sur la même période). Et son risque d'accident est réduit de 15 % grâce à une conduite plus anticipative. L'éco-conduite est le seul geste qui améliore simultanément le portefeuille, la sécurité et l'environnement.",
      },
      {
        type: "tip",
        title: "Moyens mnémotechniques éco-conduite : les repères des moniteurs",
        content:
          "Moyen 1 — 'DEUX-DEUX-CINQ-CINQ' (essence) : passer les vitesses entre 2 000 et 2 500 tr/min — le régime optimal essence à retenir comme un code. Moyen 2 — 'UN-CINQ — DEUX-MILLE' (diesel) : 1 500 à 2 000 tr/min pour le diesel — plus tôt car le couple diesel est plus élevé à bas régime. Moyen 3 — '20-30-40-50 = 2-3-4-5' : les passages de vitesse précoces — à 20 km/h passer en 2e, 30 km/h en 3e, 40 km/h en 4e, 50 km/h en 5e. Moyen 4 — 'LEVER le pied = ZÉRO consommation' : en vitesse engagée, la décélération en frein moteur coupe l'injection sur les véhicules modernes. Ne pas accélérer pour maintenir la vitesse en descente. Moyen 5 — 'ANTICIPER = NE PAS FREINER = ÉCONOMISER' : la chaîne de causalité de l'éco-conduite. Chaque freinage inutile est de l'énergie cinétique transformée en chaleur (énergie perdue). Moyen 6 — '-10 à -15 % garanti' : l'économie standard de l'éco-conduite selon l'ADEME — à retenir pour l'examen. Astuce : l'inspecteur du code teste souvent si vous connaissez la différence entre régimes essence et diesel, et si vous savez à quelle vitesse passer les rapports.",
      },
      {
        type: "example",
        title: "Scénarios types à l'examen du code : ce que l'inspecteur cherche",
        content:
          "Scénario 1 — 'À quelle vitesse environ doit-on passer en 3e vitesse pour une conduite économique ?' Réponse : autour de 30 km/h — en maintenant le régime entre 2 000 et 2 500 tr/min pour un moteur essence. Scénario 2 — 'Quelle action réduit le plus la consommation en approche d'un feu rouge visible à 200 m ?' Réponse : lever le pied de l'accélérateur immédiatement et laisser le frein moteur décélérer le véhicule — consommation zéro pendant la décélération. Scénario 3 — 'Un conducteur roule à 130 km/h sur autoroute. Comment peut-il économiser du carburant sans changer de comportement de conduite ?' Réponse : réduire la vitesse à 110 km/h (économie de 3,5 à 4,5 L/100 km) et utiliser le régulateur de vitesse (économie supplémentaire de 5 à 10 %). Scénario 4 — 'Un conducteur garde son coffre de toit vide sur son véhicule toute l'année. Quel est l'impact ?' Réponse : augmentation de la traînée aérodynamique de 10 à 30 %, donc surconsommation permanente — il doit être retiré lorsqu'il n'est pas utilisé. L'inspecteur vérifie que vous comprenez le lien entre anticipation, régimes moteur et économies concrètes.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Éco-conduite :",
        rules: [
          "ADEME : éco-conduite = -10 à -15 % de consommation en moyenne, jusqu'à 5 pleins économisés par an",
          "Régimes optimaux : 2 000-2 500 tr/min (essence), 1 500-2 000 tr/min (diesel) — passer les vitesses tôt",
          "Passages de vitesse tôt : 2e à 20 km/h, 3e à 30 km/h, 4e à 40 km/h, 5e à 50 km/h",
          "Anticiper les freinages = frein moteur = consommation zéro pendant la décélération",
          "Pression des pneus mensuelle : -0,5 bar = +2 % de consommation — vérifier à froid",
          "AAC : 74 % de réussite vs 55 % filière classique — permis dès 17 ans depuis 2024",
          "Conduire nerveusement en ville : jusqu'à +40 % de consommation par rapport à une conduite souple",
          "Mnémotechnique : '20-30-40-50 = 2-3-4-5' pour les passages de vitesse précoces",
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
    subtitle: "Fonctionnement, statistiques 2023-2024, infractions, récupération, invalidation",
    icon: "⭐",
    readingTime: "10 min",
    sections: [
      {
        type: "intro",
        title: "Le permis à points : un capital de confiance que la route vous retire progressivement",
        content:
          "Instauré en France le 1er juillet 1992, le permis à points est un système de responsabilisation progressive des conducteurs. En 25 ans, il a contribué, avec d'autres mesures, à diviser par trois le nombre de morts sur les routes françaises. En 2023, 15,8 millions de points ont été retirés sur les permis français pour 12,1 millions d'infractions traitées. La même année, 54 692 permis ont été invalidés pour solde nul — 82,9 % chez des hommes. En 2024, 11,7 millions de points ont été retirés (baisse de 26 % due à la suppression des retraits pour les excès inférieurs à 5 km/h). Pourtant, 79 % des conducteurs conservent encore leur capital maximal de 12 points — mais seulement 53 % des présumés responsables d'accidents mortels sont dans ce cas (ONISR 2023).",
      },
      {
        type: "rule",
        title: "Le capital de points : fonctionnement précis selon le profil",
        content:
          "Le capital de points est géré par le Fichier National des Permis de Conduire (FNPC), accessible via le site Télépoints (telepoints.interieur.gouv.fr) avec FranceConnect. Chaque conducteur peut consulter son solde gratuitement et à tout moment.",
        rules: [
          "À l'obtention du permis B : 6 points (permis probatoire)",
          "Conducteurs en filière classique : +2 points par année complète sans infraction entraînant retrait de points — capital de 12 points atteint en 3 ans",
          "Conducteurs en conduite accompagnée (AAC) : +3 points par année sans infraction — capital de 12 points atteint en 2 ans (avantage majeur de l'AAC)",
          "Capital maximum : 12 points — impossible d'en avoir plus",
          "Solde à 0 point : permis invalidé — obligation de remettre le titre à la préfecture sous 10 jours",
          "Notification : chaque retrait de points est signalé par lettre recommandée avec accusé de réception",
          "Les points ne sont retirés qu'au paiement de l'amende ou à la condamnation définitive — pas au moment de l'infraction",
          "Les infractions au contrôle automatisé (radar) entraînent le retrait de points seulement après paiement ou délai de contestation épuisé",
        ],
        highlight: "6 points au départ → 12 points en 3 ans (2 ans en AAC) — consultable sur Télépoints",
      },
      {
        type: "rule",
        title: "Tableau complet des infractions et retraits de points (ONISR 2023)",
        content:
          "En 2023, la vitesse représentait 48,3 % des points retirés, le téléphone 14,6 %, les règles de priorité 15,9 %. Connaître le coût précis de chaque infraction est la meilleure prévention.",
        rules: [
          "Excès de vitesse < 20 km/h (hors agglomération) : 1 point — depuis 2024, les excès < 5 km/h ne donnent plus lieu à retrait",
          "Excès de vitesse de 20 à 29 km/h : 2 points",
          "Excès de vitesse de 30 à 39 km/h : 3 points",
          "Excès de vitesse de 40 à 49 km/h : 4 points + suspension possible",
          "Excès de vitesse de 50 km/h et plus : 6 points + suspension immédiate obligatoire",
          "Alcoolémie entre 0,5 et 0,8 g/L : 6 points + 135 € d'amende",
          "Alcoolémie supérieure à 0,8 g/L : 6 points + annulation possible + jusqu'à 4 500 €",
          "Usage du téléphone tenu en main (article R412-6-1) : 3 points + 135 €",
          "Non-respect d'un feu rouge ou d'un panneau Stop : 4 points + 135 €",
          "Non-port de la ceinture de sécurité : 3 points + 135 €",
          "Non-respect du passage piéton : 6 points + 135 €",
          "Conduite sous stupéfiants : 6 points + jusqu'à 9 000 €",
          "Dépassement dangereux : 3 points + 135 €",
          "Distance de sécurité insuffisante (< 50 m à plus de 130 km/h) : 3 points + 135 €",
          "Utilisation des voies réservées (couloir de bus, piste cyclable) : 3 points + 135 €",
        ],
        highlight: "Vitesse = 48 % des retraits — téléphone = 14,6 % — priorité = 15,9 % (ONISR 2023)",
      },
      {
        type: "rule",
        title: "Récupération des points : les deux voies possibles",
        content:
          "La récupération de points est possible par deux mécanismes : automatique (par le temps) ou volontaire (via un stage de sensibilisation). En 2023, 5,9 millions de conducteurs ont récupéré leur capital initial de 12 points.",
        rules: [
          "Récupération automatique d'1 point : après 6 mois sans infraction entraînant retrait de points (uniquement pour les permis non probatoires)",
          "Récupération totale automatique : capital remis à 12 points après 10 ans sans infraction entraînant retrait",
          "Récupération rapide totale : capital remis à 12 points après 2 à 3 ans sans infraction selon le statut (probatoire ou non)",
          "Stage volontaire de sensibilisation à la sécurité routière : +4 points en 2 jours (2 points par jour)",
          "Conditions du stage volontaire : avoir au minimum 3 points, ne pas être sous le coup d'une procédure de suspension ou d'annulation, n'avoir pas suivi de stage dans les 2 ans précédents",
          "Fréquence maximale : 1 stage tous les 2 ans",
          "Coût moyen d'un stage : 150 à 250 € — 1 418 centres de stages en France (2023)",
          "Le stage n'efface pas les infractions — il ajoute 4 points sans dépasser le plafond de 12",
          "Stage obligatoire dans certains cas : permis probatoire avec retrait d'au moins 3 points sur une même infraction",
        ],
        highlight: "Stage volontaire : +4 points, 1 fois/2 ans, 150-250 €, 1 418 centres en France",
      },
      {
        type: "warning",
        title: "L'invalidation du permis : conséquences réelles et procédure",
        content:
          "En 2023, 54 692 permis ont été invalidés pour solde nul en France — 82,9 % chez des hommes, dont 11 531 étaient des permis probatoires. En 2024, ce chiffre est descendu à 47 916, en partie grâce à la réforme sur les petits excès de vitesse.",
        rules: [
          "Notification par lettre recommandée avec accusé de réception : vous disposez de 10 jours pour remettre votre permis à la préfecture ou sous-préfecture de votre domicile",
          "Interdiction de conduire dès réception de la lettre — continuer à conduire est un délit pénal",
          "Délai minimal avant de repasser le permis : 6 mois (1ère invalidation) — 1 an si récidive dans les 5 ans suivant la 1ère",
          "Obligation de repasser l'examen du code de la route ET l'examen pratique de conduite intégralement",
          "Le nouveau permis est délivré avec 6 points (retour à la case départ du permis probatoire)",
          "Période probatoire repart à zéro pour 3 ans (ou 2 ans en AAC)",
          "Conduire malgré l'invalidation : délit pénal — jusqu'à 2 ans d'emprisonnement + 4 500 € d'amende + confiscation du véhicule",
          "Un permis invalidé peut avoir des conséquences professionnelles graves pour les conducteurs dont l'emploi dépend du permis",
        ],
        highlight: "54 692 invalidations en 2023 — 10 jours pour remettre le permis — repasser code ET conduite",
      },
      {
        type: "tip",
        title: "Conseil du moniteur : surveiller son solde AVANT d'être en danger",
        content:
          "Votre solde de points est consultable gratuitement et instantanément sur le site Télépoints (telepoints.interieur.gouv.fr), accessible via FranceConnect (identité numérique). La démarche prend 2 minutes. Ce que votre moniteur vous conseille : (1) Consultez votre solde dès l'obtention du permis, puis tous les 6 mois. (2) Faites un stage volontaire dès que vous tombez sous 8 points — n'attendez pas 2 ou 3 points pour réagir. (3) En cas de doute sur une infraction verbalisée : un délai moyen de 45 jours à 6 mois s'écoule entre l'infraction et le retrait effectif des points — le solde peut donc ne pas encore refléter des infractions récentes. (4) Si vous perdez des points injustement : la Commission des permis de conduire peut être saisie dans les 6 mois suivant la notification.",
      },
      {
        type: "example",
        title: "Cas concret : un permis novice invalidé en moins d'un an",
        content:
          "Lucas obtient son permis B en filière classique en janvier 2025 avec 6 points. Mars 2025 : contrôle radar à 57 km/h en zone 50 — dépassement de 7 km/h — 1 point retiré, il reste à 5 points. Juin 2025 : feu rouge grillé — 4 points retirés, il tombe à 1 point. Septembre 2025 : téléphone tenu en main lors d'un contrôle — 3 points de retrait souhaités, mais il n'en a qu'1 — son solde tombe à 0. Notification par lettre recommandée : il a 10 jours pour remettre son permis à la préfecture. Délai d'attente : 6 mois minimum. Puis il repasse le code ET la conduite. Il repart avec 6 points probatoires et 3 ans de période probatoire. Coût total estimé : amendes + frais de reprise de formation + temps = environ 2 500 à 3 500 €, sans compter la perte de mobilité. Trois infractions banales ont annulé un an de vie de conducteur.",
      },
      {
        type: "tip",
        title: "Moyens mnémotechniques permis à points : les repères des moniteurs",
        content:
          "Moyen 1 — 'SIX au départ, DOUZE à l'arrivée' : le permis novice démarre à 6 points et monte à 12 points — le capital maximal. En filière classique, il faut 3 ans de conduite sans infraction grave. En AAC, seulement 2 ans. Moyen 2 — 'PLUS QUATRE en DEUX JOURS' : le stage volontaire donne +4 points en 2 jours (2 points par jour) — maximum 1 stage tous les 2 ans (et non 1 fois par an). Moyen 3 — 'UN POINT PAR AN sans infraction' : pour un conducteur confirmé hors période probatoire, chaque période de 6 mois sans infraction entraînant retrait = récupération automatique d'1 point — soit environ 1 point par an en rythme de croisière. Moyen 4 — 'DIX ANS pour tout récupérer' : le capital intégral de 12 points est restauré automatiquement après 10 ans sans infraction grave. Moyen 5 — 'SIX points = les cas graves' : toutes les infractions les plus graves retirent 6 points — alcool (> 0,5 g/L), stupéfiants, grand excès de vitesse (>= 50 km/h), non-respect du passage piéton. Les retenir par groupe de gravité. Moyen 6 — 'TÉLÉPOINTS pour vérifier' : le site officiel telepoints.interieur.gouv.fr permet de consulter son solde en 2 minutes via FranceConnect — à faire tous les 6 mois.",
      },
      {
        type: "example",
        title: "Scénarios types à l'examen du code : ce que l'inspecteur cherche",
        content:
          "Scénario 1 — 'Un jeune conducteur en permis probatoire (filière classique) perd 3 points pour un excès de vitesse de 25 km/h. Combien lui reste-t-il de points et comment les récupère-t-il ?' Réponse : il démarre à 6 points, il lui en reste 3. Pour récupérer, il peut attendre (récupération automatique de +2 points/an sans infraction grave) ou faire un stage volontaire (+4 points) si son solde est >= 3 points. Scénario 2 — 'Un conducteur expérimenté (12 points) fait un stage volontaire. Combien de points obtient-il ?' Réponse : aucun point supplémentaire — il est déjà au capital maximal de 12 points. Le stage ne peut pas dépasser le plafond. Scénario 3 — 'Un conducteur reçoit une lettre recommandée l'informant que son permis est invalidé (0 point). Que doit-il faire et dans quel délai ?' Réponse : remettre son titre à la préfecture dans les 10 jours. Il ne peut plus conduire dès réception de la lettre. Il devra attendre 6 mois minimum, puis repasser intégralement le code et la conduite. Scénario 4 — 'Combien d'années faut-il à un conducteur en AAC pour atteindre le capital de 12 points ?' Réponse : 2 ans (contre 3 ans en filière classique) — c'est l'un des avantages majeurs de la conduite accompagnée. L'inspecteur vérifie que vous distinguez AAC et filière classique, et que vous connaissez les conditions du stage volontaire.",
      },
      {
        type: "summary",
        title: "Ce qu'il faut retenir",
        content: "Le permis à points :",
        rules: [
          "6 points au départ (permis probatoire) → 12 points en 3 ans filière classique (2 ans en AAC)",
          "15,8 millions de points retirés en 2023 — 54 692 permis invalidés (ONISR 2023)",
          "Vitesse = 48 % des retraits — téléphone = 14,6 % — priorité = 15,9 %",
          "Stage volontaire : +4 points, 1 fois tous les 2 ans, 150-250 €, conditions : min. 3 points",
          "Récupération automatique : 1 pt tous les 6 mois sans infraction grave (hors probatoire) — 10 ans pour tout récupérer",
          "Invalidation (0 point) : 10 jours pour remettre le permis, 6 mois d'attente, repasser code + conduite",
          "Infractions à 6 points : alcool > 0,5 g/L, excès >= 50 km/h, non-respect passage piéton, stupéfiants",
          "Solde consultable gratuitement sur Télépoints (telepoints.interieur.gouv.fr) via FranceConnect",
          "Mnémotechnique : 'SIX au départ — DOUZE à l'arrivée — PLUS QUATRE en stage — DIX ANS pour tout récupérer'",
        ],
      },
    ],
  },
];
