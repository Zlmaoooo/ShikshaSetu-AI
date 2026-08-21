/**
 * Mock Data Access Layer — ShikshaSetu AI
 *
 * This is the ONLY file that imports raw JSON. All components must use the
 * getter functions exported here. Direct JSON imports elsewhere are not allowed.
 *
 * "_readme" fields present in some JSON files are documentation annotations
 * and are intentionally excluded from all TypeScript interfaces and exports.
 */

import conceptsRaw from "./concepts.json";
import sourcesRaw from "./sources.json";
import doubtsRaw from "./doubts.json";
import studentsRaw from "./students.json";
import teacherInsightsRaw from "./teacher-insights.json";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

/** Bilingual text field used across all files for user-facing content. */
export interface BilingualText {
  en: string;
  as: string;
}

/** Supported difficulty levels for concepts and practice questions. */
export type Difficulty = "beginner" | "intermediate" | "advanced";

// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT TYPES  (concepts.json)
// ─────────────────────────────────────────────────────────────────────────────

export interface Concept {
  id: string;
  subject: string;
  name: string;
  chapter: string;
  grade: number;
  difficulty: Difficulty;
  /** Present only for sub-concepts; points to the parent concept id. */
  parentConceptId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE TYPES  (sources.json)
// ─────────────────────────────────────────────────────────────────────────────

export interface Source {
  id: string;
  title: string;
  chapter: string;
  page: string;
  publisher: string;
  url: string;
  language: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOUBT TYPES  (doubts.json)
// ─────────────────────────────────────────────────────────────────────────────

export interface DiagnosticOption {
  id: string;
  text: BilingualText;
}

export interface DiagnosticMisconceptions {
  [optionId: string]: BilingualText;
}

export interface Diagnostic {
  question: BilingualText;
  options: DiagnosticOption[];
  correctOptionId: string;
  misconceptions: DiagnosticMisconceptions;
}

export interface PracticeQuestion {
  question: BilingualText;
  options: DiagnosticOption[];
  correctOptionId: string;
  difficulty: Difficulty;
}

export interface DetectedConcept {
  subject: string;
  concept: string;
  subConcept: string;
  difficulty: string;
}

export interface Doubt {
  id: string;
  doubtText: BilingualText;
  conceptId: string;
  detectedConcept: DetectedConcept;
  sourceId: string;
  explanation: BilingualText;
  diagnostic: Diagnostic;
  practice: PracticeQuestion[];
}

export interface DoubtsData {
  noMatchFallback: BilingualText;
  doubts: Doubt[];
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT TYPES  (students.json)
// ─────────────────────────────────────────────────────────────────────────────

export interface MasteryRecord {
  conceptId: string;
  conceptName: string;
  score: number;
  attempts: number;
  lastAttempt: string;
  history: number[];
}

export interface RecentDoubt {
  doubtId: string;
  askedAt: string;
}

export interface Student {
  id: string;
  name: string;
  grade: number;
  preferredLanguage: "en" | "as";
  mastery: MasteryRecord[];
  recentDoubts: RecentDoubt[];
}

export interface MasteryTier {
  min: number;
  max: number;
  label: string;
  color: string;
}

export interface StudentsData {
  currentStudentId: string;
  students: Student[];
  masteryTiers: MasteryTier[];
}

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER INSIGHT TYPES  (teacher-insights.json)
// ─────────────────────────────────────────────────────────────────────────────

export type RiskLevel = "high" | "medium" | "low";

export interface ClassConceptMastery {
  conceptId: string;
  conceptName: string;
  averageScore: number;
}

export interface AtRiskStudent {
  studentId: string;
  studentName: string;
  riskLevel: RiskLevel;
  reason: BilingualText;
  misconceptionPattern: string;
  recommendedIntervention: BilingualText;
}

export interface OnTrackHighlight {
  studentId: string;
  studentName: string;
  note: BilingualText;
}

export interface TeacherInsight {
  classId: string;
  className: string;
  classConceptMastery: ClassConceptMastery[];
  atRiskStudents: AtRiskStudent[];
  onTrackHighlight: OnTrackHighlight;
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPED DATA — cast raw JSON imports to their respective interfaces
// ─────────────────────────────────────────────────────────────────────────────

const concepts = conceptsRaw as Concept[];
const sources = sourcesRaw as Source[];

// Strip the "_readme" key from doubts before exposing
const { _readme: _doubtsReadme, ...doubtsClean } = doubtsRaw as DoubtsData & {
  _readme?: string;
};
const doubtsData: DoubtsData = doubtsClean;

const { _readme: _studentsReadme, ...studentsClean } = studentsRaw as StudentsData & {
  _readme?: string;
};
const studentsData: StudentsData = studentsClean;

const { _readme: _teacherReadme, ...teacherInsightsClean } =
  teacherInsightsRaw as TeacherInsight & { _readme?: string };
const teacherInsights: TeacherInsight = teacherInsightsClean;

// ─────────────────────────────────────────────────────────────────────────────
// GETTER FUNCTIONS — concepts
// ─────────────────────────────────────────────────────────────────────────────

/** Returns all concepts. */
export function getConcepts(): Concept[] {
  return concepts;
}

/** Returns a single concept by id, or undefined if not found. */
export function getConceptById(id: string): Concept | undefined {
  return concepts.find((c) => c.id === id);
}

/** Returns all concepts belonging to a given chapter. */
export function getConceptsByChapter(chapter: string): Concept[] {
  return concepts.filter((c) => c.chapter === chapter);
}

/** Returns all top-level concepts (those without a parentConceptId). */
export function getRootConcepts(): Concept[] {
  return concepts.filter((c) => !c.parentConceptId);
}

/** Returns all sub-concepts for a given parent concept id. */
export function getSubConcepts(parentId: string): Concept[] {
  return concepts.filter((c) => c.parentConceptId === parentId);
}

// ─────────────────────────────────────────────────────────────────────────────
// GETTER FUNCTIONS — sources
// ─────────────────────────────────────────────────────────────────────────────

/** Returns all sources. */
export function getSources(): Source[] {
  return sources;
}

/** Returns a single source by id, or undefined if not found. */
export function getSourceById(id: string): Source | undefined {
  return sources.find((s) => s.id === id);
}

// ─────────────────────────────────────────────────────────────────────────────
// GETTER FUNCTIONS — doubts
// ─────────────────────────────────────────────────────────────────────────────

/** Returns all doubts. */
export function getAllDoubts(): Doubt[] {
  return doubtsData.doubts;
}

/** Returns a single doubt by id, or undefined if not found. */
export function getDoubtById(id: string): Doubt | undefined {
  return doubtsData.doubts.find((d) => d.id === id);
}

/** Returns all doubts associated with a given concept id. */
export function getDoubtsByConceptId(conceptId: string): Doubt[] {
  return doubtsData.doubts.filter((d) => d.conceptId === conceptId);
}

/**
 * The bilingual fallback message to show when a user's typed question
 * does not match any pre-written doubt in the mock dataset.
 */
export function getNoMatchFallback(): BilingualText {
  return doubtsData.noMatchFallback;
}

// ─────────────────────────────────────────────────────────────────────────────
// GETTER FUNCTIONS — students
// ─────────────────────────────────────────────────────────────────────────────

/** Returns all students. */
export function getAllStudents(): Student[] {
  return studentsData.students;
}

/** Returns a single student by id, or undefined if not found. */
export function getStudentById(id: string): Student | undefined {
  return studentsData.students.find((s) => s.id === id);
}

/**
 * Returns the currently "logged-in" mock student.
 * Swap currentStudentId in students.json to change the active session.
 */
export function getCurrentStudent(): Student | undefined {
  return studentsData.students.find(
    (s) => s.id === studentsData.currentStudentId
  );
}

/** Returns the id of the currently "logged-in" mock student. */
export function getCurrentStudentId(): string {
  return studentsData.currentStudentId;
}

/** Returns all mastery tiers for classifying a student's score. */
export function getMasteryTiers(): MasteryTier[] {
  return studentsData.masteryTiers;
}

/**
 * Returns the mastery tier that a given score falls into.
 * Scores are evaluated as score >= tier.min && score < tier.max,
 * with the top tier (max = 1.00) being inclusive.
 */
export function getMasteryTier(score: number): MasteryTier | undefined {
  return studentsData.masteryTiers.find(
    (t) => score >= t.min && (score < t.max || t.max === 1.0)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GETTER FUNCTIONS — teacher insights
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the full teacher insights object for the demo class. */
export function getTeacherInsights(): TeacherInsight {
  return teacherInsights;
}

/** Returns the class-level concept mastery summary. */
export function getClassConceptMastery(): ClassConceptMastery[] {
  return teacherInsights.classConceptMastery;
}

/** Returns all at-risk students identified for the demo class. */
export function getAtRiskStudents(): AtRiskStudent[] {
  return teacherInsights.atRiskStudents;
}

/** Returns a specific at-risk student record by student id. */
export function getAtRiskStudentById(studentId: string): AtRiskStudent | undefined {
  return teacherInsights.atRiskStudents.find((s) => s.studentId === studentId);
}

/** Returns the highlighted on-track student for the demo class. */
export function getOnTrackHighlight(): OnTrackHighlight {
  return teacherInsights.onTrackHighlight;
}

/** Returns the class name and id for display in teacher views. */
export function getClassInfo(): Pick<TeacherInsight, "classId" | "className"> {
  return {
    classId: teacherInsights.classId,
    className: teacherInsights.className,
  };
}
