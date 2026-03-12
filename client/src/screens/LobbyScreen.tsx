import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLobbyScreen } from '../hooks/useLobbyScreen';

export const LobbyScreen: React.FC = () => {
  const {
    roomCode,
    gameState,
    playerId,
    copied,
    isHost,
    handleCopyCode,
    startGame,
  } = useLobbyScreen();

  if (!roomCode || !gameState || gameState.phase !== 'WAITING') return null;

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
            <div className="flex bg-cabo-darker rounded-xl p-2 border border-cabo-accent/20 cursor-pointer hover:border-cabo-accent/50 transition-colors group" onClick={handleCopyCode}>
              <div className="flex gap-1 pr-4">
                {roomCode.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="w-8 h-10 flex items-center justify-center bg-cabo-dark border border-cabo-accent/30 rounded-md text-xl font-display font-bold text-cabo-accent"
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
              <div className="flex items-center justify-center px-2 text-cabo-textDim group-hover:text-cabo-accent transition-colors border-l border-cabo-border/50 pl-4 relative">
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span
                      key="copied"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="text-cabo-green text-xl absolute"
                    >
                      ✓
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="text-xl absolute"
                    >
                      📋
                    </motion.span>
                  )}
                </AnimatePresence>
                <div className="w-5" /> {/* Spacer to keep layout stable */}
              </div>
            </div>
          </div>
          {copied && (
            <p className="text-cabo-green text-xs font-display absolute w-full text-center left-0 mt-1">Copied to clipboard!</p>
          )}
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
};
