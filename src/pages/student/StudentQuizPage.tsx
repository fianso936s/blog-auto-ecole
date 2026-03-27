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

// Map competence id → Tailwind color classes
const COMP_COLORS: Record<
  number,
  { tab: string; tabActive: string; badge: string }
> = {
  1: {
    tab: "border-blue-200 text-blue-700 hover:bg-blue-50",
    tabActive: "bg-blue-600 text-white border-blue-600",
    badge: "bg-blue-50 text-blue-600",
  },
  2: {
    tab: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
    tabActive: "bg-emerald-600 text-white border-emerald-600",
    badge: "bg-emerald-50 text-emerald-600",
  },
  3: {
    tab: "border-amber-200 text-amber-700 hover:bg-amber-50",
    tabActive: "bg-amber-500 text-white border-amber-500",
    badge: "bg-amber-50 text-amber-600",
  },
  4: {
    tab: "border-purple-200 text-purple-700 hover:bg-purple-50",
    tabActive: "bg-purple-600 text-white border-purple-600",
    badge: "bg-purple-50 text-purple-600",
  },
};

const QUIZ_SIZE = 20;

export default function StudentQuizPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // null = "Tout réviser", 1-4 = competence
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-[#cf5c36]" />
            <span className="text-[#cf5c36] text-sm font-semibold uppercase tracking-wide">
              Quiz REMC
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Choisissez une compétence
          </h1>
          <p className="text-gray-500 mt-1">
            20 questions par série — seuil de réussite : 75%
          </p>
        </div>

        {/* Competence cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {remcCompetences.map((comp) => {
            const colors = COMP_COLORS[comp.id];
            return (
              <button
                key={comp.id}
                onClick={() => startQuiz(comp.id)}
                className={`bg-white rounded-2xl border-2 ${comp.borderColor} p-6 text-left hover:shadow-md transition-all duration-200 group`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${comp.bgColor} flex items-center justify-center text-2xl flex-shrink-0`}
                  >
                    {comp.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}
                      >
                        C{comp.id}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">
                      {comp.shortTitle}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {comp.description}
                    </p>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 flex-shrink-0 ${comp.color} opacity-0 group-hover:opacity-100 transition-opacity mt-1`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Tout réviser */}
        <button
          onClick={() => startQuiz(null)}
          className="w-full bg-white rounded-2xl border-2 border-gray-200 p-5 text-left hover:shadow-md hover:border-[#cf5c36] transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#fcedea] flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-[#cf5c36]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-0.5">
                Tout réviser
              </h3>
              <p className="text-xs text-gray-500">
                Mix aléatoire de toutes les compétences C1 à C4
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#cf5c36] opacity-0 group-hover:opacity-100 transition-opacity" />
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div
            className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
              passed ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <Trophy
              className={`w-10 h-10 ${passed ? "text-green-600" : "text-red-500"}`}
            />
          </div>

          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
            {passed ? "Félicitations !" : "Continuez vos révisions !"}
          </h1>

          {comp && (
            <p className="text-sm text-gray-500 mb-2">
              Compétence C{comp.id} — {comp.shortTitle}
            </p>
          )}

          <p className="text-gray-600 mb-6">
            {passed
              ? "Vous avez réussi cette série d'entraînement."
              : "Il faut au moins 75% de bonnes réponses pour réussir."}
          </p>

          <div className="flex items-center justify-center gap-8 mb-8">
            <div>
              <div className="text-4xl font-bold text-[#cf5c36]">
                {score}/{questions.length}
              </div>
              <div className="text-sm text-gray-500 mt-1">Bonnes réponses</div>
            </div>
            <div>
              <div
                className={`text-4xl font-bold ${
                  passed ? "text-green-600" : "text-red-500"
                }`}
              >
                {percentage}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Score</div>
            </div>
          </div>

          {savingResult && (
            <p className="text-xs text-gray-400 mb-4 flex items-center justify-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Sauvegarde en cours...
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => startQuiz(selectedCompetence)}
              className="inline-flex items-center justify-center gap-2 bg-[#cf5c36] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#b8502f] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Nouvelle série
            </button>
            <button
              onClick={() => {
                setQuizStarted(false);
                setIsFinished(false);
              }}
              className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
            >
              Changer de compétence
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── No questions fallback ───────────────────────────────────────────────────
  if (!currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <p className="text-gray-500">Aucune question disponible pour cette compétence.</p>
        <button
          onClick={() => setQuizStarted(false)}
          className="mt-4 text-sm text-[#cf5c36] hover:underline"
        >
          Retour au choix de compétence
        </button>
      </div>
    );
  }

  // ── Active quiz screen ──────────────────────────────────────────────────────
  const comp = selectedCompetence
    ? remcCompetences.find((c) => c.id === selectedCompetence)
    : null;
  const colors = selectedCompetence ? COMP_COLORS[selectedCompetence] : null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          {comp ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">{comp.icon}</span>
              <div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors?.badge ?? ""}`}
                >
                  C{comp.id}
                </span>
                <span className="text-sm font-semibold text-gray-700 ml-2">
                  {comp.shortTitle}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#cf5c36]" />
              <span className="text-sm font-semibold text-gray-700">
                Tout réviser
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setQuizStarted(false)}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Changer de compétence
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">
          Question {currentIndex + 1}/{questions.length}
        </span>
        <span className="text-sm font-semibold text-[#cf5c36]">
          Score : {score}/{currentIndex + (isAnswered ? 1 : 0)}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div
          className="bg-[#cf5c36] h-2 rounded-full transition-all duration-300"
          style={{
            width: `${
              ((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100
            }%`,
          }}
        />
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-6">
        {/* Badges */}
        <div className="flex items-start gap-2 mb-4 flex-wrap">
          <span className="inline-block bg-[#fcedea] text-[#cf5c36] text-xs font-semibold px-2.5 py-1 rounded-full">
            {currentQuestion.category}
          </span>
          <span
            className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
              currentQuestion.difficulty === "facile"
                ? "bg-green-50 text-green-600"
                : currentQuestion.difficulty === "difficile"
                  ? "bg-red-50 text-red-600"
                  : "bg-yellow-50 text-yellow-600"
            }`}
          >
            {currentQuestion.difficulty}
          </span>
          {currentQuestion.competence_id && (
            <span
              className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                COMP_COLORS[currentQuestion.competence_id]?.badge ?? ""
              }`}
            >
              C{currentQuestion.competence_id}
            </span>
          )}
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-6">
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
                "border-gray-100 hover:border-[#cf5c36] hover:bg-[#fcedea] cursor-pointer";
            } else if (isCorrect) {
              btnClass += "border-green-500 bg-green-50";
            } else if (isSelected && !isCorrect) {
              btnClass += "border-red-500 bg-red-50";
            } else {
              btnClass += "border-gray-100 opacity-50";
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      isAnswered && isCorrect
                        ? "bg-green-500 text-white"
                        : isAnswered && isSelected && !isCorrect
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-600"
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
                  <span className="text-sm text-gray-800">{answer.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Post-answer section */}
        {isAnswered && (
          <div className="mt-6 space-y-4">
            {/* Base explanation */}
            <div
              className={`p-4 rounded-xl ${
                selectedAnswer === currentQuestion.correct_answer
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Explication
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {currentQuestion.explanation}
              </p>
            </div>

            {/* AI button */}
            {!aiExplanation && (
              <button
                onClick={askAI}
                disabled={aiLoading}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#cf5c36] hover:text-[#b8502f] transition-colors"
              >
                {aiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                {aiLoading
                  ? "L'IA réfléchit..."
                  : "Demander une explication détaillée à l'IA"}
              </button>
            )}

            {/* AI explanation */}
            {aiExplanation && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">
                    Explication du moniteur IA
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {aiExplanation}
                </p>
              </div>
            )}

            {/* Next button */}
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 bg-[#cf5c36] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#b8502f] transition-colors"
            >
              {currentIndex + 1 >= questions.length
                ? "Voir le résultat"
                : "Question suivante"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
