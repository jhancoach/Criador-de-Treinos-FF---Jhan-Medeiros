
export type TrainingMode = 'basic' | 'premium' | 'premium_plus';
export type Language = 'pt' | 'en' | 'es';

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

// Waiting List Interfaces
export interface TrainingRequest {
  id: string;
  teamName: string;
  contact?: string;
  timestamp: number;
}

export interface OpenTraining {
  id: string;
  adminName: string;
  trainingName: string;
  adminPin: string; // Simple protection for editing
  requests: TrainingRequest[];
  createdAt: number;
}

export type Position = { x: number; y: number }; // Percentages

export enum Step {
  LANDING = 'LANDING',
  MODE_4X4 = 'MODE_4X4',
  HOME = 'HOME',
  WAITING_LIST = 'WAITING_LIST',
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

export interface ReplayEvent {
  Event: number;
  Time: number;
  SParam?: string;
  FParam?: number;
}

export interface PlayerAnalysis {
    name: string;
    teamTag: string;
    kills: number;
    damage: number;
    firstEventTime: number;
    lastEventTime: number;
    mvpScore: number;
    timeAlive: number;
}

// 4x4 Specific Types
export type VS_Step = 'HOME' | 'CONFIG' | 'DRAFT' | 'HISTORY';
export type PBMode = 'snake' | 'linear' | 'mirrored';
export type MapStrategy = 'no_repeat' | 'repeat' | 'fixed';
export type TurnAction = 'BAN_A' | 'BAN_B' | 'PICK_A' | 'PICK_B';

export interface DraftState {
    bansA: string[];
    bansB: string[];
    picksA: string[];
    picksB: string[];
    turnIndex: number;
    history: { action: TurnAction; charId: string }[];
    isComplete: boolean;
}

export interface SeriesMatchResult {
    matchIndex: number;
    mapId: string;
    winner: 'A' | 'B';
    draftState: DraftState;
}
