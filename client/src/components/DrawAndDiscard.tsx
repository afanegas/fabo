import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Card } from './Card';
import { Card as CardType, Suit } from '@shared/types';

const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠',
};

const DiscardTopCard: React.FC<{ card: CardType }> = ({ card }) => {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  return (
    <div className={`absolute inset-0 p-1.5 flex flex-col justify-between ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
      <div className="flex flex-col items-start leading-none">
        <span className="font-bold font-display text-sm">{card.rank}</span>
        <span className="text-[0.5em]">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
      <div className="flex items-center justify-center flex-1">
        <span className="text-xl">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
      <div className="flex flex-col items-end leading-none rotate-180">
        <span className="font-bold font-display text-sm">{card.rank}</span>
        <span className="text-[0.5em]">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
    </div>
  );
};

export const DrawAndDiscard: React.FC = () => {
  const {
    gameState,
    playerId,
    drawnCard,
    drawFromDeck,
    drawFromDiscard,
    discardDrawnCard,
    actionMode,
  } = useGameStore();

  if (!gameState) return null;

  const isMyTurn = gameState.currentTurnPlayerId === playerId;
  const canDraw = isMyTurn && !drawnCard && !actionMode &&
    !gameState.snapWindowActive &&
    (gameState.phase === 'PLAYING' || gameState.phase === 'CABO_CALLED');
  const canDiscard = drawnCard && !gameState.drawnFromDiscard;

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
