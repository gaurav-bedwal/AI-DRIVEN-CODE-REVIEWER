import { create } from 'zustand';

interface Finding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  line: number | null;
  title: string;
  description: string;
}

interface Suggestion {
  title: string;
  before: string;
  after: string;
}

interface ReviewReport {
  id: string;
  sessionId: string;
  overallScore: number;
  stage: 'DEV' | 'SECURITY' | 'DEPLOY' | 'PRODUCTION';
  findings: Finding[];
  suggestions: Suggestion[];
  summary: string;
}

interface ReviewSession {
  id: string;
  language: string;
  filename: string | null;
  createdAt: string;
  overallScore: number;
}

interface ReviewState {
  currentSession: ReviewSession | null;
  reports: ReviewReport[];
  isAnalyzing: boolean;
  setReviewData: (session: ReviewSession, reports: ReviewReport[]) => void;
  setIsAnalyzing: (status: boolean) => void;
  clearReview: () => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  currentSession: null,
  reports: [],
  isAnalyzing: false,
  setReviewData: (session, reports) => set({ currentSession: session, reports }),
  setIsAnalyzing: (status) => set({ isAnalyzing: status }),
  clearReview: () => set({ currentSession: null, reports: [], isAnalyzing: false }),
}));
