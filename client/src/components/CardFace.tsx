import React from 'react';
import { Rank } from '@shared/types';
import { CARD_IMAGES, CARD_TITLES } from '../constants/cards';

// Illustration of a face-up card with its value in the top left and bottom right corner
export const CardFace: React.FC<{ rank: Rank }> = ({ rank }) => (
  <div className="absolute inset-0">
    <img
      src={CARD_IMAGES[rank]}
      alt={`${rank} – ${CARD_TITLES[rank]}`}
      draggable={false}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
    />
    <span className="card-rank top-[6%] left-[8%]">{rank}</span>
    <span className="card-rank bottom-[6%] right-[8%] rotate-180">{rank}</span>
  </div>
);
