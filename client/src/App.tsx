import React from 'react';
import { useGameStore } from './store/gameStore';
import { LobbyScreen } from './screens/LobbyScreen';
import { GameScreen } from './screens/GameScreen';

const App: React.FC = () => {
  const { gameState } = useGameStore();

  const inGame = gameState && gameState.phase !== 'WAITING';

  return inGame ? <GameScreen /> : <LobbyScreen />;
};

export default App;
