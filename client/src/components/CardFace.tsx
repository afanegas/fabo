import React from 'react';
import { Rank } from '@shared/types';
import { CARD_IMAGES, CARD_TITLES, CARD_ACTIONS } from '../constants/cards';

const ACTION_LABELS = {
  PEEK: 'Peek',
  SPY: 'Spy',
  SWAP: 'Swap',
  LOOK_AND_SWAP: 'Look & Swap',
} as const;

// 6 and 9 look alike upside down, so they get the usual underline
const UNDERLINED_RANKS: Rank[] = ['6', '9'];

// Illustration of a face-up card with its value in the top left and bottom right corner
// and, for action cards, the action in the middle
export const CardFace: React.FC<{ rank: Rank }> = ({ rank }) => {
  const action = CARD_ACTIONS[rank];
  const rankClass = UNDERLINED_RANKS.includes(rank) ? 'card-rank card-rank-underlined' : 'card-rank';

  return (
    <div className="absolute inset-0">
      <img
        src={CARD_IMAGES[rank]}
        alt={`${rank} – ${CARD_TITLES[rank]}`}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      <span className={`${rankClass} top-[6%] left-[8%]`}>{rank}</span>
      <span className={`${rankClass} bottom-[6%] right-[8%] rotate-180`}>{rank}</span>
      {action && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="card-action">{ACTION_LABELS[action]}</span>
        </div>
      )}
    </div>
  );
};
