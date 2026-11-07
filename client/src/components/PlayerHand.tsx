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

  return (
    <div className="w-full">
      {/* All four cards in one row, on phones and desktop */}
      <div className="flex flex-row gap-2 md:gap-3 justify-center items-center">
        {/* New cards fly in from the drawn card above, leaving ones fly up to the discard pile,
            and the rest slide slowly enough to follow with the eye */}
        <AnimatePresence mode="popLayout" initial={false}>
          {gameState.myCards.map((card, index) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, y: -120, scale: 0.6 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -120, scale: 0.6, transition: { duration: 0.6 } }}
              transition={{ type: 'spring', stiffness: 90, damping: 16, mass: 1 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <Card
                  card={card}
                  faceDown={!card.isRevealed}
                  onClick={() => handleCardClick(index)}
                  selected={selectedCardIndex === index || swapSelection.includes(index)}
                  glowing={snapActive || !!highlightAt(index)}
                  size="lg"
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
