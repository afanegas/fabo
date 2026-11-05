import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export const useActionModal = () => {
  const { 
    actionMode, 
    gameState, 
    playerId, 
    selectedCardIndex, 
    setSelectedCardIndex, 
    useAction, 
    skipAction 
  } = useGameStore();

  const [targetPlayerId, setTargetPlayerId] = useState<string | null>(null);
  const [targetCardIndex, setTargetCardIndex] = useState<number | null>(null);
  const [lookSwapPhase, setLookSwapPhase] = useState<'look' | 'swap'>('look');
  const [lookTarget, setLookTarget] = useState<'self' | 'opponent' | null>(null);

  // With only one opponent there is nothing to choose: pick them right away
  const opponents = gameState?.players.filter((p) => p.id !== playerId) ?? [];
  const onlyOpponentId = opponents.length === 1 ? opponents[0].id : null;
  const needsOpponent = actionMode === 'SPY' || actionMode === 'SWAP';
  useEffect(() => {
    if (needsOpponent && onlyOpponentId && !targetPlayerId) setTargetPlayerId(onlyOpponentId);
  }, [needsOpponent, onlyOpponentId, targetPlayerId]);

  const resetState = () => {
    setSelectedCardIndex(null);
    setTargetPlayerId(null);
    setTargetCardIndex(null);
    setLookSwapPhase('look');
    setLookTarget(null);
  };

  const handleConfirm = () => {
    if (actionMode === 'PEEK' && selectedCardIndex !== null) {
      useAction({ myCardIndex: selectedCardIndex });
      setSelectedCardIndex(null);
    } else if (actionMode === 'SPY' && targetPlayerId && targetCardIndex !== null) {
      useAction({ targetPlayerId, targetCardIndex });
      setTargetPlayerId(null);
      setTargetCardIndex(null);
    } else if (actionMode === 'SWAP' && selectedCardIndex !== null && targetPlayerId && targetCardIndex !== null) {
      useAction({ myCardIndex: selectedCardIndex, targetPlayerId, targetCardIndex });
      setSelectedCardIndex(null);
      setTargetPlayerId(null);
      setTargetCardIndex(null);
    } else if (actionMode === 'LOOK_AND_SWAP') {
      if (lookSwapPhase === 'look') {
        if (lookTarget === 'self' && selectedCardIndex !== null) {
          useAction({ myCardIndex: selectedCardIndex }, true).then(() => {
            setLookSwapPhase('swap');
            setSelectedCardIndex(null);
            setLookTarget(null);
          });
        } else if (lookTarget === 'opponent' && targetPlayerId && targetCardIndex !== null) {
          useAction({ targetPlayerId, targetCardIndex }, true).then(() => {
            setLookSwapPhase('swap');
            setTargetPlayerId(null);
            setTargetCardIndex(null);
            setLookTarget(null);
          });
        }
      } else {
        if (selectedCardIndex !== null && targetPlayerId && targetCardIndex !== null) {
          useAction({ myCardIndex: selectedCardIndex, targetPlayerId, targetCardIndex });
          resetState();
        }
      }
    }
  };

  const handleSkip = () => {
    if (actionMode === 'LOOK_AND_SWAP' && lookSwapPhase === 'swap') {
      useAction({});
      resetState();
    } else {
      skipAction();
      resetState();
    }
  };

  let canConfirm = false;
  if (actionMode === 'PEEK') canConfirm = selectedCardIndex !== null;
  if (actionMode === 'SPY') canConfirm = !!targetPlayerId && targetCardIndex !== null;
  if (actionMode === 'SWAP') canConfirm = selectedCardIndex !== null && !!targetPlayerId && targetCardIndex !== null;
  if (actionMode === 'LOOK_AND_SWAP') {
    if (lookSwapPhase === 'look') {
      canConfirm = (lookTarget === 'self' && selectedCardIndex !== null) ||
        (lookTarget === 'opponent' && !!targetPlayerId && targetCardIndex !== null);
    } else {
      canConfirm = selectedCardIndex !== null && !!targetPlayerId && targetCardIndex !== null;
    }
  }

  const titles: Record<string, string> = {
    PEEK: '👁 Peek — Look at one of your cards',
    SPY: '🔍 Spy — Look at an opponent\'s card',
    SWAP: '🔄 Swap — Swap a card with an opponent',
    LOOK_AND_SWAP: lookSwapPhase === 'look'
      ? '👁 Queen — Look at one card'
      : '🔄 Queen — Now swap (or skip)',
  };

  const opponentName = onlyOpponentId ? opponents[0].name : null;
  const descriptions: Record<string, string> = {
    PEEK: 'Select one of your cards to peek at',
    SPY: opponentName
      ? `Choose one of ${opponentName}'s cards`
      : 'Select an opponent, then choose one of their cards',
    SWAP: opponentName
      ? `Select one of your cards and one of ${opponentName}'s cards to swap (blind)`
      : 'Select one of your cards and one opponent\'s card to swap (blind)',
    LOOK_AND_SWAP: lookSwapPhase === 'look'
      ? 'Choose a card to look at (yours or an opponent\'s)'
      : 'Now swap any of your cards with an opponent\'s card, or skip',
  };

  const title = actionMode ? titles[actionMode] : '';
  const description = actionMode ? descriptions[actionMode] : '';

  return {
    actionMode,
    gameState,
    playerId,
    selectedCardIndex,
    setSelectedCardIndex,
    targetPlayerId,
    setTargetPlayerId,
    onlyOpponentId,
    targetCardIndex,
    setTargetCardIndex,
    lookSwapPhase,
    setLookSwapPhase,
    lookTarget,
    setLookTarget,
    title,
    description,
    canConfirm,
    handleConfirm,
    handleSkip
  };
};
