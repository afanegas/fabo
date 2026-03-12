import { useGameStore } from '../store/gameStore';

export const useDrawAndDiscard = () => {
  const {
    gameState,
    playerId,
    drawnCard,
    drawFromDeck,
    drawFromDiscard,
    discardDrawnCard,
    actionMode,
  } = useGameStore();

  const isMyTurn = gameState?.currentTurnPlayerId === playerId;
  const canDraw = !!gameState && isMyTurn && !drawnCard && !actionMode &&
    !gameState.snapWindowActive &&
    (gameState.phase === 'PLAYING' || gameState.phase === 'CABO_CALLED');
  const canDiscard = !!drawnCard && !gameState?.drawnFromDiscard;

  return {
    gameState,
    drawnCard,
    canDraw,
    canDiscard,
    drawFromDeck,
    drawFromDiscard,
    discardDrawnCard,
  };
};
