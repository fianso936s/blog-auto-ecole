import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import type { QuizQuestion } from "../../lib/types";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Brain,
  Loader2,
  Trophy,
  BookOpen,
  Star,
} from "lucide-react";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

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
  const [category, setCategory] = useState("Toutes");
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [quizSize] = useState(40);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*");

      if (!error && data) {
        setAllQuestions(data);
      }
      setLoading(false);
    };
    fetchQuestions();
  }, []);

  const startQuiz = useCallback(
    (cat: string) => {
      setCategory(cat);
      const filtered =
        cat === "Toutes"
          ? [...allQuestions]
          : allQuestions.filter((q) => q.category === cat);

      filtered.sort(() => Math.random() - 0.5);
      setQuestions(filtered.slice(0, quizSize));
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setScore(0);
      setIsFinished(false);
      setAiExplanation("");
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
    setAiExplanation("");
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
      setAiExplanation("");
    }
  };

  const askAI = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
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
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-muted">Aucune question disponible.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
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
                className={`text-xs px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
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
                  "border-border hover:border-primary hover:bg-primary-light cursor-pointer";
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

              {/* AI button */}
              {!aiExplanation && (
                <button
                  onClick={askAI}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  {aiLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  {aiLoading
                    ? "L'IA r\u00e9fl\u00e9chit..."
                    : "Demander une explication d\u00e9taill\u00e9e \u00e0 l'IA"}
                </button>
              )}

              {/* AI explanation callout card */}
              {aiExplanation && (
                <div className="p-5 rounded-xl bg-secondary/5 border border-secondary/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
                  <div className="flex items-center gap-2 mb-3 pl-3">
                    <Brain className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-semibold text-secondary">
                      Explication du moniteur IA
                    </span>
                  </div>
                  <p className="text-sm text-text whitespace-pre-line leading-relaxed pl-3">
                    {aiExplanation}
                  </p>
                </div>
              )}

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
