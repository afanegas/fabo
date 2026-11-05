import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand } from 'lucide-react';
import { PlayerState } from '@shared/types';
import { useGameStore, mergeHighlights } from '../store/gameStore';
import { CardActionMarker } from './CardActionMarker';
import { CardFace } from './CardFace';

interface OpponentDisplayProps {
  player: PlayerState;
  onCardClick?: (index: number) => void;
}

export const OpponentDisplay: React.FC<OpponentDisplayProps> = ({ player, onCardClick }) => {
  const { gameState, playerId, actionMode, selectedCardIndex, actionHighlights, personalNotices } = useGameStore();
  const highlights = mergeHighlights(actionHighlights, personalNotices);
  const highlightAt = (index: number) =>
    highlights.find((h) => h.playerId === player.id && h.cardIndex === index);
  const isCurrentTurn = gameState?.currentTurnPlayerId === player.id;
  const isSelectableForAction = actionMode === 'SPY' || actionMode === 'SWAP';
  // The card this opponent is holding on their turn: open from the discard pile, hidden from the deck
  const drawn = gameState?.opponentDrawn?.playerId === player.id ? gameState.opponentDrawn : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        glass-panel p-1.5 md:p-3 flex flex-col items-center gap-1.5 md:gap-2 min-w-[80px] md:min-w-[120px]
        ${isCurrentTurn ? 'active-turn-glow border-cabo-accent/50' : ''}
        ${player.isCaboCaller ? 'border-cabo-red/50' : ''}
        ${!player.isConnected ? 'opacity-40' : ''}
      `}
    >
      {/* Name + status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${player.isConnected ? 'bg-cabo-green' : 'bg-gray-500'}`} />
        <span className="text-[10px] md:text-xs font-display font-semibold truncate max-w-[60px] md:max-w-[80px]">
          {player.name}
        </span>
        {player.isCaboCaller && (
          <span className="text-[8px] md:text-[10px] bg-cabo-red/20 text-cabo-red px-1 md:px-1.5 py-0.5 rounded-full font-bold">
            CABO
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Cards (face-down backs) */}
        <div className="flex gap-1 flex-wrap justify-center">
          {Array.from({ length: player.cardCount }).map((_, i) => (
            <motion.div
              key={i}
              whileHover={isSelectableForAction ? { scale: 1.1, y: -3 } : {}}
              whileTap={isSelectableForAction ? { scale: 0.95 } : {}}
              onClick={() => isSelectableForAction && onCardClick?.(i)}
              className={`
                w-7 h-10 md:w-10 md:h-14 rounded md:rounded-lg card-face-down border border-cabo-border
                ${isSelectableForAction ? 'cursor-pointer hover:border-cabo-accent/50' : ''}
                ${isCurrentTurn ? 'border-cabo-accent/30' : ''}
                ${highlightAt(i) ? 'ring-2 ring-cabo-accent card-glow' : ''}
                relative
              `}
            >
              <div className="w-full h-full flex flex-col items-center justify-center gap-[1px]">
                <span className="text-cabo-accent/30 text-[6px] md:text-[8px] font-bold leading-none">C</span>
                <span className="text-cabo-accent/30 text-[5px] md:text-[6px] font-display leading-none">{i + 1}</span>
              </div>
              <CardActionMarker highlight={highlightAt(i)} small />
            </motion.div>
          ))}
        </div>

        {/* Drawn card in their hand, like my own drawn card on my side of the table */}
        <AnimatePresence>
          {drawn && (
            <motion.div
              key={drawn.card?.id ?? 'hidden'}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex flex-col items-center gap-0.5"
            >
              <div className="relative">
                <div
                  className={`relative w-9 h-12 md:w-12 md:h-16 rounded md:rounded-lg overflow-hidden border border-cabo-accent/60 card-glow text-[9px] md:text-xs
                    ${drawn.card ? 'bg-cabo-surface' : 'card-face-down'}`}
                >
                  {drawn.card && <CardFace rank={drawn.card.rank} />}
                </div>
                <motion.span
                  initial={{ y: -16, opacity: 0, rotate: -20 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                  className="absolute -left-2.5 -bottom-2 pointer-events-none"
                  aria-hidden
                >
                  <Hand size={18} fill="#f5e6c8" strokeWidth={1.5} className="text-cabo-accent drop-shadow" />
                </motion.span>
              </div>
              <span className="text-[8px] md:text-[10px] text-cabo-textDim font-display leading-none">
                {drawn.fromDiscard ? 'from pile' : 'from deck'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
