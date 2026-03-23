import React, { useEffect, useState } from "react";
import { useGameStore } from "./store/gameStore";
import { LandingPage } from "./screens/LandingPage";
import { LobbyScreen } from "./screens/LobbyScreen";
import { GameScreen } from "./screens/GameScreen";
import { Analytics } from "@vercel/analytics/react";

const App: React.FC = () => {
  const { gameState, roomCode, playerId, reconnectSession, initializeSocket } = useGameStore();
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    // If we have persisted session credentials but no game state,
    // attempt to reconnect to the server
    if (playerId && roomCode && !gameState) {
      setIsReconnecting(true);
      initializeSocket();
      reconnectSession().finally(() => setIsReconnecting(false));
    }
  }, []); // Only run once on mount

  if (isReconnecting) {
    return (
      <>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#0a0a0f',
          color: '#e0e0e0',
          fontSize: '1.2rem',
          fontFamily: 'Inter, sans-serif',
        }}>
          Reconnecting to game...
        </div>
        <Analytics />
      </>
    );
  }

  // In active game (playing, memorize, etc.)
  const inGame = gameState && gameState.phase !== "WAITING";
  if (inGame) {
    return (
      <>
        <GameScreen />
        <Analytics />
      </>
    );
  }

  // In a room, waiting for players
  if (roomCode && gameState?.phase === "WAITING") {
    return (
      <>
        <LobbyScreen />
        <Analytics />
      </>
    );
  }

  // Landing page
  return (
    <>
      <LandingPage />
      <Analytics />
    </>
  );
};

export default App;
