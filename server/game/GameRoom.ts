import {
  Card,
  GamePhase,
  ClientGameState,
  PlayerCardInfo,
  PlayerState,
  RoundResult,
  ActionType,
  GameMode,
  PlayerRoundStats,
  emptyPlayerRoundStats,
  addPlayerRoundStats,
} from "../../shared/types";
import { CONFIG, BEST_RANK } from "../../shared/rules";
import { Deck } from "./Deck";
import { Player } from "./Player";
import {
  calculateRoundResults,
  getActionType,
  getCardValue,
} from "./ScoreCalculator";

export class GameRoom {
  code: string;
  players: Player[] = [];
  deck: Deck = new Deck();
  discardPile: Card[] = [];
  phase: GamePhase = "WAITING";
  currentTurnIndex: number = 0;
  caboCallerId: string | null = null;
  finalTurnsRemaining: number = 0;
  roundNumber: number = 0;
  scores: Record<string, number[]> = {};
  totalScores: Record<string, number> = {};
  hostId: string = "";
  drawnCard: Map<string, Card> = new Map(); // playerId -> drawn card
  drawnFromDiscard: Set<string> = new Set(); // playerIds who drew from discard
  pendingAction: Map<string, ActionType> = new Map();
  lookAndSwapState: Map<
    string,
    { peekedCard: Card; peekedPlayerId: string; peekedCardIndex: number }
  > = new Map();
  snapWindowActive: boolean = false;
  snapTimer: ReturnType<typeof setTimeout> | null = null;
  turnActionTaken: boolean = false;
  lastDiscard: Card | null = null;
  memorizeReady: Set<string> = new Set();
  roundResults: RoundResult | null = null;
  onStateUpdate: (() => void) | null = null;
  onSnapWindowClose: (() => void) | null = null;
  onRoundEnd: ((result: RoundResult, gameOver: boolean) => void) | null = null;
  mode: GameMode;
  startedAt: string | null = null;
  roundStats: Map<string, PlayerRoundStats> = new Map(); // current round
  gameStats: Record<string, PlayerRoundStats> = {}; // finished rounds

  constructor(code: string, mode: GameMode = "normal") {
    this.code = code;
    this.mode = mode;
  }

  // ─── Player Management ───

  addPlayer(id: string, name: string, socketId: string): Player | null {
    if (this.players.length >= CONFIG.MAX_PLAYERS) return null;
    if (this.phase !== "WAITING") return null;

    const player = new Player(id, name, socketId);
    this.players.push(player);
    this.scores[id] = [];
    this.totalScores[id] = 0;

    if (this.players.length === 1) {
      this.hostId = id;
    }
    return player;
  }

  removePlayer(id: string): void {
    const player = this.players.find((p) => p.id === id);
    if (player) {
      player.isConnected = false;
    }
  }

  /**
   * Deliberately leave the game mid-play.
   * Handles turn advancement and game abandonment when too few players remain.
   */
  leaveGame(playerId: string): { abandoned: boolean } {
    const player = this.getPlayer(playerId);
    if (!player) return { abandoned: false };

    player.isConnected = false;

    // Leaving a finished game must not turn it into an abandoned one for the others
    if (this.phase === "GAME_OVER") return { abandoned: false };

    // Leaving the waiting room frees the seat; the room stays open
    if (this.phase === "WAITING") {
      this.players = this.players.filter((p) => p.id !== playerId);
      delete this.scores[playerId];
      delete this.totalScores[playerId];
      if (this.hostId === playerId) this.hostId = this.players[0]?.id ?? "";
      this.onStateUpdate?.();
      return { abandoned: false };
    }

    // Clean up any in-progress state for this player
    this.drawnCard.delete(playerId);
    this.drawnFromDiscard.delete(playerId);
    this.pendingAction.delete(playerId);
    this.lookAndSwapState.delete(playerId);
    this.memorizeReady.delete(playerId);

    // Check if enough players remain
    if (this.activePlayers.length < CONFIG.MIN_PLAYERS) {
      this.clearSnapTimer();
      this.phase = "ABANDONED";
      this.onStateUpdate?.();
      return { abandoned: true };
    }

    // If it was this player's turn, advance
    if (
      this.currentPlayer?.id === playerId &&
      (this.phase === "PLAYING" ||
        this.phase === "CABO_CALLED" ||
        this.phase === "ACTION_PENDING")
    ) {
      this.restorePhaseAfterAction();
      this.advanceTurn();
    }

    // If in MEMORIZE phase, check if remaining players are all ready
    if (this.phase === "MEMORIZE") {
      if (this.memorizeReady.size >= this.activePlayers.length) {
        this.phase = "PLAYING";
        this.currentTurnIndex = 0;
        for (const p of this.players) {
          p.peekedIndices.clear();
        }
      }
    }

    // If the cabo caller left, end the round immediately
    if (this.caboCallerId === playerId && this.phase === "CABO_CALLED") {
      this.endRound();
    }

    this.onStateUpdate?.();
    return { abandoned: false };
  }

  getPlayer(id: string): Player | undefined {
    return this.players.find((p) => p.id === id);
  }

  get currentPlayer(): Player {
    return this.players[this.currentTurnIndex];
  }

  get activePlayers(): Player[] {
    return this.players.filter((p) => p.isConnected);
  }

  // ─── Game Flow ───

  startGame(): boolean {
    if (this.players.length < CONFIG.MIN_PLAYERS) return false;
    if (this.phase !== "WAITING") return false;

    this.roundNumber = 1;
    this.startedAt = new Date().toISOString();
    this.startRound();
    return true;
  }

  startRound(): void {
    this.deck = new Deck();
    this.discardPile = [];
    this.caboCallerId = null;
    this.finalTurnsRemaining = 0;
    this.drawnCard.clear();
    this.drawnFromDiscard.clear();
    this.pendingAction.clear();
    this.lookAndSwapState.clear();
    this.snapWindowActive = false;
    this.turnActionTaken = false;
    this.lastDiscard = null;
    this.memorizeReady.clear();
    this.roundResults = null;

    for (const player of this.players) {
      player.resetForRound();
    }

    // Deal cards
    for (let i = 0; i < CONFIG.CARDS_PER_PLAYER; i++) {
      for (const player of this.players) {
        const card = this.deck.draw();
        if (card) player.addCard(card);
      }
    }

    this.roundStats.clear();
    for (const player of this.players) {
      this.stat(player.id).unicornsDealt = player.cards.filter(
        (c) => c.rank === BEST_RANK,
      ).length;
    }

    // Flip top card to start discard pile
    const topCard = this.deck.draw();
    if (topCard) this.discardPile.push(topCard);

    this.phase = "MEMORIZE";
  }

  peekInitialCard(playerId: string, cardIndex: number): Card | null {
    if (this.phase !== "MEMORIZE") return null;
    const player = this.getPlayer(playerId);
    if (!player) return null;

    // Can only peek 2 cards, and only outer cards (index 0, 1 for first row / 2, 3 for second row)
    // For simplicity, players peek any 2 of their cards
    if (player.peekedIndices.size >= CONFIG.INITIAL_PEEK_COUNT) return null;
    if (cardIndex < 0 || cardIndex >= player.cardCount) return null;

    return player.peekCard(cardIndex);
  }

  doneMemorazing(playerId: string): void {
    if (this.phase !== "MEMORIZE") return;
    this.memorizeReady.add(playerId);
    console.log(
      `Player ${playerId} ready. ${this.memorizeReady.size}/${this.activePlayers.length} ready`,
    );
    if (this.memorizeReady.size >= this.activePlayers.length) {
      this.phase = "PLAYING";
      this.currentTurnIndex = 0;
      console.log("All players ready, phase -> PLAYING");
      // Clear peeked indices so they can't look again
      for (const player of this.players) {
        player.peekedIndices.clear();
      }
    }
  }

  // ─── Turn Actions ───

  drawFromDeck(playerId: string): Card | null {
    if (!this.isPlayerTurn(playerId)) return null;
    if (this.drawnCard.has(playerId)) return null;
    if (this.snapWindowActive) return null;
    if (this.turnActionTaken) return null;

    this.ensureDeckHasCards();
    const card = this.deck.draw();
    if (!card) return null;

    this.drawnCard.set(playerId, card);
    if (card.rank === BEST_RANK) this.stat(playerId).unicornsDrawn++;
    return card;
  }

  drawFromDiscard(playerId: string): Card | null {
    if (!this.isPlayerTurn(playerId)) return null;
    if (this.drawnCard.has(playerId)) return null;
    if (this.snapWindowActive) return null;
    if (this.turnActionTaken) return null;
    if (this.discardPile.length === 0) return null;

    const card = this.discardPile.pop()!;
    this.drawnCard.set(playerId, card);
    this.drawnFromDiscard.add(playerId);
    this.stat(playerId).discardDraws++;
    return card;
  }

  keepDrawnCard(
    playerId: string,
    swapIndices: number[],
  ): { swapped: Card[]; success: boolean; penalized: boolean } {
    if (!this.isPlayerTurn(playerId))
      return { swapped: [], success: false, penalized: false };
    const drawn = this.drawnCard.get(playerId);
    if (!drawn) return { swapped: [], success: false, penalized: false };
    const player = this.getPlayer(playerId)!;

    // Validate indices: at least one, no card twice
    if (swapIndices.length === 0 || new Set(swapIndices).size !== swapIndices.length)
      return { swapped: [], success: false, penalized: false };
    for (const idx of swapIndices) {
      if (idx < 0 || idx >= player.cardCount)
        return { swapped: [], success: false, penalized: false };
    }

    if (swapIndices.length === 1) {
      // Simple swap
      const oldCard = player.swapCard(swapIndices[0], drawn);
      this.drawnCard.delete(playerId);
      this.drawnFromDiscard.delete(playerId);
      this.discardPile.push(oldCard);
      this.lastDiscard = oldCard;
      this.turnActionTaken = true;
      this.startSnapWindow();
      return { swapped: [oldCard], success: true, penalized: false };
    } else {
      // Multi-card swap: all cards at indices must have the same value
      const cardsAtIndices = swapIndices.map((i) => player.cards[i]);
      const firstValue = getCardValue(cardsAtIndices[0]);
      const allMatch = cardsAtIndices.every(
        (c) => getCardValue(c) === firstValue,
      );

      if (!allMatch) {
        // Penalty: cards go back, drawn card discarded, turn lost
        this.discardPile.push(drawn);
        this.drawnCard.delete(playerId);
        this.drawnFromDiscard.delete(playerId);
        this.lastDiscard = drawn;
        this.advanceTurn();
        return { swapped: [], success: false, penalized: true };
      }

      // Remove cards (descending order to keep indices valid) and add drawn card
      const removed = player.removeMultipleCards(swapIndices);
      player.addCard(drawn);
      this.drawnCard.delete(playerId);
      this.drawnFromDiscard.delete(playerId);

      for (const card of removed) {
        this.discardPile.push(card);
      }
      this.lastDiscard = removed[removed.length - 1];
      this.turnActionTaken = true;
      this.startSnapWindow();
      return { swapped: removed, success: true, penalized: false };
    }
  }

  discardDrawnCard(playerId: string): {
    card: Card | null;
    actionType: ActionType | null;
  } {
    if (!this.isPlayerTurn(playerId)) return { card: null, actionType: null };
    const drawn = this.drawnCard.get(playerId);
    if (!drawn) return { card: null, actionType: null };

    // Cannot discard a card drawn from the discard pile — must swap
    if (this.drawnFromDiscard.has(playerId))
      return { card: null, actionType: null };

    this.discardPile.push(drawn);
    this.drawnCard.delete(playerId);
    this.lastDiscard = drawn;

    // Check for action card
    const actionType = getActionType(drawn.rank);
    if (actionType) {
      this.pendingAction.set(playerId, actionType);
      this.phase =
        this.phase === "CABO_CALLED" ? "CABO_CALLED" : "ACTION_PENDING";
      return { card: drawn, actionType };
    }

    this.turnActionTaken = true;
    this.startSnapWindow();
    return { card: drawn, actionType: null };
  }

  useAction(
    playerId: string,
    data: {
      targetPlayerId?: string;
      myCardIndex?: number;
      targetCardIndex?: number;
    },
  ): {
    success: boolean;
    peekedCard?: Card;
    actionType?: ActionType;
  } {
    const actionType = this.pendingAction.get(playerId);
    if (!actionType) return { success: false };

    const player = this.getPlayer(playerId)!;

    switch (actionType) {
      case "PEEK": {
        if (data.myCardIndex === undefined) return { success: false };
        if (data.myCardIndex < 0 || data.myCardIndex >= player.cardCount)
          return { success: false };
        // Read card directly without adding to peekedIndices
        // so the card goes back to face-down after the peek overlay dismisses
        const card = player.cards[data.myCardIndex];
        this.stat(playerId).ownPeeks++;
        this.pendingAction.delete(playerId);
        this.restorePhaseAfterAction();
        this.startSnapWindow();
        return { success: true, peekedCard: card, actionType };
      }
      case "SPY": {
        if (!data.targetPlayerId || data.targetCardIndex === undefined)
          return { success: false };
        const target = this.getPlayer(data.targetPlayerId);
        if (!target || target.id === playerId) return { success: false };
        if (
          data.targetCardIndex < 0 ||
          data.targetCardIndex >= target.cardCount
        )
          return { success: false };
        const card = target.cards[data.targetCardIndex];
        this.stat(playerId).opponentPeeks++;
        this.pendingAction.delete(playerId);
        this.restorePhaseAfterAction();
        this.startSnapWindow();
        return { success: true, peekedCard: card, actionType };
      }
      case "SWAP": {
        if (
          !data.targetPlayerId ||
          data.myCardIndex === undefined ||
          data.targetCardIndex === undefined
        )
          return { success: false };
        const target = this.getPlayer(data.targetPlayerId);
        if (!target || target.id === playerId) return { success: false };
        if (data.myCardIndex < 0 || data.myCardIndex >= player.cardCount)
          return { success: false };
        if (
          data.targetCardIndex < 0 ||
          data.targetCardIndex >= target.cardCount
        )
          return { success: false };

        const myCard = player.cards[data.myCardIndex];
        const theirCard = target.cards[data.targetCardIndex];
        player.cards[data.myCardIndex] = theirCard;
        target.cards[data.targetCardIndex] = myCard;
        this.countOpponentSwap(playerId, theirCard);

        // Clear peeked status for swapped positions
        player.peekedIndices.delete(data.myCardIndex);
        target.peekedIndices.delete(data.targetCardIndex);

        this.pendingAction.delete(playerId);
        this.restorePhaseAfterAction();
        this.advanceTurn();
        return { success: true, actionType };
      }
      case "LOOK_AND_SWAP": {
        const lookState = this.lookAndSwapState.get(playerId);

        if (!lookState) {
          // Phase 1: Look at a card (own or opponent's)
          if (data.myCardIndex !== undefined) {
            // Looking at own card
            const card = player.peekCard(data.myCardIndex);
            if (!card) return { success: false };
            this.stat(playerId).ownPeeks++;
            this.lookAndSwapState.set(playerId, {
              peekedCard: card,
              peekedPlayerId: playerId,
              peekedCardIndex: data.myCardIndex,
            });
            return {
              success: true,
              peekedCard: card,
              actionType: "LOOK_AND_SWAP",
            };
          } else if (
            data.targetPlayerId &&
            data.targetCardIndex !== undefined
          ) {
            // Looking at opponent's card
            const target = this.getPlayer(data.targetPlayerId);
            if (!target || target.id === playerId) return { success: false };
            if (
              data.targetCardIndex < 0 ||
              data.targetCardIndex >= target.cardCount
            )
              return { success: false };
            const card = target.cards[data.targetCardIndex];
            this.stat(playerId).opponentPeeks++;
            this.lookAndSwapState.set(playerId, {
              peekedCard: card,
              peekedPlayerId: data.targetPlayerId,
              peekedCardIndex: data.targetCardIndex,
            });
            return {
              success: true,
              peekedCard: card,
              actionType: "LOOK_AND_SWAP",
            };
          }
          return { success: false };
        } else {
          // Phase 2: Swap the peeked card with another card, or skip
          if (
            data.myCardIndex !== undefined &&
            data.targetPlayerId &&
            data.targetCardIndex !== undefined
          ) {
            // Swap between my card and target's card
            const target = this.getPlayer(data.targetPlayerId);
            if (!target) return { success: false };
            if (data.myCardIndex < 0 || data.myCardIndex >= player.cardCount)
              return { success: false };
            if (
              data.targetCardIndex < 0 ||
              data.targetCardIndex >= target.cardCount
            )
              return { success: false };

            const myCard = player.cards[data.myCardIndex];
            const theirCard = target.cards[data.targetCardIndex];
            player.cards[data.myCardIndex] = theirCard;
            target.cards[data.targetCardIndex] = myCard;
            if (target.id !== playerId) this.countOpponentSwap(playerId, theirCard);

            player.peekedIndices.delete(data.myCardIndex);
            target.peekedIndices.delete(data.targetCardIndex);
          }
          // Complete the action (even if no swap was made — skip)
          this.lookAndSwapState.delete(playerId);
          this.pendingAction.delete(playerId);
          this.restorePhaseAfterAction();
          this.advanceTurn();
          return { success: true, actionType };
        }
      }
      default:
        return { success: false };
    }
  }

  skipAction(playerId: string): boolean {
    if (!this.pendingAction.has(playerId)) return false;
    this.pendingAction.delete(playerId);
    this.restorePhaseAfterAction();
    this.startSnapWindow();
    return true;
  }

  callCabo(playerId: string): boolean {
    if (!this.isPlayerTurn(playerId)) return false;
    if (this.phase !== "PLAYING") return false;
    if (this.drawnCard.has(playerId)) return false; // Must call before drawing
    if (this.turnActionTaken) return false;

    const player = this.getPlayer(playerId)!;
    player.isCaboCaller = true;
    this.caboCallerId = playerId;
    this.phase = "CABO_CALLED";
    // advanceTurn() below already counts down once for the caller's own turn,
    // so every other player still gets exactly one final turn
    this.finalTurnsRemaining = this.activePlayers.length;
    this.advanceTurn();
    return true;
  }

  snap(playerId: string, cardIndex: number): { success: boolean; card?: Card; penaltyApplied?: boolean } {
    if (!this.snapWindowActive) return { success: false };
    if (!this.lastDiscard) return { success: false };

    const player = this.getPlayer(playerId);
    if (!player) return { success: false };
    if (cardIndex < 0 || cardIndex >= player.cardCount)
      return { success: false };

    const card = player.cards[cardIndex];
    if (getCardValue(card) !== getCardValue(this.lastDiscard)) {
      // Penalty for wrong snap: Draw 1 card and add to player grid
      const penaltyCard = this.deck.draw();
      if (penaltyCard) {
        player.addCard(penaltyCard);
      }
      return { success: false, penaltyApplied: true, card: penaltyCard || undefined };
    }

    // Valid snap! Remove card from player's hand and add to discard
    const removed = player.removeCard(cardIndex);
    this.discardPile.push(removed);
    this.lastDiscard = removed;

    // Keep snap window open for chain snaps
    this.resetSnapTimer();

    return { success: true, card: removed };
  }

  // ─── State Helpers ───

  private isPlayerTurn(playerId: string): boolean {
    if (
      this.phase !== "PLAYING" &&
      this.phase !== "CABO_CALLED" &&
      this.phase !== "ACTION_PENDING"
    )
      return false;
    return this.currentPlayer.id === playerId;
  }

  private advanceTurn(): void {
    if (this.phase === "CABO_CALLED") {
      this.finalTurnsRemaining--;
      if (this.finalTurnsRemaining <= 0) {
        this.endRound();
        return;
      }
    }

    this.turnActionTaken = false;

    do {
      this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
    } while (
      !this.currentPlayer.isConnected ||
      (this.phase === "CABO_CALLED" &&
        this.currentPlayer.id === this.caboCallerId)
    );

    this.onStateUpdate?.();
  }

  private startSnapWindow(): void {
    this.snapWindowActive = true;
    this.clearSnapTimer();
    this.snapTimer = setTimeout(() => {
      this.snapWindowActive = false;
      this.onSnapWindowClose?.();
      this.advanceTurn();
    }, CONFIG.SNAP_WINDOW_MS);
  }

  private resetSnapTimer(): void {
    this.clearSnapTimer();
    this.snapTimer = setTimeout(() => {
      this.snapWindowActive = false;
      this.onSnapWindowClose?.();
      this.advanceTurn();
    }, CONFIG.SNAP_WINDOW_MS);
  }

  private clearSnapTimer(): void {
    if (this.snapTimer) {
      clearTimeout(this.snapTimer);
      this.snapTimer = null;
    }
  }

  private restorePhaseAfterAction(): void {
    if (this.caboCallerId) {
      this.phase = "CABO_CALLED";
    } else {
      this.phase = "PLAYING";
    }
  }

  private ensureDeckHasCards(): void {
    if (!this.deck.isEmpty()) return;
    if (this.discardPile.length <= 1) return;

    // Take all except top discard, shuffle them into the deck
    const topDiscard = this.discardPile.pop()!;
    this.deck.addCards(this.discardPile);
    this.discardPile = [topDiscard];
  }

  private endRound(): void {
    this.clearSnapTimer();
    this.phase = "ROUND_END";
    this.roundResults = calculateRoundResults(this.players, this.caboCallerId);

    // Update scores and play-style stats
    for (const result of this.roundResults.playerResults) {
      this.scores[result.playerId].push(result.roundScore);
      this.totalScores[result.playerId] += result.roundScore;
      result.stats = { ...this.stat(result.playerId) };
      this.gameStats[result.playerId] = addPlayerRoundStats(
        this.gameStats[result.playerId] ?? emptyPlayerRoundStats(),
        result.stats,
      );
    }

    // Check if game should end
    const gameOver = Object.values(this.totalScores).some(
      (score) => score >= CONFIG.GAME_END_SCORE,
    );
    if (gameOver) {
      this.phase = "GAME_OVER";
    }

    this.onRoundEnd?.(this.roundResults, gameOver);
    this.onStateUpdate?.();
  }

  startNextRound(): void {
    if (this.phase !== "ROUND_END") return;
    this.roundNumber++;
    this.startRound();
    this.onStateUpdate?.();
  }

  // ─── Play-Style Stats ───

  private stat(playerId: string): PlayerRoundStats {
    let stats = this.roundStats.get(playerId);
    if (!stats) {
      stats = emptyPlayerRoundStats();
      this.roundStats.set(playerId, stats);
    }
    return stats;
  }

  private countOpponentSwap(playerId: string, receivedCard: Card): void {
    const stats = this.stat(playerId);
    stats.opponentSwaps++;
    if (receivedCard.rank === BEST_RANK) stats.unicornsStolen++;
  }

  // ─── State Serialization ───

  getStateForPlayer(playerId: string): ClientGameState {
    const player = this.getPlayer(playerId);

    const myCards: PlayerCardInfo[] = player
      ? player.cards.map((card, index) => ({
          id: card.id,
          rank: player.peekedIndices.has(index) ? card.rank : null,
          isRevealed: player.peekedIndices.has(index),
        }))
      : [];

    const players: PlayerState[] = this.players.map((p) => ({
      id: p.id,
      name: p.name,
      cardCount: p.cardCount,
      isConnected: p.isConnected,
      isCaboCaller: p.isCaboCaller,
    }));

    const drawnCard = this.drawnCard.get(playerId) || null;

    return {
      roomCode: this.code,
      mode: this.mode,
      phase: this.phase,
      currentTurnPlayerId: this.currentPlayer?.id || null,
      players,
      myCards,
      discardTop:
        this.discardPile.length > 0
          ? this.discardPile[this.discardPile.length - 1]
          : null,
      deckCount: this.deck.remaining,
      drawnCard,
      actionType: this.pendingAction.get(playerId) || null,
      scores: this.scores,
      totalScores: this.totalScores,
      roundNumber: this.roundNumber,
      caboCallerId: this.caboCallerId,
      snapWindowActive: this.snapWindowActive,
      lastDiscard: this.lastDiscard,
      roundResults:
        this.phase === "ROUND_END" || this.phase === "GAME_OVER"
          ? this.roundResults
          : null,
      memorizeCardsLeft: player
        ? CONFIG.INITIAL_PEEK_COUNT - player.peekedIndices.size
        : 0,
      drawnFromDiscard: this.drawnFromDiscard.has(playerId),
      isMemorizeReady: this.memorizeReady.has(playerId),
      gameStats: this.gameStats,
    };
  }
}
