import {
  Card,
  Rank,
  PlayerRoundResult,
  RoundResult,
  ActionType,
  emptyPlayerRoundStats,
} from "../../shared/types";
import { Player } from "./Player";
import { CONFIG, SPECIAL_WIN_CARDS, CARD_POINTS, CARD_ACTIONS } from "../../shared/rules";

export function getCardValue(card: Card): number {
  return CARD_POINTS[card.rank];
}

export function getActionType(rank: Rank): ActionType | null {
  return CARD_ACTIONS[rank];
}

function getHandTotal(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + getCardValue(card), 0);
}

function hasSpecialWin(cards: Card[]): boolean {
  if (cards.length !== CONFIG.CARDS_PER_PLAYER) return false;
  return Object.entries(SPECIAL_WIN_CARDS).every(
    ([rank, count]) => cards.filter((c) => c.rank === rank).length === count,
  );
}

export function calculateRoundResults(
  players: Player[],
  caboCallerId: string | null,
): RoundResult {
  const results: PlayerRoundResult[] = players.map((player) => ({
    playerId: player.id,
    playerName: player.name,
    cards: [...player.cards],
    handTotal: getHandTotal(player.cards),
    roundScore: 0,
    caboPenalty: false,
    specialWin: false,
    stats: emptyPlayerRoundStats(),
  }));

  // Check for special win condition (2×12 + 2×13)
  const specialWinner = results.find((r) => hasSpecialWin(r.cards));
  if (specialWinner) {
    specialWinner.specialWin = true;
    specialWinner.roundScore = 0;
    for (const r of results) {
      if (r.playerId !== specialWinner.playerId) {
        r.roundScore = CONFIG.SPECIAL_WIN_PENALTY;
      }
    }
    return { playerResults: results, winnerId: specialWinner.playerId };
  }

  // Normal scoring
  const sortedByTotal = [...results].sort((a, b) => a.handTotal - b.handTotal);
  const lowestTotal = sortedByTotal[0].handTotal;

  // Find winner: lowest total wins
  // Cabo caller must be STRICTLY lowest to win — ties = penalty
  const tiedForLowest = sortedByTotal.filter(
    (r) => r.handTotal === lowestTotal,
  );
  let winnerId: string;

  if (tiedForLowest.length === 1) {
    winnerId = tiedForLowest[0].playerId;
  } else {
    // Tie: cabo caller does NOT win ties — first non-caller with lowest wins
    const nonCallerWinner = tiedForLowest.find(
      (r) => r.playerId !== caboCallerId,
    );
    winnerId = nonCallerWinner
      ? nonCallerWinner.playerId
      : tiedForLowest[0].playerId;
  }

  // Check cabo penalty: caller must be strictly lowest, otherwise penalty
  const caboCaller = results.find((r) => r.playerId === caboCallerId);
  if (caboCaller && caboCaller.playerId !== winnerId) {
    caboCaller.caboPenalty = true;
  }

  // Assign scores (positive — lower is better)
  for (const r of results) {
    if (r.playerId === winnerId) {
      r.roundScore = 0;
    } else if (r.caboPenalty) {
      r.roundScore = r.handTotal + CONFIG.CABO_PENALTY;
    } else {
      r.roundScore = r.handTotal;
    }
  }

  return { playerResults: results, winnerId };
}
