import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export const LobbyScreen: React.FC = () => {
  const {
    playerName,
    setPlayerName,
    roomCode,
    gameState,
    error,
    createRoom,
    joinRoom,
    startGame,
    doneMemorizing,
    playerId,
    initializeSocket,
  } = useGameStore();

  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');

  useEffect(() => {
    initializeSocket();
  }, []);

  // In a room, waiting for players
  if (roomCode && gameState?.phase === 'WAITING') {
    const isHost = gameState.players[0]?.id === playerId;
    return (
      <div className="min-h-screen flex items-center justify-center p-4 table-felt">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 max-w-md w-full space-y-6 text-center"
        >
          <h2 className="text-2xl font-display font-bold text-cabo-accent">Waiting Room</h2>

          <div className="space-y-2">
            <p className="text-cabo-textDim text-sm">Share this code:</p>
            <div className="flex items-center justify-center gap-2">
              {roomCode.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-10 h-12 flex items-center justify-center bg-cabo-dark border border-cabo-accent/30 rounded-lg text-2xl font-display font-bold text-cabo-accent"
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-display text-cabo-textDim">
              Players ({gameState.players.length}/4):
            </p>
            <div className="flex flex-col gap-2">
              {gameState.players.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 bg-cabo-surface/50 rounded-lg px-4 py-2"
                >
                  <div className="w-2 h-2 rounded-full bg-cabo-green" />
                  <span className="font-display text-sm">
                    {p.name}
                    {p.id === playerId && <span className="text-cabo-accent ml-1">(You)</span>}
                    {i === 0 && <span className="text-cabo-textDim ml-1">· Host</span>}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {isHost && gameState.players.length >= 2 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={startGame}
              className="btn-primary w-full text-lg"
            >
              Start Game 🎴
            </motion.button>
          )}

          {isHost && gameState.players.length < 2 && (
            <p className="text-cabo-textDim text-sm">Need at least 2 players to start</p>
          )}

          {!isHost && (
            <p className="text-cabo-textDim text-sm animate-pulse">Waiting for host to start...</p>
          )}
        </motion.div>
      </div>
    );
  }

  // Memorize phase
  if (roomCode && gameState?.phase === 'MEMORIZE') {
    return null; // Handled by GameScreen
  }

  // Main menu
  return (
    <div className="min-h-screen flex items-center justify-center p-4 table-felt">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cabo-accent/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 12}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="glass-panel p-8 max-w-md w-full space-y-6"
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <motion.h1
            className="text-5xl font-display font-extrabold"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #f0d060, #d4af37)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CABO
          </motion.h1>
          <p className="text-cabo-textDim text-sm font-display">
            A game of memory & deception
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-cabo-red/10 border border-cabo-red/30 rounded-xl px-4 py-2 text-cabo-red text-sm text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name input */}
        <div>
          <label className="text-xs font-display text-cabo-textDim mb-1 block">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Enter your name..."
            className="input-field"
            maxLength={16}
          />
        </div>

        <AnimatePresence mode="wait">
          {mode === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              <button onClick={() => { setMode('create'); createRoom(); }} className="btn-primary w-full text-lg">
                Create Room
              </button>
              <button onClick={() => setMode('join')} className="btn-secondary w-full text-lg">
                Join Room
              </button>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-display text-cabo-textDim mb-1 block">Room Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABCD12"
                  className="input-field text-center tracking-[0.3em] text-lg font-display"
                  maxLength={6}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setMode('menu')} className="btn-secondary flex-1">
                  Back
                </button>
                <button onClick={() => joinRoom(joinCode)} className="btn-primary flex-1">
                  Join
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rules hint */}
        <p className="text-center text-cabo-textDim text-[10px] font-display">
          2-4 Players · Memory · Strategy · Bluffing
        </p>
      </motion.div>
    </div>
  );
};
