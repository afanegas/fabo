import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export const useLobbyScreen = () => {
  const {
    roomCode,
    gameState,
    playerId,
    startGame,
    leaveGame,
    initializeSocket,
    updateSettings,
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
  const isChampionship = gameState?.mode === 'championship';
  // In a championship both players choose together, otherwise the host decides
  const canEditSettings = isChampionship || isHost;
  const connectedCount = gameState?.players.filter((p) => p.isConnected).length ?? 0;

  return {
    roomCode,
    gameState,
    playerId,
    copied,
    isHost,
    isChampionship,
    connectedCount,
    handleCopyCode,
    startGame,
    leaveGame,
    canEditSettings,
    updateSettings,
  };
};
