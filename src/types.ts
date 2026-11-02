export enum Role {
  OPPONENT = 'opponent',
  COACH = 'coach',
  AUDIENCE = 'audience',
  USER = 'user',
  SYSTEM = 'system'
}

export enum Difficulty {
  NOVICE = 1,
  ORATOR = 2,
  POLEMICIST = 3,
  DEMOSTHENES = 4
}

export interface Exercise {
  id: number;
  title: string;
  description: string;
  objective: string;
  difficulty: number;
  systemPrompt: string;
  evaluationCriteria: string[];
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  audioUrl?: string;
  analysis?: Analysis;
}

export interface Scores {
  logic: number;
  evidence: number;
  structure: number;
  counterargument: number;
  ethos: number;
  pathos: number;
  style: number;
}

export interface Fallacy {
  name: string;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface Analysis {
  summary: string;
  scores: Scores;
  strengths: string[];
  weaknesses: string[];
  fallacies: Fallacy[];
  improvedVersion: string;
  nextChallenge: string;
}

export interface UserProgress {
  level: Difficulty;
  xp: number;
  streak: number;
  lastTrainingDate?: number;
  skills: {
    logos: number;
    ethos: number;
    pathos: number;
    structure: number;
  };
  history: string[]; // Session IDs
}

export interface Session {
  id: string;
  exerciseId: number;
  topic: string;
  side?: 'for' | 'against';
  status: 'active' | 'completed';
  createdAt: number;
  messages: Message[];
}
