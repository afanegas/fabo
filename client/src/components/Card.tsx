import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType, PlayerCardInfo } from '@shared/types';
import { CARD_SIZE_CLASSES } from '../constants/cards';
import { CardFace } from './CardFace';

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
  const rank = card?.rank ?? null;

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
        ${isFaceDown ? 'card-face-down' : 'bg-cabo-surface'}
        ${selected ? 'ring-2 ring-cabo-accent card-glow' : ''}
        ${glowing ? 'card-glow' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        border border-cabo-border
        shadow-lg
      `}
    >
      {isFaceDown ? (
        // Face-down card back, the position number sits in the medallion
        index !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="card-back-number">{index + 1}</span>
          </div>
        )
      ) : (
        rank && <CardFace rank={rank} />
      )}
    </motion.div>
  );
};
