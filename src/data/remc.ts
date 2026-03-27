export interface REMCCompetence {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  subSkills: string[];
}

export const remcCompetences: REMCCompetence[] = [
  {
    id: 1,
    title: "Maîtriser le maniement du véhicule dans un trafic faible ou nul",
    shortTitle: "Maniement du véhicule",
    description: "Installation au poste de conduite, démarrage, trajectoires, marche arrière, demi-tour et stationnement.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: "🚗",
    subSkills: [
      "Installation au poste de conduite",
      "Utilisation des commandes",
      "Démarrage et arrêt",
      "Trajectoires rectilignes et courbes",
      "Marche arrière en ligne droite",
      "Demi-tour",
      "Stationnement",
    ],
  },
  {
    id: 2,
    title: "Appréhender la route et circuler dans des conditions normales",
    shortTitle: "Circuler normalement",
    description: "Recherche d'indices, adaptation de l'allure, intersections, changements de direction, ronds-points.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: "🛣️",
    subSkills: [
      "Recherche d'indices utiles",
      "Adaptation de l'allure",
      "Intersections et priorités",
      "Changements de direction",
      "Voies d'insertion et de décélération",
      "Ronds-points",
    ],
  },
  {
    id: 3,
    title: "Circuler dans des conditions difficiles et partager la route",
    shortTitle: "Conditions difficiles",
    description: "Agglomération dense, voies rapides, météo dégradée, partage avec piétons, vélos, poids lourds.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: "⚠️",
    subSkills: [
      "Conduite en agglomération dense",
      "Voies rapides et autoroutes",
      "Conduite sous la pluie",
      "Conduite de nuit",
      "Brouillard et visibilité réduite",
      "Partage avec les piétons",
      "Partage avec les vélos",
      "Partage avec les poids lourds",
    ],
  },
  {
    id: 4,
    title: "Pratiquer une conduite autonome, sûre et économique",
    shortTitle: "Conduite autonome",
    description: "Suivi d'itinéraire, navigation autonome, éco-conduite, urgences et premiers secours.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: "🎯",
    subSkills: [
      "Suivi d'itinéraire",
      "Navigation autonome",
      "Éco-conduite",
      "Conduite économique",
      "Situations d'urgence",
      "Premiers secours",
    ],
  },
];
