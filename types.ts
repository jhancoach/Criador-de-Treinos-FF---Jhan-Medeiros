export type TrainingMode = 'basic' | 'premium' | 'premium_plus';

export interface Team {
  id: string;
  name: string;
  color: string;
  logo?: string; // Base64 string of the logo
  players: string[]; // Array of player names (max 6)
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
  playerKills: Record<string, number>; // Map player name to kills
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

export interface PlayerStats {
  name: string;
  teamName: string;
  teamColor: string;
  totalKills: number;
  matchesPlayed: number;
  // Extra stats for Premium Plus
  totalDamage?: number;
  mvpScore?: number;
  timeAlive?: number;
}

// Interface for saved trainings in the Public Hub
export interface SavedTrainingSession {
  id: string;
  name: string;
  date: string;
  teamsCount: number;
  matchesCount: number;
  leaderboardTop3: { name: string; points: number }[];
  data: string; // JSON string of full state
}

export type Position = { x: number; y: number }; // Percentages

export enum Step {
  HOME = 'HOME',
  PUBLIC_HUB = 'PUBLIC_HUB',
  MODE_SELECT = 'MODE_SELECT',
  TEAM_REGISTER = 'TEAM_REGISTER',
  MAP_SORT = 'MAP_SORT',
  STRATEGY = 'STRATEGY',
  SCORING = 'SCORING',
  REPORT = 'REPORT',
  DASHBOARD = 'DASHBOARD',
  VIEWER = 'VIEWER'
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