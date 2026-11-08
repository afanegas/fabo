import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RpsChoice } from '@shared/types';
import { useGameStore } from '../store/gameStore';

const CHOICES: { id: RpsChoice; icon: string; label: string }[] = [
  { id: 'rock', icon: '✊', label: 'Rock' },
  { id: 'paper', icon: '✋', label: 'Paper' },
  { id: 'scissors', icon: '✌️', label: 'Scissors' },
];
const ICON = Object.fromEntries(CHOICES.map((c) => [c.id, c.icon])) as Record<RpsChoice, string>;

// Rock-paper-scissors at the start of a game: the winner starts
export const StarterPick: React.FC = () => {
  const { gameState, playerId, pickStarter } = useGameStore();
  const pick = gameState?.starterPick;
  if (!gameState || gameState.phase !== 'STARTER_PICK' || !pick) return null;

  const nameOf = (id: string) =>
    id === playerId ? 'You' : gameState.players.find((p) => p.id === id)?.name ?? '?';
  const amCandidate = !!playerId && pick.candidates.includes(playerId);
  const waitingFor = pick.candidates.filter((id) => !pick.pickedIds.includes(id) && id !== playerId);
  const reveal = pick.reveal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-gradient-to-b from-cabo-surface/95 to-cabo-dark/95 shadow-2xl p-6 text-center space-y-5"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cabo-textDim font-display">Who starts?</p>
          <h2 className="text-xl font-display font-bold text-cabo-accent mt-1">Rock · Paper · Scissors</h2>
        </div>

        <AnimatePresence mode="wait">
          {reveal ? (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex justify-center gap-6">
                {Object.entries(reveal.picks).map(([id, choice], i) => (
                  <motion.div
                    key={id}
                    initial={{ rotateY: 90, scale: 0.6 }}
                    animate={{ rotateY: 0, scale: 1 }}
                    transition={{ delay: i * 0.15, type: 'spring', stiffness: 180 }}
                    className={`flex flex-col items-center gap-1 ${
                      reveal.winnerId && reveal.winnerId !== id ? 'opacity-40' : ''
                    }`}
                  >
                    <span className="text-5xl">{ICON[choice]}</span>
                    <span className="text-xs font-display text-cabo-textDim">{nameOf(id)}</span>
                  </motion.div>
                ))}
              </div>
              <p className="font-display font-semibold text-cabo-text">
                {reveal.outcome === 'winner' && reveal.winnerId
                  ? reveal.winnerId === playerId ? '🎉 You start!' : `${nameOf(reveal.winnerId)} starts!`
                  : reveal.outcome === 'tie'
                    ? 'Tie — once more!'
                    : 'The winners go again…'}
              </p>
            </motion.div>
          ) : amCandidate && !pick.myPick ? (
            <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center gap-3">
              {CHOICES.map((c) => (
                <motion.button
                  key={c.id}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => pickStarter(c.id)}
                  className="flex flex-col items-center gap-1 w-20 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-cabo-accent/15 hover:border-cabo-accent/50 transition-colors"
                >
                  <span className="text-4xl">{c.icon}</span>
                  <span className="text-xs font-display text-cabo-textDim">{c.label}</span>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {pick.myPick && <span className="text-5xl block">{ICON[pick.myPick]}</span>}
              <p className="text-sm text-cabo-textDim animate-pulse">
                {waitingFor.length > 0
                  ? `Waiting for ${waitingFor.map(nameOf).join(', ')}…`
                  : 'Waiting for the others…'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
