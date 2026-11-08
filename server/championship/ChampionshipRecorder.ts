import { RoundResult, emptyPlayerRoundStats } from "../../shared/types";
import {
  ChampionId,
  ChampionshipRound,
  isChampionId,
} from "../../shared/championship";
import { GameRoom } from "../game/GameRoom";
import { ChampionshipStore } from "./ChampionshipStore";

function toRound(
  roundNumber: number,
  result: RoundResult,
  caboCallerId: string | null,
): ChampionshipRound {
  const scores = { fane: 0, lebo: 0 };
  const handTotals = { fane: 0, lebo: 0 };
  const stats = { fane: emptyPlayerRoundStats(), lebo: emptyPlayerRoundStats() };
  let caboPenalty: ChampionId | null = null;
  let specialWin: ChampionId | null = null;

  for (const r of result.playerResults) {
    if (!isChampionId(r.playerId)) continue;
    scores[r.playerId] = r.roundScore;
    handTotals[r.playerId] = r.handTotal;
    stats[r.playerId] = r.stats;
    if (r.caboPenalty) caboPenalty = r.playerId;
    if (r.specialWin) specialWin = r.playerId;
  }

  return {
    roundNumber,
    scores,
    handTotals,
    winner: result.winnerId as ChampionId,
    caboCaller: isChampionId(caboCallerId) ? caboCallerId : null,
    caboPenalty,
    specialWin,
    stats,
  };
}

/**
 * Collects the rounds of a championship game in memory and stores the game
 * only once it is finished. Abandoned games are never written.
 */
export function recordChampionshipGames(
  room: GameRoom,
  store: ChampionshipStore,
): void {
  const rounds: ChampionshipRound[] = [];

  room.onRoundEnd = (result, gameOver) => {
    rounds.push(toRound(room.roundNumber, result, room.caboCallerId));
    if (!gameOver) return;

    const totals = {
      fane: room.totalScores.fane ?? 0,
      lebo: room.totalScores.lebo ?? 0,
    };
    // Every championship game is a single round, so the round winner wins the game
    const winner: ChampionId | null = isChampionId(result.winnerId) ? result.winnerId : null;

    try {
      store.addGame({
        id: `${Date.now()}`,
        startedAt: room.startedAt ?? new Date().toISOString(),
        endedAt: new Date().toISOString(),
        rounds: [...rounds],
        totals,
        winner,
      });
    } catch (err) {
      console.error("Failed to save championship game:", err);
    }
  };
}
