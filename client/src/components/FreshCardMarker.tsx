import React from 'react';
import { motion } from 'framer-motion';

// Frame and label on a card that just arrived in a hand, so its new place is easy to follow
export const FreshCardMarker: React.FC<{ small?: boolean }> = ({ small }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: [0.6, 1, 0.6] }}
    transition={{ duration: 1.2, repeat: Infinity }}
    className={`absolute pointer-events-none z-10 border-emerald-400
      ${small ? '-inset-0.5 rounded md:rounded-lg border-2' : '-inset-1 rounded-xl border-[3px]'}`}
    style={{ boxShadow: '0 0 14px rgba(52, 211, 153, 0.8), inset 0 0 10px rgba(52, 211, 153, 0.5)' }}
  >
    <span
      className={`absolute left-1/2 -translate-x-1/2 bg-emerald-400 text-cabo-dark font-display font-bold rounded-full leading-none
        ${small ? '-top-2 text-[7px] px-1 py-0.5' : 'top-1 text-[10px] px-1.5 py-0.5'}`}
    >
      NEW
    </span>
  </motion.div>
);
