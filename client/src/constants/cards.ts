import { Heart, Diamond, Club, Spade } from 'lucide-react';
import React from 'react';
import { Suit } from '@shared/types';

export const SUIT_ICONS: Record<Suit, React.ElementType> = {
  hearts: Heart,
  diamonds: Diamond,
  clubs: Club,
  spades: Spade,
};

export const SUIT_COLORS: Record<Suit, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-800',
  spades: 'text-gray-800',
};

export const CARD_SIZE_CLASSES = {
  sm: 'w-14 h-20 text-xs',
  md: 'w-20 h-28 text-sm',
  lg: 'w-24 h-36 text-base',
};
