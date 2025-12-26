
export type StatusType = 'CONFORME' | 'NÃO CONFORME' | 'FALHA GRAVE (NCG)';

export interface ScorecardCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // Used as Max Points now
  category: string;
}

export interface CriteriaStatus {
  criterionId: string;
  status: StatusType;
  observation: string;
  pointsEarned: number;
  maxPoints: number;
}

export interface AnalysisResult {
  evaluationStatus: StatusType;
  totalScore: number;
  reasonForCall: string;
  criteriaScores: CriteriaStatus[];
  summary: string;
  systemReadyText: string;
  operatorFeedback: string;
  isNcgDetected: boolean;
}

export interface Interaction {
  id: string;
  agentName: string;
  date: string;
  transcript: string;
  result?: AnalysisResult;
}
