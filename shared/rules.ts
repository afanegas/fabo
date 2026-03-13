import { Rank, ActionType } from './types';

export const CARD_POINTS: Record<Rank, number> = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
  '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 0
};

export const CARD_ACTIONS: Record<Rank, ActionType | null> = {
  'A': null, '2': null, '3': null, '4': null, '5': null, '6': null,
  '7': 'PEEK', '8': 'PEEK', '9': 'SPY', '10': 'SPY', 'J': 'SWAP', 'Q': 'LOOK_AND_SWAP', 'K': null
};

// ─── Game Configuration & Rules ───
export const CONFIG = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 4,
  CARDS_PER_PLAYER: 4,
  INITIAL_PEEK_COUNT: 2,
  SNAP_WINDOW_MS: 5000,
  MEMORIZE_TIME_MS: 10000,
  CABO_PENALTY: 10,
  SPECIAL_WIN_PENALTY: 50,
  GAME_END_SCORE: 100,
  ROOM_CODE_LENGTH: 6,
  CABO_ALERT_DURATION_MS: 5000,
  PEEK_DURATION_MS: 2500,
} as const;

export const SPECIAL_WIN_CARDS = {
  Q: 2,
  K: 2,
};
