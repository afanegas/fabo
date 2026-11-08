import { useGameStore } from '../store/gameStore';

export const useDrawAndDiscard = () => {
  const {
    gameState,
    playerId,
    drawnCard,
    drawFromDeck,
    drawFromDiscard,
    returnToDiscard,
    discardDrawnCard,
    actionMode,
  } = useGameStore();

  const isMyTurn = gameState?.currentTurnPlayerId === playerId;
  const canDraw = !!gameState && isMyTurn && !drawnCard && !actionMode &&
    !gameState.snapWindowActive &&
    (gameState.phase === 'PLAYING' || gameState.phase === 'CABO_CALLED');
  const canDiscard = !!drawnCard && !gameState?.drawnFromDiscard;

  // The card an opponent is holding on their turn (their hidden or open drawn card)
  const opponentDrawn =
    gameState?.opponentDrawn && gameState.opponentDrawn.playerId !== playerId ? gameState.opponentDrawn : null;
  const opponentDrawnName = opponentDrawn
    ? gameState?.players.find((p) => p.id === opponentDrawn.playerId)?.name ?? ''
    : '';

  return {
    gameState,
    opponentDrawn,
    opponentDrawnName,
    drawnCard,
    canDraw,
    canDiscard,
    drawFromDeck,
    drawFromDiscard,
    returnToDiscard,
    discardDrawnCard,
  };
};
