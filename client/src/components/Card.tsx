import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType, PlayerCardInfo, Rank, Suit } from '@shared/types';
import { SUIT_ICONS, SUIT_COLORS, CARD_SIZE_CLASSES } from '../constants/cards';

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

  const renderSuitIcon = (suit: Suit | null, size: number) => {
    if (!suit) return null;
    const Icon = SUIT_ICONS[suit];
    return <Icon size={size} fill="currentColor" strokeWidth={1} />;
  };

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
        ${CARD_SIZE_CLASSES[size]} relative rounded-xl cursor-pointer select-none overflow-hidden
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
          <div className="flex flex-col items-start leading-none gap-0.5">
            <span className="font-bold font-display">{rank}</span>
            {renderSuitIcon(suit, 12)}
          </div>
          <div className="flex items-center justify-center flex-1">
            {renderSuitIcon(suit, 28)}
          </div>
          <div className="flex flex-col items-end leading-none gap-0.5 rotate-180">
            <span className="font-bold font-display">{rank}</span>
            {renderSuitIcon(suit, 12)}
          </div>
        </div>
      )}
    </motion.div>
  );
};
