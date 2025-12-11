export interface Source {
  title: string;
  uri: string;
}

export interface AnalysisResult {
  score: number; // 0 to 100
  verdict: string;
  analysis: string;
  sources: Source[];
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}