import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  BookMarked,
  Clock,
  List,
} from "lucide-react";
import { remcLessonsAll } from "../../data/remcLessonsAll";
import { remcCompetences } from "../../data/remc";
import type { REMCLesson, LessonSection } from "../../data/remcLessonsTypes";

// ─── Competence color config ───────────────────────────────────────────────

interface CompColor {
  tab: string;
  tabActive: string;
  badge: string;
  badgeActive: string;
  border: string;
  text: string;
  bg: string;
  highlight: string;
}

const COMP_COLORS: Record<number, CompColor> = {
  1: {
    tab: "border-blue-200 text-blue-700 hover:bg-blue-50",
    tabActive: "bg-blue-600 text-white border-blue-600",
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    badgeActive: "bg-blue-600 text-white",
    border: "border-blue-400",
    text: "text-blue-600",
    bg: "bg-blue-50",
    highlight: "bg-blue-100 text-blue-800 border-blue-300",
  },
  2: {
    tab: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
    tabActive: "bg-emerald-600 text-white border-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    badgeActive: "bg-emerald-600 text-white",
    border: "border-emerald-400",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    highlight: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  3: {
    tab: "border-amber-200 text-amber-700 hover:bg-amber-50",
    tabActive: "bg-amber-500 text-white border-amber-500",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    badgeActive: "bg-amber-500 text-white",
    border: "border-amber-400",
    text: "text-amber-600",
    bg: "bg-amber-50",
    highlight: "bg-amber-100 text-amber-800 border-amber-300",
  },
  4: {
    tab: "border-purple-200 text-purple-700 hover:bg-purple-50",
    tabActive: "bg-purple-600 text-white border-purple-600",
    badge: "bg-purple-50 text-purple-700 border border-purple-200",
    badgeActive: "bg-purple-600 text-white",
    border: "border-purple-400",
    text: "text-purple-600",
    bg: "bg-purple-50",
    highlight: "bg-purple-100 text-purple-800 border-purple-300",
  },
};

// ─── Section Renderers ─────────────────────────────────────────────────────

function SectionIntro({ section }: { section: LessonSection }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex gap-4">
      <div className="shrink-0 mt-0.5">
        <BookOpen className="w-5 h-5 text-gray-500" />
      </div>
      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
        {section.content}
      </p>
    </div>
  );
}

function SectionRule({
  section,
  compId,
}: {
  section: LessonSection;
  compId: number;
}) {
  const colors = COMP_COLORS[compId] ?? COMP_COLORS[1];
  return (
    <div
      className={`bg-white rounded-xl border-l-4 ${colors.border} shadow-sm p-5`}
    >
      {section.title && (
        <h3 className="font-semibold text-gray-900 mb-2">{section.title}</h3>
      )}
      <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-3">
        {section.content}
      </p>
      {section.rules && section.rules.length > 0 && (
        <ul className="space-y-1.5 mb-3">
          {section.rules.map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle
                className={`w-4 h-4 shrink-0 mt-0.5 ${colors.text}`}
              />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      )}
      {section.highlight && (
        <div
          className={`inline-block rounded-lg border px-3 py-1.5 text-sm font-medium ${colors.highlight}`}
        >
          {section.highlight}
        </div>
      )}
    </div>
  );
}

function SectionWarning({ section }: { section: LessonSection }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          {section.title && (
            <h3 className="font-semibold text-red-800 mb-1">{section.title}</h3>
          )}
          <p className="text-red-700 text-sm sm:text-base leading-relaxed">
            {section.content}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionTip({ section }: { section: LessonSection }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
      <div className="flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          {section.title && (
            <h3 className="font-semibold text-blue-800 mb-1">{section.title}</h3>
          )}
          <p className="text-blue-800 text-sm sm:text-base leading-relaxed">
            {section.content}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionExample({ section }: { section: LessonSection }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
      <div className="flex items-start gap-3">
        <BookMarked className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          {section.title && (
            <h3 className="font-semibold text-green-800 mb-1">
              {section.title}
            </h3>
          )}
          <p className="text-green-800 text-sm sm:text-base leading-relaxed">
            {section.content}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionSummary({ section }: { section: LessonSection }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 text-white">
      <div className="flex items-center gap-2 mb-3">
        <List className="w-5 h-5 text-gray-300" />
        <h3 className="font-semibold text-gray-100">À retenir</h3>
      </div>
      <p className="text-gray-300 text-sm mb-3">{section.content}</p>
      {section.rules && section.rules.length > 0 && (
        <ul className="space-y-1.5">
          {section.rules.map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LessonSection({
  section,
  compId,
}: {
  section: LessonSection;
  compId: number;
}) {
  switch (section.type) {
    case "intro":
      return <SectionIntro section={section} />;
    case "rule":
      return <SectionRule section={section} compId={compId} />;
    case "warning":
      return <SectionWarning section={section} />;
    case "tip":
      return <SectionTip section={section} />;
    case "example":
      return <SectionExample section={section} />;
    case "summary":
      return <SectionSummary section={section} />;
    default:
      return null;
  }
}

// ─── Lesson Content Panel ──────────────────────────────────────────────────

function LessonContent({
  lesson,
  prevLesson,
  nextLesson,
  onNavigate,
}: {
  lesson: REMCLesson;
  prevLesson: REMCLesson | null;
  nextLesson: REMCLesson | null;
  onNavigate: (id: string) => void;
}) {
  const comp = remcCompetences.find((c) => c.id === lesson.competence_id);
  const colors = COMP_COLORS[lesson.competence_id] ?? COMP_COLORS[1];

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
        <span className={`font-medium ${colors.text}`}>
          C{lesson.competence_id}. {comp?.shortTitle ?? "Compétence"}
        </span>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-gray-700 font-medium">{lesson.title}</span>
      </nav>

      {/* Lesson Header */}
      <div className={`${colors.bg} rounded-xl p-5 sm:p-6`}>
        <div className="flex items-start gap-4">
          <span className="text-3xl sm:text-4xl" role="img" aria-label={lesson.title}>
            {lesson.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}
              >
                C{lesson.competence_id} · Leçon {lesson.chapter}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {lesson.readingTime}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {lesson.title}
            </h1>
            <p className="text-sm text-gray-600 mt-1">{lesson.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-4">
        {lesson.sections.map((section, i) => (
          <LessonSection key={i} section={section} compId={lesson.competence_id} />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-3">
        <div className="flex-1">
          {prevLesson && (
            <button
              onClick={() => onNavigate(prevLesson.id)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:block truncate max-w-[180px]">
                {prevLesson.title}
              </span>
              <span className="sm:hidden">Précédent</span>
            </button>
          )}
        </div>
        <div className="flex-1 flex justify-end">
          {nextLesson && (
            <button
              onClick={() => onNavigate(nextLesson.id)}
              className="flex items-center gap-2 text-sm font-medium text-[#cf5c36] hover:text-[#b54d2c] transition-colors group"
            >
              <span className="hidden sm:block truncate max-w-[180px]">
                {nextLesson.title}
              </span>
              <span className="sm:hidden">Suivant</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Panel ─────────────────────────────────────────────────────────

function SidebarPanel({
  selectedCompId,
  selectedLessonId,
  onSelectComp,
  onSelectLesson,
}: {
  selectedCompId: number;
  selectedLessonId: string;
  onSelectComp: (id: number) => void;
  onSelectLesson: (id: string) => void;
}) {
  const lessonsForComp = remcLessonsAll.filter(
    (l) => l.competence_id === selectedCompId
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Competence Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
          Compétences
        </p>
        <div className="flex flex-col gap-1">
          {remcCompetences.map((comp) => {
            const colors = COMP_COLORS[comp.id] ?? COMP_COLORS[1];
            const isActive = comp.id === selectedCompId;
            return (
              <button
                key={comp.id}
                onClick={() => onSelectComp(comp.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all text-left w-full ${
                  isActive ? colors.tabActive : colors.tab
                }`}
              >
                <span className="text-base" role="img" aria-label={comp.shortTitle}>
                  {comp.icon}
                </span>
                <span className="leading-tight">
                  <span className="font-bold">C{comp.id}</span>
                  <span className="hidden lg:inline"> — {comp.shortTitle}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lesson List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
          {remcCompetences.find((c) => c.id === selectedCompId)?.shortTitle}
        </p>
        <div className="flex flex-col gap-0.5">
          {lessonsForComp.map((lesson) => {
            const colors = COMP_COLORS[lesson.competence_id] ?? COMP_COLORS[1];
            const isActive = lesson.id === selectedLessonId;
            return (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson.id)}
                className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left w-full transition-all group ${
                  isActive
                    ? `${colors.bg} ${colors.text} font-semibold`
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-sm mt-0.5 shrink-0">{lesson.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug truncate">{lesson.title}</p>
                  <p
                    className={`text-xs mt-0.5 ${
                      isActive ? "opacity-70" : "text-gray-400"
                    }`}
                  >
                    Leçon {lesson.chapter} · {lesson.readingTime}
                  </p>
                </div>
                {isActive && (
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 mt-1 ${colors.text}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Competence + Lesson Selector ──────────────────────────────────

function MobileSelector({
  selectedCompId,
  selectedLessonId,
  onSelectComp,
  onSelectLesson,
}: {
  selectedCompId: number;
  selectedLessonId: string;
  onSelectComp: (id: number) => void;
  onSelectLesson: (id: string) => void;
}) {
  const [listOpen, setListOpen] = useState(false);
  const lessonsForComp = remcLessonsAll.filter(
    (l) => l.competence_id === selectedCompId
  );

  return (
    <div className="flex flex-col gap-3 lg:hidden">
      {/* Competence row */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {remcCompetences.map((comp) => {
          const colors = COMP_COLORS[comp.id] ?? COMP_COLORS[1];
          const isActive = comp.id === selectedCompId;
          return (
            <button
              key={comp.id}
              onClick={() => {
                onSelectComp(comp.id);
                setListOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border shrink-0 transition-all ${
                isActive ? colors.tabActive : colors.tab
              }`}
            >
              <span>{comp.icon}</span>
              <span>C{comp.id}</span>
            </button>
          );
        })}
      </div>

      {/* Lesson accordion */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setListOpen((v) => !v)}
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-800"
        >
          <span className="flex items-center gap-2">
            <List className="w-4 h-4 text-gray-500" />
            Leçons de C{selectedCompId}
          </span>
          <ChevronRight
            className={`w-4 h-4 text-gray-500 transition-transform ${
              listOpen ? "rotate-90" : ""
            }`}
          />
        </button>
        {listOpen && (
          <div className="border-t border-gray-100 divide-y divide-gray-50">
            {lessonsForComp.map((lesson) => {
              const colors = COMP_COLORS[lesson.competence_id] ?? COMP_COLORS[1];
              const isActive = lesson.id === selectedLessonId;
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    onSelectLesson(lesson.id);
                    setListOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm transition-colors ${
                    isActive
                      ? `${colors.bg} ${colors.text} font-semibold`
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{lesson.icon}</span>
                  <span className="flex-1">{lesson.title}</span>
                  {isActive && <ChevronRight className={`w-3.5 h-3.5 ${colors.text}`} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function CoursPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultLessonId = remcLessonsAll[0]?.id ?? "c1_l1";
  const lessonParam = searchParams.get("lesson") ?? defaultLessonId;

  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    () =>
      remcLessonsAll.find((l) => l.id === lessonParam)?.id ?? defaultLessonId
  );

  // Sync with URL
  useEffect(() => {
    const param = searchParams.get("lesson");
    if (param && param !== selectedLessonId) {
      const found = remcLessonsAll.find((l) => l.id === param);
      if (found) setSelectedLessonId(param);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const selectedLesson =
    remcLessonsAll.find((l) => l.id === selectedLessonId) ?? remcLessonsAll[0];

  const [selectedCompId, setSelectedCompId] = useState<number>(
    selectedLesson?.competence_id ?? 1
  );

  const lessonIndex = remcLessonsAll.findIndex((l) => l.id === selectedLessonId);
  const prevLesson = lessonIndex > 0 ? remcLessonsAll[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex < remcLessonsAll.length - 1
      ? remcLessonsAll[lessonIndex + 1]
      : null;

  const handleSelectLesson = (id: string) => {
    setSelectedLessonId(id);
    setSearchParams({ lesson: id });
    const lesson = remcLessonsAll.find((l) => l.id === id);
    if (lesson) setSelectedCompId(lesson.competence_id);
    // Scroll to top of content on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectComp = (compId: number) => {
    setSelectedCompId(compId);
    // Auto-select first lesson of that competence
    const firstLesson = remcLessonsAll.find((l) => l.competence_id === compId);
    if (firstLesson) {
      setSelectedLessonId(firstLesson.id);
      setSearchParams({ lesson: firstLesson.id });
    }
  };

  if (!selectedLesson) return null;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes cours REMC</h1>
        <p className="text-sm text-gray-500 mt-1">
          {remcLessonsAll.length} leçons réparties sur 4 compétences
        </p>
      </div>

      {/* Mobile selector */}
      <div className="mb-4">
        <MobileSelector
          selectedCompId={selectedCompId}
          selectedLessonId={selectedLessonId}
          onSelectComp={handleSelectComp}
          onSelectLesson={handleSelectLesson}
        />
      </div>

      {/* Desktop 2-column layout */}
      <div className="flex gap-6 items-start">
        {/* Sidebar (desktop only) */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-6">
          <SidebarPanel
            selectedCompId={selectedCompId}
            selectedLessonId={selectedLessonId}
            onSelectComp={handleSelectComp}
            onSelectLesson={handleSelectLesson}
          />
        </aside>

        {/* Lesson content */}
        <main className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 lg:p-8">
          <LessonContent
            lesson={selectedLesson}
            prevLesson={prevLesson}
            nextLesson={nextLesson}
            onNavigate={handleSelectLesson}
          />
        </main>
      </div>
    </div>
  );
}
