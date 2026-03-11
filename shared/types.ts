// ─── Card Types ───
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
}

export type ActionType = 'PEEK' | 'SPY' | 'SWAP' | 'LOOK_AND_SWAP';

// ─── Game Phases ───
export type GamePhase =
  | 'WAITING'
  | 'MEMORIZE'
  | 'PLAYING'
  | 'CABO_CALLED'
  | 'SNAP_WINDOW'
  | 'ACTION_PENDING'
  | 'ROUND_END'
  | 'GAME_OVER';

// ─── Player ───
export interface PlayerState {
  id: string;
  name: string;
  cardCount: number;
  isConnected: boolean;
  isCaboCaller: boolean;
}

export interface PlayerCardInfo {
  id: string;
  rank: Rank | null;  // null = face-down (hidden)
  suit: Suit | null;
  isRevealed: boolean;
}

// ─── Client Game State (what the server sends to each player) ───
export interface ClientGameState {
  roomCode: string;
  phase: GamePhase;
  currentTurnPlayerId: string | null;
  players: PlayerState[];
  myCards: PlayerCardInfo[];
  discardTop: Card | null;
  deckCount: number;
  drawnCard: Card | null;        // only set when the player drew from deck
  drawnFromDiscard: boolean;     // true if drawn card came from discard pile
  actionType: ActionType | null; // pending action after discard
  scores: Record<string, number[]>; // playerId -> round scores
  totalScores: Record<string, number>;
  roundNumber: number;
  caboCallerId: string | null;
  snapWindowActive: boolean;
  lastDiscard: Card | null;
  roundResults: RoundResult | null;
  memorizeCardsLeft: number;
}

// ─── Round Results ───
export interface PlayerRoundResult {
  playerId: string;
  playerName: string;
  cards: Card[];
  handTotal: number;
  roundScore: number;
  caboPenalty: boolean;
  specialWin: boolean;
}

export interface RoundResult {
  playerResults: PlayerRoundResult[];
  winnerId: string;
}

// ─── Socket Events ───
export enum SocketEvents {
  // Client → Server
  CREATE_ROOM = 'create_room',
  JOIN_ROOM = 'join_room',
  START_GAME = 'start_game',
  PEEK_INITIAL = 'peek_initial',
  DONE_MEMORIZING = 'done_memorizing',
  DRAW_FROM_DECK = 'draw_from_deck',
  DRAW_FROM_DISCARD = 'draw_from_discard',
  SWAP_CARD = 'swap_card',
  KEEP_DRAWN_CARD = 'keep_drawn_card',
  DISCARD_DRAWN_CARD = 'discard_drawn_card',
  USE_ACTION = 'use_action',
  SKIP_ACTION = 'skip_action',
  CALL_CABO = 'call_cabo',
  SNAP = 'snap',
  NEXT_ROUND = 'next_round',

  // Server → Client
  ROOM_CREATED = 'room_created',
  ROOM_JOINED = 'room_joined',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  GAME_STARTED = 'game_started',
  CARD_PEEKED = 'card_peeked',
  STATE_UPDATE = 'state_update',
  TURN_CHANGED = 'turn_changed',
  CARD_DRAWN = 'card_drawn',
  CARD_DISCARDED = 'card_discarded',
  CARD_SWAPPED = 'card_swapped',
  ACTION_REQUIRED = 'action_required',
  ACTION_RESULT = 'action_result',
  CABO_ANNOUNCED = 'cabo_announced',
  SNAP_WINDOW_OPEN = 'snap_window_open',
  SNAP_RESULT = 'snap_result',
  SNAP_WINDOW_CLOSED = 'snap_window_closed',
  ROUND_ENDED = 'round_ended',
  GAME_OVER = 'game_over',
  ERROR = 'error',
}

// ─── Config ───
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
} as const;
