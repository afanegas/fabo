import { useGameStore } from '../store/gameStore';

export const useGameActions = () => {
  const {
    gameState,
    playerId,
    drawnCard,
    actionMode,
    selectedCardIndex,
    useAction,
    callCabo,
    doneMemorizing,
  } = useGameStore();

  const isMyTurn = gameState?.currentTurnPlayerId === playerId;
  const opponents = gameState?.players.filter((p) => p.id !== playerId) || [];
  const me = gameState?.players.find((p) => p.id === playerId);
  
  const canCallCabo = isMyTurn && !drawnCard && !actionMode &&
    !gameState?.snapWindowActive &&
    gameState?.phase === 'PLAYING';
    
  const isMemorize = gameState?.phase === 'MEMORIZE';

  const handleOpponentCardClick = (targetPlayerId: string, cardIndex: number) => {
    if (actionMode === 'SPY') {
      useAction({ targetPlayerId, targetCardIndex: cardIndex });
    } else if (actionMode === 'SWAP' && selectedCardIndex !== null) {
      useAction({
        myCardIndex: selectedCardIndex,
        targetPlayerId,
        targetCardIndex: cardIndex,
      });
    }
  };

  return {
    gameState,
    playerId,
    drawnCard,
    actionMode,
    isMyTurn,
    opponents,
    me,
    canCallCabo,
    isMemorize,
    handleOpponentCardClick,
    callCabo,
    doneMemorizing,
  };
};
