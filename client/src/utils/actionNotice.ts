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
  DRAW: '✋',
  PLACE: '📥',
  DISCARD: '🗑',
  MISMATCH: '❌',
};

// Card powers stay a little longer; drawing, placing and discarding just flash by
export const noticeDuration = (a: ActionNotice) =>
  a.type === 'PEEK' || a.type === 'SPY' || a.type === 'SWAP' ? 5000 : 2000;

// Spied on or swapped with one of my cards
export const concernsMe = (a: ActionNotice, myId: string | null) => a.targetPlayerId === myId;

// Cards count from the left, as they lie on the table
const ordinal = (index?: number) => {
  const n = (index ?? 0) + 1;
  return n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`;
};

// Message for everyone except the player who made the move
export function describeAction(a: ActionNotice, myId: string | null): string {
  const target = a.targetPlayerId === myId ? 'your' : `${a.targetPlayerName}'s`;
  const icon = ACTION_ICONS[a.type];
  switch (a.type) {
    case 'PEEK':
      return `${icon} ${a.actorName} peeked at their ${ordinal(a.actorCardIndex)} card`;
    case 'SPY':
      return `${icon} ${a.actorName} spied on ${target} ${ordinal(a.targetCardIndex)} card`;
    case 'SWAP':
      return `${icon} ${a.actorName} swapped their ${ordinal(a.actorCardIndex)} card with ${target} ${ordinal(a.targetCardIndex)} card`;
    case 'DRAW':
      return a.fromDiscard
        ? `${icon} ${a.actorName} took the ${a.cardRank} from the discard pile`
        : `${icon} ${a.actorName} drew a card from the deck`;
    case 'PLACE':
      return (a.cardCount ?? 1) > 1
        ? `${icon} ${a.actorName} swapped ${a.cardCount} matching cards for it — now their ${ordinal(a.actorCardIndex)} card`
        : `${icon} ${a.actorName} put it in their ${ordinal(a.actorCardIndex)} place`;
    case 'DISCARD':
      return `${icon} ${a.actorName} discarded the ${a.cardRank}`;
    case 'MISMATCH':
      return `${icon} ${a.actorName} tried to swap ${a.cardCount} cards that didn't match — turn lost`;
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
