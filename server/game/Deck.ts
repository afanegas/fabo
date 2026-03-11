import { Card, Rank, Suit } from '../../shared/types';
import { v4 as uuidv4 } from 'uuid';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export class Deck {
  cards: Card[] = [];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.cards = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.cards.push({ id: uuidv4(), rank, suit });
      }
    }
    // Add 2 Jokers
    this.cards.push({ id: uuidv4(), rank: 'JOKER', suit: null });
    this.cards.push({ id: uuidv4(), rank: 'JOKER', suit: null });
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
