import { useGameStore } from '../store/gameStore';

export const usePeekOverlay = () => {
  const { peekedCard, showPeekedCard, clearPeekedCard } = useGameStore();

  return {
    peekedCard,
    showPeekedCard,
    clearPeekedCard,
  };
};
