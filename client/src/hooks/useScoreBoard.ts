import { useGameStore } from '../store/gameStore';

export const useScoreBoard = () => {
  const { gameState, showScoreBoard, nextRound, playerId } = useGameStore();

  const isGameOver = gameState?.phase === 'GAME_OVER';

  // Find overall winner for game over
  const sortedTotals = gameState?.totalScores 
    ? Object.entries(gameState.totalScores).sort(([, a], [, b]) => a - b)
    : [];
  
  const overallWinnerId = sortedTotals[0]?.[0];

  return {
    gameState,
    showScoreBoard,
    isGameOver,
    sortedTotals,
    overallWinnerId,
    playerId,
    nextRound,
  };
};
