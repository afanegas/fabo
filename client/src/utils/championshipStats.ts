import { ChampionId, ChampionshipGame } from '@shared/championship';
import { PlayerRoundStats, addPlayerRoundStats, emptyPlayerRoundStats } from '@shared/types';

export interface ChampionStats {
  gamesWon: number;
  roundsWon: number;
  roundsPlayed: number;
  avgRoundScore: number;
  avgGameTotal: number;
  bestGameTotal: number | null;
  caboCalls: number;
  caboSuccess: number;
  specialWins: number;
  longestStreak: number;
}

export interface SeasonStats {
  games: number;
  draws: number;
  players: Record<ChampionId, ChampionStats>;
  currentStreak: { champion: ChampionId; length: number } | null;
  // Cumulative game wins after each game, for the progress chart
  progress: { fane: number; lebo: number }[];
  // Play style & luck summed over all games that recorded them
  play: Record<ChampionId, PlayerRoundStats>;
  gamesWithPlayStats: number;
}

const IDS: ChampionId[] = ['fane', 'lebo'];

const round1 = (n: number) => Math.round(n * 10) / 10;

export function computeSeasonStats(games: ChampionshipGame[]): SeasonStats {
  const players = {} as Record<ChampionId, ChampionStats>;

  for (const id of IDS) {
    const rounds = games.flatMap((g) => g.rounds);
    const calls = rounds.filter((r) => r.caboCaller === id);

    let longest = 0;
    let run = 0;
    for (const g of games) {
      run = g.winner === id ? run + 1 : 0;
      longest = Math.max(longest, run);
    }

    players[id] = {
      gamesWon: games.filter((g) => g.winner === id).length,
      roundsWon: rounds.filter((r) => r.winner === id).length,
      roundsPlayed: rounds.length,
      avgRoundScore: rounds.length
        ? round1(rounds.reduce((s, r) => s + r.scores[id], 0) / rounds.length)
        : 0,
      avgGameTotal: games.length
        ? round1(games.reduce((s, g) => s + g.totals[id], 0) / games.length)
        : 0,
      bestGameTotal: games.length
        ? Math.min(...games.map((g) => g.totals[id]))
        : null,
      caboCalls: calls.length,
      caboSuccess: calls.filter((r) => r.winner === id).length,
      specialWins: rounds.filter((r) => r.specialWin === id).length,
      longestStreak: longest,
    };
  }

  let currentStreak: SeasonStats['currentStreak'] = null;
  const last = games[games.length - 1];
  if (last?.winner) {
    let length = 0;
    for (let i = games.length - 1; i >= 0 && games[i].winner === last.winner; i--) length++;
    currentStreak = { champion: last.winner, length };
  }

  const progress: SeasonStats['progress'] = [];
  const tally = { fane: 0, lebo: 0 };
  for (const g of games) {
    if (g.winner) tally[g.winner]++;
    progress.push({ ...tally });
  }

  const play = { fane: emptyPlayerRoundStats(), lebo: emptyPlayerRoundStats() };
  for (const r of games.flatMap((g) => g.rounds)) {
    if (!r.stats) continue;
    for (const id of IDS) play[id] = addPlayerRoundStats(play[id], r.stats[id]);
  }

  return {
    games: games.length,
    draws: games.filter((g) => !g.winner).length,
    players,
    currentStreak,
    progress,
    play,
    gamesWithPlayStats: games.filter((g) => g.rounds.some((r) => r.stats)).length,
  };
}
