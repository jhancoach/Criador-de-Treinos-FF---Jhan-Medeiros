export type TrainingMode = 'basic' | 'premium';

export interface Team {
  id: string;
  name: string;
}

export interface MapData {
  id: string;
  name: string;
  image: string;
  cities: string[];
}

export interface MatchScore {
  teamId: string;
  rank: number | '';
  kills: number | '';
}

export interface ProcessedScore {
  teamId: string;
  teamName: string;
  totalPoints: number;
  placementPoints: number;
  killPoints: number;
  booyahs: number;
  totalKills: number;
  matchesPlayed: number;
  lastMatchRank: number;
}

export type Position = { x: number; y: number }; // Percentages

export enum Step {
  HOME = 'HOME',
  MODE_SELECT = 'MODE_SELECT',
  TEAM_REGISTER = 'TEAM_REGISTER',
  MAP_SORT = 'MAP_SORT',
  STRATEGY = 'STRATEGY',
  SCORING = 'SCORING',
  REPORT = 'REPORT',
  DASHBOARD = 'DASHBOARD'
}

export const POINTS_SYSTEM: Record<number, number> = {
  1: 12,
  2: 9,
  3: 8,
  4: 7,
  5: 6,
  6: 5,
  7: 4,
  8: 3,
  9: 2,
  10: 1
};
// 11-15 is 0