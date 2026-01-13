export enum Grade {
  PreK = 'Pre-K',
  K = 'Kindergarten',
  G1 = '1st Grade',
  G2 = '2nd Grade',
  G3 = '3rd Grade',
  G4 = '4th Grade',
  G5 = '5th Grade'
}

export enum Subject {
  Math = 'Math',
  Reading = 'Reading',
  Writing = 'Writing',
  Science = 'Science',
  History = 'History'
}

export interface LearningNeeds {
  [Subject.Math]?: string[];
  [Subject.Reading]?: string[];
  [Subject.Writing]?: string[];
  [Subject.Science]?: string[];
  [Subject.History]?: string[];
}

export interface ParentPreferences {
  autoGenerate: boolean;
  generationTime: string;
  notifications: {
    dailyReady: boolean;
    weeklyProgress: boolean;
  };
  voiceEnabled: boolean;
  voiceSpeed: number;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  grade: Grade;
  subjects: Subject[];
  learningNeeds: LearningNeeds;
  preferences: ParentPreferences;
  preferredTopics?: Record<string, string[]>;
}

export interface Question {
  id: string;
  text: string;
  options?: string[];
  correctAnswer?: string;
  type: 'multiple-choice' | 'text' | 'true-false';
  focusArea?: string;
}

export interface Worksheet {
  id: string;
  childId: string;
  subject: Subject;
  grade: Grade;
  date: string;
  title: string;
  topic?: string;
  instructions: string;
  questions: Question[];
  status: 'pending' | 'ready' | 'completed';
  created_at?: string;
  content?: {
    instructions: string;
    questions: Question[];
  };
  answers?: Record<string, string>;
  learningContent?: string;
}

export interface AppState {
  user: { email: string } | null;
  children: Child[];
  activeChildId: string | null;
  worksheets: Worksheet[];
}

export type AppView = 'home' | 'login' | 'signup' | 'onboarding' | 'dashboard' | 'worksheet' | 'tutor';