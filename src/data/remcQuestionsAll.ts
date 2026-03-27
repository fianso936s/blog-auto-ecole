import type { REMCQuestion } from "./remcQuestionsTypes";
import { questionsC1, questionsC2 } from "./remcQuestionsC1C2";
import { questionsC3, questionsC4 } from "./remcQuestionsC3C4";

export type { REMCQuestion };

export const remcQuestionsAll: REMCQuestion[] = [
  ...questionsC1,
  ...questionsC2,
  ...questionsC3,
  ...questionsC4,
];

export { questionsC1, questionsC2, questionsC3, questionsC4 };
