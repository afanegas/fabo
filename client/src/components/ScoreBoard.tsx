import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScoreBoard } from '../hooks/useScoreBoard';
import { CARD_IMAGES } from '../constants/cards';
import { CONFIG } from '@shared/rules';
import { PLAY_STAT_GROUPS } from '../constants/playStats';

export const ScoreBoard: React.FC = () => {
  const {
    gameState,
    showScoreBoard,
    isGameOver,
    sortedTotals,
    overallWinnerId,
    playerId,
    nextRound,
    isChampionship,
    leaveGame,
  } = useScoreBoard();

  if (!showScoreBoard || !gameState?.roundResults) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.85 }}
          className="glass-panel p-6 max-w-md w-full space-y-5 max-h-[90vh] overflow-y-auto"
        >
          <h2 className="text-2xl font-display font-bold text-center text-cabo-accent">
            {isGameOver ? '🏆 Game Over!' : `Round ${gameState.roundNumber} Results`}
          </h2>

          {/* Round Results */}
          <div className="space-y-3">
            {gameState.roundResults.playerResults
              .sort((a, b) => a.roundScore - b.roundScore)
              .map((result, index) => {
                const isWinner = result.playerId === gameState.roundResults!.winnerId;
                const isMe = result.playerId === playerId;
                return (
                  <motion.div
                    key={result.playerId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      rounded-xl p-3 border transition-all
                      ${isWinner ? 'border-cabo-accent/50 bg-cabo-accent/10' : 'border-cabo-border bg-cabo-surface/50'}
                      ${isMe ? 'ring-1 ring-cabo-accent/30' : ''}
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {isWinner && <span className="text-lg">👑</span>}
                        <span className={`font-display font-semibold ${isMe ? 'text-cabo-accent' : ''}`}>
                          {result.playerName}
                          {isMe ? ' (You)' : ''}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`font-display font-bold text-lg ${
                          result.roundScore === 0 ? 'text-cabo-green' : 'text-cabo-red'
                        }`}>
                          {result.roundScore === 0 ? '0' : result.roundScore}
                        </span>
                      </div>
                    </div>

                    {/* Card breakdown */}
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {result.cards.map((card, ci) => (
                        <span key={ci} className="flex items-center gap-1 text-xs pl-0.5 pr-1.5 py-0.5 rounded bg-slate-500/20 text-slate-300">
                          <img src={CARD_IMAGES[card.rank]} alt="" className="w-3 h-[18px] rounded-sm object-cover" />
                          {card.rank}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-1 text-[10px] text-cabo-textDim">
                      <span>Hand: {result.handTotal}</span>
                      {result.caboPenalty && <span className="text-cabo-red">+{CONFIG.CABO_PENALTY} Cabo penalty</span>}
                      {result.specialWin && <span className="text-cabo-accent">✨ Special Win!</span>}
                    </div>
                  </motion.div>
                );
              })}
          </div>

          {/* Cumulative Leaderboard */}
          <div className="border-t border-cabo-border pt-4">
            <h3 className="text-sm font-display font-semibold text-cabo-textDim mb-2">
              {isGameOver ? 'Final Standings' : 'Leaderboard'}
            </h3>
            <div className="space-y-1">
              {sortedTotals.map(([pid, total], i) => {
                const pName = gameState.players.find(p => p.id === pid)?.name || 'Unknown';
                return (
                  <div key={pid} className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <span className="text-cabo-textDim w-5">{i + 1}.</span>
                      <span className={`font-display ${pid === playerId ? 'text-cabo-accent' : ''}`}>
                        {pName}
                        {isGameOver && pid === overallWinnerId && ' 🏆'}
                      </span>
                    </span>
                    <span className={`font-display font-bold ${total === 0 ? 'text-cabo-green' : 'text-cabo-red'}`}>
                      {total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Play style & luck, added up over all rounds played so far */}
          <div className="border-t border-cabo-border pt-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-cabo-textDim font-display">
                  <th className="text-left font-semibold pb-1">
                    {isGameOver ? 'Game stats' : `Stats after ${gameState.roundNumber} round${gameState.roundNumber > 1 ? 's' : ''}`}
                  </th>
                  {sortedTotals.map(([pid]) => (
                    <th key={pid} className={`text-right font-semibold pb-1 ${pid === playerId ? 'text-cabo-accent' : ''}`}>
                      {gameState.players.find(p => p.id === pid)?.name}
                    </th>
                  ))}
                </tr>
              </thead>
              {PLAY_STAT_GROUPS.map((group) => (
                <tbody key={group.title}>
                  <tr>
                    <td colSpan={sortedTotals.length + 1} className="pt-2 pb-0.5 text-[10px] uppercase tracking-wider text-cabo-textDim">
                      {group.title}
                    </td>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.key} className="border-t border-cabo-border/40">
                      <td className="py-1 text-cabo-textDim">{row.label}</td>
                      {sortedTotals.map(([pid]) => (
                        <td key={pid} className="py-1 text-right font-display font-semibold">
                          {gameState.gameStats?.[pid]?.[row.key] ?? 0}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>

          {/* Action */}
          {!isGameOver && (
            <button onClick={nextRound} className="btn-primary w-full">
              Next Round →
            </button>
          )}
          {isGameOver && (
            <div className="text-center">
              <p className="text-cabo-accent font-display font-bold text-lg mb-2">
                {overallWinnerId === playerId ? '🎉 You Won!' : `${gameState.players.find(p => p.id === overallWinnerId)?.name} Wins!`}
              </p>
              {isChampionship ? (
                <button onClick={leaveGame} className="btn-primary">
                  🏆 Back to Championship
                </button>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  Play Again
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
