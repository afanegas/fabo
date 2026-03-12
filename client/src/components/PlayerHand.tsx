import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { usePlayerHand } from '../hooks/usePlayerHand';

export const PlayerHand: React.FC = () => {
  const {
    gameState,
    drawnCard,
    selectedCardIndex,
    actionMode,
    isMemorize,
    snapActive,
    handleCardClick,
    handleSwapConfirm,
  } = usePlayerHand();

  if (!gameState) return null;

  return (
    <div className="w-full">
      {/* Player's cards - 2x2 on mobile, row on desktop */}
      <div className="grid grid-cols-2 md:flex md:flex-row gap-3 justify-center items-center">
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
              selected={selectedCardIndex === index}
              glowing={snapActive}
              size="lg"
              index={index}
            />
          </motion.div>
        ))}
      </div>

      {/* Swap confirm button */}
      {selectedCardIndex !== null && drawnCard && !actionMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-3"
        >
          <button
            onClick={handleSwapConfirm}
            className="btn-primary text-sm"
          >
            Swap with Card {selectedCardIndex + 1}
          </button>
        </motion.div>
      )}

      {/* Phase-specific labels */}
      {isMemorize && gameState.memorizeCardsLeft > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-3 text-cabo-accent text-sm font-display"
        >
          Peek at {gameState.memorizeCardsLeft} more card{gameState.memorizeCardsLeft > 1 ? 's' : ''} to memorize
        </motion.p>
      )}

      {snapActive && (
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-3 text-cabo-green text-sm font-display font-semibold animate-pulse"
        >
          ⚡ SNAP WINDOW — Tap a matching card!
        </motion.p>
      )}
    </div>
  );
};
