import { Card } from '../../shared/types';
import { RANKS, RANK_COPIES } from '../../shared/rules';
import { v4 as uuidv4 } from 'uuid';

export class Deck {
  cards: Card[] = [];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.cards = [];
    for (const rank of RANKS) {
      for (let i = 0; i < RANK_COPIES[rank]; i++) {
        this.cards.push({ id: uuidv4(), rank });
      }
    }
    this.shuffle();
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(): Card | null {
    return this.cards.pop() || null;
  }

  get remaining(): number {
    return this.cards.length;
  }

  isEmpty(): boolean {
    return this.cards.length === 0;
  }

  addCards(cards: Card[]): void {
    this.cards.push(...cards);
    this.shuffle();
  }
}
