"use client";

import { useState } from "react";
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
  Loader2,
  SendHorizontal,
  User,
  Upload,
  Clipboard,
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
// MASTERY BAR  (clean static progress indicator)
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
            {toPct}
            <span className="text-xl">%</span>
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${toPct}%`,
            backgroundColor: tier?.color ?? "#4d9de0",
          }}
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
// LANGUAGE TOGGLE
// ─────────────────────────────────────────────────────────────────────────────

function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-0.5 p-1 rounded-lg bg-muted border border-border">
      {(["en", "as"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={cn(
            "px-3 py-1 rounded-md text-xs font-medium transition-colors",
            lang === l
              ? "bg-background text-foreground shadow-xs"
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
// TOP BAR
// ─────────────────────────────────────────────────────────────────────────────

function TopBar({ lang, onLangChange }: { lang: Lang; onLangChange: (l: Lang) => void }) {
  return (
    <div className="border-b border-border bg-background sticky top-0 z-20 w-full">
      <div className="w-full px-6 py-3 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span>ShikshaSetu AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <LangToggle lang={lang} onChange={onLangChange} />
          <Link
            href="/student/profile"
            aria-label="Profile"
            className="h-8 w-8 rounded-full border border-border bg-muted flex items-center justify-center text-foreground hover:bg-primary/20 hover:border-primary transition-colors"
          >
            <User className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MCQ OPTION
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
        "w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors focus-visible:outline-none",
        !submitted && selected && "border-primary bg-primary/10 text-foreground font-medium",
        !submitted && !selected && "border-border bg-card hover:bg-muted/50 text-foreground/90",
        submitted && isCorrect && "border-emerald-500 bg-emerald-500/10 text-emerald-800 font-medium",
        submitted && selected && !isCorrect && "border-red-500 bg-red-500/10 text-red-800 font-medium",
        submitted && !selected && !isCorrect && "border-border/40 bg-transparent opacity-40 cursor-default"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex-shrink-0 h-5 w-5 rounded-full border text-[10px] font-bold flex items-center justify-center",
            !submitted && selected
              ? "border-primary text-primary"
              : "border-border text-muted-foreground",
            submitted && isCorrect ? "border-emerald-500 text-emerald-500" : "",
            submitted && selected && !isCorrect ? "border-red-500 text-red-500" : ""
          )}
        >
          {id.toUpperCase()}
        </span>
        <span className="flex-1">{label}</span>
        {submitted && isCorrect && (
          <CheckCircle2 className="flex-shrink-0 h-4 w-4 text-emerald-500" />
        )}
        {submitted && selected && !isCorrect && (
          <XCircle className="flex-shrink-0 h-4 w-4 text-red-500" />
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
      setShowExplanation(true);
      setShowDiagnostic(true);
    }, 600);
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
    setShowPractice(true);
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
      const capturedDiagCorrect = diagCorrect;
      computeAndShowMastery(newAnswers, capturedDiagCorrect);
    }
  }

  function handleNextPractice() {
    setPracticeIndex((i) => i + 1);
    setPracticeCurrentAnswer(null);
    setPracticeSubmitted(false);
  }

  // ── Mastery delta engine ──────────────────────────────────────────────────
  function computeAndShowMastery(
    answers: Array<{ answer: string; correct: boolean } | null>,
    isDiagCorrect: boolean | null
  ) {
    let delta = 0;

    if (isDiagCorrect === true) {
      delta += 0.1;
    } else if (isDiagCorrect === false) {
      delta -= 0.08;
    }

    for (const ans of answers) {
      if (!ans) continue;
      if (ans.correct) {
        delta += 0.1;
        if (!isDiagCorrect) delta += 0.04;
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
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* SELECT PHASE */}
      {phase === "select" && (
        <div className="min-h-screen flex flex-col">
          <TopBar lang={lang} onLangChange={setLang} />

          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full mx-auto px-5 -mt-12 pb-16">
            {/* Hero text */}
            <div className="mb-8 text-center w-full">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                {lang === "en" ? "AI-powered doubt solving" : "AI-চালিত সন্দেহ সমাধান"}
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-3">
                {lang === "en" ? "What's your doubt?" : "আপোনাৰ সন্দেহ কি?"}
              </h1>
              <p className="text-muted-foreground text-base">
                {lang === "en"
                  ? "Type your question below to get instant AI help"
                  : "তাতক্ষণিক AI সহায়ৰ বাবে তলত আপোনাৰ প্ৰশ্ন লিখক"}
              </p>
            </div>

            {/* Quick Actions (Upload & Link) */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-xl mb-5">
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*,.pdf,.doc,.docx,.mp3,.mp4";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      setFreeText(`[Uploaded: ${file.name}]`);
                    }
                  };
                  input.click();
                }}
                className="p-4 rounded-2xl border border-border bg-card hover:border-primary hover:bg-muted/40 transition-all text-left flex flex-col justify-between cursor-pointer group shadow-xs"
              >
                <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Upload className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="mt-4">
                  <p className="font-semibold text-sm text-foreground">
                    {lang === "en" ? "Upload" : "আপলোড"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === "en" ? "File, audio, video" : "ফাইল, অডিঅ', ভিডিঅ'"}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                      setFreeText(text);
                    }
                  } catch {
                    const pasted = prompt(
                      lang === "en" ? "Paste text here:" : "ইয়াত পাঠ পেষ্ট কৰক:"
                    );
                    if (pasted) {
                      setFreeText(pasted);
                    }
                  }
                }}
                className="p-4 rounded-2xl border border-border bg-card hover:border-primary hover:bg-muted/40 transition-all text-left flex flex-col justify-between cursor-pointer group shadow-xs"
              >
                <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Clipboard className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="mt-4">
                  <p className="font-semibold text-sm text-foreground">
                    {lang === "en" ? "Paste" : "পেষ্ট"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === "en" ? "Copied Text" : "কপি কৰা পাঠ"}
                  </p>
                </div>
              </button>
            </div>

            {/* Free-text input */}
            <form onSubmit={handleFreeTextSubmit} className="relative w-full max-w-xl">
              <input
                type="text"
                value={freeText}
                onChange={(e) => { setFreeText(e.target.value); setNoMatch(false); }}
                placeholder={
                  lang === "en"
                    ? "Type your question here…"
                    : "ইয়াত আপোনাৰ প্ৰশ্ন লিখক…"
                }
                className="w-full px-5 py-3.5 pr-14 rounded-xl border border-input bg-card text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-xs"
              />
              <Button
                type="submit"
                size="sm"
                aria-label={lang === "en" ? "Ask question" : "প্ৰশ্ন সোধক"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8.5 w-10 px-0 justify-center flex items-center"
              >
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </form>

            {/* No-match fallback */}
            {noMatch && (
              <div className="mt-4 w-full max-w-xl px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 font-medium text-sm leading-relaxed text-center">
                {tx(noMatchFallback)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* THINKING PHASE */}
      {phase === "thinking" && (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center space-y-1">
            <p className="font-semibold text-base">
              {lang === "en" ? "Analyzing your doubt…" : "আপোনাৰ সন্দেহ বিশ্লেষণ কৰা হৈছে…"}
            </p>
            <p className="text-sm text-muted-foreground">
              {lang === "en" ? "Finding the best explanation" : "সৰ্বোত্তম ব্যাখ্যা বিচাৰি আছে"}
            </p>
          </div>
        </div>
      )}

      {/* RESULT PHASE */}
      {phase === "result" && selectedDoubt && (
        <div className="min-h-screen">
          <TopBar lang={lang} onLangChange={setLang} />

          <div className="max-w-2xl mx-auto px-5 py-8 space-y-5 pb-24">
            {/* Selected doubt header */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-muted/40 border border-border">
              <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                  {lang === "en" ? "Your Doubt" : "আপোনাৰ সন্দেহ"}
                </p>
                <p className="text-sm font-medium leading-snug">{tx(selectedDoubt.doubtText)}</p>
              </div>
            </div>

            {/* Concept Detected panel */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                  {lang === "en" ? "Concept Detected" : "ধাৰণা চিহ্নিত হ'ল"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-1.5 flex-wrap text-sm">
                  <span className="text-muted-foreground">
                    {selectedDoubt.detectedConcept.subject}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {selectedDoubt.detectedConcept.concept}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                  <span className="font-semibold text-foreground">
                    {selectedDoubt.detectedConcept.subConcept}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                  <Badge variant="outline" className="text-[10px] font-medium capitalize px-2 py-0">
                    {selectedDoubt.detectedConcept.difficulty}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Explanation + Citation */}
            {showExplanation && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3" />
                    {lang === "en" ? "Explanation" : "ব্যাখ্যা"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4 space-y-4">
                  <p className="text-sm leading-relaxed text-foreground">
                    {tx(selectedDoubt.explanation)}
                  </p>

                  {source && (
                    <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
                      <div className="flex items-center gap-2 px-3.5 py-2 border-b border-border bg-muted/50">
                        <Library className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          {lang === "en" ? "Verified Source" : "যাচাই কৰা উৎস"}
                        </span>
                      </div>
                      <div className="px-3.5 py-3 font-mono text-xs space-y-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="font-semibold text-foreground not-italic">
                            {source.title}
                          </span>
                          <span className="text-muted-foreground">—</span>
                          <span className="text-muted-foreground">{source.chapter}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">pp.&nbsp;{source.page}</span>
                        </div>
                        <p className="text-muted-foreground/80">{source.publisher}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Diagnostic MCQ */}
            {showDiagnostic && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Brain className="h-3 w-3 text-primary" />
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

                  {diagSubmitted && (
                    <div>
                      {diagCorrect ? (
                        <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
                          <span className="font-semibold">
                            {lang === "en" ? "✓ Correct!" : "✓ শুদ্ধ!"}
                          </span>{" "}
                          {lang === "en"
                            ? "Great understanding of this concept."
                            : "এই ধাৰণাটোৰ উত্তম বোধ।"}
                        </div>
                      ) : diagAnswer &&
                        selectedDoubt.diagnostic.misconceptions[diagAnswer] ? (
                        <div className="px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
                          {tx(selectedDoubt.diagnostic.misconceptions[diagAnswer])}
                        </div>
                      ) : (
                        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                          {lang === "en"
                            ? `Incorrect. The right answer is option ${selectedDoubt.diagnostic.correctOptionId.toUpperCase()}.`
                            : `ভুল। শুদ্ধ উত্তৰ হ'ল ${selectedDoubt.diagnostic.correctOptionId.toUpperCase()}।`}
                        </div>
                      )}
                    </div>
                  )}

                  {!diagSubmitted && (
                    <Button
                      onClick={handleDiagSubmit}
                      disabled={!diagAnswer}
                      className="w-full disabled:opacity-50 h-9"
                    >
                      {lang === "en" ? "Submit Answer" : "উত্তৰ দিয়ক"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Practice Questions */}
            {showPractice && selectedDoubt && currentPracticeQ && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-2 pt-4">
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
                            "h-2 w-2 rounded-full",
                            i < practiceIndex
                              ? "bg-emerald-500"
                              : i === practiceIndex
                                ? "bg-primary"
                                : "bg-muted"
                          )}
                        />
                      ))}
                      <span className="text-[11px] text-muted-foreground ml-1">
                        {practiceIndex + 1}/{selectedDoubt.practice.length}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-4 space-y-3.5">
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

                  {practiceSubmitted && (
                    <div>
                      {practiceAnswers[practiceIndex]?.correct ? (
                        <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                          ✓ {lang === "en" ? "Correct!" : "শুদ্ধ!"}
                        </div>
                      ) : (
                        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                          {lang === "en"
                            ? `Incorrect. Correct answer: ${currentPracticeQ.correctOptionId.toUpperCase()}`
                            : `ভুল। শুদ্ধ উত্তৰ: ${currentPracticeQ.correctOptionId.toUpperCase()}`}
                        </div>
                      )}
                    </div>
                  )}

                  {!practiceSubmitted ? (
                    <Button
                      onClick={handlePracticeSubmit}
                      disabled={!practiceCurrentAnswer}
                      className="w-full disabled:opacity-50 h-9"
                    >
                      {lang === "en" ? "Submit Answer" : "উত্তৰ দিয়ক"}
                    </Button>
                  ) : practiceIndex < selectedDoubt.practice.length - 1 ? (
                    <Button
                      onClick={handleNextPractice}
                      className="w-full h-9"
                    >
                      {lang === "en" ? "Next Question →" : "পৰৱৰ্তী প্ৰশ্ন →"}
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {/* Mastery Summary */}
            {showMastery && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-primary" />
                    {lang === "en" ? "Session Complete" : "সেশন সম্পূৰ্ণ হ'ল"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pb-5 space-y-5">
                  <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-muted/40 border border-border">
                    <div className="text-center min-w-[3rem]">
                      <div className="text-2xl font-bold tabular-nums">
                        {correctCount}/{totalCount}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        {lang === "en" ? "correct" : "শুদ্ধ"}
                      </div>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {lang === "en"
                        ? `${correctCount} of ${totalCount} questions answered correctly.`
                        : `${totalCount}টাৰ মাজৰ ${correctCount}টা প্ৰশ্নৰ শুদ্ধ উত্তৰ দিছে।`}
                    </p>
                  </div>

                  <MasteryBar
                    fromScore={initialMasteryScore}
                    toScore={finalScore}
                  />

                  <div className="h-px bg-border" />

                  {mode === "guest" ? (
                    <div className="flex items-center gap-4 flex-wrap">
                      <p className="flex-1 text-sm text-muted-foreground min-w-[160px]">
                        {lang === "en"
                          ? "Log in to save your progress and track mastery over time."
                          : "আপোনাৰ অগ্ৰগতি সংৰক্ষণ কৰিবলৈ আৰু দক্ষতা অনুসৰণ কৰিবলৈ লগ ইন কৰক।"}
                      </p>
                      <Link
                        href="/login"
                        className="flex-shrink-0 inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
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

                  <Button
                    variant="outline"
                    onClick={resetAll}
                    className="w-full gap-2 h-9"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {lang === "en" ? "Ask another question" : "আন এটা প্ৰশ্ন সোধক"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
