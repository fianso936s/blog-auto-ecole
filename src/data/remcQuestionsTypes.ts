export interface REMCQuestion {
  id: string;
  question: string;
  answers: { label: string; text: string }[];
  correct_answer: string;
  explanation: string;
  category: string;
  difficulty: string;
  competence_id: number;
}
