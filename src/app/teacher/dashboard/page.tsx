"use client";

import Link from "next/link";
import {
  getTeacherInsights,
  getClassConceptMastery,
  getAtRiskStudents,
  getOnTrackHighlight,
  getClassInfo,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  School,
  AlertTriangle,
  Users,
  TrendingUp,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  FileText,
  Brain,
  Zap,
} from "lucide-react";

export default function TeacherDashboardPage() {
  const insights = getTeacherInsights();
  const classInfo = getClassInfo();
  const conceptMastery = getClassConceptMastery();
  const atRisk = getAtRiskStudents();
  const onTrack = getOnTrackHighlight();

  // Compute class overall average
  const totalAvg =
    conceptMastery.reduce((acc, curr) => acc + curr.averageScore, 0) /
    (conceptMastery.length || 1);
  const classAvgPct = Math.round(totalAvg * 100);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-8 pb-20">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
            <School className="h-3.5 w-3.5 text-primary" />
            <span>{classInfo.className}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Teacher Misconception & Diagnostic Hub
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            AI-driven misconception pattern analysis & recommended targeted interventions for Class 8 Science.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 px-4 text-xs font-semibold gap-2">
            <FileText className="h-4 w-4" />
            <span>Export Insights Report</span>
          </Button>
          <Button className="h-10 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs flex items-center gap-2 shadow-xs">
            <Sparkles className="h-4 w-4" />
            <span>Generate Quiz</span>
          </Button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Class Average */}
        <Card className="border-border bg-card">
          <CardContent className="pt-5 pb-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Class Average Mastery
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold tabular-nums">{classAvgPct}%</span>
                <Badge variant="outline" className="text-[10px] border-primary text-primary px-1.5 py-0 font-semibold">
                  Developing
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stat 2: At-Risk Alerts */}
        <Card className="border-border bg-card">
          <CardContent className="pt-5 pb-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                At-Risk Students
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
                  {atRisk.length}
                </span>
                <span className="text-xs text-muted-foreground">Require intervention</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stat 3: Top Performer Highlight */}
        <Card className="border-border bg-card">
          <CardContent className="pt-5 pb-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                On-Track Highlight
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-lg font-bold truncate">{onTrack.studentName}</span>
                <span className="text-xs text-emerald-600 font-semibold">88%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stat 4: Misconceptions Detected */}
        <Card className="border-border bg-card">
          <CardContent className="pt-5 pb-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center flex-shrink-0">
              <Brain className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Misconceptions
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold tabular-nums">1 Key</span>
                <span className="text-xs text-muted-foreground">Open Circuit Pattern</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: At-Risk Interventions & Class Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* At-Risk Students & Targeted Interventions (2 Cols) */}
        <div id="at-risk" className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>At-Risk Students & AI Recommended Interventions</span>
            </h2>
            <span className="text-xs text-muted-foreground">
              Updated from latest student diagnostic attempts
            </span>
          </div>

          <div className="space-y-4">
            {atRisk.map((student) => (
              <Card key={student.studentId} className="border-border bg-card overflow-hidden">
                <CardHeader className="pb-3 pt-5 border-b border-border bg-muted/20">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-base text-foreground">
                        {student.studentName}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          student.riskLevel === "high"
                            ? "border-red-500 text-red-600 bg-red-500/10 font-bold uppercase text-[10px]"
                            : "border-amber-500 text-amber-700 bg-amber-500/10 font-bold uppercase text-[10px]"
                        }
                      >
                        {student.riskLevel} Risk
                      </Badge>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      Pattern: {student.misconceptionPattern}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  {/* Identified Misconception / Reason */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Brain className="h-3.5 w-3.5 text-secondary" />
                      <span>Identified Learning Gap / Misconception</span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground bg-muted/30 p-3.5 rounded-xl border border-border">
                      {student.reason.en}
                    </p>
                  </div>

                  {/* Recommended Action / Intervention */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                      <Lightbulb className="h-3.5 w-3.5 text-primary" />
                      <span>Recommended Classroom Intervention</span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/10 text-sm text-foreground leading-relaxed">
                      {student.recommendedIntervention.en}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="text-xs gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-secondary" />
                      <span>Assign Practice Remediation</span>
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Student ID: {student.studentId}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Class Concept Analytics & Peer Tutoring (1 Col) */}
        <div id="class-mastery" className="space-y-6">
          {/* Concept Mastery Overview */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Class Concept Mastery</span>
            </h2>

            <Card className="border-border bg-card">
              <CardContent className="p-5 space-y-4">
                {conceptMastery.map((concept) => {
                  const pct = Math.round(concept.averageScore * 100);
                  const isLow = pct < 50;

                  return (
                    <div key={concept.conceptId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-foreground">{concept.conceptName}</span>
                        <span
                          className={
                            isLow ? "text-red-600 font-bold tabular-nums" : "text-foreground font-bold tabular-nums"
                          }
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: isLow ? "#e35d5d" : "#3EC1D3",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* On-Track Peer Tutoring Highlight */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>Peer-Tutoring Recommendation</span>
            </h2>

            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">
                    {onTrack.studentName}
                  </span>
                  <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400 text-[10px]">
                    Top Performer (88%)
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {onTrack.note.en}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
