export type LessonStep = { title: string; explanation: string; why: string };
export type Course = {
  id: string;
  code: string;
  group: "C1" | "C2" | "Manœuvres" | "Sécurité";
  title: string;
  minutes: number;
  intro: string;
  objective: string;
  steps: LessonStep[];
  example: string;
  traps: string[];
  safety: string;
  takeaway: string;
  tags: string[];
  sourcePages: string;
};
const step = (title: string, explanation: string, why: string): LessonStep => ({
  title,
  explanation,
  why,
});
export const courses: Course[] = [
  {
    id: "c1-verifications",
    code: "1.1",
    group: "C1",
    title: "Connaître ta voiture et ses commandes",
    minutes: 5,
    intro:
      "Avant de te demander de bien conduire, je veux que tu saches avec quoi tu conduis. Une commande que tu connais, c’est une recherche de moins quand la circulation réclame ton attention.",
    objective:
      "Trouver les commandes utiles et comprendre ce que tu vérifies, sur le véhicule de ta leçon.",
    steps: [
      step(
        "Repère les commandes à l’arrêt",
        "Installe-toi et retrouve les feux, les clignotants, le désembuage, les essuie-glaces et le signal de détresse. N’appuie pas au hasard : explique ce que tu veux obtenir, puis montre la commande. Sur ta voiture, les commandes peuvent être différentes de celles d’une vidéo.",
        "Tu dois pouvoir agir sans garder les yeux dans l’habitacle lorsque tu roules.",
      ),
      step(
        "Relie le contrôle à son utilité",
        "Pour une vérification extérieure, demande-toi ce que tu cherches : un pneu abîmé, un feu qui ne fonctionne pas, une visibilité dégradée. À l’intérieur, distingue un voyant d’information d’une alerte qui demande une action. Un voyant rouge n’est pas à ignorer.",
        "Réciter une réponse sans comprendre ne permet pas de prendre la bonne décision en situation réelle.",
      ),
      step(
        "Prépare les questions de l’examen",
        "Révise avec les supports en vigueur et une démonstration adaptée au modèle utilisé. Fais le lien entre la vérification, la sécurité routière et les premiers secours. Les documents et vidéos complètent les explications de ton enseignant.",
        "Tu seras plus à l’aise si tu sais montrer et expliquer, plutôt que réciter des numéros de questions.",
      ),
    ],
    example:
      "Il pleut et le pare-brise s’embue : tu identifies le manque de visibilité, puis tu choisis essuie-glaces et désembuage avant de repartir.",
    traps: [
      "Apprendre uniquement la position des boutons d’une autre voiture.",
      "Poursuivre malgré une alerte dont tu ne comprends pas le sens.",
    ],
    safety:
      "Fais ces recherches à l’arrêt. Les vérifications sous le capot se font dans les conditions prévues par le constructeur, avec l’enseignant.",
    takeaway:
      "Je sais ce que je vérifie, pourquoi je le vérifie et quelle commande utiliser.",
    tags: ["Commandes", "Observation"],
    sourcePages: "Fiche C1-C2, p. 1.",
  },
  {
    id: "c1-installation",
    code: "1.2",
    group: "C1",
    title: "T’installer avant de démarrer",
    minutes: 5,
    intro:
      "Une bonne installation, ce n’est pas du confort en plus : c’est ce qui te permet de doser, de voir et de tourner sans te battre avec la voiture.",
    objective:
      "Régler ton poste de conduite dans un ordre cohérent et vérifier que tu peux partir.",
    steps: [
      step(
        "Règle le siège, le dossier et l’appui-tête",
        "Commence par la distance aux pédales et la hauteur. Tu dois atteindre les commandes sans tendre complètement la jambe ni décoller le bassin. Garde le dos soutenu, puis règle l’appui-tête à la bonne hauteur.",
        "Si tu modifies le siège après tes rétroviseurs, les réglages précédents ne seront plus fiables.",
      ),
      step(
        "Règle le volant et les rétroviseurs",
        "Approche le volant pour garder les bras légèrement fléchis et voir les instruments. Règle ensuite l’intérieur et les extérieurs depuis ta position normale. Mets la ceinture correctement et vérifie que les passagers sont attachés.",
        "Tu crées une position de référence stable : tes repères de trajectoire et ta vision latérale deviennent plus cohérents.",
      ),
      step(
        "Prépare la visibilité et le départ",
        "Lis les informations du tableau de bord. Observe la météo et ce qui t’entoure. Si besoin, règle ventilation, éclairage et essuie-glaces avant de partir. Pour sortir, vérifie aussi le côté de la portière, notamment l’arrivée d’un vélo.",
        "Préparer la voiture à l’arrêt te laisse disponible pour observer les autres au démarrage.",
      ),
    ],
    example:
      "Si tu dois te pencher pour atteindre le frein, tu n’es pas prêt à partir. Corrige ton installation, même si tu as l’impression de perdre trente secondes.",
    traps: [
      "Régler les rétroviseurs en étant penché.",
      "Mettre la ceinture sous le bras.",
      "Ouvrir la portière sans vérifier l’arrière et le côté.",
    ],
    safety:
      "Les réglages importants se font à l’arrêt. Une position apprise doit être adaptée à ta morphologie.",
    takeaway:
      "Siège, dossier, appui-tête, volant, rétroviseurs, ceinture, visibilité.",
    tags: ["Installation", "Observation"],
    sourcePages: "Fiche C1-C2, p. 1.",
  },
  {
    id: "c1-volant",
    code: "1.3",
    group: "C1",
    title: "Le regard guide, les mains accompagnent",
    minutes: 7,
    intro:
      "Si tu regardes le trottoir en te disant « je ne veux pas le toucher », tu risques de te diriger vers lui. On va d’abord choisir où on veut aller ; les mains accompagnent ensuite.",
    objective:
      "Tourner et redresser progressivement en gardant une trajectoire régulière.",
    steps: [
      step(
        "Pose tes mains et choisis ta cible",
        "Garde les deux mains sur le volant dans une position stable, adaptée au véhicule ; la position proche de 9 h 15 est une référence courante. Ne serre pas trop fort. Regarde le fond de la rue que tu veux rejoindre, puis ramène de courts contrôles près de toi.",
        "Le regard loin donne la direction ; les contrôles proches vérifient les marges de sécurité.",
      ),
      step(
        "Prépare la rotation sans précipitation",
        "Réduis l’allure avant de tourner. Utilise le repère travaillé ensemble, par exemple la position du rétroviseur par rapport au bord du trottoir, en le confirmant par la voie cible. Tire et accompagne le volant avec une méthode contrôlée.",
        "Le repère dépend du véhicule, de ton installation et du dessin de l’intersection. Il t’aide mais ne remplace pas ton observation.",
      ),
      step(
        "Redresse en regardant la sortie",
        "Quand la voiture s’aligne sur la rue choisie, accompagne le retour du volant avec les mains. Ne le lâche pas complètement. Évite les grosses corrections : regarde la trajectoire obtenue et ajuste progressivement.",
        "Le retour accompagné évite de finir trop près d’un bord ou d’osciller entre les deux côtés.",
      ),
    ],
    example:
      "Dans un tournant à droite, ta cible est la voie autorisée. S’il y a une voie de bus au bord, tu ne prends pas automatiquement le trottoir comme repère de placement.",
    traps: [
      "Fixer le capot ou le trottoir.",
      "Commencer à tourner avant d’avoir adapté l’allure.",
      "Laisser le volant revenir sans contrôle des mains.",
    ],
    safety:
      "Un repère visuel se calibre avec ton enseignant. Un placement des mains imparfait n’est pas, à lui seul, une faute éliminatoire automatique.",
    takeaway:
      "Je regarde ma voie, je tourne progressivement, j’accompagne le retour.",
    tags: ["Volant", "Placement"],
    sourcePages: "Fiche C1-C2, p. 1-2 ; fiche avec éliminatoires, p. 1.",
  },
  {
    id: "c1-pedales",
    code: "1.5",
    group: "C1",
    title: "Doser l’accélérateur et le frein",
    minutes: 6,
    intro:
      "Ce sont des pédales qui se dosent. Tu ne t’effondres pas dessus. L’objectif, c’est de décider de ton allure puis de la construire progressivement.",
    objective:
      "Accélérer sans à-coup et t’arrêter à un endroit choisi avec un freinage progressif.",
    steps: [
      step(
        "Prépare ton ralentissement",
        "Observe loin et vérifie derrière toi avant un ralentissement prévisible, sans retarder un freinage urgent. Relâche l’accélérateur assez tôt. Sur une électrique, apprends avec l’enseignant l’effet de la récupération d’énergie et des modes du véhicule.",
        "Plus tu anticipes, moins tu as besoin d’une action brutale au dernier moment.",
      ),
      step(
        "Applique la pression nécessaire",
        "Pose le pied avec précision et augmente la pression selon ton allure, la distance et l’adhérence. Garde une position qui te permet d’atteindre les pédales sans coincer le pied. Une situation urgente peut demander un freinage immédiat et ferme.",
        "Le freinage se décide à partir de la situation, pas d’une quantité de pression apprise une fois pour toutes.",
      ),
      step(
        "Allège en fin d’arrêt",
        "À mesure que la vitesse baisse, relâche progressivement une partie de la pression pour éviter l’à-coup final, puis maintiens la voiture immobilisée. Regarde ton point d’arrêt et ce qui se passe autour ; ne fixe pas tes pieds.",
        "C’est le principe du freinage dégressif pour un arrêt confortable, sans jamais sacrifier la distance nécessaire.",
      ),
    ],
    example:
      "Tu vises une ligne d’arrêt. Tu ralentis tôt, tu ajustes la pression, puis tu allèges en arrivant. Tu t’immobilises avant la ligne sans dépasser pour « rattraper » un arrêt mal préparé.",
    traps: [
      "Freiner très tard puis relâcher trop tôt.",
      "Continuer à accélérer vers un point où il faudra s’arrêter.",
      "Croire que la récupération électrique remplace toujours le frein.",
    ],
    safety:
      "En cas de danger immédiat, freine sans attendre d’effectuer une routine de contrôles. L’urgence de sécurité passe avant la recherche de confort.",
    takeaway: "J’anticipe, je dose, j’allège en fin d’arrêt.",
    tags: ["Vitesse", "Commandes"],
    sourcePages: "Fiche C1-C2, p. 2 ; fiche avec éliminatoires, p. 1.",
  },
  {
    id: "c1-trajectoire",
    code: "1.7",
    group: "C1",
    title: "Garder ta voie et préparer les courbes",
    minutes: 6,
    intro:
      "Tu es assis à gauche dans la voiture : ton corps n’est pas le centre du véhicule. On utilise ce que tu vois pour placer la voiture entière, pas seulement ton siège.",
    objective:
      "Maintenir les marges latérales et aborder une courbe avec une allure adaptée.",
    steps: [
      step(
        "Construis le milieu de ta voie",
        "Repère les bords utilisables, puis imagine le milieu de la voie. Ta position de conducteur est légèrement à gauche de ce milieu. Confirme avec de brefs regards aux rétroviseurs, sans regarder en continu un seul côté.",
        "Tu évites de placer ton siège au milieu et de décaler toute la voiture vers la droite.",
      ),
      step(
        "Prépare l’allure avant la courbe",
        "Observe la visibilité, la largeur et l’état de la chaussée. Ralentis avant la courbe si nécessaire. Garde ton pied disponible pour le frein quand la situation peut l’exiger, sans rester inutilement en freinage permanent.",
        "La vitesse d’entrée doit laisser une marge pour tenir ta voie et réagir à ce que tu ne voyais pas encore.",
      ),
      step(
        "Accompagne la courbe et adapte-toi",
        "Regarde la sortie visible de la courbe et garde des actions souples. Si l’allure reste excessive, réduis-la de façon adaptée. Sur une chaussée sans ligne, reconstitue ton espace de circulation et conserve des marges avec les véhicules croisés.",
        "Il n’y a pas de vitesse unique pour toutes les courbes : la visibilité et les autres usagers changent la décision.",
      ),
    ],
    example:
      "Dans une rue sans marquage, tu partages mentalement la largeur disponible tout en tenant compte du stationnement. Si deux voitures ne passent pas avec une marge suffisante, tu ralentis et organises le croisement.",
    traps: [
      "Fixer un bord pendant plusieurs secondes.",
      "Accélérer alors que la visibilité se referme.",
      "Confondre chaussée assez large et passage forcément possible.",
    ],
    safety:
      "Une allure trop élevée peut entraîner une perte de trajectoire ou une mise en danger. Le seul fait de ne pas garder le pied au-dessus du frein n’est pas une élimination automatique.",
    takeaway: "Je vise loin, je prépare mon allure et je protège mes marges.",
    tags: ["Placement", "Vitesse"],
    sourcePages: "Fiche C1-C2, p. 2-3.",
  },
  {
    id: "c1-controles",
    code: "1.8",
    group: "C1",
    title: "Contrôler autour de toi et avertir",
    minutes: 7,
    intro:
      "Avant d’aller prendre une place sur la route, tu vérifies qu’elle est disponible. Le clignotant annonce ton intention ; il ne te donne jamais la priorité.",
    objective:
      "Choisir des contrôles utiles avant de te déplacer et entretenir une vision de l’arrière.",
    steps: [
      step(
        "Vérifie les espaces concernés",
        "Avant un déport ou un changement de voie, contrôle l’intérieur, l’extérieur du côté concerné, puis l’angle mort si un usager peut s’y trouver. Fais des regards brefs et reviens devant. La séquence est un aide-mémoire qui s’adapte à la situation.",
        "Un cycliste ou une moto peut être présent dans une zone que les rétroviseurs ne couvrent pas.",
      ),
      step(
        "Annonce assez tôt, puis recontrôle",
        "Mets le clignotant avant de te déplacer, avec assez d’anticipation pour être compris et sans tromper sur une intersection précédente. Si tu as attendu après tes contrôles, vérifie de nouveau avant de t’engager.",
        "Une information juste il y a deux secondes peut déjà avoir changé.",
      ),
      step(
        "Entretiens une vision régulière de l’arrière",
        "Contrôle régulièrement le rétroviseur intérieur et avant les ralentissements prévisibles. La référence des sept secondes est un repère pédagogique, pas un chronomètre ni une règle officielle. Augmente les contrôles quand le contexte le demande.",
        "Savoir qui te suit aide à anticiper et à freiner tôt sans perdre l’attention devant toi.",
      ),
    ],
    example:
      "Tu veux dépasser une voiture arrêtée. Tu observes la voie en face et l’arrière, tu annonces ton déport, tu vérifies l’espace latéral puis tu passes uniquement si tu peux le faire sans imposer un freinage dangereux.",
    traps: [
      "Mettre le clignotant et partir immédiatement.",
      "Tourner longtemps la tête et perdre la trajectoire.",
      "Faire mécaniquement les mêmes contrôles avant toute petite correction du volant.",
    ],
    safety:
      "En danger immédiat, la réaction protectrice ne doit pas être retardée par une routine. Un oubli devient particulièrement grave quand il crée un risque pour un usager.",
    takeaway:
      "Je contrôle, j’annonce, je vérifie encore si la situation a changé.",
    tags: ["Observation", "Priorité"],
    sourcePages: "Fiche C1-C2, p. 3 ; fiche avec éliminatoires, p. 2.",
  },
  {
    id: "c2-pad",
    code: "2.1",
    group: "C2",
    title: "Voir, comprendre, décider : le PAD",
    minutes: 6,
    intro:
      "Voir un panneau ne suffit pas. Ce qui m’intéresse, c’est ce que tu vas en faire. Pose-toi toujours trois questions : qu’est-ce que je vois, qu’est-ce que je risque, qu’est-ce que je fais ?",
    objective:
      "Transformer les indices de la route en décisions prises assez tôt.",
    steps: [
      step(
        "Perception : relève les indices",
        "Cherche loin les panneaux, marquages, feux et intersections. Observe aussi les indices informels : une portière qui peut s’ouvrir, un ballon, un piéton tourné vers la chaussée. Un regard loin prépare l’action ; un regard plus proche la confirme.",
        "Le danger n’arrive pas uniquement par la signalisation officielle.",
      ),
      step(
        "Analyse : imagine ce qui peut évoluer",
        "Demande-toi quel usager pourrait apparaître, quelle priorité s’applique et si ta visibilité suffit. Reconnaître le dos d’un stop ou d’un cédez-le-passage peut t’aider, mais ne crée pas à lui seul une priorité certaine.",
        "Tu fais la différence entre une hypothèse utile et une information confirmée.",
      ),
      step(
        "Décision : adapte avant d’arriver",
        "Choisis une allure, un placement et une marge. Prépare un arrêt si la situation l’exige. En conduite commentée, dis simplement : « voiture qui masque, visibilité faible, je ralentis et je cherche l’information ».",
        "Le commentaire doit expliquer une décision ; il ne doit pas devenir une récitation qui surcharge ton attention.",
      ),
    ],
    example:
      "Une camionnette masque le passage piéton. Tu n’attends pas de voir une personne pour ralentir : le masque de visibilité est déjà une information utile.",
    traps: [
      "Nommer les panneaux sans modifier ta conduite.",
      "Fixer un danger et ne plus voir le reste.",
      "Prendre une supposition pour une certitude.",
    ],
    safety:
      "Un panneau ou indice manqué n’est pas automatiquement éliminatoire ; les conséquences, les infractions et le risque créé comptent.",
    takeaway: "Je perçois, j’analyse, puis je décide avant d’être dessus.",
    tags: ["Observation", "Vigilance"],
    sourcePages: "Fiche C1-C2, p. 3-4.",
  },
  {
    id: "c2-placement",
    code: "2.2",
    group: "C2",
    title: "Choisir la bonne voie sans te précipiter",
    minutes: 6,
    intro:
      "Si deux voies vont dans ta direction, ta référence reste la plus à droite compatible avec ce que tu veux faire. Et si tu t’es trompé, on préfère changer de direction que forcer un passage.",
    objective:
      "Lire les voies assez tôt et préparer ton placement avec des contrôles.",
    steps: [
      step(
        "Lis la destination de chaque voie",
        "Repère les flèches, panneaux directionnels, voies réservées et lignes. Ne confonds pas « aller à gauche » avec « prendre systématiquement la voie la plus à gauche ». Si deux voies autorisent la même direction, choisis normalement celle de droite.",
        "La signalisation réelle décide des possibilités ; une règle simplifiée ne doit pas te faire ignorer les flèches.",
      ),
      step(
        "Prépare ton changement de voie",
        "Contrôle, annonce et vérifie l’angle mort concerné. Adapte ton allure pour rejoindre un espace sans obliger un autre à freiner ou à s’écarter brutalement. Une voie de stockage te permet de préparer un changement de direction.",
        "Le bon placement se construit en amont, sans manœuvre d’urgence au dernier moment.",
      ),
      step(
        "Accepte une autre direction si nécessaire",
        "Si tu découvres trop tard que ta voie ne permet pas le trajet demandé, continue dans une direction autorisée. Explique calmement que tu n’as pas pu te replacer en sécurité.",
        "Une erreur d’itinéraire ne justifie pas une infraction ni une mise en danger.",
      ),
    ],
    example:
      "Tu es sur une voie qui impose de tourner à droite alors qu’on t’a demandé tout droit. Tu tournes à droite en sécurité, puis tu reconstruis l’itinéraire.",
    traps: [
      "Couper une ligne pour sauver la direction demandée.",
      "Croire que le clignotant impose aux autres de laisser passer.",
      "Rouler durablement à gauche sans raison sur une route à plusieurs voies.",
    ],
    safety:
      "Le placement est évalué dans son contexte. Ce sont notamment les infractions et les conséquences dangereuses qui peuvent rendre l’erreur éliminatoire.",
    takeaway: "Je lis, je choisis tôt, je me replace si c’est sûr.",
    tags: ["Placement", "Observation"],
    sourcePages: "Fiche C1-C2, p. 4 ; fiche avec éliminatoires, p. 3.",
  },
  {
    id: "c2-allure",
    code: "2.3",
    group: "C2",
    title: "Adapter ton allure, au-delà du compteur",
    minutes: 6,
    intro:
      "Être à la limitation ne veut pas dire être à la bonne allure. À cinquante dans une rue large et dégagée, tu n’as pas les mêmes informations qu’à cinquante entre deux rangées de voitures.",
    objective:
      "Relier ta vitesse à la visibilité, à l’adhérence et aux usagers.",
    steps: [
      step(
        "Distingue limite et allure adaptée",
        "La vitesse maximale autorisée est un plafond. Ton allure réelle peut devoir être bien plus basse près d’un passage piéton masqué, d’une intersection ou sur une chaussée glissante. Lis les changements de limitation.",
        "Respecter le compteur ne suffit pas si tu n’as pas la distance pour réagir.",
      ),
      step(
        "Ralentis pour obtenir de l’information",
        "Quand tu ne vois pas, réduis l’allure avant d’arriver dans la zone d’incertitude. Prépare le frein si utile. Continue à chercher, puis décide si tu peux passer ou si tu dois t’arrêter.",
        "Le ralentissement a un objectif : retrouver une marge et de la visibilité.",
      ),
      step(
        "Reprends une allure cohérente quand c’est dégagé",
        "Quand le risque est passé et que les conditions le permettent, reprends progressivement une allure compatible avec la circulation. Évite la lenteur sans raison, tout en gardant la priorité à la sécurité.",
        "La fluidité fait partie de la conduite : rester très lent sans motif peut surprendre ou gêner.",
      ),
    ],
    example:
      "Une priorité à droite est masquée. Tu ralentis pour voir. Une fois l’intersection franchie sans danger, tu reprends ton allure au lieu de conserver un freinage qui n’a plus de raison.",
    traps: [
      "Se fixer une vitesse identique pour toutes les intersections.",
      "Freiner quand on est déjà dans la difficulté.",
      "Accélérer pour faire plaisir à celui qui colle derrière.",
    ],
    safety:
      "Un excès de vitesse est une infraction. L’évaluation à l’examen dépend du comportement et du danger ; aucune fiche ne remplace l’analyse de la situation.",
    takeaway: "Ma vitesse doit me laisser le temps de voir, décider et agir.",
    tags: ["Vitesse", "Vigilance"],
    sourcePages: "Fiche C1-C2, p. 5.",
  },
  {
    id: "c2-tourner",
    code: "2.4a",
    group: "C2",
    title: "Tourner à droite ou à gauche",
    minutes: 7,
    intro:
      "Un bon tournant commence avant de tourner le volant. Tu dois avoir choisi ta voie cible, compris les priorités et préparé ton allure.",
    objective:
      "Préparer le changement de direction sans couper les trajectoires ni manquer un usager.",
    steps: [
      step(
        "Lis l’intersection en avance",
        "Repère feux, passages piétons, marquages et panneaux dès qu’ils deviennent visibles. Cherche les usagers concernés, notamment les vélos qui peuvent circuler près de toi. Les éléments se lisent selon leur disponibilité, sans attendre un ordre mécanique rigide.",
        "Le PAD te permet de comprendre le carrefour avant de commencer ton geste.",
      ),
      step(
        "Choisis le repère et la voie cible",
        "À droite, vérifie si le bord est une voie de bus ou une piste. À gauche, identifie le sens de circulation de la rue que tu rejoins. Le repère du rétroviseur peut aider à déclencher la rotation, mais confirme toujours le résultat avec ton regard.",
        "Le but n’est pas d’atteindre un repère : c’est d’entrer dans la bonne voie avec de la marge.",
      ),
      step(
        "Cède les passages concernés",
        "À gauche, vérifie la circulation venant en face avant de couper sa trajectoire, sauf signalisation qui organise autrement le passage. Aux deux directions, observe les piétons et cycles. Effectue le virage à une allure permettant de t’arrêter si nécessaire.",
        "Tu dois gérer les conflits de trajectoires, pas seulement ton volant.",
      ),
    ],
    example:
      "Tu tournes à gauche et un véhicule arrive en face. Tu attends dans une position sûre sans le forcer à freiner, puis tu tournes quand l’espace et les autres priorités le permettent.",
    traps: [
      "Tourner en fixant seulement le bord du trottoir.",
      "Prendre la voie à contresens dans la rue d’arrivée.",
      "Oublier les usagers venant en face.",
    ],
    safety:
      "Ne t’engage pas dans une intersection que tu ne peux pas dégager. Un feu vert ne supprime pas tous les conflits de trajectoires.",
    takeaway:
      "Je prépare l’allure, la voie cible et les priorités avant le volant.",
    tags: ["Intersection", "Placement"],
    sourcePages: "Fiche C1-C2, p. 5.",
  },
  {
    id: "c2-priorite",
    code: "2.4b",
    group: "C2",
    title: "Détecter une priorité à droite",
    minutes: 7,
    intro:
      "La priorité à droite se prépare avant de voir une voiture. Ton premier travail, c’est de repérer qu’il existe une rue, puis de comprendre son régime de priorité.",
    objective:
      "Détecter, identifier et franchir une intersection sans hésitation injustifiée.",
    steps: [
      step(
        "Détecte l’ouverture",
        "Cherche une rupture du trottoir, un espace entre bâtiments, une interruption du stationnement ou une signalisation annonçant une intersection. Tous les accès ne sont pas des rues : une sortie privée ou de parking peut avoir un autre régime.",
        "Tu gagnes du temps pour comprendre ce qui se cache derrière l’ouverture.",
      ),
      step(
        "Identifie la règle",
        "Lis la signalisation qui te concerne, puis les marquages et les indices complémentaires. À défaut de règle particulière, applique la priorité à droite aux voies concernées. Si un panneau vu de dos t’aide, confirme ce que tu peux avec l’ensemble du contexte.",
        "Tu ne dois ni inventer une priorité ni en supprimer une sur un seul indice incertain.",
      ),
      step(
        "Franchis avec une allure qui permet de céder",
        "Cherche assez de profondeur dans la rue pour évaluer les véhicules et leur vitesse. Cède si nécessaire. Si la visibilité ne suffit pas, ralentis davantage, voire arrête-toi. Si elle est bonne et que personne ne nécessite de céder, poursuis sans arrêt automatique.",
        "La décision dépend de la visibilité et des conflits possibles, pas d’un nombre fixe de voitures ou de mètres.",
      ),
    ],
    example:
      "Tu vois la rue tardivement derrière un utilitaire. Tu ralentis pour obtenir l’information avant de couper la trajectoire de l’usager prioritaire.",
    traps: [
      "Chercher seulement une voiture et oublier la règle.",
      "Passer parce que personne n’a encore klaxonné.",
      "S’arrêter systématiquement même quand toute la situation est clairement dégagée.",
    ],
    safety:
      "Un arrêt prudent justifié par une mauvaise visibilité est pertinent. Une hésitation n’est pas automatiquement éliminatoire ; un refus de priorité dangereux peut l’être.",
    takeaway:
      "Je détecte la rue, j’identifie la règle, je prends la décision adaptée.",
    tags: ["Priorité", "Vigilance"],
    sourcePages: "Fiche C1-C2, p. 6 ; fiche avec éliminatoires, p. 3-4.",
  },
  {
    id: "c2-pietons",
    code: "2.4c",
    group: "C2",
    title: "Anticiper les piétons et leurs intentions",
    minutes: 6,
    intro:
      "Tu ne dois pas attendre qu’un piéton soit devant ton capot pour te poser la question. Observe le passage, les feux et les personnes assez tôt.",
    objective: "Protéger les piétons et décider avant la zone de conflit.",
    steps: [
      step(
        "Cherche le passage et ses abords",
        "Regarde les deux côtés, les masques de visibilité et les personnes susceptibles de traverser. Observe les feux qui organisent le passage quand ils sont présents. Anticipe un enfant, une personne âgée ou quelqu’un qui regarde la chaussée.",
        "La vulnérabilité et l’intention d’une personne sont des informations aussi importantes que le marquage.",
      ),
      step(
        "Applique la priorité avec prudence",
        "Cède le passage, au besoin en t’arrêtant, au piéton qui s’engage régulièrement ou manifeste clairement son intention de le faire. Tiens compte des feux et du contexte. Le rouge piéton interdit la traversée au piéton, mais ne t’autorise jamais à provoquer un danger.",
        "Tu dois toujours prévenir une collision, même si l’autre usager commet une erreur.",
      ),
      step(
        "Communique par une conduite prévisible",
        "Ralentis assez tôt et arrête-toi de façon lisible si nécessaire. Ne fais pas de geste qui pourrait inviter une personne à traverser sans savoir ce que font les autres voies. Repars après avoir vérifié que le passage est dégagé.",
        "Ton véhicule n’est qu’une partie de la scène : un autre conducteur peut arriver sur la voie voisine.",
      ),
    ],
    example:
      "Un piéton commence à traverser malgré son signal rouge. Tu ne cherches pas à le « dissuader » avec la voiture : tu ralentis ou t’arrêtes pour éviter le danger.",
    traps: [
      "Croire que le feu vert donne le droit de continuer quoi qu’il arrive.",
      "Attendre le dernier moment pour regarder les trottoirs.",
      "Inviter une personne à traverser sans vision sur les autres voies.",
    ],
    safety:
      "La protection des personnes prime. S’arrêter pour éviter un danger réel n’est pas une faute éliminatoire automatique au motif que le piéton n’était pas prioritaire.",
    takeaway: "J’anticipe l’intention et je protège la personne.",
    tags: ["Priorité", "Vigilance"],
    sourcePages:
      "Fiche C1-C2, p. 6, reformulée pour la sécurité ; Code de la route R415-11.",
  },
  {
    id: "c2-giratoire",
    code: "2.5",
    group: "C2",
    title: "Comprendre et franchir un giratoire",
    minutes: 8,
    intro:
      "La forme ronde ne dit pas à elle seule qui est prioritaire. Cherche le cédez-le-passage et les autres indications avant de décider.",
    objective: "Entrer, circuler et sortir sans couper les voies.",
    steps: [
      step(
        "Identifie la priorité à l’entrée",
        "Avec un cédez-le-passage à ton entrée, tu cèdes aux usagers qui circulent sur l’anneau dans les conditions prévues. Sans cette signalisation, identifie la règle réellement applicable, notamment la priorité à droite. Observe aussi les passages piétons et cyclables.",
        "Un giratoire et un rond-point à priorité à droite peuvent se ressembler visuellement mais demander des décisions différentes.",
      ),
      step(
        "Choisis ton placement",
        "Utilise la signalisation. À défaut d’indication particulière, rester à droite est une référence simple ; pour une sortie située à gauche par rapport à ton entrée, tu peux te placer à gauche dans un giratoire à plusieurs voies si les conditions le permettent. Ce n’est pas une obligation automatique.",
        "La voie intérieure peut faciliter le trajet, mais impose ensuite de préparer un retour à droite en sécurité.",
      ),
      step(
        "Prépare le retour à droite avant ta sortie",
        "Après avoir dépassé la sortie qui précède la tienne, prépare ton déplacement : contrôles, clignotant et angle mort concerné, puis laisse passer les usagers déjà dans la voie extérieure. Anticipe plus tôt si la circulation l’exige.",
        "Le repère de l’avant-dernière sortie est un aide-mémoire ; il ne donne pas la priorité pour changer de voie.",
      ),
      step(
        "Renonce à sortir si l’espace manque",
        "Ne coupe pas deux voies d’un seul coup. Si tu ne peux pas rejoindre la sortie sans risque, continue dans une direction autorisée et adapte ton itinéraire. Ne t’arrête pas sans raison sur l’anneau, mais arrête-toi si un danger ou la circulation l’exige.",
        "Rater une sortie est préférable à imposer une collision ou une manœuvre d’urgence.",
      ),
    ],
    example:
      "Tu es sur la voie intérieure et une voiture reste à ta droite au niveau de la sortie. Tu ne la coupes pas : tu poursuis et tu prépares une solution sûre.",
    traps: [
      "Assimiler tout carrefour rond à une priorité à gauche.",
      "Sortir directement de la voie intérieure.",
      "Se rabattre parce que le clignotant est déjà allumé.",
    ],
    safety:
      "Le changement de voie doit respecter les usagers présents. Un arrêt imposé par un danger ou un embouteillage ne devient pas fautif parce qu’il a lieu sur un giratoire.",
    takeaway:
      "Je lis la priorité, je prépare ma voie, je sors depuis une position sûre.",
    tags: ["Giratoire", "Priorité", "Placement"],
    sourcePages: "Fiche C1-C2, p. 6 ; fiche avec éliminatoires, p. 4.",
  },
  {
    id: "manoeuvre-arriere",
    code: "M1",
    group: "Manœuvres",
    title: "Reculer droit, avec de petites corrections",
    minutes: 6,
    intro:
      "Pour une marche arrière en ligne droite, on cherche surtout une bonne observation et une trajectoire calme. Si tu corriges fort à chaque seconde, la voiture va faire de grands écarts.",
    objective:
      "Reculer lentement en observant directement et en corrigeant progressivement.",
    steps: [
      step(
        "Prépare la zone",
        "Choisis un emplacement autorisé et suffisamment dégagé. Annonce la manœuvre de façon adaptée, observe autour de toi et vérifie l’espace derrière la voiture. N’engage pas la marche arrière avant de savoir où tu vas.",
        "Reculer ne te donne pas la priorité sur ceux qui circulent.",
      ),
      step(
        "Regarde et avance à très faible allure",
        "Privilégie la vision directe arrière, complétée par les rétroviseurs et les aides du véhicule. Alterne pour surveiller les angles et l’avant qui peut se déporter. La caméra aide, mais ne montre pas forcément tous les dangers.",
        "Une observation large reste indispensable à chaque mouvement du véhicule.",
      ),
      step(
        "Corrige peu et laisse la distance agir",
        "Choisis une référence lointaine. Si la voiture dérive, apporte une petite correction puis observe son effet avant d’en ajouter une autre. Arrête-toi pour reprendre calmement si tu as perdu ta référence.",
        "Un petit braquage agit progressivement ; des corrections rapides et fortes amplifient les écarts.",
      ),
    ],
    example:
      "Un cycliste approche pendant que tu recules. Tu immobilises le véhicule et tu le laisses passer, puis tu refais tes observations avant de continuer.",
    traps: [
      "Regarder uniquement la caméra.",
      "Corriger de plus en plus fort.",
      "Reprendre après une pause sans refaire les contrôles.",
    ],
    safety:
      "Interromps la manœuvre si un usager peut entrer dans la zone de conflit. Une omission de clignotant n’est pas automatiquement éliminatoire indépendamment du contexte.",
    takeaway: "J’observe largement, je recule lentement, je corrige peu.",
    tags: ["Manœuvre", "Observation"],
    sourcePages: "Fiche avec éliminatoires, p. 5.",
  },
  {
    id: "manoeuvre-demitour",
    code: "M2",
    group: "Manœuvres",
    title: "Faire demi-tour sans imposer ton mouvement",
    minutes: 5,
    intro:
      "Le demi-tour, ce n’est pas seulement mettre le volant d’un côté puis de l’autre. À chaque changement de sens, tu reconstruis ton observation.",
    objective:
      "Choisir un lieu adapté et enchaîner les mouvements à faible allure.",
    steps: [
      step(
        "Vérifie que le lieu le permet",
        "Lis les interdictions, le marquage et les contraintes de visibilité. Choisis une zone où la voiture pourra se déplacer sans monter sur le trottoir ni gêner dangereusement la circulation.",
        "Un espace physiquement disponible n’est pas forcément un lieu autorisé ou sûr.",
      ),
      step(
        "Annonce puis réalise chaque phase",
        "Contrôle autour, annonce le mouvement de façon compréhensible et braque à faible allure selon la méthode vue en leçon. Avant de reculer, arrête-toi et regarde à nouveau dans les zones concernées.",
        "Les priorités et la présence d’usagers peuvent changer entre deux mouvements.",
      ),
      step(
        "Arrête-toi dès que la situation devient incertaine",
        "Si quelqu’un arrive dans la zone de manœuvre, immobilise le véhicule et laisse l’espace nécessaire. Pour repartir dans ton nouveau sens, vérifie l’arrière, les côtés et l’avant avant de t’insérer.",
        "La réussite se mesure à la sécurité de l’ensemble, pas au nombre minimal de mouvements.",
      ),
    ],
    example:
      "Tu as besoin d’un mouvement supplémentaire. Tu le fais avec des contrôles, plutôt que d’accélérer ou de monter sur le trottoir pour finir en une seule fois.",
    traps: [
      "Se focaliser sur le volant.",
      "Utiliser le clignotant comme une priorité.",
      "Continuer parce que la manœuvre est presque terminée.",
    ],
    safety:
      "Les indications lumineuses accompagnent les mouvements pertinents et doivent rester compréhensibles pour les autres. Elles ne remplacent jamais les contrôles.",
    takeaway: "Un nouveau mouvement demande une nouvelle observation.",
    tags: ["Manœuvre", "Priorité"],
    sourcePages: "Fiche avec éliminatoires, p. 5.",
  },
  {
    id: "manoeuvre-creneau",
    code: "M3",
    group: "Manœuvres",
    title: "Réussir un créneau en restant disponible",
    minutes: 7,
    intro:
      "Les repères t’aident à placer la voiture. Mais le vrai objectif, c’est de te garer sans perdre les usagers de vue. Tu as le droit de t’arrêter et de corriger.",
    objective: "Combiner repères, observation et maîtrise de l’allure.",
    steps: [
      step(
        "Choisis la place et prépare ta position",
        "Vérifie les règles de stationnement, la taille disponible, les accès et les marges avec les véhicules. Annonce ton intention, observe l’arrière et positionne la voiture avec les repères adaptés au modèle utilisé.",
        "Une place trop petite ou interdite ne devient pas un bon choix parce que le repère fonctionne.",
      ),
      step(
        "Enchaîne lentement les phases",
        "Recule à faible allure, commence la rotation au repère travaillé en leçon puis accompagne le contre-braquage au moment adapté. Le repère du feu arrière ou de l’angle visuel reste à calibrer sur ta voiture. Observe aussi l’avant qui se déporte.",
        "Les dimensions du véhicule et ta position changent les images que tu vois.",
      ),
      step(
        "Contrôle et corrige",
        "Si un usager arrive dans la zone de conflit, arrête-toi. Vérifie les espaces avec le trottoir et les voitures, puis corrige en prenant le temps nécessaire. Termine dans une position autorisée et stable.",
        "Une correction calme est une compétence ; continuer sans marge pour éviter de recommencer crée le risque.",
      ),
    ],
    example:
      "Tu vois que l’arrière approche trop du trottoir. Tu t’arrêtes, tu observes et tu ajustes. Tu ne montes pas dessus pour conserver le rythme de ta manœuvre.",
    traps: [
      "Ne regarder que le rétroviseur du côté du trottoir.",
      "Faire confiance à un repère appris sur une autre voiture.",
      "Continuer à bouger pendant le passage d’un usager dans la zone de conflit.",
    ],
    safety:
      "Heurter un obstacle ou monter sur un trottoir peut créer un danger. Ne transforme pas le stationnement en objectif à atteindre coûte que coûte.",
    takeaway:
      "Mes repères placent la voiture ; mes contrôles protègent les autres.",
    tags: ["Manœuvre", "Placement"],
    sourcePages: "Fiche avec éliminatoires, p. 5.",
  },
  {
    id: "securite-rapide",
    code: "S1",
    group: "Sécurité",
    title: "T’insérer sur une voie rapide",
    minutes: 6,
    intro:
      "Une insertion se prépare avant la fin de la voie d’accélération. Tu dois trouver un espace et adapter ta vitesse à cet espace, sans supposer que les autres vont se déplacer pour toi.",
    objective: "Associer vitesse adaptée, contrôles et décision d’insertion.",
    steps: [
      step(
        "Observe tôt la voie à rejoindre",
        "Cherche le trafic, les distances, la longueur de la voie et les limitations. Repère une possibilité d’insertion avant d’arriver au bout. Contrôle plusieurs fois si nécessaire, par regards brefs.",
        "L’espace disponible et la vitesse des autres évoluent pendant ton accélération.",
      ),
      step(
        "Construis une allure compatible",
        "Accélère progressivement quand les conditions le permettent, en respectant la limitation et l’adhérence. Garde une solution si la voie est encombrée. Une vitesse trop faible sans raison peut rendre l’intégration plus difficile.",
        "Tu dois limiter l’écart de vitesse, sans prendre une vitesse que tu ne peux pas maîtriser.",
      ),
      step(
        "Insère-toi uniquement dans un espace sûr",
        "Contrôle rétroviseur et angle mort concernés, annonce ton intention et respecte la priorité des véhicules déjà présents. Si tu ne peux pas passer, adapte ta décision avant la fin de la voie ; ne force jamais.",
        "Le clignotant informe, et les autres n’ont pas l’obligation de te créer un espace.",
      ),
    ],
    example:
      "Une voiture est à ton niveau. Tu ne tournes pas pour l’obliger à se décaler : tu ajustes ton allure et recherches un autre espace.",
    traps: [
      "Regarder trop longtemps derrière et oublier l’avant.",
      "Arriver à la fin de la voie sans avoir choisi de solution.",
      "Accélérer au-delà de la limitation pour attraper un espace.",
    ],
    safety:
      "Il peut être nécessaire de s’arrêter si l’insertion est impossible. L’anticipation doit éviter de découvrir cette nécessité au dernier instant.",
    takeaway:
      "Je repère l’espace, j’adapte mon allure, je contrôle et je m’insère sans forcer.",
    tags: ["Vitesse", "Observation"],
    sourcePages:
      "Fiche avec éliminatoires, p. 5 ; explication pédagogique complémentaire.",
  },
  {
    id: "securite-distances",
    code: "S2",
    group: "Sécurité",
    title: "Garder une marge autour de la voiture",
    minutes: 6,
    intro:
      "Une distance de sécurité, c’est du temps et de l’espace pour ne pas subir la prochaine action d’un autre. On ne cherche pas à passer « juste » : on cherche une marge.",
    objective:
      "Distinguer la distance avant, la marge latérale et les espaces de manœuvre.",
    steps: [
      step(
        "Garde du temps avec le véhicule de devant",
        "Sur route, utilise au moins deux secondes de distance en conditions normales et augmente avec la pluie, la visibilité ou l’état de la chaussée. Choisis un point fixe et compare les passages.",
        "La même distance en mètres ne donne pas le même temps de réaction à trente et à quatre-vingts kilomètres par heure.",
      ),
      step(
        "Adapte les marges sur les côtés",
        "Observe les portières, cyclistes, piétons, rétroviseurs et obstacles. Pour dépasser certains usagers vulnérables, la règle prévoit notamment au moins un mètre en agglomération et un mètre cinquante hors agglomération. Si l’espace manque, attends.",
        "Ces valeurs de dépassement ne sont pas une règle universelle d’un mètre avec tous les trottoirs et véhicules.",
      ),
      step(
        "Protège aussi l’espace pendant les manœuvres",
        "À faible allure, surveille les angles et les mouvements de l’avant comme de l’arrière. Laisse une marge suffisante avec les obstacles et interromps ton déplacement quand tu ne sais plus ce qui reste.",
        "Une faible vitesse réduit les conséquences mais ne supprime pas le risque de heurter ou de coincer quelqu’un.",
      ),
    ],
    example:
      "Tu veux dépasser un vélo, mais une voiture arrive en face et la rue est étroite. Tu restes derrière à une distance adaptée jusqu’à disposer de l’espace nécessaire.",
    traps: [
      "Appliquer « un mètre partout » sans comprendre la situation.",
      "Coller devant pour empêcher quelqu’un de s’insérer.",
      "Réduire les marges parce que le trajet est connu.",
    ],
    safety:
      "Augmente les distances dès que les conditions se dégradent. Les marges d’apprentissage choisies avec ton enseignant peuvent être plus grandes que les minima réglementaires.",
    takeaway:
      "De l’espace sur les côtés, du temps devant et une solution si ça change.",
    tags: ["Vigilance", "Placement"],
    sourcePages:
      "Fiche avec éliminatoires, p. 5-6, corrigée ; Code de la route R412-12 et R414-4.",
  },
  {
    id: "securite-examen",
    code: "S3",
    group: "Sécurité",
    title: "Comprendre ce qui devient éliminatoire",
    minutes: 6,
    intro:
      "Je veux que tu comprennes le risque, pas que tu conduises avec une liste de peurs. Une erreur de geste ne se juge pas seulement à son nom : on regarde ce qu’elle provoque.",
    objective:
      "Identifier les risques graves sans confondre chaque imperfection avec un échec automatique.",
    steps: [
      step(
        "Distingue erreur et mise en danger",
        "Une hésitation, un repère corrigé ou un geste perfectible s’apprécient dans leur contexte. Une action ou une absence d’action peut être éliminatoire quand elle crée une situation dangereuse où la sécurité dépend surtout de la réaction des autres.",
        "C’est pourquoi « un clignotant oublié égale toujours élimination » est une présentation trop absolue.",
      ),
      step(
        "Respecte les interdictions et les priorités",
        "Un signal imposant l’arrêt, un sens interdit, une ligne continue ou une voie réservée ne se traitent pas comme de simples préférences de trajectoire. Le texte de l’examen prévoit certaines infractions éliminatoires. Applique les règles, même si personne n’est visible.",
        "L’absence d’intervention de l’examinateur ne prouve pas qu’une action est acceptable.",
      ),
      step(
        "Après une erreur, reprends une conduite sûre",
        "Ne tente pas de réparer une mauvaise direction par une manœuvre dangereuse. Respire, reviens à l’observation et applique la règle suivante. Si tu ne peux pas passer, tu attends ; si tu peux reprendre une allure adaptée, tu le fais.",
        "Se précipiter pour compenser peut transformer une petite difficulté en véritable danger.",
      ),
    ],
    example:
      "Tu rates une sortie mais continues dans ta voie autorisée. C’est plus sûr que couper le giratoire pour rejoindre la sortie à tout prix.",
    traps: [
      "Croire que l’examinateur doit intervenir pour qu’une erreur soit éliminatoire.",
      "S’arrêter à chaque doute même sans chercher à comprendre.",
      "Continuer malgré un danger parce que l’on pense avoir déjà échoué.",
    ],
    safety:
      "Cette fiche explique le principe d’évaluation ; elle ne prédit pas le résultat d’un examen. L’expert apprécie la situation selon les textes applicables.",
    takeaway:
      "Mon objectif reste une conduite autonome, réglementaire et protectrice.",
    tags: ["Vigilance", "Examen"],
    sourcePages:
      "Fiche avec éliminatoires, p. 1-6, nuancée ; arrêté du 19 février 2010, article 27.",
  },
];
export const courseSources = [
  {
    label: "Principe des erreurs éliminatoires",
    url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000024518860",
  },
  {
    label: "Priorité aux piétons — R415-11",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037411323",
  },
  {
    label: "Dépassement et marges — R414-4",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006842216",
  },
  {
    label: "Distance de sécurité — R412-12",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051682619",
  },
];
