import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { usePlayerHand } from '../hooks/usePlayerHand';
import { CardActionMarker } from './CardActionMarker';
import { FreshCardMarker } from './FreshCardMarker';

interface PlayerHandProps {
  centerSlot?: React.ReactNode;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ centerSlot }) => {
  const {
    gameState,
    playerId,
    isMyTurn,
    highlights,
    freshCardIds,
    drawnCard,
    selectedCardIndex,
    swapSelection,
    actionMode,
    isMemorize,
    snapActive,
    handleCardClick,
    handleSwapConfirm,
  } = usePlayerHand();

  if (!gameState) return null;

  const highlightAt = (index: number) =>
    highlights.find((h) => h.playerId === playerId && h.cardIndex === index);
  const showSwapButton = swapSelection.length > 0 && drawnCard && !actionMode;
  const swapLabel = swapSelection.length === 1 ? 'Swap selected card' : `Swap ${swapSelection.length} cards for 1`;

  const myName = gameState.players.find((p) => p.id === playerId)?.name ?? 'You';

  return (
    <div className="w-full">
      {/* My hand in its own panel, set apart from the piles, mirroring the opponent's panel */}
      <div
        className={`mx-auto w-fit rounded-3xl border px-3 pt-2.5 pb-2 md:px-4 bg-gradient-to-b from-white/[0.06] to-white/[0.02]
          backdrop-blur-md transition-all duration-500
          ${isMyTurn ? 'border-cabo-accent/60 shadow-[0_0_30px_rgba(212,175,55,0.25)]' : 'border-white/10'}`}
      >
        {/* All four cards in one row, on phones and desktop */}
        <div className="flex flex-row gap-2 md:gap-3 justify-center items-center">
          {/* Each card carries its id as layoutId: a new card flies in from wherever it was
              (drawn card, discard pile, opponent's hand), leaving ones fly to where they go,
              and the rest slide slowly enough to follow with the eye */}
          <AnimatePresence mode="popLayout" initial={false}>
            {gameState.myCards.map((card, index) => (
              <motion.div
                key={card.id}
                layoutId={card.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.5 } }}
                transition={{ type: 'spring', stiffness: 70, damping: 15 }}
                className="flex flex-col items-center"
              >
                <div className="relative">
                  <Card
                    card={card}
                    faceDown={!card.isRevealed}
                    onClick={() => handleCardClick(index)}
                    selected={selectedCardIndex === index || swapSelection.includes(index)}
                    glowing={snapActive || !!highlightAt(index)}
                    size="table"
                  />
                  <CardActionMarker highlight={highlightAt(index)} />
                  {freshCardIds.includes(card.id) && <FreshCardMarker />}
                </div>
                {/* Quiet position number, the same numbers the messages use */}
                <span className="mt-1 text-[10px] leading-none font-display text-cabo-textDim/50">{index + 1}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-2 mt-1.5">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-display font-bold
              ${isMyTurn ? 'bg-cabo-accent text-cabo-dark' : 'bg-white/10 text-cabo-text'}`}
          >
            {myName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-display font-semibold">{myName}</span>
          <span className="text-[10px] font-display text-cabo-textDim">· your hand</span>
        </div>
      </div>

      {/* Mobile: buttons & labels below the cards */}
      <div className="flex md:hidden flex-col items-center justify-center mt-3 gap-2">
        {showSwapButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button
              onClick={handleSwapConfirm}
              className="btn-primary text-xs px-3 py-2 whitespace-nowrap"
            >
              {swapLabel}
            </button>
          </motion.div>
        )}
        {centerSlot}

        {isMemorize && gameState.memorizeCardsLeft > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-cabo-accent text-xs font-display"
          >
            Peek at {gameState.memorizeCardsLeft} more card{gameState.memorizeCardsLeft > 1 ? 's' : ''} to memorize
          </motion.p>
        )}

        {snapActive && (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-cabo-green text-xs font-display font-semibold animate-pulse"
          >
            ⚡ SNAP WINDOW — Tap a matching card!
          </motion.p>
        )}
      </div>

      {/* Desktop swap confirm button */}
      {showSwapButton && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex justify-center mt-3"
        >
          <button
            onClick={handleSwapConfirm}
            className="btn-primary text-sm"
          >
            {swapLabel}
          </button>
        </motion.div>
      )}

      {/* Desktop phase-specific labels */}
      {isMemorize && gameState.memorizeCardsLeft > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hidden md:block text-center mt-3 text-cabo-accent text-sm font-display"
        >
          Peek at {gameState.memorizeCardsLeft} more card{gameState.memorizeCardsLeft > 1 ? 's' : ''} to memorize
        </motion.p>
      )}

      {snapActive && (
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden md:block text-center mt-3 text-cabo-green text-sm font-display font-semibold animate-pulse"
        >
          ⚡ SNAP WINDOW — Tap a matching card!
        </motion.p>
      )}
    </div>
  );
};
