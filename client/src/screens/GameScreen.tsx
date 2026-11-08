import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useGameActions } from '../hooks/useGameActions';
import { PlayerHand } from '../components/PlayerHand';
import { OpponentDisplay } from '../components/OpponentDisplay';
import { DrawAndDiscard } from '../components/DrawAndDiscard';
import { ActionModal } from '../components/ActionModal';
import { ScoreBoard } from '../components/ScoreBoard';
import { PeekOverlay } from '../components/PeekOverlay';
import { GameMessages } from '../components/GameMessages';
import { StarterPick } from '../components/StarterPick';
import { LogOut } from 'lucide-react';
import { CARD_ACTIONS } from '../constants/cards';

export const GameScreen: React.FC = () => {
  const {
    caboAlertActive,
    error,
    leaveGame,
  } = useGameStore();

  const {
    gameState,
    drawnCard,
    actionMode,
    isMyTurn,
    opponents,
    canCallCabo,
    isMemorize,
    handleOpponentCardClick,
    callCabo,
    doneMemorizing,
  } = useGameActions();

  if (!gameState) return null;

  return (
    <div className={`
      h-[100dvh] table-felt flex flex-col relative overflow-hidden
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
      <div className="shrink-0 flex justify-between items-center px-4 py-2 bg-cabo-darker/80 backdrop-blur-sm border-b border-cabo-border/30 z-10">
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
          <span className="text-cabo-textDim text-xs font-display">
            {gameState.roomCode}
          </span>
          <button
            onClick={leaveGame}
            className="flex items-center gap-1.5 text-cabo-textDim hover:text-cabo-red transition-colors text-xs font-display px-2 py-1 rounded border border-cabo-border/30 hover:border-cabo-red/50"
            title="Return to Lobby"
          >
            <LogOut size={14} /> Leave
          </button>
        </div>
      </div>

      {/* Cabo called: full-width strip, always in view */}
      {gameState.phase === 'CABO_CALLED' && (
        <motion.div
          animate={{ opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="shrink-0 bg-cabo-red text-white text-center text-xs md:text-sm font-display font-bold py-1 z-10"
        >
          🔔 CABO called by {gameState.players.find(p => p.id === gameState.caboCallerId)?.name} — final turns!
        </motion.div>
      )}

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

      {/* Opponents across the table. With one opponent their cards are as big as mine. */}
      <div className="shrink-0 flex flex-wrap justify-center gap-2 md:gap-3 px-2 pt-2">
        {opponents.map(p => (
          <OpponentDisplay
            key={p.id}
            player={p}
            size={opponents.length === 1 ? 'table' : opponents.length === 2 ? 'md' : 'sm'}
            onCardClick={(idx) => handleOpponentCardClick(p.id, idx)}
          />
        ))}
      </div>

      {/* Center: Draw & Discard piles with the messages right below, takes the space that is left */}
      <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center gap-3 py-2">
        {/* The table: a soft oval behind the piles, setting them apart from both hands */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-3 inset-y-1 md:inset-x-[18%] rounded-[50%] border border-white/[0.06]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(46,204,113,0.10) 0%, rgba(46,204,113,0.03) 55%, transparent 75%)' }}
        />
        <div className="relative w-full flex flex-col items-center gap-3">
          <DrawAndDiscard />
          <GameMessages />
        </div>
      </div>

      {/* Turn indicator */}
      <div className="text-center py-1 px-2 shrink-0">
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
            {drawnCard ? (gameState.drawnFromDiscard
                ? 'Select a card to swap (or several of the same value), or put it back'
                : drawnCard && CARD_ACTIONS[drawnCard.rank]
                  ? `Select a card to swap (or several of the same value), use the ${CARD_ACTIONS[drawnCard.rank]?.toLowerCase()} power, or Discard`
                  : 'Select a card to swap (or several of the same value), or Discard') :
              actionMode ? `Use your ${actionMode} action` :
              'Your turn — Draw or Call Cabo'}
          </motion.p>
        )}
        {!isMyTurn && !isMemorize && !gameState.snapWindowActive && !['ROUND_END', 'GAME_OVER', 'STARTER_PICK'].includes(gameState.phase) && (
          <p className="text-cabo-textDim font-display text-xs">
            {gameState.players.find(p => p.id === gameState.currentTurnPlayerId)?.name}'s turn
          </p>
        )}
        {isMemorize && gameState.isMemorizeReady && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-cabo-accent font-display text-xs"
          >
            Waiting for other players...
          </motion.p>
        )}
      </div>

      {/* Player's hand */}
      <div className="px-4 pb-3 md:pb-4 shrink-0">
        <PlayerHand
          centerSlot={
            <>
              {canCallCabo && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={callCabo}
                  className="btn-danger text-xs md:hidden"
                >
                  🔔 Call CABO
                </motion.button>
              )}
              {isMemorize && !gameState.isMemorizeReady && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={doneMemorizing}
                  className="btn-primary text-xs md:hidden"
                >
                  {gameState.memorizeCardsLeft > 0
                    ? `Skip & Ready`
                    : 'Ready! ✓'}
                </motion.button>
              )}
            </>
          }
        />

        {/* Desktop action buttons (below cards) */}
        <div className="hidden md:flex justify-center gap-3 mt-3">
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

          {isMemorize && !gameState.isMemorizeReady && (
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
      <StarterPick />

      {/* Abandoned game overlay */}
      <AnimatePresence>
        {gameState.phase === 'ABANDONED' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.85)' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-cabo-dark border border-cabo-border/40 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl"
            >
              <div className="text-4xl mb-4">👋</div>
              <h2 className="text-xl font-display font-bold text-cabo-text mb-2">
                Game Ended
              </h2>
              <p className="text-cabo-textDim text-sm mb-6">
                A player has left the game. Not enough players to continue.
                Start a new game from the lobby!
              </p>
              <button
                onClick={leaveGame}
                className="btn-primary text-sm w-full"
              >
                Return to Lobby
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
