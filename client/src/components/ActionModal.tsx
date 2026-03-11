import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export const ActionModal: React.FC = () => {
  const { actionMode, gameState, playerId, selectedCardIndex, setSelectedCardIndex, useAction, skipAction } = useGameStore();
  const [targetPlayerId, setTargetPlayerId] = useState<string | null>(null);
  const [targetCardIndex, setTargetCardIndex] = useState<number | null>(null);

  if (!actionMode || !gameState) return null;

  const opponents = gameState.players.filter(p => p.id !== playerId);

  const handleConfirm = () => {
    if (actionMode === 'PEEK' && selectedCardIndex !== null) {
      useAction({ myCardIndex: selectedCardIndex });
      setSelectedCardIndex(null);
    } else if (actionMode === 'SPY' && targetPlayerId && targetCardIndex !== null) {
      useAction({ targetPlayerId, targetCardIndex });
      setTargetPlayerId(null);
      setTargetCardIndex(null);
    } else if (actionMode === 'SWAP' && selectedCardIndex !== null && targetPlayerId && targetCardIndex !== null) {
      useAction({ myCardIndex: selectedCardIndex, targetPlayerId, targetCardIndex });
      setSelectedCardIndex(null);
      setTargetPlayerId(null);
      setTargetCardIndex(null);
    }
  };

  const handleSkip = () => {
    skipAction();
    setSelectedCardIndex(null);
    setTargetPlayerId(null);
    setTargetCardIndex(null);
  };

  const titles: Record<string, string> = {
    PEEK: '👁 Peek — Look at one of your cards',
    SPY: '🔍 Spy — Look at an opponent\'s card',
    SWAP: '🔄 Swap — Swap a card with an opponent',
  };

  const descriptions: Record<string, string> = {
    PEEK: 'Select one of your cards to peek at',
    SPY: 'Select an opponent, then choose one of their cards',
    SWAP: 'Select one of your cards and one opponent\'s card to swap (blind)',
  };

  let canConfirm = false;
  if (actionMode === 'PEEK') canConfirm = selectedCardIndex !== null;
  if (actionMode === 'SPY') canConfirm = !!targetPlayerId && targetCardIndex !== null;
  if (actionMode === 'SWAP') canConfirm = selectedCardIndex !== null && !!targetPlayerId && targetCardIndex !== null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-panel p-6 max-w-sm w-full space-y-4 max-h-[85vh] overflow-y-auto"
        >
          <h3 className="text-lg font-display font-bold text-cabo-accent">
            {titles[actionMode]}
          </h3>
          <p className="text-cabo-textDim text-sm">
            {descriptions[actionMode]}
          </p>

          {/* PEEK — select own card */}
          {actionMode === 'PEEK' && (
            <div className="space-y-2">
              <p className="text-xs font-display text-cabo-textDim">Select one of your cards:</p>
              <div className="flex gap-2 justify-center">
                {gameState.myCards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCardIndex(selectedCardIndex === i ? null : i)}
                    className={`
                      w-12 h-16 rounded-lg border text-xs font-display font-bold transition-all
                      ${selectedCardIndex === i
                        ? 'border-cabo-accent bg-cabo-accent/20 text-cabo-accent ring-2 ring-cabo-accent'
                        : 'border-cabo-border bg-cabo-surface text-cabo-textDim hover:border-cabo-accent/50'
                      }
                    `}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target player selection for SPY and SWAP */}
          {(actionMode === 'SPY' || actionMode === 'SWAP') && (
            <div className="space-y-2">
              <p className="text-xs font-display text-cabo-textDim">Select opponent:</p>
              <div className="flex gap-2 flex-wrap">
                {opponents.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setTargetPlayerId(p.id); setTargetCardIndex(null); }}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-display transition-all
                      ${targetPlayerId === p.id
                        ? 'bg-cabo-accent text-cabo-dark font-semibold'
                        : 'bg-cabo-surface border border-cabo-border text-cabo-text hover:border-cabo-accent/50'
                      }
                    `}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Target card selection */}
              {targetPlayerId && (
                <div className="space-y-1">
                  <p className="text-xs font-display text-cabo-textDim">Select their card:</p>
                  <div className="flex gap-2">
                    {Array.from({
                      length: opponents.find(p => p.id === targetPlayerId)?.cardCount || 0
                    }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTargetCardIndex(i)}
                        className={`
                          w-10 h-14 rounded-lg border text-xs font-display font-bold transition-all
                          ${targetCardIndex === i
                            ? 'border-cabo-accent bg-cabo-accent/20 text-cabo-accent'
                            : 'border-cabo-border bg-cabo-surface text-cabo-textDim hover:border-cabo-accent/50'
                          }
                        `}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SWAP — select own card inside modal */}
          {actionMode === 'SWAP' && (
            <div className="space-y-2">
              <p className="text-xs font-display text-cabo-textDim">Select your card to swap:</p>
              <div className="flex gap-2 justify-center">
                {gameState.myCards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCardIndex(selectedCardIndex === i ? null : i)}
                    className={`
                      w-12 h-16 rounded-lg border text-xs font-display font-bold transition-all
                      ${selectedCardIndex === i
                        ? 'border-cabo-accent bg-cabo-accent/20 text-cabo-accent ring-2 ring-cabo-accent'
                        : 'border-cabo-border bg-cabo-surface text-cabo-textDim hover:border-cabo-accent/50'
                      }
                    `}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              {selectedCardIndex !== null && (
                <p className="text-xs text-cabo-accent text-center font-display">
                  ✓ Your card {selectedCardIndex + 1} selected
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSkip} className="btn-secondary text-sm flex-1">
              Skip
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`btn-primary text-sm flex-1 ${!canConfirm ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
