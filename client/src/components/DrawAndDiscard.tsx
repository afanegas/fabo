import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand } from 'lucide-react';
import { Card } from './Card';
import { useDrawAndDiscard } from '../hooks/useDrawAndDiscard';
import { CardFace } from './CardFace';
import { CARD_ACTIONS } from '../constants/cards';

const ACTION_BUTTON_LABELS = { PEEK: 'Use Peek', SPY: 'Use Spy', SWAP: 'Use Swap', LOOK_AND_SWAP: 'Use' } as const;

export const DrawAndDiscard: React.FC = () => {
  const {
    gameState,
    drawnCard,
    canDraw,
    canDiscard,
    drawFromDeck,
    drawFromDiscard,
    returnToDiscard,
    discardDrawnCard,
  } = useDrawAndDiscard();

  if (!gameState) return null;

  // After taking the top card of the discard pile, the card below stays there but may not be used
  const discardBlocked = gameState.discardBlocked && !!gameState.discardTop;
  // A power card is used by putting it on the discard pile, so the button says so
  const drawnAction = drawnCard ? CARD_ACTIONS[drawnCard.rank] : null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-6 justify-center">
        {/* Draw Pile */}
        <motion.div
          className="flex flex-col items-center gap-1 md:gap-2"
          whileHover={canDraw ? { scale: 1.05 } : {}}
        >
          <motion.div
            onClick={canDraw ? drawFromDeck : undefined}
            className={`
              relative w-16 h-24 md:w-20 md:h-28 rounded-xl card-face-down border border-cabo-border
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

        {/* Discard Pile */}
        <motion.div
          className="flex flex-col items-center gap-1 md:gap-2"
          whileHover={canDraw ? { scale: 1.05 } : {}}
        >
          <motion.div
            onClick={canDraw && gameState.discardTop ? drawFromDiscard : undefined}
            className={`
              relative w-16 h-24 md:w-20 md:h-28 rounded-xl border shadow-xl overflow-hidden text-sm
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
              <div className={`absolute inset-0 transition-all duration-300 ${discardBlocked ? 'grayscale opacity-40' : ''}`}>
                <CardFace rank={gameState.discardTop.rank} />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-cabo-textDim text-xs">Empty</span>
              </div>
            )}
          </motion.div>
          <span className="text-cabo-textDim text-xs font-display">
            {discardBlocked ? 'Not usable now' : 'Discard'}
          </span>
        </motion.div>
      </div>

      {/* Drawn Card (shown only to the active player), below the piles with a hand holding it */}
      <AnimatePresence>
        {drawnCard && (
          <motion.div
            key={drawnCard.id}
            initial={{ opacity: 0, scale: 0.6, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <Card card={drawnCard} size="md" glowing />
              <motion.span
                initial={{ y: -30, opacity: 0, rotate: -20 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.15 }}
                className="absolute -left-4 -bottom-3 text-cabo-accent drop-shadow-lg pointer-events-none"
                aria-hidden
              >
                <Hand size={30} fill="#f5e6c8" strokeWidth={1.5} />
              </motion.span>
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <span className="text-cabo-accent text-xs font-display font-semibold leading-tight">
                You drew
                <br />
                <span className="text-cabo-textDim font-normal">
                  {gameState.drawnFromDiscard ? 'from the discard pile' : 'from the deck'}
                </span>
              </span>
              {canDiscard ? (
                <div className="flex gap-1.5">
                  {/* A power card can be used, or just thrown away like any other card */}
                  {drawnAction && (
                    <button
                      onClick={() => discardDrawnCard(true)}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      {ACTION_BUTTON_LABELS[drawnAction]}
                    </button>
                  )}
                  <button
                    onClick={() => discardDrawnCard(false)}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Discard
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-cabo-textDim text-[10px] font-display">Swap it, or</span>
                  {/* Taken by mistake: put it back and choose again */}
                  <button
                    onClick={returnToDiscard}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    ↩ Put back
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
