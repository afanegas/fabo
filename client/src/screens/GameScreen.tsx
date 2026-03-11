import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PlayerHand } from '../components/PlayerHand';
import { OpponentDisplay } from '../components/OpponentDisplay';
import { DrawAndDiscard } from '../components/DrawAndDiscard';
import { ActionModal } from '../components/ActionModal';
import { ScoreBoard } from '../components/ScoreBoard';
import { PeekOverlay } from '../components/PeekOverlay';

export const GameScreen: React.FC = () => {
  const {
    gameState,
    playerId,
    caboAlertActive,
    drawnCard,
    actionMode,
    error,
    snapNotification,
    callCabo,
    doneMemorizing,
    useAction,
    selectedCardIndex,
  } = useGameStore();

  if (!gameState) return null;

  const isMyTurn = gameState.currentTurnPlayerId === playerId;
  const opponents = gameState.players.filter(p => p.id !== playerId);
  const me = gameState.players.find(p => p.id === playerId);
  const canCallCabo = isMyTurn && !drawnCard && !actionMode &&
    !gameState.snapWindowActive &&
    gameState.phase === 'PLAYING';
  const isMemorize = gameState.phase === 'MEMORIZE';

  const handleOpponentCardClick = (targetPlayerId: string, cardIndex: number) => {
    if (actionMode === 'SPY') {
      useAction({ targetPlayerId, targetCardIndex: cardIndex });
    } else if (actionMode === 'SWAP' && selectedCardIndex !== null) {
      useAction({
        myCardIndex: selectedCardIndex,
        targetPlayerId,
        targetCardIndex: cardIndex,
      });
    }
  };

  return (
    <div className={`
      min-h-screen table-felt flex flex-col relative overflow-hidden
      ${caboAlertActive ? 'cabo-alert-border border-4' : ''}
    `}>
      {/* Cabo Alert Overlay */}
      <AnimatePresence>
        {caboAlertActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              boxShadow: 'inset 0 0 80px rgba(231,76,60,0.3)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-cabo-darker/80 backdrop-blur-sm border-b border-cabo-border/30 z-10">
        <div className="flex items-center gap-3">
          <h1
            className="font-display font-bold text-lg"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #f0d060)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CABO
          </h1>
          <span className="text-cabo-textDim text-xs">R{gameState.roundNumber}</span>
        </div>
        <div className="flex items-center gap-3">
          {gameState.phase === 'CABO_CALLED' && (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-cabo-red text-xs font-display font-bold"
            >
              CABO CALLED — Final Turns!
            </motion.span>
          )}
          <span className="text-cabo-textDim text-xs font-display">
            {gameState.roomCode}
          </span>
        </div>
      </div>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-cabo-red/90 text-white px-4 py-2 rounded-xl text-sm font-display shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Snap notification toast */}
      <AnimatePresence>
        {snapNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-cabo-green/90 text-white px-4 py-2 rounded-xl text-sm font-display shadow-lg"
          >
            ⚡ {snapNotification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opponents */}
      <div className="flex justify-center gap-3 px-4 py-3 flex-wrap">
        {opponents.map(p => (
          <OpponentDisplay
            key={p.id}
            player={p}
            onCardClick={(idx) => handleOpponentCardClick(p.id, idx)}
          />
        ))}
      </div>

      {/* Center: Draw & Discard piles */}
      <div className="flex-1 flex items-center justify-center">
        <DrawAndDiscard />
      </div>

      {/* Turn indicator */}
      <div className="text-center py-1">
        {gameState.snapWindowActive && (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-cabo-green font-display text-sm font-semibold animate-pulse"
          >
            ⚡ Snap window open...
          </motion.p>
        )}
        {isMyTurn && !isMemorize && !gameState.snapWindowActive && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-cabo-accent font-display text-sm font-semibold"
          >
            {drawnCard ? 'Select a card to swap, or Discard' :
              actionMode ? `Use your ${actionMode} action` :
              'Your turn — Draw or Call Cabo'}
          </motion.p>
        )}
        {!isMyTurn && !isMemorize && !gameState.snapWindowActive && gameState.phase !== 'ROUND_END' && gameState.phase !== 'GAME_OVER' && (
          <p className="text-cabo-textDim font-display text-xs">
            {gameState.players.find(p => p.id === gameState.currentTurnPlayerId)?.name}'s turn
          </p>
        )}
      </div>

      {/* Player's hand */}
      <div className="px-4 pb-4">
        <PlayerHand />

        {/* Action buttons */}
        <div className="flex justify-center gap-3 mt-3">
          {canCallCabo && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={callCabo}
              className="btn-danger text-sm"
            >
              🔔 Call CABO
            </motion.button>
          )}

          {isMemorize && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={doneMemorizing}
              className="btn-primary text-sm"
            >
              {gameState.memorizeCardsLeft > 0
                ? `Skip & Ready (${gameState.memorizeCardsLeft} peeks left)`
                : 'Ready! ✓'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Overlays */}
      {actionMode && <ActionModal />}
      <ScoreBoard />
      <PeekOverlay />
    </div>
  );
};
