import { ActionNotice } from '@shared/types';

export interface CardHighlight {
  playerId: string;
  cardIndex: number;
}

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
      return `👁 ${a.actorName} peeked at their ${ordinal(a.actorCardIndex)} card`;
    case 'SPY':
      return `🔍 ${a.actorName} spied on ${target} ${ordinal(a.targetCardIndex)} card`;
    case 'SWAP':
      return `🔄 ${a.actorName} swapped their ${ordinal(a.actorCardIndex)} card with ${target} ${ordinal(a.targetCardIndex)} card`;
  }
}

export function actionHighlights(a: ActionNotice): CardHighlight[] {
  const cards: CardHighlight[] = [];
  if (a.actorCardIndex !== undefined) cards.push({ playerId: a.actorId, cardIndex: a.actorCardIndex });
  if (a.targetPlayerId && a.targetCardIndex !== undefined)
    cards.push({ playerId: a.targetPlayerId, cardIndex: a.targetCardIndex });
  return cards;
}
