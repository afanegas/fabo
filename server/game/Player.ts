import { Card } from '../../shared/types';

export class Player {
  id: string;
  name: string;
  cards: Card[] = [];
  peekedIndices: Set<number> = new Set();
  isConnected: boolean = true;
  isCaboCaller: boolean = false;
  socketId: string;

  constructor(id: string, name: string, socketId: string) {
    this.id = id;
    this.name = name;
    this.socketId = socketId;
  }

  addCard(card: Card, index?: number): void {
    if (index !== undefined) {
      this.cards[index] = card;
    } else {
      this.cards.push(card);
    }
  }

  removeCard(index: number): Card {
    const card = this.cards[index];
    this.cards.splice(index, 1);
    // Update peeked indices
    const newPeeked = new Set<number>();
    for (const pi of this.peekedIndices) {
      if (pi < index) newPeeked.add(pi);
      else if (pi > index) newPeeked.add(pi - 1);
      // If pi === index, it's removed
    }
    this.peekedIndices = newPeeked;
    return card;
  }

  swapCard(index: number, newCard: Card): Card {
    const oldCard = this.cards[index];
    this.cards[index] = newCard;
    this.peekedIndices.delete(index);
    return oldCard;
  }

  removeMultipleCards(indices: number[]): Card[] {
    // Sort descending so indices don't shift
    const sorted = [...indices].sort((a, b) => b - a);
    const removed: Card[] = [];
    for (const idx of sorted) {
      removed.push(this.removeCard(idx));
    }
    return removed;
  }

  peekCard(index: number): Card | null {
    if (index < 0 || index >= this.cards.length) return null;
    this.peekedIndices.add(index);
    return this.cards[index];
  }

  get cardCount(): number {
    return this.cards.length;
  }

  resetForRound(): void {
    this.cards = [];
    this.peekedIndices.clear();
    this.isCaboCaller = false;
  }
}
