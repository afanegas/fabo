import React from "react";
import { useGameStore } from "./store/gameStore";
import { LandingPage } from "./screens/LandingPage";
import { LobbyScreen } from "./screens/LobbyScreen";
import { GameScreen } from "./screens/GameScreen";
import { Analytics } from "@vercel/analytics/next";

const App: React.FC = () => {
  const { gameState, roomCode } = useGameStore();

  <Analytics />;

  // In active game (playing, memorize, etc.)
  const inGame = gameState && gameState.phase !== "WAITING";
  if (inGame) return <GameScreen />;

  // In a room, waiting for players
  if (roomCode && gameState?.phase === "WAITING") return <LobbyScreen />;

  // Landing page
  return <LandingPage />;
};

export default App;
