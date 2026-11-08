import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerState } from '@shared/types';
import { useGameStore, mergeHighlights } from '../store/gameStore';
import { CardActionMarker } from './CardActionMarker';
import { FreshCardMarker } from './FreshCardMarker';
import { CARD_SIZE_CLASSES, CardSize } from '../constants/cards';

interface OpponentDisplayProps {
  player: PlayerState;
  onCardClick?: (index: number) => void;
  size?: CardSize; // 'table' with a single opponent: as big as my own cards
}

export const OpponentDisplay: React.FC<OpponentDisplayProps> = ({ player, onCardClick, size = 'table' }) => {
  const { gameState, actionMode, actionHighlights, personalNotices, freshCardIds } = useGameStore();
  const highlights = mergeHighlights(actionHighlights, personalNotices);
  const highlightAt = (index: number) =>
    highlights.find((h) => h.playerId === player.id && h.cardIndex === index);
  const isCurrentTurn = gameState?.currentTurnPlayerId === player.id;
  const isSelectableForAction = actionMode === 'SPY' || actionMode === 'SWAP';
  // Card ids let each card keep its identity, so it can be followed when it moves
  const cardIds = player.cardIds ?? Array.from({ length: player.cardCount }, (_, i) => `${player.id}-${i}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-3xl border px-3 pt-2 pb-2.5 md:px-4 md:pt-3 flex flex-col items-center gap-2
        bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-md transition-all duration-500
        ${isCurrentTurn ? 'border-cabo-accent/60 shadow-[0_0_30px_rgba(212,175,55,0.25)]' : 'border-white/10'}
        ${player.isCaboCaller ? 'border-cabo-red/60' : ''}
        ${!player.isConnected ? 'opacity-40' : ''}
      `}
    >
      {/* Name + status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-display font-bold
            ${isCurrentTurn ? 'bg-cabo-accent text-cabo-dark' : 'bg-white/10 text-cabo-text'}`}
        >
          {player.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-xs md:text-sm font-display font-semibold truncate max-w-[110px]">{player.name}</span>
        {isCurrentTurn && <span className="text-[10px] text-cabo-accent font-display">· playing</span>}
        {!player.isConnected && <span className="text-[10px] text-cabo-textDim font-display">· offline</span>}
        {player.isCaboCaller && (
          <span className="text-[10px] bg-cabo-red/20 text-cabo-red px-1.5 py-0.5 rounded-full font-bold">CABO</span>
        )}
      </div>

      {/* Cards (face-down backs). The layoutId lets a card fly to wherever it goes next. */}
      <div className="flex gap-2 md:gap-3 justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {cardIds.map((cardId, i) => (
            <motion.div
              key={cardId}
              layoutId={cardId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.5 } }}
              transition={{ type: 'spring', stiffness: 70, damping: 15 }}
              whileHover={isSelectableForAction ? { scale: 1.06, y: -3 } : {}}
              whileTap={isSelectableForAction ? { scale: 0.95 } : {}}
              onClick={() => isSelectableForAction && onCardClick?.(i)}
              className="flex flex-col items-center"
            >
              <div
                className={`
                  ${CARD_SIZE_CLASSES[size]} rounded-xl card-face-down border border-white/15 shadow-lg relative
                  ${isSelectableForAction ? 'cursor-pointer hover:border-cabo-accent/60' : ''}
                  ${highlightAt(i) ? 'ring-2 ring-cabo-accent card-glow' : ''}
                `}
              >
                <CardActionMarker highlight={highlightAt(i)} small={size === 'sm'} />
                {freshCardIds.includes(cardId) && <FreshCardMarker small={size === 'sm'} />}
              </div>
              {/* Quiet position number, counted from the left as shown here */}
              <span className="mt-1 text-[10px] leading-none font-display text-cabo-textDim/50">{i + 1}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
