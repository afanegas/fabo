import React from 'react';
import { motion } from 'framer-motion';
import { CardHighlight, ACTION_ICONS } from '../utils/actionNotice';

// Pulsing badge on a card an opponent just peeked at, spied on or swapped
export const CardActionMarker: React.FC<{ highlight?: CardHighlight; small?: boolean }> = ({ highlight, small }) => {
  if (!highlight) return null;
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className={`flex items-center justify-center rounded-full bg-cabo-accent text-cabo-dark shadow-lg
          ${small ? 'w-5 h-5 text-[10px] md:w-7 md:h-7 md:text-sm' : 'w-9 h-9 text-lg'}`}
      >
        {ACTION_ICONS[highlight.type]}
      </motion.span>
    </div>
  );
};
