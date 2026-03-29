import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { remcQuestionsAll } from "../../data/remcQuestionsAll";
import { remcCompetences } from "../../data/remc";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Brain,
  Loader2,
  Trophy,
  BookOpen,
  Target,
  Sparkles,
} from "lucide-react";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

interface LocalQuizQuestion {
  id: string;
  question: string;
  answers: { label: string; text: string }[];
  correct_answer: string;
  explanation: string;
  category: string;
  difficulty: string;
  competence_id: number;
}

// Map competence id -> card color themes
const COMP_CARD_COLORS: Record<
  number,
  { bg: string; border: string; hoverBorder: string; badge: string; icon: string; text: string; gradientFrom: string }
> = {
  1: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    hoverBorder: "hover:border-blue-400",
    badge: "bg-blue-100 text-blue-700",
    icon: "text-blue-600",
    text: "text-blue-700",
    gradientFrom: "from-blue-500",
  },
  2: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    hoverBorder: "hover:border-emerald-400",
    badge: "bg-emerald-100 text-emerald-700",
    icon: "text-emerald-600",
    text: "text-emerald-700",
    gradientFrom: "from-emerald-500",
  },
  3: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    hoverBorder: "hover:border-amber-400",
    badge: "bg-amber-100 text-amber-700",
    icon: "text-amber-600",
    text: "text-amber-700",
    gradientFrom: "from-amber-500",
  },
  4: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    hoverBorder: "hover:border-purple-400",
    badge: "bg-purple-100 text-purple-700",
    icon: "text-purple-600",
    text: "text-purple-700",
    gradientFrom: "from-purple-500",
  },
};

// Quiz badge colors
const COMP_BADGE: Record<number, string> = {
  1: "bg-blue-50 text-blue-600",
  2: "bg-emerald-50 text-emerald-600",
  3: "bg-amber-50 text-amber-600",
  4: "bg-purple-50 text-purple-600",
};

const QUIZ_SIZE = 20;

export default function StudentQuizPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // null = "Tout reviser", 1-4 = competence
  const [selectedCompetence, setSelectedCompetence] = useState<number | null>(
    () => {
      const param = searchParams.get("competence");
      if (param) {
        const n = parseInt(param, 10);
        if (n >= 1 && n <= 4) return n;
      }
      return 1;
    }
  );

  const [questions, setQuestions] = useState<LocalQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [savingResult, setSavingResult] = useState(false);

  // Build a shuffled quiz from the selected competence
  const buildQuiz = useCallback((competenceId: number | null) => {
    const pool =
      competenceId === null
        ? [...(remcQuestionsAll as LocalQuizQuestion[])]
        : (remcQuestionsAll as LocalQuizQuestion[]).filter(
            (q) => q.competence_id === competenceId
          );

    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, QUIZ_SIZE);
  }, []);

  const startQuiz = useCallback(
    (competenceId: number | null) => {
      setSelectedCompetence(competenceId);
      setQuestions(buildQuiz(competenceId));
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setScore(0);
      setIsFinished(false);
      setAiExplanation("");
      setQuizStarted(true);
    },
    [buildQuiz]
  );

  // Auto-start if arriving via ?competence= link
  useEffect(() => {
    const param = searchParams.get("competence");
    if (param) {
      const n = parseInt(param, 10);
      if (n >= 1 && n <= 4) {
        startQuiz(n);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (label: string) => {
    if (isAnswered) return;
    setSelectedAnswer(label);
    setIsAnswered(true);
    setAiExplanation("");
    if (label === currentQuestion.correct_answer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);
      saveResult(score + (selectedAnswer === currentQuestion.correct_answer ? 0 : 0));
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setAiExplanation("");
    }
  };

  // We need to save the FINAL score (already updated before calling)
  const saveResult = async (finalScore: number) => {
    if (!user) return;
    setSavingResult(true);
    try {
      await supabase.from("quiz_results").insert({
        user_id: user.id,
        competence_id: selectedCompetence,
        score: finalScore,
        total: questions.length,
      });
    } catch {
      // Silently fail if table doesn't exist yet
    }
    setSavingResult(false);
  };

  // Score is updated via setScore which is async — track correctly
  // When isFinished triggers, score is already the correct final value
  useEffect(() => {
    if (isFinished && user && questions.length > 0) {
      saveResult(score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  const askAI = async () => {
    if (!currentQuestion) return;
    setAiLoading(true);
    const correctText = currentQuestion.answers.find(
      (a) => a.label === currentQuestion.correct_answer
    )?.text;

    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `Tu es un moniteur d'auto-ecole bienveillant et pedagogue. Tu expliques les regles du code de la route de maniere simple et claire.

REGLE ABSOLUE : La bonne reponse a cette question est "${currentQuestion.correct_answer}" (${correctText}). Tu dois UNIQUEMENT expliquer pourquoi cette reponse est correcte. Tu ne dois JAMAIS contredire ou remettre en question cette reponse. C'est la reponse officielle du code de la route francais.

Explique en 3-4 phrases courtes pourquoi c'est la bonne reponse. Cite la regle du code de la route si possible. Utilise le vouvoiement.`,
            },
            {
              role: "user",
              content: `Question : ${currentQuestion.question}\nReponse correcte : ${currentQuestion.correct_answer}. ${correctText}\nExplique-moi pourquoi c'est la bonne reponse.`,
            },
          ],
          max_tokens: 300,
          temperature: 0.3,
        }),
      });

      const data = await res.json();
      setAiExplanation(data.choices[0].message.content.trim());
    } catch {
      setAiExplanation(currentQuestion.explanation);
    }
    setAiLoading(false);
  };

  // ── Competence selector screen ──────────────────────────────────────────────
  if (!quizStarted) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <span className="text-primary text-sm font-semibold uppercase tracking-wide">
              Quiz REMC
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary tracking-tight">
            Choisissez une competence
          </h1>
          <p className="text-text-muted mt-1">
            20 questions par serie -- seuil de reussite : 75%
          </p>
        </div>

        {/* Competence cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {remcCompetences.map((comp, index) => {
            const cardColors = COMP_CARD_COLORS[comp.id];
            return (
              <button
                key={comp.id}
                onClick={() => startQuiz(comp.id)}
                className={`bg-surface rounded-2xl border-2 ${cardColors.border} ${cardColors.hoverBorder} p-6 text-left hover-lift transition-all duration-300 group animate-fade-up`}
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl ${cardColors.bg} flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {comp.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${cardColors.badge}`}
                      >
                        C{comp.id}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-secondary text-sm leading-snug mb-1">
                      {comp.shortTitle}
                    </h3>
                    <p className="text-xs text-text-muted line-clamp-2">
                      {comp.description}
                    </p>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 flex-shrink-0 ${cardColors.icon} opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 mt-1`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Tout reviser */}
        <button
          onClick={() => startQuiz(null)}
          className="w-full bg-surface rounded-2xl border-2 border-border p-6 text-left hover-lift hover:border-primary transition-all duration-300 group animate-fade-up delay-500"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-light to-amber-light flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Brain className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif font-bold text-secondary mb-0.5">
                Tout reviser
              </h3>
              <p className="text-xs text-text-muted">
                Mix aleatoire de toutes les competences C1 a C4
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
        </button>
      </div>
    );
  }

  // ── Result screen ───────────────────────────────────────────────────────────
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 75;
    const comp = selectedCompetence
      ? remcCompetences.find((c) => c.id === selectedCompetence)
      : null;

    return (
      <div className="max-w-2xl mx-auto animate-scale-in">
        <div className="bg-surface rounded-2xl border border-border p-8 sm:p-10 text-center relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-amber to-primary" />
          <div className="absolute top-6 right-6 opacity-5">
            <Sparkles className="w-32 h-32 text-primary" />
          </div>

          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                passed ? "bg-emerald-100" : "bg-primary-light"
              }`}
            >
              <Trophy
                className={`w-12 h-12 ${passed ? "text-emerald-600" : "text-primary"}`}
              />
            </div>

            <h1 className="font-serif text-3xl font-bold text-secondary mb-2">
              {passed ? "Felicitations !" : "Continuez vos revisions !"}
            </h1>

            {comp && (
              <p className="text-sm text-text-muted mb-2">
                Competence C{comp.id} -- {comp.shortTitle}
              </p>
            )}

            <p className="text-text-muted mb-8 max-w-md mx-auto">
              {passed
                ? "Vous avez reussi cette serie d'entrainement."
                : "Il faut au moins 75% de bonnes reponses pour reussir."}
            </p>

            <div className="flex items-center justify-center gap-10 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary font-serif">
                  {score}/{questions.length}
                </div>
                <div className="text-sm text-text-muted mt-1">Bonnes reponses</div>
              </div>
              <div className="w-px h-16 bg-border" />
              <div className="text-center">
                <div
                  className={`text-4xl font-bold font-serif ${
                    passed ? "text-emerald-600" : "text-primary"
                  }`}
                >
                  {percentage}%
                </div>
                <div className="text-sm text-text-muted mt-1">Score</div>
              </div>
            </div>

            {/* Score bar visual */}
            <div className="max-w-xs mx-auto mb-8">
              <div className="w-full bg-surface-alt rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${passed ? "bg-emerald-500" : "bg-primary"}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-text-muted">0%</span>
                <span className="text-xs text-text-muted font-medium">Seuil: 75%</span>
                <span className="text-xs text-text-muted">100%</span>
              </div>
            </div>

            {savingResult && (
              <p className="text-xs text-text-muted mb-4 flex items-center justify-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Sauvegarde en cours...
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => startQuiz(selectedCompetence)}
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full font-semibold hover:bg-primary-dark transition-colors shadow-sm hover:shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                Nouvelle serie
              </button>
              <button
                onClick={() => {
                  setQuizStarted(false);
                  setIsFinished(false);
                }}
                className="inline-flex items-center justify-center gap-2 bg-surface-alt text-secondary px-7 py-3.5 rounded-full font-semibold hover:bg-border transition-colors"
              >
                Changer de competence
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── No questions fallback ───────────────────────────────────────────────────
  if (!currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <p className="text-text-muted">Aucune question disponible pour cette competence.</p>
        <button
          onClick={() => setQuizStarted(false)}
          className="mt-4 text-sm font-semibold text-primary hover:text-primary-dark hover:underline transition-colors"
        >
          Retour au choix de competence
        </button>
      </div>
    );
  }

  // ── Active quiz screen ──────────────────────────────────────────────────────
  const comp = selectedCompetence
    ? remcCompetences.find((c) => c.id === selectedCompetence)
    : null;

  return (
    <div className="max-w-3xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          {comp ? (
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{comp.icon}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${COMP_BADGE[comp.id] ?? ""}`}
                >
                  C{comp.id}
                </span>
                <span className="text-sm font-semibold text-secondary">
                  {comp.shortTitle}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-secondary">
                Tout reviser
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setQuizStarted(false)}
          className="text-xs text-text-muted hover:text-primary font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-light"
        >
          Changer de competence
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-muted font-medium">
          Question {currentIndex + 1}/{questions.length}
        </span>
        <span className="text-sm font-bold text-primary">
          Score : {score}/{currentIndex + (isAnswered ? 1 : 0)}
        </span>
      </div>
      <div className="w-full bg-surface-alt rounded-full h-2.5 mb-8 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary to-primary-dark h-2.5 rounded-full transition-all duration-500"
          style={{
            width: `${
              ((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100
            }%`,
          }}
        />
      </div>

      {/* Question card */}
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 mb-6 shadow-sm">
        {/* Badges */}
        <div className="flex items-start gap-2 mb-5 flex-wrap">
          <span className="inline-block bg-primary-light text-primary text-xs font-semibold px-3 py-1 rounded-full">
            {currentQuestion.category}
          </span>
          <span
            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
              currentQuestion.difficulty === "facile"
                ? "bg-emerald-50 text-emerald-600"
                : currentQuestion.difficulty === "difficile"
                  ? "bg-red-50 text-red-600"
                  : "bg-amber-50 text-amber-600"
            }`}
          >
            {currentQuestion.difficulty}
          </span>
          {currentQuestion.competence_id && (
            <span
              className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                COMP_BADGE[currentQuestion.competence_id] ?? ""
              }`}
            >
              C{currentQuestion.competence_id}
            </span>
          )}
        </div>

        <h2 className="font-serif text-lg sm:text-xl font-bold text-secondary mb-6 leading-snug">
          {currentQuestion.question}
        </h2>

        {/* Answers */}
        <div className="space-y-3">
          {currentQuestion.answers.map((answer) => {
            const isCorrect = answer.label === currentQuestion.correct_answer;
            const isSelected = answer.label === selectedAnswer;
            let btnClass =
              "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ";

            if (!isAnswered) {
              btnClass +=
                "border-border hover:border-primary hover:bg-primary-light cursor-pointer";
            } else if (isCorrect) {
              btnClass += "border-emerald-500 bg-emerald-50";
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
                <div className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      isAnswered && isCorrect
                        ? "bg-emerald-500 text-white"
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
          <div className="mt-6 space-y-4 animate-fade-up">
            {/* Base explanation */}
            <div
              className={`p-5 rounded-xl ${
                selectedAnswer === currentQuestion.correct_answer
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-bold text-secondary">
                  Explication
                </span>
              </div>
              <p className="text-sm text-text leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>

            {/* AI button */}
            {!aiExplanation && (
              <button
                onClick={askAI}
                disabled={aiLoading}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors px-4 py-2 rounded-xl hover:bg-primary-light"
              >
                {aiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                {aiLoading
                  ? "L'IA reflechit..."
                  : "Demander une explication detaillee a l'IA"}
              </button>
            )}

            {/* AI explanation */}
            {aiExplanation && (
              <div className="p-5 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-blue-700">
                    Explication du moniteur IA
                  </span>
                </div>
                <p className="text-sm text-text whitespace-pre-line leading-relaxed">
                  {aiExplanation}
                </p>
              </div>
            )}

            {/* Next button */}
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full font-semibold hover:bg-primary-dark transition-colors shadow-sm hover:shadow-md"
            >
              {currentIndex + 1 >= questions.length
                ? "Voir le resultat"
                : "Question suivante"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
