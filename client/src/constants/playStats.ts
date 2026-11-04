import { PlayerRoundStats } from '@shared/types';

export const PLAY_STAT_GROUPS: { title: string; rows: { key: keyof PlayerRoundStats; label: string }[] }[] = [
  {
    title: 'Play style',
    rows: [
      { key: 'opponentPeeks', label: 'Peeked at opponent' },
      { key: 'opponentSwaps', label: 'Swapped with opponent' },
      { key: 'unicornsStolen', label: '🦊 Foxes stolen' },
      { key: 'ownPeeks', label: 'Peeked at own cards' },
      { key: 'discardDraws', label: 'Took from discard pile' },
    ],
  },
  {
    title: 'Luck',
    rows: [
      { key: 'unicornsDealt', label: '🦊 Foxes dealt' },
      { key: 'unicornsDrawn', label: '🦊 Foxes drawn' },
    ],
  },
];
