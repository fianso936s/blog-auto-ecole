import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import type { QuizQuestion } from "../../lib/types";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Loader2,
  Trophy,
  BookOpen,
  Star,
} from "lucide-react";
import PageMeta from "../../components/PageMeta";
import { shuffleCopy } from "../../lib/quiz";


const CATEGORIES = [
  "Toutes",
  "Signalisation",
  "Priorites",
  "Vitesse",
  "Stationnement",
  "Eclairage",
  "Alcool et Stup\u00e9fiants",
  "Securite",
  "Environnement",
  "Premiers secours",
  "Regles de circulation",
];

export default function QuizPage() {
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [category, setCategory] = useState("Toutes");
  const [quizSize] = useState(40);

  useEffect(() => {
    let cancelled = false;

    const fetchQuestions = async () => {
      setLoadError("");
      try {
        const { data, error } = await supabase
          .from("quiz_questions")
          .select("*");

        if (cancelled) return;
        if (error) {
          setLoadError("Impossible de charger les questions pour le moment.");
          return;
        }
        setAllQuestions(data ?? []);
      } catch {
        if (!cancelled) {
          setLoadError("Impossible de charger les questions pour le moment.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchQuestions();
    return () => {
      cancelled = true;
    };
  }, []);

  const startQuiz = useCallback(
    (cat: string) => {
      setCategory(cat);
      const filtered =
        cat === "Toutes"
          ? [...allQuestions]
          : allQuestions.filter((q) => q.category === cat);

      const shuffled = shuffleCopy(filtered);
      setQuestions(shuffled.slice(0, quizSize));
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setScore(0);
      setIsFinished(false);
    },
    [allQuestions, quizSize]
  );

  useEffect(() => {
    if (allQuestions.length > 0 && questions.length === 0) {
      startQuiz("Toutes");
    }
  }, [allQuestions, questions.length, startQuiz]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (label: string) => {
    if (isAnswered) return;
    setSelectedAnswer(label);
    setIsAnswered(true);
    if (label === currentQuestion.correct_answer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <PageMeta title="Quiz Code de la Route" noIndex />
        <div className="text-center animate-fade-in" role="status" aria-live="polite">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-xl font-bold text-secondary mb-2">Quiz Code de la Route</h1>
          <p className="text-text-muted">Chargement des questions...</p>
        </div>
      </div>
    );
  }

  // Écran de résultat
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 75;

    return (
      <div className="min-h-screen bg-bg">
        <PageMeta title="Résultat du quiz Code de la Route" noIndex />
        {/* Hero result header */}
        <div className="bg-secondary relative overflow-hidden grain">
          <div className="absolute top-8 right-12 w-24 h-24 border-2 border-white/10 rounded-full" />
          <div className="absolute bottom-4 left-16 w-16 h-16 bg-primary/20 rounded-full" />
          <div className="absolute top-1/2 right-1/3 w-6 h-6 bg-amber/15 rounded-full" />
          <div className="max-w-3xl mx-auto px-4 py-10 text-center relative z-10">
            <span className="inline-block text-primary text-sm font-semibold uppercase tracking-wider mb-2">
              R&eacute;sultat du Quiz
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              {passed ? "F\u00e9licitations !" : "Continuez vos r\u00e9visions !"}
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 -mt-8 pb-16">
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-8 sm:p-10 text-center animate-scale-in">
            {/* Trophy */}
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${passed ? "bg-green-100" : "bg-red-50"}`}>
              <Trophy className={`w-12 h-12 ${passed ? "text-green-600" : "text-red-500"}`} />
            </div>

            {/* Confetti-like stars for pass */}
            {passed && (
              <div className="flex justify-center gap-2 mb-4">
                <Star className="w-5 h-5 text-amber animate-scale-in" />
                <Star className="w-5 h-5 text-primary animate-scale-in delay-100" />
                <Star className="w-5 h-5 text-amber animate-scale-in delay-200" />
                <Star className="w-5 h-5 text-primary animate-scale-in delay-300" />
                <Star className="w-5 h-5 text-amber animate-scale-in delay-400" />
              </div>
            )}

            <p className="text-text-muted mb-8">
              {passed
                ? "Vous avez r\u00e9ussi cette s\u00e9rie d'entra\u00eenement."
                : "Il faut au moins 75% de bonnes r\u00e9ponses pour r\u00e9ussir."}
            </p>

            <div className="flex items-center justify-center gap-10 mb-10">
              <div>
                <div className="text-5xl font-bold text-primary font-serif">
                  {score}/{questions.length}
                </div>
                <div className="text-sm text-text-muted mt-1">Bonnes r&eacute;ponses</div>
              </div>
              <div className="w-px h-16 bg-border" />
              <div>
                <div className={`text-5xl font-bold font-serif ${passed ? "text-green-600" : "text-red-500"}`}>
                  {percentage}%
                </div>
                <div className="text-sm text-text-muted mt-1">Score</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => startQuiz(category)}
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Nouvelle s&eacute;rie
              </button>
              <button
                onClick={() => startQuiz("Toutes")}
                className="inline-flex items-center justify-center gap-2 bg-surface-alt text-text px-8 py-3.5 rounded-xl font-semibold hover:bg-border transition-colors"
              >
                Toutes les cat&eacute;gories
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <PageMeta title="Quiz Code de la Route" noIndex />
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-bold text-secondary mb-3">Quiz Code de la Route</h1>
          <p className="text-text-muted" role={loadError ? "alert" : undefined}>
            {loadError || "Aucune question n’est disponible pour cette catégorie."}
          </p>
          {category !== "Toutes" && (
            <button
              type="button"
              onClick={() => startQuiz("Toutes")}
              className="mt-5 inline-flex items-center justify-center rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-primary hover:border-primary"
            >
              Revenir à toutes les catégories
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <PageMeta title="Quiz Code de la Route" noIndex />
      {/* Bold hero header with grain overlay */}
      <div className="bg-secondary relative overflow-hidden grain">
        <div className="absolute top-6 right-10 w-20 h-20 border-2 border-white/10 rounded-full" />
        <div className="absolute bottom-2 left-12 w-12 h-12 bg-primary/20 rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-amber/15 rounded-full" />
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10 text-center relative z-10">
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-wider mb-2">
            Quiz Code de la Route
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Testez vos connaissances
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
        {/* Category filter pills - horizontal scroll */}
        <div className="mb-8 -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => startQuiz(cat)}
                className={`text-xs px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                  category === cat
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface text-text-muted border border-border hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-text-muted">
            Question {currentIndex + 1}/{questions.length}
          </span>
          <span className="text-sm font-semibold text-primary">
            Score : {score}/{currentIndex + (isAnswered ? 1 : 0)}
          </span>
        </div>
        <div className="w-full bg-surface-alt rounded-full h-2.5 mb-8">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question card */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 sm:p-8 mb-6 animate-fade-up">
          <div className="flex items-start gap-2 mb-1 flex-wrap">
            <span className="inline-block bg-primary-light text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
              {currentQuestion.category}
            </span>
            <span
              className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full ${
                currentQuestion.difficulty === "facile"
                  ? "bg-green-50 text-green-600"
                  : currentQuestion.difficulty === "difficile"
                    ? "bg-red-50 text-red-600"
                    : "bg-amber-light text-amber"
              }`}
            >
              {currentQuestion.difficulty}
            </span>
          </div>

          {/* Question number + text */}
          <div className="flex items-start gap-4 mt-5 mb-8">
            <span className="flex-shrink-0 w-10 h-10 bg-secondary text-white rounded-xl flex items-center justify-center font-serif font-bold text-sm">
              {currentIndex + 1}
            </span>
            <h2 className="text-lg font-semibold text-text leading-relaxed pt-1.5">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer buttons - large clickable areas */}
          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => {
              const isCorrect = answer.label === currentQuestion.correct_answer;
              const isSelected = answer.label === selectedAnswer;
              let btnClass =
                "w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 ";

              if (!isAnswered) {
                btnClass +=
                  "border-border hover:border-primary hover:bg-primary-light cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none";
              } else if (isCorrect) {
                btnClass += "border-green-500 bg-green-50";
              } else if (isSelected && !isCorrect) {
                btnClass += "border-red-500 bg-red-50";
              } else {
                btnClass += "border-border opacity-50";
              }

              return (
                <button
                  key={answer.label}
                  onClick={() => handleAnswer(answer.label)}
                  disabled={isAnswered}
                  className={btnClass}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                        isAnswered && isCorrect
                          ? "bg-green-500 text-white"
                          : isAnswered && isSelected && !isCorrect
                            ? "bg-red-500 text-white"
                            : "bg-surface-alt text-text-muted"
                      }`}
                    >
                      {isAnswered && isCorrect ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : isAnswered && isSelected && !isCorrect ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        answer.label
                      )}
                    </span>
                    <span className="text-sm text-text">{answer.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Post-answer section */}
          {isAnswered && (
            <div className="mt-8 space-y-4 animate-fade-up">
              {/* Base explanation */}
              <div
                className={`p-5 rounded-xl ${selectedAnswer === currentQuestion.correct_answer ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-semibold text-text">
                    Explication
                  </span>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>

              <p className="text-xs text-text-muted">
                Explication enregistrée dans le contenu pédagogique du quiz.
              </p>

              {/* Next button */}
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
              >
                {currentIndex + 1 >= questions.length
                  ? "Voir le r\u00e9sultat"
                  : "Question suivante"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
