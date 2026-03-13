import { create } from 'zustand';
import { ClientGameState, Card, ActionType, GamePhase } from '@shared/types';
import { CONFIG } from '@shared/rules';
import { socketService, SocketEvents } from '../services/socket';

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
  actionMode: ActionType | null;
  peekedCard: Card | null;
  showPeekedCard: boolean;
  snapNotification: string | null;

  // Actions
  setPlayerName: (name: string) => void;
  setError: (error: string | null) => void;
  createRoom: () => Promise<void>;
  joinRoom: (code: string) => Promise<void>;
  startGame: () => Promise<void>;
  peekInitialCard: (index: number) => Promise<void>;
  doneMemorizing: () => Promise<void>;
  drawFromDeck: () => Promise<void>;
  drawFromDiscard: () => Promise<void>;
  keepDrawnCard: (swapIndices: number[]) => Promise<void>;
  discardDrawnCard: () => Promise<void>;
  useAction: (data: { targetPlayerId?: string; myCardIndex?: number; targetCardIndex?: number }) => Promise<void>;
  callCabo: () => Promise<void>;
  snap: (cardIndex: number) => Promise<void>;
  nextRound: () => Promise<void>;
  setSelectedCardIndex: (index: number | null) => void;
  setActionMode: (mode: ActionType | null) => void;
  clearPeekedCard: () => void;
  skipAction: () => Promise<void>;
  initializeSocket: () => void;
}

let errorTimeoutId: NodeJS.Timeout | null = null;

export const useGameStore = create<GameStore>((set, get) => ({
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
  actionMode: null,
  peekedCard: null,
  showPeekedCard: false,
  snapNotification: null,

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

    socketService.on(SocketEvents.STATE_UPDATE, (state: ClientGameState) => {
      const prev = get().gameState;
      const myId = get().playerId;
      set({ gameState: state });

      // Sync drawn card with server state
      // If server says we don't have a drawn card, clear local one
      if (!state.drawnCard && get().drawnCard) {
        // Only clear if it's no longer our turn or snap window is active
        if (state.currentTurnPlayerId !== myId || state.snapWindowActive) {
          set({ drawnCard: null, selectedCardIndex: null });
        }
      }

      // Sync action mode
      if (!state.actionType && get().actionMode) {
        set({ actionMode: null });
      }

      // Show score board on round end
      if (state.phase === 'ROUND_END' || state.phase === 'GAME_OVER') {
        set({ showScoreBoard: true, drawnCard: null, actionMode: null, selectedCardIndex: null });
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
        set({ drawnCard: null, selectedCardIndex: null });
      } else if (res.success) {
        set({ drawnCard: null, selectedCardIndex: null });
      }
    } catch (err) {
      get().setError('Failed');
    }
  },

  discardDrawnCard: async () => {
    try {
      const res: any = await socketService.emit(SocketEvents.DISCARD_DRAWN_CARD);
      if (res.success) {
        set({ drawnCard: null });
        if (res.actionType) {
          set({ actionMode: res.actionType });
        }
      }
    } catch (err) {
      get().setError('Failed');
    }
  },

  useAction: async (data) => {
    try {
      const res: any = await socketService.emit(SocketEvents.USE_ACTION, data);
      if (res.success) {
        set({ actionMode: null, selectedCardIndex: null });
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
  setActionMode: (mode) => set({ actionMode: mode }),
  clearPeekedCard: () => set({ peekedCard: null, showPeekedCard: false }),

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
}));
