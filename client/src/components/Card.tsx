import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType, PlayerCardInfo, Rank, Suit } from '@shared/types';

interface CardProps {
  card?: CardType | PlayerCardInfo | null;
  faceDown?: boolean;
  onClick?: () => void;
  selected?: boolean;
  glowing?: boolean;
  size?: 'sm' | 'md' | 'lg';
  index?: number;
  disabled?: boolean;
}

const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const SUIT_COLORS: Record<Suit, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-800',
  spades: 'text-gray-800',
};

const sizeClasses = {
  sm: 'w-14 h-20 text-xs',
  md: 'w-20 h-28 text-sm',
  lg: 'w-24 h-36 text-base',
};

export const Card: React.FC<CardProps> = ({
  card,
  faceDown = false,
  onClick,
  selected = false,
  glowing = false,
  size = 'md',
  index,
  disabled = false,
}) => {
  const isFaceDown = faceDown || !card || ('isRevealed' in card && !card.isRevealed) || !card.rank;
  const rank = card && 'rank' in card ? card.rank : null;
  const suit = card && 'suit' in card ? card.suit : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: selected ? 1.08 : 1,
        y: selected ? -8 : 0,
      }}
      whileHover={!disabled ? { scale: 1.05, y: -4 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={!disabled ? onClick : undefined}
      className={`
        ${sizeClasses[size]} relative rounded-xl cursor-pointer select-none overflow-hidden
        transition-shadow duration-300
        ${isFaceDown ? 'card-face-down' : 'bg-gradient-to-br from-white to-gray-100'}
        ${selected ? 'ring-2 ring-cabo-accent card-glow' : ''}
        ${glowing ? 'card-glow' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        border ${isFaceDown ? 'border-cabo-border' : 'border-gray-300'}
        shadow-lg
      `}
    >
      {isFaceDown ? (
        // Face-down card back
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/5 h-3/5 rounded-lg border border-cabo-accent/20 flex items-center justify-center">
            <span className="text-cabo-accent/40 font-display font-bold text-lg">C</span>
          </div>
        </div>
      ) : (
        // Face-up card
        <div className={`absolute inset-0 p-1.5 flex flex-col justify-between ${suit ? SUIT_COLORS[suit] : 'text-slate-200'}`}>
          <div className="flex flex-col items-start leading-none">
            <span className="font-bold font-display">{rank}</span>
            {suit && <span className="text-[0.6em]">{SUIT_SYMBOLS[suit]}</span>}
          </div>
          <div className="flex items-center justify-center flex-1">
            {suit && <span className="text-2xl">{SUIT_SYMBOLS[suit]}</span>}
          </div>
          <div className="flex flex-col items-end leading-none rotate-180">
            <span className="font-bold font-display">{rank}</span>
            {suit && <span className="text-[0.6em]">{SUIT_SYMBOLS[suit]}</span>}
          </div>
        </div>
      )}
    </motion.div>
  );
};
