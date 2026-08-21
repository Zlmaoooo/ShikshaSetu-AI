"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

import {
  getAllDoubts,
  getSourceById,
  getNoMatchFallback,
  getMasteryTier,
  type Doubt,
  type BilingualText,
} from "@/lib/mock-data";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  ChevronRight,
  BookOpen,
  Brain,
  CheckCircle2,
  XCircle,
  LogIn,
  Sparkles,
  RotateCcw,
  Library,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DoubtFlowProps {
  /** Controls mode-specific UI (guest shows login CTA, student skips it). */
  mode: "guest" | "student";
  /** Starting mastery score [0–1] for the concept being explored. */
  initialMasteryScore?: number;
  /** Called with the mastery delta after the session completes. */
  onComplete?: (delta: number) => void;
}

type Phase = "select" | "thinking" | "result";
type Lang = "en" | "as";

// ─────────────────────────────────────────────────────────────────────────────
// SPOTLIGHT  (Aceternity UI–inspired: mouse-tracking radial gradient)
// ─────────────────────────────────────────────────────────────────────────────

function Spotlight({ children, className }: { children: React.ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 45, y: 35 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Wide ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-[background] duration-500"
        style={{
          background: `radial-gradient(800px circle at ${pos.x}% ${pos.y}%, rgba(139,92,246,0.06) 0%, rgba(99,102,241,0.03) 35%, transparent 65%)`,
        }}
      />
      {/* Tight hot-spot */}
      <div
        className="pointer-events-none absolute inset-0 transition-[background] duration-200"
        style={{
          background: `radial-gradient(280px circle at ${pos.x}% ${pos.y}%, rgba(168,85,247,0.05) 0%, transparent 50%)`,
        }}
      />
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED COUNTER  (Magic UI–inspired: cubic-ease-out number roll)
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedCounter({
  from,
  to,
  duration = 1.5,
  className,
}: {
  from: number;
  to: number;
  duration?: number;
  className?: string;
}) {
  const [current, setCurrent] = useState(from);

  useEffect(() => {
    const startTime = performance.now();
    const startVal = from;

    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // cubic ease-out
      setCurrent(Math.round(startVal + (to - startVal) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };

    const rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [from, to, duration]);

  return <span className={className}>{current}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTERY BAR  (combines animated counter + motion progress bar)
// ─────────────────────────────────────────────────────────────────────────────

function MasteryBar({
  fromScore,
  toScore,
}: {
  fromScore: number;
  toScore: number;
}) {
  const tier = getMasteryTier(toScore);
  const fromPct = Math.round(fromScore * 100);
  const toPct = Math.round(toScore * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Mastery
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm text-muted-foreground line-through tabular-nums">
            {fromPct}%
          </span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          <span
            className="text-3xl font-bold tabular-nums leading-none"
            style={{ color: tier?.color ?? "#4d9de0" }}
          >
            <AnimatedCounter from={fromPct} to={toPct} duration={1.5} />
            <span className="text-xl">%</span>
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: tier?.color ?? "#4d9de0" }}
          initial={{ width: `${fromPct}%` }}
          animate={{ width: `${toPct}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Shimmer */}
        <motion.div
          className="absolute inset-y-0 w-8 bg-white/20 skew-x-12"
          initial={{ left: `${fromPct}%` }}
          animate={{ left: `${toPct + 5}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Tier label */}
      {tier && (
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: tier.color }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: tier.color }}
          >
            {tier.label}
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE TOGGLE  (shared between select and result phase top bars)
// ─────────────────────────────────────────────────────────────────────────────

function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-0.5 p-1 rounded-lg bg-muted/60 border border-border/40">
      {(["en", "as"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
            lang === l
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l === "en" ? "English" : "অসমীয়া"}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP BAR  (grade/subject selects + language toggle)
// ─────────────────────────────────────────────────────────────────────────────

function TopBar({ lang, onLangChange }: { lang: Lang; onLangChange: (l: Lang) => void }) {
  return (
    <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Grade — single option, disabled for this round */}
          <Select defaultValue="8">
            <SelectTrigger className="w-28 h-8 text-xs bg-muted/40 border-border/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8">Class 8</SelectItem>
            </SelectContent>
          </Select>
          {/* Subject — single option, disabled for this round */}
          <Select defaultValue="science">
            <SelectTrigger className="w-32 h-8 text-xs bg-muted/40 border-border/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="science">Science</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <LangToggle lang={lang} onChange={onLangChange} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MCQ OPTION  (shared between diagnostic and practice)
// ─────────────────────────────────────────────────────────────────────────────

function McqOption({
  id,
  label,
  selected,
  submitted,
  isCorrect,
  onClick,
}: {
  id: string;
  label: string;
  selected: boolean;
  submitted: boolean;
  isCorrect: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={submitted}
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all duration-150 focus-visible:outline-none",
        !submitted && selected &&
          "border-violet-500/60 bg-violet-500/10 text-foreground",
        !submitted && !selected &&
          "border-border/40 bg-muted/10 hover:border-border/70 hover:bg-muted/30 text-foreground/80",
        submitted && isCorrect &&
          "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
        submitted && selected && !isCorrect &&
          "border-red-500/50 bg-red-500/10 text-red-300",
        submitted && !selected && !isCorrect &&
          "border-border/20 bg-transparent opacity-40 cursor-default"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex-shrink-0 h-5 w-5 rounded-full border text-[10px] font-bold flex items-center justify-center",
            !submitted && selected
              ? "border-violet-400 text-violet-400"
              : "border-border/60 text-muted-foreground",
            submitted && isCorrect ? "border-emerald-400 text-emerald-400" : "",
            submitted && selected && !isCorrect ? "border-red-400 text-red-400" : ""
          )}
        >
          {id.toUpperCase()}
        </span>
        <span className="flex-1">{label}</span>
        {submitted && isCorrect && (
          <CheckCircle2 className="flex-shrink-0 h-4 w-4 text-emerald-400" />
        )}
        {submitted && selected && !isCorrect && (
          <XCircle className="flex-shrink-0 h-4 w-4 text-red-400" />
        )}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function DoubtFlow({
  mode,
  initialMasteryScore = 0,
  onComplete,
}: DoubtFlowProps) {
  const doubts = getAllDoubts();
  const noMatchFallback = getNoMatchFallback();

  // ── Core state ──────────────────────────────────────────────────────────────
  const [lang, setLang] = useState<Lang>("en");
  const [phase, setPhase] = useState<Phase>("select");
  const [freeText, setFreeText] = useState("");
  const [noMatch, setNoMatch] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);

  // ── Progressive reveal flags (result phase) ──────────────────────────────
  const [showExplanation, setShowExplanation] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [showMastery, setShowMastery] = useState(false);

  // ── Diagnostic ────────────────────────────────────────────────────────────
  const [diagAnswer, setDiagAnswer] = useState<string | null>(null);
  const [diagSubmitted, setDiagSubmitted] = useState(false);
  const [diagCorrect, setDiagCorrect] = useState<boolean | null>(null);

  // ── Practice ─────────────────────────────────────────────────────────────
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<
    Array<{ answer: string; correct: boolean } | null>
  >([null, null, null]);
  const [practiceCurrentAnswer, setPracticeCurrentAnswer] = useState<string | null>(null);
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);

  // ── Mastery ───────────────────────────────────────────────────────────────
  const [finalScore, setFinalScore] = useState(initialMasteryScore);

  // ── Helper: bilingual text accessor ─────────────────────────────────────
  function tx(text: BilingualText): string {
    return text[lang];
  }

  // ── Reset all state to initial select phase ───────────────────────────────
  function resetAll() {
    setPhase("select");
    setSelectedDoubt(null);
    setFreeText("");
    setNoMatch(false);
    setShowExplanation(false);
    setShowDiagnostic(false);
    setShowPractice(false);
    setShowMastery(false);
    setDiagAnswer(null);
    setDiagSubmitted(false);
    setDiagCorrect(null);
    setPracticeIndex(0);
    setPracticeAnswers([null, null, null]);
    setPracticeCurrentAnswer(null);
    setPracticeSubmitted(false);
    setFinalScore(initialMasteryScore);
  }

  // ── Select a doubt and start the flow ────────────────────────────────────
  function handleSelectDoubt(doubt: Doubt) {
    setSelectedDoubt(doubt);
    setNoMatch(false);
    setFreeText("");
    setPhase("thinking");

    setTimeout(() => {
      setPhase("result");
      setTimeout(() => setShowExplanation(true), 500);
      setTimeout(() => setShowDiagnostic(true), 1050);
    }, 1450);
  }

  // ── Free text: fuzzy-match against doubt texts, fallback otherwise ────────
  function handleFreeTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = freeText.trim().toLowerCase();
    if (!q) return;

    const match = doubts.find(
      (d) =>
        d.doubtText.en.toLowerCase().includes(q) ||
        d.doubtText.as.includes(q) ||
        q.split(" ").some((word) =>
          word.length > 4 && d.doubtText.en.toLowerCase().includes(word)
        )
    );
    if (match) {
      handleSelectDoubt(match);
    } else {
      setNoMatch(true);
    }
  }

  // ── Diagnostic submission ─────────────────────────────────────────────────
  function handleDiagSubmit() {
    if (!diagAnswer || !selectedDoubt) return;
    const correct = diagAnswer === selectedDoubt.diagnostic.correctOptionId;
    setDiagCorrect(correct);
    setDiagSubmitted(true);
    setTimeout(() => setShowPractice(true), 900);
  }

  // ── Practice submission ───────────────────────────────────────────────────
  function handlePracticeSubmit() {
    if (!practiceCurrentAnswer || !selectedDoubt) return;
    const question = selectedDoubt.practice[practiceIndex];
    const correct = practiceCurrentAnswer === question.correctOptionId;

    const newAnswers = [...practiceAnswers];
    newAnswers[practiceIndex] = { answer: practiceCurrentAnswer, correct };
    setPracticeAnswers(newAnswers);
    setPracticeSubmitted(true);

    if (practiceIndex === selectedDoubt.practice.length - 1) {
      // Last question — compute mastery after a short pause
      const capturedDiagCorrect = diagCorrect; // capture current closure value
      setTimeout(() => {
        computeAndShowMastery(newAnswers, capturedDiagCorrect);
      }, 900);
    }
  }

  function handleNextPractice() {
    setPracticeIndex((i) => i + 1);
    setPracticeCurrentAnswer(null);
    setPracticeSubmitted(false);
  }

  // ── Mastery delta engine (mirrors spec from PRD) ──────────────────────────
  function computeAndShowMastery(
    answers: Array<{ answer: string; correct: boolean } | null>,
    isDiagCorrect: boolean | null
  ) {
    let delta = 0;

    // Diagnostic contribution
    if (isDiagCorrect === true) {
      delta += 0.1;
    } else if (isDiagCorrect === false) {
      delta -= 0.08;
    }

    // Practice contributions
    for (const ans of answers) {
      if (!ans) continue;
      if (ans.correct) {
        delta += 0.1;
        if (!isDiagCorrect) delta += 0.04; // recovery bonus
      } else {
        delta -= 0.08;
      }
    }

    const newScore = Math.min(1, Math.max(0, initialMasteryScore + delta));
    setFinalScore(newScore);
    setShowMastery(true);
    onComplete?.(parseFloat(delta.toFixed(4)));
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const source = selectedDoubt ? getSourceById(selectedDoubt.sourceId) : null;
  const currentPracticeQ = selectedDoubt?.practice[practiceIndex] ?? null;

  const correctCount =
    (diagCorrect === true ? 1 : 0) +
    practiceAnswers.filter((a) => a?.correct).length;
  const totalCount = 1 + (selectedDoubt?.practice.length ?? 0);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background font-sans">
      <AnimatePresence mode="wait">

        {/* ══════════════════════════════════════════════════════════════════
            SELECT PHASE
        ══════════════════════════════════════════════════════════════════ */}
        {phase === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <Spotlight className="min-h-screen">
              <TopBar lang={lang} onLangChange={setLang} />

              <div className="max-w-2xl mx-auto px-5 py-12 pb-24">
                {/* Hero text */}
                <div className="mb-10 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400/90 text-[11px] font-semibold tracking-wide uppercase mb-5"
                  >
                    <Sparkles className="h-3 w-3" />
                    {lang === "en" ? "AI-powered doubt solving" : "AI-চালিত সন্দেহ সমাধান"}
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl font-bold tracking-tight mb-3"
                  >
                    {lang === "en" ? "What's your doubt?" : "আপোনাৰ সন্দেহ কি?"}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                    className="text-muted-foreground text-[15px]"
                  >
                    {lang === "en"
                      ? "Pick a question below or type your own"
                      : "তলত এটা প্ৰশ্ন বাছক বা নিজে লিখক"}
                  </motion.p>
                </div>

                {/* Doubt chips */}
                <div className="space-y-2.5 mb-8">
                  {doubts.map((doubt, i) => (
                    <motion.button
                      key={doubt.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 + i * 0.07, duration: 0.35 }}
                      onClick={() => handleSelectDoubt(doubt)}
                      className="group w-full text-left p-4 rounded-xl border border-border/50 bg-card/40
                                 hover:border-violet-500/40 hover:bg-violet-500/[0.04]
                                 active:scale-[0.99] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="mt-0.5 h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0
                                       group-hover:bg-violet-500/12 transition-colors duration-200">
                          <Brain className="h-3.5 w-3.5 text-muted-foreground group-hover:text-violet-400 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-snug text-foreground/90 group-hover:text-foreground transition-colors">
                            {tx(doubt.doubtText)}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {doubt.detectedConcept.subConcept}
                            {" · "}
                            <span className="capitalize">{doubt.detectedConcept.difficulty}</span>
                          </p>
                        </div>
                        <ChevronRight className="flex-shrink-0 h-4 w-4 text-muted-foreground/30 group-hover:text-violet-400 mt-0.5 transition-colors" />
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Free-text input */}
                <motion.form
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38 }}
                  onSubmit={handleFreeTextSubmit}
                  className="relative"
                >
                  <input
                    type="text"
                    value={freeText}
                    onChange={(e) => { setFreeText(e.target.value); setNoMatch(false); }}
                    placeholder={
                      lang === "en"
                        ? "Or type your question here…"
                        : "বা ইয়াত আপোনাৰ প্ৰশ্ন লিখক…"
                    }
                    className="w-full px-4 py-3 pr-24 rounded-xl border border-border/50 bg-card/40 text-sm
                               placeholder:text-muted-foreground/50
                               focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/40
                               transition-all duration-200"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-violet-600 hover:bg-violet-700 text-white h-7 text-xs px-3"
                  >
                    {lang === "en" ? "Ask" : "সোধক"}
                  </Button>
                </motion.form>

                {/* No-match fallback */}
                <AnimatePresence>
                  {noMatch && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-400 text-sm leading-relaxed"
                    >
                      {tx(noMatchFallback)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Spotlight>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            THINKING PHASE
        ══════════════════════════════════════════════════════════════════ */}
        {phase === "thinking" && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="min-h-screen flex flex-col items-center justify-center gap-5"
          >
            {/* Spinner */}
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-2 border-violet-500/15" />
              <div className="absolute inset-0 rounded-full border-2 border-t-violet-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border border-violet-500/10" />
              <Brain className="absolute inset-0 m-auto h-6 w-6 text-violet-400" />
            </div>

            <div className="text-center space-y-1.5">
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="font-semibold text-[15px]"
              >
                {lang === "en" ? "Analyzing your doubt…" : "আপোনাৰ সন্দেহ বিশ্লেষণ কৰা হৈছে…"}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-muted-foreground"
              >
                {lang === "en" ? "Finding the best explanation" : "সৰ্বোত্তম ব্যাখ্যা বিচাৰি আছে"}
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            RESULT PHASE  — progressive reveal of all panels
        ══════════════════════════════════════════════════════════════════ */}
        {phase === "result" && selectedDoubt && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <TopBar lang={lang} onLangChange={setLang} />

            <div className="max-w-2xl mx-auto px-5 py-8 space-y-5 pb-24">

              {/* ── Selected doubt header ──────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-muted/25 border border-border/30"
              >
                <Brain className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                    {lang === "en" ? "Your Doubt" : "আপোনাৰ সন্দেহ"}
                  </p>
                  <p className="text-sm font-medium leading-snug">{tx(selectedDoubt.doubtText)}</p>
                </div>
              </motion.div>

              {/* ── Concept Detected panel ─────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.08 }}
              >
                <Card className="border-border/40 bg-card/60">
                  <CardHeader className="pb-2.5 pt-4">
                    <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-violet-400" />
                      {lang === "en" ? "Concept Detected" : "ধাৰণা চিহ্নিত হ'ল"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex items-center gap-1.5 flex-wrap text-sm">
                      <span className="text-muted-foreground">
                        {selectedDoubt.detectedConcept.subject}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        {selectedDoubt.detectedConcept.concept}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 flex-shrink-0" />
                      <span className="font-semibold text-foreground">
                        {selectedDoubt.detectedConcept.subConcept}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 flex-shrink-0" />
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-medium capitalize px-2 py-0"
                      >
                        {selectedDoubt.detectedConcept.difficulty}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ── Explanation + Citation ─────────────────────────────── */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    key="explanation"
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="border-border/40 bg-card/60 overflow-hidden">
                      <CardHeader className="pb-2.5 pt-4">
                        <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                          <BookOpen className="h-3 w-3" />
                          {lang === "en" ? "Explanation" : "ব্যাখ্যা"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4 space-y-4">
                        {/* Explanation body */}
                        <p className="text-sm leading-[1.75] text-foreground/85">
                          {tx(selectedDoubt.explanation)}
                        </p>

                        {/* Citation block — monospace, visually distinct trust signal */}
                        {source && (
                          <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] overflow-hidden">
                            {/* Header strip */}
                            <div className="flex items-center gap-2 px-3.5 py-2 border-b border-emerald-500/12 bg-emerald-500/[0.04]">
                              <Library className="h-3 w-3 text-emerald-400" />
                              <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                                {lang === "en" ? "Verified Source" : "যাচাই কৰা উৎস"}
                              </span>
                            </div>
                            {/* Citation body */}
                            <div className="px-3.5 py-3 font-mono text-xs space-y-1.5">
                              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                <span className="font-semibold text-foreground/90 not-italic">
                                  {source.title}
                                </span>
                                <span className="text-muted-foreground/60">—</span>
                                <span className="text-muted-foreground/80">{source.chapter}</span>
                                <span className="text-muted-foreground/40">·</span>
                                <span className="text-muted-foreground/70">pp.&nbsp;{source.page}</span>
                              </div>
                              <p className="text-muted-foreground/55">{source.publisher}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Diagnostic MCQ ─────────────────────────────────────── */}
              <AnimatePresence>
                {showDiagnostic && (
                  <motion.div
                    key="diagnostic"
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="border-border/40 bg-card/60">
                      <CardHeader className="pb-2.5 pt-4">
                        <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                          <Brain className="h-3 w-3 text-violet-400" />
                          {lang === "en" ? "Check Your Understanding" : "আপোনাৰ বোধ পৰীক্ষা কৰক"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4 space-y-3.5">
                        <p className="text-sm font-medium leading-snug">
                          {tx(selectedDoubt.diagnostic.question)}
                        </p>

                        <div className="space-y-2">
                          {selectedDoubt.diagnostic.options.map((opt) => (
                            <McqOption
                              key={opt.id}
                              id={opt.id}
                              label={tx(opt.text)}
                              selected={diagAnswer === opt.id}
                              submitted={diagSubmitted}
                              isCorrect={opt.id === selectedDoubt.diagnostic.correctOptionId}
                              onClick={() => !diagSubmitted && setDiagAnswer(opt.id)}
                            />
                          ))}
                        </div>

                        {/* Feedback */}
                        <AnimatePresence>
                          {diagSubmitted && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.25 }}
                            >
                              {diagCorrect ? (
                                <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                                  <span className="font-semibold">
                                    {lang === "en" ? "✓ Correct!" : "✓ শুদ্ধ!"}
                                  </span>{" "}
                                  {lang === "en"
                                    ? "Great understanding of this concept."
                                    : "এই ধাৰণাটোৰ উত্তম বোধ।"}
                                </div>
                              ) : diagAnswer &&
                                selectedDoubt.diagnostic.misconceptions[diagAnswer] ? (
                                <div className="px-4 py-3 rounded-lg bg-amber-500/8 border border-amber-500/20 text-amber-300/90 text-sm leading-relaxed">
                                  {tx(selectedDoubt.diagnostic.misconceptions[diagAnswer])}
                                </div>
                              ) : (
                                <div className="px-4 py-3 rounded-lg bg-red-500/8 border border-red-500/20 text-red-300 text-sm">
                                  {lang === "en"
                                    ? `Incorrect. The right answer is option ${selectedDoubt.diagnostic.correctOptionId.toUpperCase()}.`
                                    : `ভুল। শুদ্ধ উত্তৰ হ'ল ${selectedDoubt.diagnostic.correctOptionId.toUpperCase()}।`}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {!diagSubmitted && (
                          <Button
                            onClick={handleDiagSubmit}
                            disabled={!diagAnswer}
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-35 h-9"
                          >
                            {lang === "en" ? "Submit Answer" : "উত্তৰ দিয়ক"}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Practice Questions ─────────────────────────────────── */}
              <AnimatePresence>
                {showPractice && selectedDoubt && currentPracticeQ && (
                  <motion.div
                    key="practice"
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="border-border/40 bg-card/60">
                      <CardHeader className="pb-2.5 pt-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {lang === "en" ? "Practice" : "অনুশীলন"}
                          </CardTitle>
                          {/* Step dots */}
                          <div className="flex items-center gap-1.5">
                            {selectedDoubt.practice.map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "rounded-full transition-all duration-300",
                                  i < practiceIndex
                                    ? "h-2 w-2 bg-emerald-400"
                                    : i === practiceIndex
                                    ? "h-2.5 w-2.5 bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                                    : "h-2 w-2 bg-muted/70"
                                )}
                              />
                            ))}
                            <span className="text-[11px] text-muted-foreground ml-1">
                              {practiceIndex + 1}/{selectedDoubt.practice.length}
                            </span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pb-4">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={practiceIndex}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ duration: 0.22 }}
                            className="space-y-3.5"
                          >
                            <p className="text-sm font-medium leading-snug">
                              {tx(currentPracticeQ.question)}
                            </p>

                            <div className="space-y-2">
                              {currentPracticeQ.options.map((opt) => (
                                <McqOption
                                  key={opt.id}
                                  id={opt.id}
                                  label={tx(opt.text)}
                                  selected={practiceCurrentAnswer === opt.id}
                                  submitted={practiceSubmitted}
                                  isCorrect={opt.id === currentPracticeQ.correctOptionId}
                                  onClick={() =>
                                    !practiceSubmitted && setPracticeCurrentAnswer(opt.id)
                                  }
                                />
                              ))}
                            </div>

                            {/* Practice feedback */}
                            <AnimatePresence>
                              {practiceSubmitted && (
                                <motion.div
                                  initial={{ opacity: 0, y: -6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                >
                                  {practiceAnswers[practiceIndex]?.correct ? (
                                    <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold">
                                      ✓ {lang === "en" ? "Correct!" : "শুদ্ধ!"}
                                    </div>
                                  ) : (
                                    <div className="px-4 py-3 rounded-lg bg-red-500/8 border border-red-500/20 text-red-300 text-sm">
                                      {lang === "en"
                                        ? `Incorrect. Correct answer: ${currentPracticeQ.correctOptionId.toUpperCase()}`
                                        : `ভুল। শুদ্ধ উত্তৰ: ${currentPracticeQ.correctOptionId.toUpperCase()}`}
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Action buttons */}
                            {!practiceSubmitted ? (
                              <Button
                                onClick={handlePracticeSubmit}
                                disabled={!practiceCurrentAnswer}
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-35 h-9"
                              >
                                {lang === "en" ? "Submit Answer" : "উত্তৰ দিয়ক"}
                              </Button>
                            ) : practiceIndex < selectedDoubt.practice.length - 1 ? (
                              <Button
                                onClick={handleNextPractice}
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white h-9"
                              >
                                {lang === "en" ? "Next Question →" : "পৰৱৰ্তী প্ৰশ্ন →"}
                              </Button>
                            ) : null}
                          </motion.div>
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Mastery Summary ────────────────────────────────────── */}
              <AnimatePresence>
                {showMastery && (
                  <motion.div
                    key="mastery"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                  >
                    <Card className="border-violet-500/25 bg-card/60 overflow-hidden">
                      {/* Top accent line */}
                      <div className="h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

                      <CardHeader className="pb-2.5 pt-4">
                        <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 text-violet-400" />
                          {lang === "en" ? "Session Complete" : "সেশন সম্পূৰ্ণ হ'ল"}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="pb-5 space-y-5">
                        {/* Score pill */}
                        <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-muted/25 border border-border/30">
                          <div className="text-center min-w-[3rem]">
                            <div className="text-2xl font-bold tabular-nums">
                              {correctCount}/{totalCount}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                              {lang === "en" ? "correct" : "শুদ্ধ"}
                            </div>
                          </div>
                          <div className="h-8 w-px bg-border/40" />
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {lang === "en"
                              ? `${correctCount} of ${totalCount} questions answered correctly.`
                              : `${totalCount}টাৰ মাজৰ ${correctCount}টা প্ৰশ্নৰ শুদ্ধ উত্তৰ দিছে।`}
                          </p>
                        </div>

                        {/* Mastery bar (animated counter + progress bar) */}
                        <MasteryBar
                          fromScore={initialMasteryScore}
                          toScore={finalScore}
                        />

                        {/* Divider */}
                        <div className="h-px bg-border/30" />

                        {/* Guest CTA or student message */}
                        {mode === "guest" ? (
                          <div className="flex items-center gap-4 flex-wrap">
                            <p className="flex-1 text-sm text-muted-foreground min-w-[160px]">
                              {lang === "en"
                                ? "Log in to save your progress and track mastery over time."
                                : "আপোনাৰ অগ্ৰগতি সংৰক্ষণ কৰিবলৈ আৰু দক্ষতা অনুসৰণ কৰিবলৈ লগ ইন কৰক।"}
                            </p>
                            <Link
                              href="/login"
                              className="flex-shrink-0 inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
                            >
                              <LogIn className="h-3.5 w-3.5" />
                              {lang === "en" ? "Save progress — Log in" : "অগ্ৰগতি সংৰক্ষণ কৰক"}
                            </Link>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {lang === "en"
                              ? "Your mastery score has been updated."
                              : "আপোনাৰ দক্ষতা স্ক'ৰ আপডেট কৰা হৈছে।"}
                          </p>
                        )}

                        {/* Try another doubt */}
                        <Button
                          variant="ghost"
                          onClick={resetAll}
                          className="w-full gap-2 text-muted-foreground hover:text-foreground border border-border/40 h-9"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          {lang === "en" ? "Ask another question" : "আন এটা প্ৰশ্ন সোধক"}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
