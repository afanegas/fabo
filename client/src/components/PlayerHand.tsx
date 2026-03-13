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
    actionMode,
    isMemorize,
    snapActive,
    handleCardClick,
    handleSwapConfirm,
  } = usePlayerHand();

  if (!gameState) return null;

  const leftCards = gameState.myCards.filter((_, i) => i % 2 === 0);
  const rightCards = gameState.myCards.filter((_, i) => i % 2 === 1);
  const showSwapButton = selectedCardIndex !== null && drawnCard && !actionMode;

  return (
    <div className="w-full">
      {/* Desktop: standard row layout */}
      <div className="hidden md:flex md:flex-row gap-3 justify-center items-center">
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

      {/* Mobile: left column | center button | right column */}
      <div className="flex md:hidden justify-between items-center w-full">
        {/* Left column — flush left */}
        <div className="flex flex-col gap-2">
          {leftCards.map((card, ci) => {
            const originalIndex = ci * 2;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: originalIndex * 0.1, type: 'spring', stiffness: 200 }}
              >
                <Card
                  card={card}
                  faceDown={!card.isRevealed}
                  onClick={() => handleCardClick(originalIndex)}
                  selected={selectedCardIndex === originalIndex}
                  glowing={snapActive}
                  size="lg"
                  index={originalIndex}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Center — buttons & labels between columns */}
        <div className="flex flex-col items-center justify-center flex-1 px-2 gap-2">
          {showSwapButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <button
                onClick={handleSwapConfirm}
                className="btn-primary text-xs px-3 py-2 whitespace-nowrap"
              >
                Swap Card {selectedCardIndex + 1}
              </button>
            </motion.div>
          )}
          {centerSlot}

          {/* Mobile phase labels */}
          {isMemorize && gameState.memorizeCardsLeft > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-cabo-accent text-[10px] font-display leading-tight"
            >
              Peek at {gameState.memorizeCardsLeft} more
              <br />
              card{gameState.memorizeCardsLeft > 1 ? 's' : ''} to memorize
            </motion.p>
          )}

          {snapActive && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center text-cabo-green text-[10px] font-display font-semibold animate-pulse leading-tight"
            >
              ⚡ SNAP WINDOW
              <br />
              Tap a matching card!
            </motion.p>
          )}
        </div>

        {/* Right column — flush right */}
        <div className="flex flex-col gap-2">
          {rightCards.map((card, ci) => {
            const originalIndex = ci * 2 + 1;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: originalIndex * 0.1, type: 'spring', stiffness: 200 }}
              >
                <Card
                  card={card}
                  faceDown={!card.isRevealed}
                  onClick={() => handleCardClick(originalIndex)}
                  selected={selectedCardIndex === originalIndex}
                  glowing={snapActive}
                  size="lg"
                  index={originalIndex}
                />
              </motion.div>
            );
          })}
        </div>
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
            Swap with Card {selectedCardIndex + 1}
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
