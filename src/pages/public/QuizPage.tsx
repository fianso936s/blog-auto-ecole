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

  // Charger les questions
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

  // Demarrer une serie
  const startQuiz = useCallback(
    (cat: string) => {
      setCategory(cat);
      let filtered =
        cat === "Toutes"
          ? [...allQuestions]
          : allQuestions.filter((q) => q.category === cat);

      // Melanger aleatoirement
      filtered.sort(() => Math.random() - 0.5);
      // Prendre 40 questions max (comme le vrai examen)
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

  // Soumettre une reponse
  const handleAnswer = (label: string) => {
    if (isAnswered) return;
    setSelectedAnswer(label);
    setIsAnswered(true);
    setAiExplanation("");
    if (label === currentQuestion.correct_answer) {
      setScore((s) => s + 1);
    }
  };

  // Question suivante
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

  // Demander une explication IA VERROUILLEE sur la bonne reponse
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
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#cf5c36] mx-auto mb-4" />
        <p className="text-gray-500">Chargement des questions...</p>
      </div>
    );
  }

  // Ecran de resultat
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 75;

    return (
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div
            className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${passed ? "bg-green-100" : "bg-red-100"}`}
          >
            <Trophy
              className={`w-10 h-10 ${passed ? "text-green-600" : "text-red-500"}`}
            />
          </div>

          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
            {passed ? "F\u00e9licitations !" : "Continuez vos r\u00e9visions !"}
          </h1>

          <p className="text-gray-600 mb-6">
            {passed
              ? "Vous avez r\u00e9ussi cette s\u00e9rie d'entra\u00eenement."
              : "Il faut au moins 75% de bonnes r\u00e9ponses pour r\u00e9ussir."}
          </p>

          <div className="flex items-center justify-center gap-8 mb-8">
            <div>
              <div className="text-4xl font-bold text-[#cf5c36]">
                {score}/{questions.length}
              </div>
              <div className="text-sm text-gray-500 mt-1">Bonnes r\u00e9ponses</div>
            </div>
            <div>
              <div
                className={`text-4xl font-bold ${passed ? "text-green-600" : "text-red-500"}`}
              >
                {percentage}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Score</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => startQuiz(category)}
              className="inline-flex items-center justify-center gap-2 bg-[#cf5c36] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#b8502f] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Nouvelle s\u00e9rie
            </button>
            <button
              onClick={() => startQuiz("Toutes")}
              className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
            >
              Toutes les cat\u00e9gories
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Aucune question disponible.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-[#cf5c36] text-sm font-semibold uppercase tracking-wide">
          Quiz Code de la Route
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          Testez vos connaissances
        </h1>
      </div>

      {/* Filtres categories */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => startQuiz(cat)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              category === cat
                ? "bg-[#cf5c36] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
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
            width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">
        <div className="flex items-start gap-3 mb-1">
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
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-6">
          {currentQuestion.question}
        </h2>

        {/* Reponses */}
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

        {/* Explication apres reponse */}
        {isAnswered && (
          <div className="mt-6 space-y-4">
            {/* Explication de base */}
            <div
              className={`p-4 rounded-xl ${selectedAnswer === currentQuestion.correct_answer ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
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

            {/* Bouton IA */}
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
                  ? "L'IA r\u00e9fl\u00e9chit..."
                  : "Demander une explication d\u00e9taill\u00e9e \u00e0 l'IA"}
              </button>
            )}

            {/* Explication IA */}
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

            {/* Bouton suivant */}
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 bg-[#cf5c36] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#b8502f] transition-colors"
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
  );
}
