"use client";

import Link from "next/link";
import {
  getCurrentStudent,
  getMasteryTier,
  getAllDoubts,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Sparkles,
  SendHorizontal,
  TrendingUp,
  Award,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function StudentDashboardPage() {
  const student = getCurrentStudent();
  const allDoubts = getAllDoubts();

  if (!student) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Student profile not found.
      </div>
    );
  }

  // Compute average score
  const totalScore = student.mastery.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = totalScore / (student.mastery.length || 1);
  const overallTier = getMasteryTier(avgScore);
  const avgPct = Math.round(avgScore * 100);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-8 pb-20">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Class {student.grade} Science</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {student.name}!
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            You are currently at{" "}
            <span className="font-semibold text-foreground">{avgPct}% Mastery</span>.
            Solve more doubts and complete practice checks to reach the Mastered tier!
          </p>
        </div>

        <Link href="/ask">
          <Button className="h-11 px-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm flex items-center gap-2.5 shadow-xs">
            <SendHorizontal className="h-4 w-4" />
            <span>Ask a New Doubt</span>
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Overall Mastery */}
        <Card className="border-border bg-card">
          <CardContent className="pt-5 pb-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Overall Mastery
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold tabular-nums">{avgPct}%</span>
                {overallTier && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0 font-semibold capitalize"
                    style={{ borderColor: overallTier.color, color: overallTier.color }}
                  >
                    {overallTier.label}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stat 2: Doubts Solved */}
        <Card className="border-border bg-card">
          <CardContent className="pt-5 pb-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center flex-shrink-0">
              <Brain className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Doubts Solved
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold tabular-nums">12</span>
                <span className="text-xs text-muted-foreground">+3 this week</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stat 3: Practice Accuracy */}
        <Card className="border-border bg-card">
          <CardContent className="pt-5 pb-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Accuracy Rate
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold tabular-nums">78%</span>
                <span className="text-xs text-muted-foreground">MCQ practice</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stat 4: Learning Streak */}
        <Card className="border-border bg-card">
          <CardContent className="pt-5 pb-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Learning Streak
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold tabular-nums">5 Days</span>
                <span className="text-xs text-muted-foreground">Active streak</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Concept Mastery & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Concept Mastery Breakdown (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span>Concept Mastery Breakdown</span>
            </h2>
            <Link
              href="/student/progress"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <span>View Full Analytics</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Card className="border-border bg-card">
            <CardContent className="p-6 space-y-6">
              {student.mastery.map((item) => {
                const tier = getMasteryTier(item.score);
                const scorePct = Math.round(item.score * 100);

                return (
                  <div key={item.conceptId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {item.conceptName}
                        </span>
                        {tier && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-2 py-0 font-medium"
                            style={{
                              borderColor: tier.color,
                              color: tier.color,
                            }}
                          >
                            {tier.label}
                          </Badge>
                        )}
                      </div>
                      <span
                        className="font-bold tabular-nums"
                        style={{ color: tier?.color ?? "#000000" }}
                      >
                        {scorePct}%
                      </span>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${scorePct}%`,
                          backgroundColor: tier?.color ?? "#3EC1D3",
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
                      <span>{item.attempts} Practice Attempts</span>
                      <span>Last active: {new Date(item.lastAttempt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Recent Doubts & Quick Practice (1 Col) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-secondary" />
            <span>Recent Doubts</span>
          </h2>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3 pt-5">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Resolved Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-5 space-y-3">
              {allDoubts.slice(0, 3).map((doubt) => (
                <Link
                  key={doubt.id}
                  href="/ask"
                  className="block p-3.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/70 transition-colors"
                >
                  <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug mb-1.5">
                    {doubt.doubtText.en}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-primary">
                      {doubt.detectedConcept.subConcept}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                      {doubt.detectedConcept.difficulty}
                    </Badge>
                  </div>
                </Link>
              ))}

              <Link href="/ask" className="block pt-2">
                <Button variant="outline" className="w-full h-9 text-xs font-semibold gap-1.5">
                  <SendHorizontal className="h-3.5 w-3.5" />
                  <span>Ask Another Question</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
