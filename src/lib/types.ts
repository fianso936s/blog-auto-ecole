export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  author: string;
  created_at: string;
  updated_at: string;
  published: boolean;
}

export interface Profile {
  id: string;
  email: string;
  role: "admin" | "user";
  full_name?: string;
  avatar_url?: string;
}

export interface AppUser {
  id: string;
  email: string;
  role: "admin" | "user";
  full_name?: string;
}

export interface QuizAnswer {
  label: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  answers: QuizAnswer[];
  correct_answer: string;
  explanation: string;
  category: string;
  difficulty: string;
  competence_id?: number;
  article_reference: string;
  created_at: string;
}
