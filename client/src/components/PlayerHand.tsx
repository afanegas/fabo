import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { usePlayerHand } from '../hooks/usePlayerHand';

interface PlayerHandProps {
  centerSlot?: React.ReactNode;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ centerSlot }) => {
  const {
    gameState,
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

  const showSwapButton = swapSelection.length > 0 && drawnCard && !actionMode;
  const swapLabel = swapSelection.length === 1 ? 'Swap selected card' : `Swap ${swapSelection.length} cards for 1`;

  return (
    <div className="w-full">
      {/* All four cards in one row, on phones and desktop */}
      <div className="flex flex-row gap-2 md:gap-3 justify-center items-center">
        {gameState.myCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
          >
            <Card
              card={card}
              faceDown={!card.isRevealed}
              onClick={() => handleCardClick(index)}
              selected={selectedCardIndex === index || swapSelection.includes(index)}
              glowing={snapActive}
              size="lg"
            />
          </motion.div>
        ))}
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
