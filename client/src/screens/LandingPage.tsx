import React from "react";
import { HeroScene } from "../components/landing/HeroScene";
import { TutorialSection } from "../components/landing/TutorialSection";
import { CaboCallSection } from "../components/landing/CaboCallSection";
import { FooterSection } from "../components/landing/FooterSection";
import { GameRulesCarousel } from "../components/GameRulesCarousel";
import { useLandingPage } from "../hooks/useLandingPage";

export const LandingPage: React.FC = () => {
  const {
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
  } = useLandingPage();

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

      {showRules && <GameRulesCarousel onClose={() => setShowRules(false)} />}
    </div>
  );
};
