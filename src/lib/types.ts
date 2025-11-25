import { FieldValue, Timestamp } from 'firebase/firestore';

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  isUncertain?: boolean;
}

export interface ShortAnswerQuestion {
  question: string;
  answer: string;
  isUncertain?: boolean;
}

export interface Flashcard {
  front: string;
  back: string;
  isUncertain?: boolean;
}

export interface MatchingPair {
  term: string;
  definition: string;
  isUncertain?: boolean;
}

export interface DiagramQuestion {
  question: string;
  answer: string;
  explanation: string;
  isUncertain?: boolean;
}

export interface StudySet {
  mcqs?: MCQ[];
  shortAnswerQuestions?: ShortAnswerQuestion[];
  flashcards?: Flashcard[];
  matchingPairs?: MatchingPair[];
  diagramQuestions?: DiagramQuestion[];
}

export interface ResourceTypes {
  mcqs: boolean;
  shortAnswer: boolean;
  flashcards: boolean;
  matching: boolean;
  diagram: boolean;
}

export interface ImageContent {
    base64: string;
    mimeType: string;
    url: string;
}

export interface Settings {
  topic: string;
  fileContent: string | null;
  imageContent: ImageContent | null;
  resourceTypes: ResourceTypes;
  count: number;
  difficulty: 'Introductory' | 'Intermediate' | 'Advanced';
}

export interface Feedback {
  verdict: 'Correct' | 'Partially Correct' | 'Incorrect';
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imagePreview?: string; // Data URL for rendering
}

// Subscription & User Types

export type PlanInterval = 'month' | 'year';

export interface UserStats {
    setsGenerated: number;
    questionsAnswered: number;
    daysStreak: number;
    lastLogin: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  subscriptionStatus: 'active' | 'canceled' | 'expired' | 'free' | 'trialing' | 'past_due';
  planInterval?: PlanInterval;
  currentPeriodEnd?: number; // Timestamp
  joinedDate: number;
  stats: UserStats;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UserPreferences {
  lastTopic?: string;
  lastDifficulty?: Settings['difficulty'];
  lastResourceTypes?: ResourceTypes;
  darkMode?: boolean;
}

export type ViewState = 'landing' | 'home' | 'account';
export type Theme = 'light' | 'dark';

export interface Product {
  productId: string;
  name: string;
  price: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  hlsUrl: string;
  dashUrl: string;
  thumbnailUrl: string;
  duration: number; // seconds
  startTime: string;
  endTime: string;
  status: "completed" | "upcoming" | "live";
  streamKey: string;
  creatorId: string;
  products: Product[];
  createdAt: FieldValue | Timestamp;
}

export type VideoInsert = Omit<Video, 'id' | 'createdAt'> & { createdAt?: FieldValue };
