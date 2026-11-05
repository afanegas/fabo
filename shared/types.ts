// ─── Card Types ───
export type Rank = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13';

export interface Card {
  id: string;
  rank: Rank;
}

export type ActionType = 'PEEK' | 'SPY' | 'SWAP' | 'LOOK_AND_SWAP';

// ─── Shared Exports ───
export * from './rules';

// ─── Game Phases ───
export type GamePhase =
  | 'WAITING'
  | 'MEMORIZE'
  | 'PLAYING'
  | 'CABO_CALLED'
  | 'SNAP_WINDOW'
  | 'ACTION_PENDING'
  | 'ROUND_END'
  | 'GAME_OVER'
  | 'ABANDONED';

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
  isRevealed: boolean;
}

export type GameMode = 'normal' | 'championship';

// ─── Client Game State (what the server sends to each player) ───
export interface ClientGameState {
  roomCode: string;
  mode: GameMode;
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
  isMemorizeReady: boolean;
  gameStats: Record<string, PlayerRoundStats>; // playerId -> totals of finished rounds
  settings: GameSettings;
  lastAction: ActionNotice | null; // last Peek/Spy/Swap, shown to everyone else
}

// ─── Game Settings (chosen in the waiting room) ───
export interface GameSettings {
  snapEnabled: boolean;
}

// ─── Card power used by a player, so the others know what happened ───
export interface ActionNotice {
  id: number;                // increases with every action, to tell new from old
  type: 'PEEK' | 'SPY' | 'SWAP';
  actorId: string;
  actorName: string;
  actorCardIndex?: number;   // PEEK: the card looked at, SWAP: the actor's card
  targetPlayerId?: string;   // SPY / SWAP
  targetPlayerName?: string;
  targetCardIndex?: number;
}

// ─── Play Style & Luck (counted per player and round) ───
export interface PlayerRoundStats {
  ownPeeks: number;        // 7/8 looking at own card
  opponentPeeks: number;   // 9/10 looking at an opponent's card
  opponentSwaps: number;   // 11/12 swapping with an opponent
  discardDraws: number;    // took the top card of the discard pile
  unicornsDealt: number;   // 0-cards (sleeping fox) in the starting hand
  unicornsDrawn: number;   // 0-cards drawn from the deck
  unicornsStolen: number;  // 0-cards taken from an opponent by swapping
}

export const PLAYER_ROUND_STATS_KEYS: (keyof PlayerRoundStats)[] = [
  'ownPeeks',
  'opponentPeeks',
  'opponentSwaps',
  'discardDraws',
  'unicornsDealt',
  'unicornsDrawn',
  'unicornsStolen',
];

export function emptyPlayerRoundStats(): PlayerRoundStats {
  return {
    ownPeeks: 0,
    opponentPeeks: 0,
    opponentSwaps: 0,
    discardDraws: 0,
    unicornsDealt: 0,
    unicornsDrawn: 0,
    unicornsStolen: 0,
  };
}

export function addPlayerRoundStats(a: PlayerRoundStats, b: PlayerRoundStats): PlayerRoundStats {
  const sum = emptyPlayerRoundStats();
  for (const key of PLAYER_ROUND_STATS_KEYS) sum[key] = (a[key] ?? 0) + (b[key] ?? 0);
  return sum;
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
  stats: PlayerRoundStats;
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
  RECONNECT = 'reconnect_session',
  LEAVE_GAME = 'leave_game',
  JOIN_CHAMPIONSHIP = 'join_championship',
  UPDATE_SETTINGS = 'update_settings',

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

