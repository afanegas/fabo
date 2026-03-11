import React from 'react';
import { motion } from 'framer-motion';

export const FooterSection: React.FC<{
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}> = ({ onCreateRoom, onJoinRoom }) => {
  return (
    <footer id="footer" className="relative py-20 px-4 overflow-hidden">
      {/* Top divider */}
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-cabo-accent/20 to-transparent" />

      {/* Background ambient cards */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        {/* Draw pile silhouette */}
        <div className="absolute right-[15%] top-1/2 -translate-y-1/2">
          {[...Array(6)].map((_, i) => (
            <div
              key={`draw-${i}`}
              className="absolute w-16 h-24 rounded-xl border border-cabo-accent"
              style={{
                transform: `translateX(${i * 2}px) translateY(${-i * 2}px) rotate(${2 + i}deg)`,
              }}
            />
          ))}
        </div>

        {/* Discard pile silhouette */}
        <div className="absolute left-[15%] top-1/2 -translate-y-1/2">
          {[...Array(3)].map((_, i) => (
            <div
              key={`discard-${i}`}
              className="absolute w-16 h-24 rounded-xl border border-cabo-accent"
              style={{
                transform: `rotate(${-10 + i * 12}deg) translateX(${i * 3}px)`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold text-cabo-text mb-4"
        >
          Ready to Play?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-cabo-textDim mb-10 text-base"
        >
          Gather your friends, test your memory, and may the lowest score win.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <button
            onClick={onCreateRoom}
            className="group relative px-10 py-4 rounded-2xl font-display font-bold text-lg text-cabo-dark overflow-hidden transition-all duration-500"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-xl">🎴</span> Create Room
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cabo-accent via-cabo-accentLight to-cabo-accent bg-[length:200%_100%] animate-shimmer" />
          </button>

          <button
            onClick={onJoinRoom}
            className="px-10 py-4 rounded-2xl font-display font-bold text-lg text-cabo-text border-2 border-cabo-accent/30 transition-all duration-500 hover:border-cabo-accent/70"
            style={{ background: 'rgba(22,22,42,0.7)', backdropFilter: 'blur(10px)' }}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">🚪</span> Join Room
            </span>
          </button>
        </motion.div>

        {/* Player count badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <div className="flex -space-x-2">
            {['🟢', '🔵', '🟡', '🔴'].map((dot, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-cabo-dark flex items-center justify-center text-[8px] bg-cabo-surface"
              >
                {dot}
              </div>
            ))}
          </div>
          <span className="text-cabo-textDim text-sm font-display">
            2 – 8 Players · 5 – 30 Minutes
          </span>
        </motion.div>

        {/* Bottom divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-cabo-border to-transparent mb-8" />

        {/* Copyright + Credits */}
        <div className="flex flex-col items-center gap-2">
          <p
            className="font-display font-bold text-lg"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #f0d060)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CABO
          </p>
          <p className="text-cabo-textDim/40 text-xs font-display">
            A game of memory, deception & low scores
          </p>
        </div>
      </div>
    </footer>
  );
};
