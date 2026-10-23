import test from "node:test";
import assert from "node:assert/strict";
import {
  csvCell,
  quizFingerprint,
  publicQuiz,
  canReadSpot,
  spotQuizSchema,
} from "../../packages/core/src/index.js";
const quiz = {
  question: "Qui passe ?",
  options: ["A", "B"],
  answer: 1,
  explanation: "B passe.",
};
test("quiz fingerprints survive JSONB property reordering and change with correction", () => {
  assert.equal(
    quizFingerprint(quiz),
    quizFingerprint({
      explanation: quiz.explanation,
      answer: 1,
      options: quiz.options,
      question: quiz.question,
    }),
  );
  assert.notEqual(
    quizFingerprint(quiz),
    quizFingerprint({ ...quiz, answer: 0 }),
  );
});
test("students receive question and choices without correction", () => {
  assert.deepEqual(publicQuiz(quiz, false), {
    question: quiz.question,
    options: quiz.options,
  });
  assert.deepEqual(publicQuiz(quiz, true), quiz);
});
test("archived catalog markers are unreadable even to owner", () => {
  const profile: any = { id: "student", role: "student" };
  assert.equal(
    canReadSpot(profile, { author_id: "teacher", status: "published" }),
    true,
  );
  assert.equal(
    canReadSpot(profile, { author_id: "teacher", status: "private" }),
    false,
  );
  assert.equal(
    canReadSpot(profile, {
      author_id: "student",
      status: "private",
      archived_at: new Date(),
    }),
    false,
  );
});
test("quiz schema rejects duplicate choices and out of range correct answer", () => {
  assert.equal(
    spotQuizSchema.safeParse({ ...quiz, options: [" A ", "a"] }).success,
    false,
  );
  assert.equal(spotQuizSchema.safeParse({ ...quiz, answer: 4 }).success, false);
});
test("CSV neutralizes formulas and preserves quotes and multiline content", () => {
  assert.equal(csvCell(" =1+1"), '"\' =1+1"');
  assert.equal(csvCell('photo "A"\nB'), '"photo ""A""\nB"');
});
