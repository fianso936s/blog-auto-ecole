export interface LessonSection {
  type: "intro" | "rule" | "warning" | "tip" | "example" | "summary";
  title?: string;
  content: string;
  rules?: string[];
  highlight?: string;
}

export interface REMCLesson {
  id: string;
  competence_id: number;
  chapter: number;
  title: string;
  subtitle: string;
  icon: string;
  readingTime: string;
  sections: LessonSection[];
}
