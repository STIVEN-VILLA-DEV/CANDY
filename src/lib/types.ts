export type RiskLevel = "high" | "medium" | "low";

export interface Finding {
  id: string;
  category: string;
  detected: string;
  recommendation: string;
  risk: RiskLevel;
}

export interface AnalysisResult {
  score: number;
  findings: Finding[];
  summary: string;
  atsRecommendations: string[];
}

export type ProcessingStatus =
  | "idle"
  | "uploading"
  | "extracting"
  | "analyzing"
  | "done"
  | "error";
