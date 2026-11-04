import { Rank } from '@shared/types';
import { CARD_ACTIONS } from './cards';

const getCardsForAction = (action: string) => {
  return Object.entries(CARD_ACTIONS)
    .filter(([_, act]) => act === action)
    .map(([rank]) => rank)
    .join(' & ');
};

export const TUTORIAL_CARDS: { value: Rank }[] = [
  { value: '3' },
  { value: '0' },
  { value: '5' },
  { value: '8' },
];

export const TUTORIAL_ACTIONS = [
  {
    icon: '👁',
    name: 'Peek',
    cards: getCardsForAction('PEEK'),
    description: 'Look at one of your own face-down cards. Knowledge is power — but can you remember?',
    color: '#d4af37',
    gradient: 'from-amber-500/20 to-yellow-600/10',
  },
  {
    icon: '🔍',
    name: 'Spy',
    cards: getCardsForAction('SPY'),
    description: "Secretly look at one of an opponent's cards. Use their secrets against them.",
    color: '#2ecc71',
    gradient: 'from-emerald-500/20 to-green-600/10',
  },
  {
    icon: '🔄',
    name: 'Swap',
    cards: getCardsForAction('SWAP'),
    description: "Blind swap — exchange one of your cards with an opponent's. Neither player sees what moves.",
    color: '#6c3483',
    gradient: 'from-purple-500/20 to-violet-600/10',
  },
];
