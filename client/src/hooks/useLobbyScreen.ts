import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export const useLobbyScreen = () => {
  const {
    roomCode,
    gameState,
    playerId,
    startGame,
    initializeSocket,
  } = useGameStore();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHost = gameState?.players[0]?.id === playerId;

  return {
    roomCode,
    gameState,
    playerId,
    copied,
    isHost,
    handleCopyCode,
    startGame,
  };
};
