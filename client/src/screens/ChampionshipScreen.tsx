import React from 'react';
import { motion } from 'framer-motion';
import { CHAMPIONS, ChampionId } from '@shared/championship';
import { useChampionshipScreen } from '../hooks/useChampionshipScreen';
import { ProgressChart } from '../components/championship/ProgressChart';
import { CHAMPION_COLORS } from '../constants/championship';
import { ChampionStats } from '../utils/championshipStats';
import { PLAY_STAT_GROUPS } from '../constants/playStats';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

const STAT_ROWS: { label: string; value: (s: ChampionStats) => string }[] = [
  { label: 'Games won', value: (s) => `${s.gamesWon}` },
  { label: 'Rounds won', value: (s) => `${s.roundsWon} / ${s.roundsPlayed}` },
  { label: 'Avg. points per round', value: (s) => `${s.avgRoundScore}` },
  { label: 'Avg. final score', value: (s) => `${s.avgGameTotal}` },
  { label: 'Best final score', value: (s) => (s.bestGameTotal === null ? '–' : `${s.bestGameTotal}`) },
  {
    label: 'Cabo calls (won)',
    value: (s) =>
      s.caboCalls ? `${s.caboCalls} (${Math.round((s.caboSuccess / s.caboCalls) * 100)}%)` : '0',
  },
  { label: 'Special wins (2Q + 2K)', value: (s) => `${s.specialWins}` },
  { label: 'Longest win streak', value: (s) => `${s.longestStreak}` },
];

const nameOf = (id: ChampionId) => CHAMPIONS.find((c) => c.id === id)!.name;

export const ChampionshipScreen: React.FC = () => {
  const {
    error,
    data,
    season,
    stats,
    isCurrentSeason,
    setSelectedSeason,
    joinChampionship,
    close,
    showReset,
    setShowReset,
    resetInput,
    setResetInput,
    isResetting,
    handleReset,
  } = useChampionshipScreen();

  return (
    <div className="min-h-screen bg-cabo-darker text-cabo-text p-4 sm:p-8">
      {error && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl bg-cabo-dark/90 border border-cabo-red/60 text-cabo-red text-sm">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        <div className="flex items-center justify-between gap-4">
          <button onClick={close} className="text-cabo-textDim hover:text-cabo-text text-sm font-display">
            ← Back
          </button>
          {data && data.seasons.length > 1 && (
            <select
              value={season?.number ?? ''}
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
              className="bg-cabo-surface border border-cabo-border rounded-lg px-3 py-1.5 text-sm font-display"
            >
              {[...data.seasons].reverse().map((s) => (
                <option key={s.number} value={s.number}>
                  Season {s.number}
                  {s.endedAt ? '' : ' (current)'}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-cabo-accent tracking-wide">
            Fane-Lebo Life Championship
          </h1>
          {season && (
            <p className="text-cabo-textDim text-sm">
              Season {season.number} · {formatDate(season.startedAt)}
              {season.endedAt ? ` – ${formatDate(season.endedAt)}` : ' – today'}
            </p>
          )}
        </div>

        {/* Standings */}
        {stats && (
          <div className="glass-panel p-6 flex items-center justify-center gap-6 sm:gap-10">
            {CHAMPIONS.map(({ id, name }, i) => (
              <React.Fragment key={id}>
                {i === 1 && <span className="text-3xl text-cabo-textDim font-display">:</span>}
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl font-display font-extrabold" style={{ color: CHAMPION_COLORS[id] }}>
                    {stats.players[id].gamesWon}
                  </div>
                  <div className="font-display font-semibold mt-1">{name}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
        {stats && (
          <p className="text-center text-cabo-textDim text-sm -mt-3">
            {stats.games} {stats.games === 1 ? 'game' : 'games'}
            {stats.draws ? ` · ${stats.draws} ${stats.draws === 1 ? 'draw' : 'draws'}` : ''}
            {stats.currentStreak &&
              ` · ${nameOf(stats.currentStreak.champion)} won the last ${
                stats.currentStreak.length === 1 ? 'game' : `${stats.currentStreak.length} games`
              }`}
          </p>
        )}

        {/* Play */}
        {isCurrentSeason && (
          <div className="glass-panel p-6 space-y-3 text-center">
            <p className="text-cabo-textDim text-sm font-display">Who are you?</p>
            <div className="flex gap-3">
              {CHAMPIONS.map(({ id, name }) => (
                <button
                  key={id}
                  onClick={() => joinChampionship(id)}
                  className="flex-1 py-4 rounded-2xl font-display font-extrabold tracking-widest text-lg text-cabo-dark transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{ background: CHAMPION_COLORS[id] }}
                >
                  I'M {name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress */}
        {stats && (
          <div className="glass-panel p-6 space-y-3">
            <h2 className="font-display font-semibold text-cabo-textDim text-sm">Games won over time</h2>
            <ProgressChart progress={stats.progress} />
          </div>
        )}

        {/* Statistics */}
        {stats && stats.games > 0 && (
          <div className="glass-panel p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-cabo-textDim font-display">
                  <th className="text-left font-semibold pb-2">Statistics</th>
                  {CHAMPIONS.map(({ id, name }) => (
                    <th key={id} className="text-right font-semibold pb-2" style={{ color: CHAMPION_COLORS[id] }}>
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAT_ROWS.map((row) => (
                  <tr key={row.label} className="border-t border-cabo-border/50">
                    <td className="py-2 text-cabo-textDim">{row.label}</td>
                    {CHAMPIONS.map(({ id }) => (
                      <td key={id} className="py-2 text-right font-display font-semibold">
                        {row.value(stats.players[id])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Play style & luck, cumulated over the season */}
        {stats && stats.gamesWithPlayStats > 0 && (
          <div className="glass-panel p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-cabo-textDim font-display">
                  <th className="text-left font-semibold pb-1">
                    Play style & luck
                    <span className="block text-[10px] font-normal">total · per game</span>
                  </th>
                  {CHAMPIONS.map(({ id, name }) => (
                    <th key={id} className="text-right font-semibold pb-1 align-top" style={{ color: CHAMPION_COLORS[id] }}>
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              {PLAY_STAT_GROUPS.map((group) => (
                <tbody key={group.title}>
                  <tr>
                    <td colSpan={3} className="pt-3 pb-1 text-[10px] uppercase tracking-wider text-cabo-textDim">
                      {group.title}
                    </td>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.key} className="border-t border-cabo-border/50">
                      <td className="py-2 text-cabo-textDim">{row.label}</td>
                      {CHAMPIONS.map(({ id }) => {
                        const total = stats.play[id][row.key];
                        return (
                          <td key={id} className="py-2 text-right font-display font-semibold">
                            {total}
                            <span className="text-cabo-textDim font-normal text-xs">
                              {' · '}
                              {Math.round((total / stats.gamesWithPlayStats) * 10) / 10}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        )}

        {/* Recent games */}
        {season && season.games.length > 0 && (
          <div className="glass-panel p-6 space-y-2">
            <h2 className="font-display font-semibold text-cabo-textDim text-sm mb-2">Recent games</h2>
            {[...season.games]
              .reverse()
              .slice(0, 10)
              .map((g) => (
                <div key={g.id} className="flex items-center justify-between text-sm border-t border-cabo-border/50 pt-2">
                  <span className="text-cabo-textDim">{formatDate(g.endedAt)}</span>
                  <span className="font-display">
                    {CHAMPIONS.map(({ id }) => g.totals[id]).join(' : ')}
                    {/* Games are single rounds now; older games could have several */}
                    {g.rounds.length > 1 && <span className="text-cabo-textDim"> · {g.rounds.length} rounds</span>}
                  </span>
                  <span
                    className="font-display font-semibold"
                    style={{ color: g.winner ? CHAMPION_COLORS[g.winner] : undefined }}
                  >
                    {g.winner ? `${nameOf(g.winner)} 🏆` : 'Draw'}
                  </span>
                </div>
              ))}
          </div>
        )}

        {/* Reset */}
        {isCurrentSeason && (
          <div className="text-center pb-8">
            {!showReset ? (
              <button
                onClick={() => setShowReset(true)}
                className="text-cabo-textDim hover:text-cabo-red text-xs font-display tracking-wider"
              >
                Reset championship
              </button>
            ) : (
              <div className="glass-panel p-5 space-y-3 border-cabo-red/50">
                <p className="text-sm">
                  This ends Season {season?.number} and starts a new season at 0 : 0. Past seasons stay viewable.
                  Type <span className="font-display font-bold text-cabo-red">RESET</span> to confirm.
                </p>
                <input
                  value={resetInput}
                  onChange={(e) => setResetInput(e.target.value)}
                  className="w-full text-center py-2 rounded-xl bg-cabo-dark border border-cabo-border focus:outline-none focus:border-cabo-red font-display tracking-widest"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={() => { setShowReset(false); setResetInput(''); }} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={resetInput !== 'RESET' || isResetting}
                    className="flex-1 py-3 rounded-xl font-display font-semibold bg-cabo-red text-white disabled:opacity-40"
                  >
                    Start new season
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
