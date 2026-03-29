import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  BookMarked,
  Clock,
  List,
  Info,
  FileText,
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
    tabActive: "bg-blue-600 text-white border-blue-600 shadow-sm",
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    badgeActive: "bg-blue-600 text-white",
    border: "border-blue-400",
    text: "text-blue-600",
    bg: "bg-blue-50",
    highlight: "bg-blue-100 text-blue-800 border-blue-300",
  },
  2: {
    tab: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
    tabActive: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    badgeActive: "bg-emerald-600 text-white",
    border: "border-emerald-400",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    highlight: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  3: {
    tab: "border-amber-200 text-amber-700 hover:bg-amber-50",
    tabActive: "bg-amber-500 text-white border-amber-500 shadow-sm",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    badgeActive: "bg-amber-500 text-white",
    border: "border-amber-400",
    text: "text-amber-600",
    bg: "bg-amber-50",
    highlight: "bg-amber-100 text-amber-800 border-amber-300",
  },
  4: {
    tab: "border-purple-200 text-purple-700 hover:bg-purple-50",
    tabActive: "bg-purple-600 text-white border-purple-600 shadow-sm",
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
    <div className="bg-blue-50/60 border border-blue-200/60 rounded-2xl p-5 sm:p-6 flex gap-4">
      <div className="shrink-0 mt-0.5">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Info className="w-4 h-4 text-blue-600" />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1.5">Introduction</p>
        <p className="text-text leading-relaxed text-sm sm:text-base">
          {section.content}
        </p>
      </div>
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
      className={`bg-surface rounded-2xl border-l-4 ${colors.border} shadow-sm p-5 sm:p-6 border border-border/50`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
          <FileText className={`w-4 h-4 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          {section.title && (
            <h3 className="font-serif font-bold text-secondary mb-2 text-base">{section.title}</h3>
          )}
          <p className="text-text text-sm sm:text-base leading-relaxed mb-3">
            {section.content}
          </p>
          {section.rules && section.rules.length > 0 && (
            <ul className="space-y-2 mb-3">
              {section.rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-text">
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
              className={`inline-block rounded-xl border px-4 py-2 text-sm font-medium ${colors.highlight}`}
            >
              {section.highlight}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionWarning({ section }: { section: LessonSection }) {
  return (
    <div className="bg-amber-light border border-amber/20 rounded-2xl p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-amber/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4 text-amber" />
        </div>
        <div>
          <p className="text-xs font-semibold text-amber uppercase tracking-wide mb-1">Attention</p>
          {section.title && (
            <h3 className="font-serif font-bold text-secondary mb-1.5">{section.title}</h3>
          )}
          <p className="text-text text-sm sm:text-base leading-relaxed">
            {section.content}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionTip({ section }: { section: LessonSection }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Conseil</p>
          {section.title && (
            <h3 className="font-serif font-bold text-secondary mb-1.5">{section.title}</h3>
          )}
          <p className="text-text text-sm sm:text-base leading-relaxed">
            {section.content}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionExample({ section }: { section: LessonSection }) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <BookMarked className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Exemple</p>
          {section.title && (
            <h3 className="font-serif font-bold text-secondary mb-1.5">
              {section.title}
            </h3>
          )}
          <p className="text-text text-sm sm:text-base leading-relaxed">
            {section.content}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionSummary({ section }: { section: LessonSection }) {
  return (
    <div className="bg-secondary rounded-2xl p-5 sm:p-6 text-white">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
          <List className="w-4 h-4 text-white/80" />
        </div>
        <h3 className="font-serif font-bold text-white">A retenir</h3>
      </div>
      <p className="text-white/70 text-sm mb-3 leading-relaxed">{section.content}</p>
      {section.rules && section.rules.length > 0 && (
        <ul className="space-y-2">
          {section.rules.map((rule, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-white/90">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LessonSectionRenderer({
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
      <nav className="flex items-center gap-1.5 text-xs text-text-muted flex-wrap">
        <span className={`font-medium ${colors.text}`}>
          C{lesson.competence_id}. {comp?.shortTitle ?? "Competence"}
        </span>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-secondary font-medium">{lesson.title}</span>
      </nav>

      {/* Lesson Header */}
      <div className={`${colors.bg} rounded-2xl p-5 sm:p-6 border ${colors.border.replace('border-', 'border-')}/30`}>
        <div className="flex items-start gap-4">
          <span className="text-3xl sm:text-4xl" role="img" aria-label={lesson.title}>
            {lesson.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors.badge}`}
              >
                C{lesson.competence_id} · Lecon {lesson.chapter}
              </span>
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Clock className="w-3 h-3" />
                {lesson.readingTime}
              </span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-secondary leading-tight">
              {lesson.title}
            </h1>
            <p className="text-sm text-text-muted mt-1.5">{lesson.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-5">
        {lesson.sections.map((section, i) => (
          <LessonSectionRenderer key={i} section={section} compId={lesson.competence_id} />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border gap-3">
        <div className="flex-1">
          {prevLesson && (
            <button
              onClick={() => onNavigate(prevLesson.id)}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-secondary transition-colors group p-2 -ml-2 rounded-xl hover:bg-surface-alt"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:block truncate max-w-[180px]">
                {prevLesson.title}
              </span>
              <span className="sm:hidden">Precedent</span>
            </button>
          )}
        </div>
        <div className="flex-1 flex justify-end">
          {nextLesson && (
            <button
              onClick={() => onNavigate(nextLesson.id)}
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors group p-2 -mr-2 rounded-xl hover:bg-primary-light"
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
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-3">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2 px-2">
          Competences
        </p>
        <div className="flex flex-col gap-1">
          {remcCompetences.map((comp) => {
            const colors = COMP_COLORS[comp.id] ?? COMP_COLORS[1];
            const isActive = comp.id === selectedCompId;
            return (
              <button
                key={comp.id}
                onClick={() => onSelectComp(comp.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 text-left w-full ${
                  isActive ? colors.tabActive : colors.tab
                }`}
              >
                <span className="text-base" role="img" aria-label={comp.shortTitle}>
                  {comp.icon}
                </span>
                <span className="leading-tight">
                  <span className="font-bold">C{comp.id}</span>
                  <span className="hidden lg:inline"> -- {comp.shortTitle}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lesson List */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-3">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2 px-2">
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
                className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left w-full transition-all duration-200 group ${
                  isActive
                    ? `${colors.bg} ${colors.text} font-semibold border border-current/10`
                    : "text-text-muted hover:bg-surface-alt hover:text-secondary"
                }`}
              >
                <span className="text-sm mt-0.5 shrink-0">{lesson.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug truncate">{lesson.title}</p>
                  <p
                    className={`text-xs mt-0.5 ${
                      isActive ? "opacity-70" : "text-text-muted"
                    }`}
                  >
                    Lecon {lesson.chapter} · {lesson.readingTime}
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
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium border shrink-0 transition-all duration-200 ${
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
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <button
          onClick={() => setListOpen((v) => !v)}
          className="flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium text-secondary"
        >
          <span className="flex items-center gap-2">
            <div className="w-6 h-6 bg-surface-alt rounded-lg flex items-center justify-center">
              <List className="w-3.5 h-3.5 text-text-muted" />
            </div>
            Lecons de C{selectedCompId}
          </span>
          <ChevronRight
            className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
              listOpen ? "rotate-90" : ""
            }`}
          />
        </button>
        {listOpen && (
          <div className="border-t border-border divide-y divide-border/50">
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
                  className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm transition-all duration-200 ${
                    isActive
                      ? `${colors.bg} ${colors.text} font-semibold`
                      : "text-text hover:bg-surface-alt"
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
    <div className="max-w-7xl mx-auto animate-fade-up">
      {/* Page title */}
      <div className="mb-6">
        <p className="text-primary text-sm font-semibold uppercase tracking-wide mb-1">Formation REMC</p>
        <h1 className="font-serif text-2xl font-bold text-secondary">Mes cours</h1>
        <p className="text-sm text-text-muted mt-1">
          {remcLessonsAll.length} lecons reparties sur 4 competences
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
        <main className="flex-1 min-w-0 bg-surface rounded-2xl shadow-sm border border-border p-5 sm:p-6 lg:p-8">
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
