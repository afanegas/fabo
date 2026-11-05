import { ActionNotice } from '@shared/types';

export interface CardHighlight {
  playerId: string;
  cardIndex: number;
  type: ActionNotice['type'];
}

export const ACTION_ICONS: Record<ActionNotice['type'], string> = {
  PEEK: '👁',
  SPY: '🔍',
  SWAP: '🔄',
};

// Spied on or swapped with one of my cards
export const concernsMe = (a: ActionNotice, myId: string | null) => a.targetPlayerId === myId;

// Cards count from the left, as they lie on the table
const ordinal = (index?: number) => {
  const n = (index ?? 0) + 1;
  return n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`;
};

// Message for everyone except the player who used the card power
export function describeAction(a: ActionNotice, myId: string | null): string {
  const target = a.targetPlayerId === myId ? 'your' : `${a.targetPlayerName}'s`;
  switch (a.type) {
    case 'PEEK':
      return `${ACTION_ICONS.PEEK} ${a.actorName} peeked at their ${ordinal(a.actorCardIndex)} card`;
    case 'SPY':
      return `${ACTION_ICONS.SPY} ${a.actorName} spied on ${target} ${ordinal(a.targetCardIndex)} card`;
    case 'SWAP':
      return `${ACTION_ICONS.SWAP} ${a.actorName} swapped their ${ordinal(a.actorCardIndex)} card with ${target} ${ordinal(a.targetCardIndex)} card`;
  }
}

export function actionHighlights(a: ActionNotice): CardHighlight[] {
  const cards: CardHighlight[] = [];
  if (a.actorCardIndex !== undefined)
    cards.push({ playerId: a.actorId, cardIndex: a.actorCardIndex, type: a.type });
  if (a.targetPlayerId && a.targetCardIndex !== undefined)
    cards.push({ playerId: a.targetPlayerId, cardIndex: a.targetCardIndex, type: a.type });
  return cards;
}
