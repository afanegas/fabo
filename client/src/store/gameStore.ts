import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ClientGameState, Card, ActionType, GamePhase, GameSettings } from '@shared/types';
import { CONFIG } from '@shared/rules';
import { ChampionId } from '@shared/championship';
import { socketService, SocketEvents } from '../services/socket';
import { CardHighlight, describeAction, actionHighlights, concernsMe, noticeDuration } from '../utils/actionNotice';

// An opponent spied on or swapped with one of my cards: stays until I dismiss it
export interface PersonalNotice {
  id: number;
  text: string;
  highlights: CardHighlight[];
}

interface GameStore {
  // Connection
  playerId: string | null;
  playerName: string;
  roomCode: string | null;
  isConnected: boolean;
  error: string | null;

  // Game state from server
  gameState: ClientGameState | null;

  // Local UI state
  drawnCard: Card | null;
  showScoreBoard: boolean;
  caboAlertActive: boolean;
  selectedCardIndex: number | null;
  swapSelection: number[];          // own cards chosen to swap for the drawn card
  actionMode: ActionType | null;
  peekedCard: Card | null;
  showPeekedCard: boolean;
  snapNotification: string | null;
  actionNotice: string | null;          // what an opponent just did with Peek/Spy/Swap
  actionHighlights: CardHighlight[];    // the cards that action touched
  personalNotices: PersonalNotice[];
  championshipOpen: boolean;

  // Actions
  setPlayerName: (name: string) => void;
  setError: (error: string | null) => void;
  createRoom: () => Promise<void>;
  joinRoom: (code: string) => Promise<void>;
  joinChampionship: (champion: ChampionId) => Promise<void>;
  setChampionshipOpen: (open: boolean) => void;
  updateSettings: (changes: Partial<GameSettings>) => Promise<void>;
  dismissPersonalNotice: (id: number) => void;
  startGame: () => Promise<void>;
  peekInitialCard: (index: number) => Promise<void>;
  doneMemorizing: () => Promise<void>;
  drawFromDeck: () => Promise<void>;
  drawFromDiscard: () => Promise<void>;
  keepDrawnCard: (swapIndices: number[]) => Promise<void>;
  discardDrawnCard: () => Promise<void>;
  useAction: (data: { targetPlayerId?: string; myCardIndex?: number; targetCardIndex?: number }, keepActionOpen?: boolean) => Promise<void>;
  callCabo: () => Promise<void>;
  snap: (cardIndex: number) => Promise<void>;
  nextRound: () => Promise<void>;
  setSelectedCardIndex: (index: number | null) => void;
  toggleSwapSelection: (index: number) => void;
  setActionMode: (mode: ActionType | null) => void;
  clearPeekedCard: () => void;
  skipAction: () => Promise<void>;
  reconnectSession: () => Promise<void>;
  clearSession: () => void;
  leaveGame: () => Promise<void>;
  initializeSocket: () => void;
}

let errorTimeoutId: NodeJS.Timeout | null = null;
let actionNoticeTimeoutId: ReturnType<typeof setTimeout> | null = null;

// socket.io reconnects on its own after a short drop (phone locked, app switched,
// network change), but with a new socket id. Without telling the server, it keeps
// the player marked as disconnected and skips their turns, so rejoin every time.
let rejoinOnConnect: (() => void) | null = null;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
  // Initial state
  playerId: null,
  playerName: '',
  roomCode: null,
  isConnected: false,
  error: null,
  gameState: null,
  drawnCard: null,
  showScoreBoard: false,
  caboAlertActive: false,
  selectedCardIndex: null,
  swapSelection: [],
  actionMode: null,
  peekedCard: null,
  showPeekedCard: false,
  snapNotification: null,
  actionNotice: null,
  actionHighlights: [],
  personalNotices: [],
  championshipOpen: false,

  setPlayerName: (name) => set({ playerName: name }),
  
  setError: (error) => {
    set({ error });
    
    // Clear any existing timeout to reset the 4-second clock
    if (errorTimeoutId) {
      clearTimeout(errorTimeoutId);
      errorTimeoutId = null;
    }

    // Only set a new timeout if we are actually displaying an error
    if (error) {
      errorTimeoutId = setTimeout(() => {
        set({ error: null });
        errorTimeoutId = null;
      }, 4000);
    }
  },

  initializeSocket: () => {
    socketService.connect();
    set({ isConnected: true });

    if (!rejoinOnConnect) {
      rejoinOnConnect = () => {
        if (get().roomCode && get().playerId) get().reconnectSession();
      };
      socketService.on('connect', rejoinOnConnect);
    }

    socketService.on(SocketEvents.STATE_UPDATE, (state: ClientGameState) => {
      const prev = get().gameState;
      const myId = get().playerId;
      set({ gameState: state });

      // Sync drawn card with server state
      // If server says we don't have a drawn card, clear local one
      if (!state.drawnCard && get().drawnCard) {
        // Only clear if it's no longer our turn or snap window is active
        if (state.currentTurnPlayerId !== myId || state.snapWindowActive) {
          set({ drawnCard: null, selectedCardIndex: null, swapSelection: [] });
        }
      }

      // Tell the others what the player on turn did with a card (not after a reload)
      const action = state.lastAction;
      if (prev && action && action.id !== prev.lastAction?.id && action.actorId !== myId) {
        if (concernsMe(action, myId)) {
          const notice = { id: action.id, text: describeAction(action, myId), highlights: actionHighlights(action) };
          set({ personalNotices: [...get().personalNotices, notice] });
        } else {
          set({ actionNotice: describeAction(action, myId), actionHighlights: actionHighlights(action) });
          if (actionNoticeTimeoutId) clearTimeout(actionNoticeTimeoutId);
          actionNoticeTimeoutId = setTimeout(
            () => set({ actionNotice: null, actionHighlights: [] }),
            noticeDuration(action),
          );
        }
      }

      // Sync action mode
      if (!state.actionType && get().actionMode) {
        set({ actionMode: null });
      }

      // Show score board on round end
      if (state.phase === 'ROUND_END' || state.phase === 'GAME_OVER') {
        // Card positions change in the next round, so old notices would point at the wrong cards
        set({ showScoreBoard: true, drawnCard: null, actionMode: null, selectedCardIndex: null, swapSelection: [], personalNotices: [] });
      }

      // Trigger cabo alert
      if (state.caboCallerId && state.caboCallerId !== myId) {
        if (!prev?.caboCallerId) {
          set({ caboAlertActive: true });
          setTimeout(() => set({ caboAlertActive: false }), CONFIG.CABO_ALERT_DURATION_MS);
        }
      }
    });

    socketService.on(SocketEvents.CABO_ANNOUNCED, (data: { callerName: string }) => {
      set({ caboAlertActive: true });
      setTimeout(() => set({ caboAlertActive: false }), CONFIG.CABO_ALERT_DURATION_MS);
    });

    socketService.on(SocketEvents.SNAP_RESULT, (data: { playerName: string; card: Card }) => {
      set({ snapNotification: `${data.playerName} snapped a ${data.card.rank}!` });
      setTimeout(() => set({ snapNotification: null }), 2000);
    });

    socketService.on(SocketEvents.SNAP_WINDOW_CLOSED, () => {
      // Snap window is over
    });

    socketService.on(SocketEvents.ERROR, (data: { message: string }) => {
      get().setError(data.message);
    });
  },

  createRoom: async () => {
    try {
      const name = get().playerName.trim();
      if (!name) { get().setError('Please enter your name'); return; }

      const res: any = await socketService.emit(SocketEvents.CREATE_ROOM, { playerName: name });
      if (res.success) {
        set({ roomCode: res.roomCode, playerId: res.playerId });
        get().setError(null);
      } else {
        get().setError(res.error || 'Failed to create room');
      }
    } catch (err) {
      get().setError('Connection failed');
    }
  },

  joinRoom: async (code) => {
    try {
      const name = get().playerName.trim();
      if (!name) { get().setError('Please enter your name'); return; }

      const res: any = await socketService.emit(SocketEvents.JOIN_ROOM, {
        roomCode: code.toUpperCase(),
        playerName: name,
      });
      if (res.success) {
        set({ roomCode: res.roomCode, playerId: res.playerId });
        get().setError(null);
      } else {
        get().setError(res.error || 'Failed to join room');
      }
    } catch (err) {
      get().setError('Connection failed');
    }
  },

  joinChampionship: async (champion) => {
    try {
      socketService.connect();
      const res: any = await socketService.emit(SocketEvents.JOIN_CHAMPIONSHIP, { champion });
      if (res.success) {
        set({ roomCode: res.roomCode, playerId: res.playerId, isConnected: true });
        get().setError(null);
      } else {
        get().setError(res.error || 'Failed to join championship');
      }
    } catch (err) {
      get().setError('Connection failed');
    }
  },

  setChampionshipOpen: (open) => set({ championshipOpen: open }),

  dismissPersonalNotice: (id) =>
    set({ personalNotices: get().personalNotices.filter((n) => n.id !== id) }),

  updateSettings: async (changes) => {
    try {
      const res: any = await socketService.emit(SocketEvents.UPDATE_SETTINGS, changes);
      if (!res.success) get().setError(res.error || 'Cannot change settings');
    } catch (err) {
      get().setError('Failed to change settings');
    }
  },

  startGame: async () => {
    try {
      const res: any = await socketService.emit(SocketEvents.START_GAME);
      if (!res.success) get().setError(res.error || 'Cannot start game');
    } catch (err) {
      get().setError('Failed to start game');
    }
  },

  peekInitialCard: async (index) => {
    try {
      const res: any = await socketService.emit(SocketEvents.PEEK_INITIAL, { cardIndex: index });
      if (res.success && res.card) {
        set({ peekedCard: res.card, showPeekedCard: true });
        setTimeout(() => set({ showPeekedCard: false, peekedCard: null }), CONFIG.PEEK_DURATION_MS);
      }
    } catch (err) {
      get().setError('Failed to peek');
    }
  },

  doneMemorizing: async () => {
    try {
      await socketService.emit(SocketEvents.DONE_MEMORIZING);
    } catch (err) {
      get().setError('Failed');
    }
  },

  drawFromDeck: async () => {
    try {
      const res: any = await socketService.emit(SocketEvents.DRAW_FROM_DECK);
      if (res.success && res.card) {
        set({ drawnCard: res.card });
      } else {
        get().setError(res.error || 'Cannot draw');
      }
    } catch (err) {
      get().setError('Failed to draw');
    }
  },

  drawFromDiscard: async () => {
    try {
      const res: any = await socketService.emit(SocketEvents.DRAW_FROM_DISCARD);
      if (res.success && res.card) {
        set({ drawnCard: res.card });
      } else {
        get().setError(res.error || 'Cannot draw');
      }
    } catch (err) {
      get().setError('Failed to draw');
    }
  },

  keepDrawnCard: async (swapIndices) => {
    try {
      const res: any = await socketService.emit(SocketEvents.KEEP_DRAWN_CARD, { swapIndices });
      if (res.penalized) {
        get().setError('Penalty! Cards didn\'t match — turn lost');
        set({ drawnCard: null, selectedCardIndex: null, swapSelection: [] });
      } else if (res.success) {
        set({ drawnCard: null, selectedCardIndex: null, swapSelection: [] });
      }
    } catch (err) {
      get().setError('Failed');
    }
  },

  discardDrawnCard: async () => {
    try {
      const res: any = await socketService.emit(SocketEvents.DISCARD_DRAWN_CARD);
      if (res.success) {
        set({ drawnCard: null, swapSelection: [] });
        if (res.actionType) {
          set({ actionMode: res.actionType });
        }
      }
    } catch (err) {
      get().setError('Failed');
    }
  },

  useAction: async (data, keepActionOpen = false) => {
    try {
      const res: any = await socketService.emit(SocketEvents.USE_ACTION, data);
      if (res.success) {
        if (!keepActionOpen) {
          set({ actionMode: null, selectedCardIndex: null });
        } else {
          set({ selectedCardIndex: null });
        }
        if (res.peekedCard) {
          set({ peekedCard: res.peekedCard, showPeekedCard: true });
          setTimeout(() => set({ showPeekedCard: false, peekedCard: null }), CONFIG.PEEK_DURATION_MS);
        }
      } else {
        get().setError('Action failed');
      }
    } catch (err) {
      get().setError('Failed');
    }
  },

  callCabo: async () => {
    try {
      const res: any = await socketService.emit(SocketEvents.CALL_CABO);
      if (!res.success) get().setError(res.error || 'Cannot call Cabo');
    } catch (err) {
      get().setError('Failed');
    }
  },

  snap: async (cardIndex) => {
    try {
      const res: any = await socketService.emit(SocketEvents.SNAP, { cardIndex });
      if (!res.success) {
        if (res.penaltyApplied) {
          get().setError('Wrong snap! Penalty card added to your grid.');
        } else {
          get().setError("Card doesn't match!");
        }
      }
    } catch (err) {
      get().setError('Failed');
    }
  },

  nextRound: async () => {
    try {
      await socketService.emit(SocketEvents.NEXT_ROUND);
      set({ showScoreBoard: false });
    } catch (err) {
      get().setError('Failed');
    }
  },

  setSelectedCardIndex: (index) => set({ selectedCardIndex: index }),
  toggleSwapSelection: (index) => {
    const current = get().swapSelection;
    set({ swapSelection: current.includes(index) ? current.filter((i) => i !== index) : [...current, index] });
  },
  setActionMode: (mode) => set({ actionMode: mode }),
  clearPeekedCard: () => set({ peekedCard: null, showPeekedCard: false }),

  reconnectSession: async () => {
    const { roomCode, playerId } = get();
    if (!roomCode || !playerId) return;

    try {
      socketService.connect();
      // Small delay to ensure socket is connected before emitting
      await new Promise(resolve => setTimeout(resolve, 200));
      const res: any = await socketService.emit(SocketEvents.RECONNECT, { roomCode, playerId });
      if (res.success) {
        set({ isConnected: true });
      } else {
        // Session expired, clear credentials
        get().clearSession();
      }
    } catch (err) {
      get().clearSession();
    }
  },

  clearSession: () => {
    set({ playerId: null, roomCode: null, playerName: '', gameState: null, isConnected: false, drawnCard: null, actionMode: null, selectedCardIndex: null, swapSelection: [], showScoreBoard: false });
  },

  leaveGame: async () => {
    try {
      await socketService.emit(SocketEvents.LEAVE_GAME);
    } catch (err) {
      // Ignore errors — we're leaving anyway
    }
    get().clearSession();
    socketService.disconnect();
  },

  skipAction: async () => {
    try {
      const res: any = await socketService.emit(SocketEvents.SKIP_ACTION);
      if (res.success) {
        set({ actionMode: null, selectedCardIndex: null });
      } else {
        get().setError('Failed to skip action');
      }
    } catch (err) {
      get().setError('Failed to skip action');
    }
  },
}),
    {
      name: 'cabo-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        playerId: state.playerId,
        playerName: state.playerName,
        roomCode: state.roomCode,
        championshipOpen: state.championshipOpen,
      }),
    },
  ),
);

// Cards to mark on the table: from the short banner and from notices not yet dismissed
export const mergeHighlights = (
  actionHighlights: CardHighlight[],
  personalNotices: PersonalNotice[],
): CardHighlight[] =>
  personalNotices.length === 0
    ? actionHighlights
    : [...actionHighlights, ...personalNotices.flatMap((n) => n.highlights)];
