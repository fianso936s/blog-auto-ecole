export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
}

export const badges: BadgeDefinition[] = [
  {
    id: "premier_quiz",
    name: "Premier pas",
    description: "Premier quiz termine",
    icon: "🎯",
    condition: "Terminer votre premier quiz",
  },
  {
    id: "score_parfait",
    name: "Sans faute",
    description: "100% sur un quiz",
    icon: "💯",
    condition: "Obtenir un score parfait sur un quiz",
  },
  {
    id: "serie_5",
    name: "En serie",
    description: "5 quiz termines",
    icon: "🔥",
    condition: "Terminer 5 quiz au total",
  },
  {
    id: "c1_maitre",
    name: "Maitre C1",
    description: "80%+ sur 3 quiz C1",
    icon: "🚗",
    condition: "Obtenir 80% ou plus sur 3 quiz de la competence C1",
  },
  {
    id: "c2_maitre",
    name: "Maitre C2",
    description: "80%+ sur 3 quiz C2",
    icon: "🛣️",
    condition: "Obtenir 80% ou plus sur 3 quiz de la competence C2",
  },
  {
    id: "c3_maitre",
    name: "Maitre C3",
    description: "80%+ sur 3 quiz C3",
    icon: "🤝",
    condition: "Obtenir 80% ou plus sur 3 quiz de la competence C3",
  },
  {
    id: "c4_maitre",
    name: "Maitre C4",
    description: "80%+ sur 3 quiz C4",
    icon: "⚠️",
    condition: "Obtenir 80% ou plus sur 3 quiz de la competence C4",
  },
  {
    id: "assidu",
    name: "Assidu",
    description: "10 quiz termines",
    icon: "📚",
    condition: "Terminer 10 quiz au total",
  },
  {
    id: "champion",
    name: "Champion",
    description: "90%+ de moyenne globale",
    icon: "🏆",
    condition: "Avoir une moyenne globale superieure a 90%",
  },
  {
    id: "explorateur",
    name: "Explorateur",
    description: "Quiz dans chaque competence",
    icon: "🧭",
    condition: "Faire au moins un quiz dans chaque competence (C1 a C4)",
  },
];
