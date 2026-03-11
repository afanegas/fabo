import React from 'react';
import { motion } from 'framer-motion';
import { PlayerState } from '@shared/types';
import { useGameStore } from '../store/gameStore';

interface OpponentDisplayProps {
  player: PlayerState;
  onCardClick?: (index: number) => void;
}

export const OpponentDisplay: React.FC<OpponentDisplayProps> = ({ player, onCardClick }) => {
  const { gameState, playerId, actionMode, selectedCardIndex } = useGameStore();
  const isCurrentTurn = gameState?.currentTurnPlayerId === player.id;
  const isSelectableForAction = actionMode === 'SPY' || actionMode === 'SWAP';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        glass-panel p-3 flex flex-col items-center gap-2 min-w-[120px]
        ${isCurrentTurn ? 'active-turn-glow border-cabo-accent/50' : ''}
        ${player.isCaboCaller ? 'border-cabo-red/50' : ''}
        ${!player.isConnected ? 'opacity-40' : ''}
      `}
    >
      {/* Name + status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${player.isConnected ? 'bg-cabo-green' : 'bg-gray-500'}`} />
        <span className="text-xs font-display font-semibold truncate max-w-[80px]">
          {player.name}
        </span>
        {player.isCaboCaller && (
          <span className="text-[10px] bg-cabo-red/20 text-cabo-red px-1.5 py-0.5 rounded-full font-bold">
            CABO
          </span>
        )}
      </div>

      {/* Cards (face-down backs) */}
      <div className="flex gap-1 flex-wrap justify-center">
        {Array.from({ length: player.cardCount }).map((_, i) => (
          <motion.div
            key={i}
            whileHover={isSelectableForAction ? { scale: 1.1, y: -3 } : {}}
            whileTap={isSelectableForAction ? { scale: 0.95 } : {}}
            onClick={() => isSelectableForAction && onCardClick?.(i)}
            className={`
              w-10 h-14 rounded-lg card-face-down border border-cabo-border
              ${isSelectableForAction ? 'cursor-pointer hover:border-cabo-accent/50' : ''}
              ${isCurrentTurn ? 'border-cabo-accent/30' : ''}
            `}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-cabo-accent/30 text-[8px] font-bold">C</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
