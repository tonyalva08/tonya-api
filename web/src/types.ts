export type Stage = 'pre-PMF' | 'growth' | 'scaling' | 'mature';

export interface Competitor {
  name: string;
  positioning: string;
}

export interface MarketSnapshot {
  stage: Stage;
  competitors: Competitor[];
  positioning: string;
}
