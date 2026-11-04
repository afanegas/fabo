import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export const useLandingPage = () => {
  const {
    playerName,
    setPlayerName,
    error,
    createRoom,
    joinRoom,
    initializeSocket,
    setChampionshipOpen,
  } = useGameStore();

  const [joinCode, setJoinCode] = useState("");
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  const handleCreateRoom = () => {
    createRoom();
  };

  const handleJoinRoom = () => {
    const hero = document.getElementById("hero");
    if (hero) hero.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmitJoin = () => {
    if (joinCode.trim()) {
      joinRoom(joinCode);
    }
  };

  return {
    playerName,
    setPlayerName,
    joinCode,
    setJoinCode,
    error,
    showRules,
    setShowRules,
    handleCreateRoom,
    handleJoinRoom,
    handleSubmitJoin,
    handleOpenChampionship: () => setChampionshipOpen(true),
  };
};
