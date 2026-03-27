import type { REMCLesson } from "./remcLessonsTypes";
import { lessonsC1, lessonsC2 } from "./remcLessonsC1C2";
import { lessonsC3, lessonsC4 } from "./remcLessonsC3C4";

export type { REMCLesson };

export const remcLessonsAll: REMCLesson[] = [
  ...lessonsC1,
  ...lessonsC2,
  ...lessonsC3,
  ...lessonsC4,
];

export { lessonsC1, lessonsC2, lessonsC3, lessonsC4 };
