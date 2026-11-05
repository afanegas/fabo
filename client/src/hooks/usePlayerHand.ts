import { useGameStore, mergeHighlights } from '../store/gameStore';

export const usePlayerHand = () => {
  const {
    gameState,
    playerId,
    drawnCard,
    selectedCardIndex,
    setSelectedCardIndex,
    swapSelection,
    toggleSwapSelection,
    actionMode,
    keepDrawnCard,
    snap,
    peekInitialCard,
    useAction,
    actionHighlights,
    personalNotices,
  } = useGameStore();

  const isMyTurn = gameState?.currentTurnPlayerId === playerId;
  const isMemorize = gameState?.phase === 'MEMORIZE';
  const snapActive = gameState?.snapWindowActive;
  const hasDrawn = !!drawnCard;

  const handleCardClick = (index: number) => {
    if (isMemorize) {
      peekInitialCard(index);
      return;
    }

    if (actionMode === 'PEEK') {
      useAction({ myCardIndex: index });
      return;
    }

    if (actionMode === 'SWAP') {
      if (selectedCardIndex === null) {
        setSelectedCardIndex(index);
      } else if (selectedCardIndex === index) {
        setSelectedCardIndex(null);
      }
      return;
    }

    if (snapActive) {
      snap(index);
      return;
    }

    // With a drawn card, tap one card to swap it, or several cards of the same value
    // to swap them all for the drawn card
    if (hasDrawn && isMyTurn) {
      toggleSwapSelection(index);
      return;
    }
  };

  const handleSwapConfirm = () => {
    if (swapSelection.length > 0 && drawnCard) {
      keepDrawnCard(swapSelection);
    }
  };

  return {
    gameState,
    playerId,
    highlights: mergeHighlights(actionHighlights, personalNotices),
    drawnCard,
    selectedCardIndex,
    swapSelection,
    actionMode,
    isMemorize,
    snapActive,
    handleCardClick,
    handleSwapConfirm,
  };
};
