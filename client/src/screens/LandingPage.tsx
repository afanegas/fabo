import React, { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { HeroScene } from "../components/landing/HeroScene";
import { TutorialSection } from "../components/landing/TutorialSection";
import { CaboCallSection } from "../components/landing/CaboCallSection";
import { FooterSection } from "../components/landing/FooterSection";
import { GameRulesCarousel } from "../components/GameRulesCarousel";

export const LandingPage: React.FC = () => {
  const {
    playerName,
    setPlayerName,
    error,
    createRoom,
    joinRoom,
    initializeSocket,
  } = useGameStore();

  const [joinCode, setJoinCode] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    initializeSocket();
  }, []);

  const handleCreateRoom = () => {
    setPendingAction(() => createRoom);
    setShowRules(true);
  };

  const handleJoinRoom = () => {
    // Scroll to hero if not there
    const hero = document.getElementById("hero");
    if (hero) hero.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmitJoin = () => {
    if (joinCode.trim()) {
      setPendingAction(() => () => joinRoom(joinCode));
      setShowRules(true);
    }
  };

  const executePendingAction = () => {
    setShowRules(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  return (
    <div className="landing-page min-h-screen bg-cabo-darker text-cabo-text">
      <HeroScene
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        playerName={playerName}
        setPlayerName={setPlayerName}
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        onSubmitJoin={handleSubmitJoin}
        error={error}
        onShowRules={() => setShowRules(true)}
      />

      <TutorialSection />

      <CaboCallSection />

      <FooterSection
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />

      {showRules && (
        <GameRulesCarousel onClose={executePendingAction} />
      )}
    </div>
  );
};
