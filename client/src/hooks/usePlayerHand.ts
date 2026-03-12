import { useGameStore } from '../store/gameStore';

export const usePlayerHand = () => {
  const {
    gameState,
    playerId,
    drawnCard,
    selectedCardIndex,
    setSelectedCardIndex,
    actionMode,
    keepDrawnCard,
    snap,
    peekInitialCard,
    useAction,
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

    if (hasDrawn && isMyTurn) {
      if (selectedCardIndex === index) {
        setSelectedCardIndex(null);
      } else {
        setSelectedCardIndex(index);
      }
      return;
    }
  };

  const handleSwapConfirm = () => {
    if (selectedCardIndex !== null && drawnCard) {
      keepDrawnCard([selectedCardIndex]);
    }
  };

  return {
    gameState,
    drawnCard,
    selectedCardIndex,
    actionMode,
    isMemorize,
    snapActive,
    handleCardClick,
    handleSwapConfirm,
  };
};
