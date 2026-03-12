import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { Card as CardType, Suit } from '@shared/types';
import { useDrawAndDiscard } from '../hooks/useDrawAndDiscard';
import { SUIT_ICONS, SUIT_COLORS } from '../constants/cards';

const DiscardTopCard: React.FC<{ card: CardType }> = ({ card }) => {
  const Icon = SUIT_ICONS[card.suit];
  
  return (
    <div className={`absolute inset-0 p-1.5 flex flex-col justify-between ${SUIT_COLORS[card.suit]}`}>
      <div className="flex flex-col items-start leading-none gap-0.5">
        <span className="font-bold font-display text-sm">{card.rank}</span>
        <Icon size={12} fill="currentColor" strokeWidth={1} />
      </div>
      <div className="flex items-center justify-center flex-1">
        <Icon size={24} fill="currentColor" strokeWidth={1} />
      </div>
      <div className="flex flex-col items-end leading-none gap-0.5 rotate-180">
        <span className="font-bold font-display text-sm">{card.rank}</span>
        <Icon size={12} fill="currentColor" strokeWidth={1} />
      </div>
    </div>
  );
};

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
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-cabo-accent/50 font-display font-bold text-xl">C</span>
            <span className="text-cabo-textDim text-[10px] mt-1">{gameState.deckCount}</span>
          </div>
        </motion.div>
        <span className="text-cabo-textDim text-xs font-display">Draw</span>
      </motion.div>

      {/* Drawn Card (shown only to the active player) */}
      <AnimatePresence>
        {drawnCard && (
          <motion.div
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
            relative w-20 h-28 rounded-xl border shadow-xl overflow-hidden
            transition-all duration-300
            ${gameState.discardTop
              ? 'bg-gradient-to-br from-white to-gray-100 border-gray-300'
              : 'border-dashed border-cabo-border bg-cabo-surface/30'
            }
            ${canDraw && gameState.discardTop ? 'cursor-pointer hover:shadow-cabo-accent/20' : ''}
          `}
          whileTap={canDraw && gameState.discardTop ? { scale: 0.95 } : {}}
        >
          {gameState.discardTop ? (
            <DiscardTopCard card={gameState.discardTop} />
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
