// ─── Fane-Lebo Life Championship ───

import { PlayerRoundStats } from './types';

export const CHAMPIONSHIP_ROOM_CODE = 'FANELEBO';

export type ChampionId = 'fane' | 'lebo';

export const CHAMPIONS: { id: ChampionId; name: string }[] = [
  { id: 'fane', name: 'Fane' },
  { id: 'lebo', name: 'Lebo' },
];

export function isChampionId(value: unknown): value is ChampionId {
  return value === 'fane' || value === 'lebo';
}

export interface ChampionshipRound {
  roundNumber: number;
  scores: Record<ChampionId, number>;
  handTotals: Record<ChampionId, number>;
  winner: ChampionId;
  caboCaller: ChampionId | null;
  caboPenalty: ChampionId | null;
  specialWin: ChampionId | null;
  stats?: Record<ChampionId, PlayerRoundStats>; // missing in games stored before play-style stats
}

export interface ChampionshipGame {
  id: string;
  startedAt: string;
  endedAt: string;
  rounds: ChampionshipRound[];
  totals: Record<ChampionId, number>;
  winner: ChampionId | null; // null = draw
}

export interface ChampionshipSeason {
  number: number;
  startedAt: string;
  endedAt: string | null; // null = current season
  games: ChampionshipGame[];
}

export interface ChampionshipSeasonSummary {
  number: number;
  startedAt: string;
  endedAt: string | null;
  gameCount: number;
  wins: Record<ChampionId, number>;
}

// GET /api/championship?season=N
export interface ChampionshipResponse {
  seasons: ChampionshipSeasonSummary[];
  season: ChampionshipSeason;
  currentSeason: number;
}
