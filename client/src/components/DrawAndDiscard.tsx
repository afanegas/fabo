import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { useDrawAndDiscard } from '../hooks/useDrawAndDiscard';
import { CardFace } from './CardFace';

export const DrawAndDiscard: React.FC = () => {
  const {
    gameState,
    drawnCard,
    canDraw,
    canDiscard,
    drawFromDeck,
    drawFromDiscard,
    discardDrawnCard,
  } = useDrawAndDiscard();

  if (!gameState) return null;

  return (
    <div className="flex items-center gap-6 justify-center">
      {/* Draw Pile */}
      <motion.div
        className="flex flex-col items-center gap-2"
        whileHover={canDraw ? { scale: 1.05 } : {}}
      >
        <motion.div
          onClick={canDraw ? drawFromDeck : undefined}
          className={`
            relative w-20 h-28 rounded-xl card-face-down border border-cabo-border
            shadow-xl cursor-pointer transition-all duration-300
            ${canDraw ? 'hover:border-cabo-accent/50 hover:shadow-cabo-accent/20' : 'opacity-60'}
          `}
          whileTap={canDraw ? { scale: 0.95 } : {}}
        >
          <div className="absolute inset-0 flex items-center justify-center text-sm">
            <span className="card-back-number">{gameState.deckCount}</span>
          </div>
        </motion.div>
        <span className="text-cabo-textDim text-xs font-display">Draw</span>
      </motion.div>

      {/* Drawn Card (shown only to the active player) */}
      <AnimatePresence>
        {drawnCard && (
          <motion.div
            key={drawnCard.id}
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            className="flex flex-col items-center gap-2"
          >
            <Card card={drawnCard} size="lg" glowing />
            {canDiscard ? (
              <button
                onClick={discardDrawnCard}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Discard
              </button>
            ) : (
              <span className="text-cabo-textDim text-[10px] font-display">Must swap</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discard Pile */}
      <motion.div
        className="flex flex-col items-center gap-2"
        whileHover={canDraw ? { scale: 1.05 } : {}}
      >
        <motion.div
          onClick={canDraw && gameState.discardTop ? drawFromDiscard : undefined}
          className={`
            relative w-20 h-28 rounded-xl border shadow-xl overflow-hidden text-sm
            transition-all duration-300
            ${gameState.discardTop
              ? 'bg-cabo-surface border-cabo-border'
              : 'border-dashed border-cabo-border bg-cabo-surface/30'
            }
            ${canDraw && gameState.discardTop ? 'cursor-pointer hover:shadow-cabo-accent/20' : ''}
          `}
          whileTap={canDraw && gameState.discardTop ? { scale: 0.95 } : {}}
        >
          {gameState.discardTop ? (
            <CardFace rank={gameState.discardTop.rank} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-cabo-textDim text-xs">Empty</span>
            </div>
          )}
        </motion.div>
        <span className="text-cabo-textDim text-xs font-display">Discard</span>
      </motion.div>
    </div>
  );
};
