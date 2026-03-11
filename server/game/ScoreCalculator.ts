import { Card, Rank, Suit, PlayerRoundResult, RoundResult } from '../../shared/types';
import { Player } from './Player';
import { CONFIG } from '../../shared/types';

const RED_SUITS: Suit[] = ['hearts', 'diamonds'];

export function getCardValue(card: Card): number {
  if (card.rank === 'JOKER') return 0;
  if (card.rank === 'K' && card.suit && RED_SUITS.includes(card.suit)) return 0;
  const valueMap: Record<Rank, number> = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
    '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'JOKER': 0
  };
  return valueMap[card.rank];
}

export function getActionType(rank: Rank): 'PEEK' | 'SPY' | 'SWAP' | null {
  if (rank === '7' || rank === '8') return 'PEEK';
  if (rank === '9' || rank === '10') return 'SPY';
  if (rank === 'J' || rank === 'Q') return 'SWAP';
  return null;
}

function getHandTotal(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + getCardValue(card), 0);
}

function hasSpecialWin(cards: Card[]): boolean {
  if (cards.length !== 4) return false;
  const queens = cards.filter(c => c.rank === 'Q').length;
  const kings = cards.filter(c => c.rank === 'K').length;
  return queens === 2 && kings === 2;
}

export function calculateRoundResults(players: Player[], caboCallerId: string | null): RoundResult {
  const results: PlayerRoundResult[] = players.map(player => ({
    playerId: player.id,
    playerName: player.name,
    cards: [...player.cards],
    handTotal: getHandTotal(player.cards),
    roundScore: 0,
    caboPenalty: false,
    specialWin: false,
  }));

  // Check for special win condition (2×Q + 2×K)
  const specialWinner = results.find(r => hasSpecialWin(r.cards));
  if (specialWinner) {
    specialWinner.specialWin = true;
    specialWinner.roundScore = 0;
    for (const r of results) {
      if (r.playerId !== specialWinner.playerId) {
        r.roundScore = -CONFIG.SPECIAL_WIN_PENALTY;
      }
    }
    return { playerResults: results, winnerId: specialWinner.playerId };
  }

  // Normal scoring
  const sortedByTotal = [...results].sort((a, b) => a.handTotal - b.handTotal);
  const lowestTotal = sortedByTotal[0].handTotal;

  // Find winner: lowest total wins.  In case of tie, cabo caller wins the tie
  const tiedForLowest = sortedByTotal.filter(r => r.handTotal === lowestTotal);
  let winnerId: string;

  if (tiedForLowest.length === 1) {
    winnerId = tiedForLowest[0].playerId;
  } else {
    // Tie: cabo caller wins if they're tied for lowest
    const caboCallerInTie = tiedForLowest.find(r => r.playerId === caboCallerId);
    winnerId = caboCallerInTie ? caboCallerInTie.playerId : tiedForLowest[0].playerId;
  }

  // Check cabo penalty: if caller doesn't have lowest, they get penalty
  const caboCaller = results.find(r => r.playerId === caboCallerId);
  if (caboCaller && caboCaller.playerId !== winnerId) {
    caboCaller.caboPenalty = true;
  }

  // Assign scores
  for (const r of results) {
    if (r.playerId === winnerId) {
      r.roundScore = 0;
    } else if (r.caboPenalty) {
      r.roundScore = -(r.handTotal + CONFIG.CABO_PENALTY);
    } else {
      r.roundScore = -r.handTotal;
    }
  }

  return { playerResults: results, winnerId };
}
