import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

// All "what just happened" messages in one fixed place under the piles, so the eyes
// don't have to jump to the top of the screen and no cards get covered
export const GameMessages: React.FC = () => {
  const { snapNotification, actionNotice, personalNotices, dismissPersonalNotice } = useGameStore();

  return (
    <div className="w-full max-w-sm min-h-[2.75rem] flex flex-col items-stretch justify-start gap-1.5 px-4">
      <AnimatePresence initial={false}>
        {personalNotices.map((n) => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 bg-cabo-red/90 text-white pl-3 pr-1.5 py-1.5 rounded-xl text-xs md:text-sm font-display font-semibold shadow-lg"
          >
            <span className="flex-1">{n.text}</span>
            <button
              onClick={() => dismissPersonalNotice(n.id)}
              className="shrink-0 bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 text-xs font-bold"
            >
              OK
            </button>
          </motion.div>
        ))}
        {actionNotice && (
          <motion.div
            key={actionNotice}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center bg-cabo-accent/90 text-cabo-dark px-3 py-1.5 rounded-xl text-xs md:text-sm font-display font-semibold shadow-lg"
          >
            {actionNotice}
          </motion.div>
        )}
        {snapNotification && (
          <motion.div
            key="snap"
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center bg-cabo-green/90 text-white px-3 py-1.5 rounded-xl text-xs md:text-sm font-display shadow-lg"
          >
            ⚡ {snapNotification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
