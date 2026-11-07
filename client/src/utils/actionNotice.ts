import { ActionNotice } from '@shared/types';
import { CARD_ACTIONS } from '@shared/rules';

const POWER_NAMES = { PEEK: 'Peek', SPY: 'Spy', SWAP: 'Swap', LOOK_AND_SWAP: 'Look & Swap' } as const;

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
  RETURN: '↩',
  USE: '✨',
};

// Long enough to read: grows with the length of the text, card powers stay a bit longer
export const readingTime = (text: string, minMs: number) =>
  Math.min(9000, Math.max(minMs, 1500 + text.length * 60));

export const noticeDuration = (a: ActionNotice, text: string) =>
  readingTime(text, a.type === 'PEEK' || a.type === 'SPY' || a.type === 'SWAP' ? 6000 : 4000);

// Spied on or swapped with one of my cards
export const concernsMe = (a: ActionNotice, myId: string | null) => a.targetPlayerId === myId;

// Same numbers as shown under the cards, counted from the left
const cardNo = (index?: number) => `card ${(index ?? 0) + 1}`;

// Message for everyone except the player who made the move
export function describeAction(a: ActionNotice, myId: string | null): string {
  const target = a.targetPlayerId === myId ? 'your' : `${a.targetPlayerName}'s`;
  const icon = ACTION_ICONS[a.type];
  switch (a.type) {
    case 'PEEK':
      return `${icon} ${a.actorName} peeked at their ${cardNo(a.actorCardIndex)}`;
    case 'SPY':
      return `${icon} ${a.actorName} spied on ${target} ${cardNo(a.targetCardIndex)}`;
    case 'SWAP':
      return `${icon} ${a.actorName} swapped their ${cardNo(a.actorCardIndex)} with ${target} ${cardNo(a.targetCardIndex)}`;
    case 'DRAW':
      return a.fromDiscard
        ? `${icon} ${a.actorName} took the ${a.cardRank} from the discard pile`
        : `${icon} ${a.actorName} drew a card from the deck`;
    case 'PLACE':
      return (a.cardCount ?? 1) > 1
        ? `${icon} ${a.actorName} swapped ${a.cardCount} matching cards for it — it is now their ${cardNo(a.actorCardIndex)}`
        : `${icon} ${a.actorName} put it in place of their ${cardNo(a.actorCardIndex)}`;
    case 'DISCARD':
      return a.powerUnused
        ? `${icon} ${a.actorName} discarded the ${a.cardRank} without using its power`
        : `${icon} ${a.actorName} discarded the ${a.cardRank}`;
    case 'USE':
      return `${icon} ${a.actorName} is using the ${a.cardRank} — ${POWER_NAMES[CARD_ACTIONS[a.cardRank!] ?? 'PEEK']}`;
    case 'RETURN':
      return `${icon} ${a.actorName} put the ${a.cardRank} back on the discard pile`;
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
