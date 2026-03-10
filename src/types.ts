/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Domain = 'Operations' | 'Algebra' | 'Measurement' | 'Data' | 'Number' | 'Geometry' | 'Financial Literacy' | 'Mixed';
export type GradeLevel = 'grade2' | 'grade3';
export type Grade2SkillArea = 'Addition' | 'Subtraction' | 'Equality' | 'Time' | 'Graphing' | 'Fractions';
export type Grade3Topic =
  | 'Place Value and Rounding'
  | 'Addition'
  | 'Subtraction'
  | 'Multiplication'
  | 'Division'
  | 'Order of Operations'
  | 'Roman Numerals'
  | 'Fractions and Decimals'
  | 'Measurement'
  | 'Counting Money'
  | 'Time & Calendar'
  | 'Geometry'
  | 'Data & Graphing'
  | 'Word Problems';
export type SkillArea = Grade2SkillArea | Grade3Topic;
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Step {
  label: string;
  content: string;
}

export interface Problem {
  id: string;
  grade: GradeLevel;
  domain: Domain;
  skill: SkillArea;
  subskill: string;
  difficulty: Difficulty;
  prompt: string;
  question: string; // Displayed math expression
  correctAnswer: number | string;
  choices?: (number | string)[];
  steps: Step[];
  hints: string[];
  narrations: {
    intro: string;
    hint1: string;
    hint2: string;
    solution: string;
    success: string;
  };
  visualData?: any;
}

export interface SessionResult {
  date: string;
  grade: GradeLevel;
  skill: SkillArea;
  difficulty: Difficulty;
  totalQuestions: number;
  correctCount: number;
  mistakeTags: string[];
  subskillStats: Record<string, { correct: number, total: number }>;
}

export interface UserStats {
  totalStars: number;
  streak: number;
  lastSessionDate: string | null;
  history: SessionResult[];
  subskillAccuracy: Record<string, number>;
  mistakeTagCounts: Record<string, number>;
  gradePerformance: Record<GradeLevel, { sessions: number; stars: number }>;
}
