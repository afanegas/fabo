import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CONFIG } from '@shared/types';

export const CaboCallSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });

  return (
    <section id="cabo-call" ref={ref} className="relative min-h-screen flex flex-col items-center justify-center py-20 px-4 overflow-hidden">
      {/* Dramatic red ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          opacity: isInView ? 1 : 0,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(231,76,60,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Warning corner lights */}
      <div
        className="absolute top-0 left-0 w-1/2 h-1/2 pointer-events-none transition-opacity duration-1000"
        style={{
          opacity: isInView ? 0.6 : 0,
          background: 'radial-gradient(ellipse at 0% 0%, rgba(231,76,60,0.06) 0%, transparent 50%)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-1/2 h-1/2 pointer-events-none transition-opacity duration-1000"
        style={{
          opacity: isInView ? 0.6 : 0,
          background: 'radial-gradient(ellipse at 100% 100%, rgba(231,76,60,0.06) 0%, transparent 50%)',
        }}
      />

      {/* Top divider with red tint */}
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-cabo-red/30 to-transparent" />

      {/* Pulsing CABO button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="mb-10"
      >
        <motion.div
          animate={isInView ? {
            boxShadow: [
              '0 0 20px rgba(231,76,60,0.2), 0 0 60px rgba(231,76,60,0.1)',
              '0 0 40px rgba(231,76,60,0.4), 0 0 100px rgba(231,76,60,0.2)',
              '0 0 20px rgba(231,76,60,0.2), 0 0 60px rgba(231,76,60,0.1)',
            ],
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-40 h-40 md:w-52 md:h-52 rounded-full flex items-center justify-center cursor-default"
          style={{
            background: 'radial-gradient(circle, rgba(231,76,60,0.15) 0%, rgba(22,22,42,0.9) 70%)',
            border: '2px solid rgba(231,76,60,0.3)',
          }}
        >
          {/* Outer ring pulse */}
          <motion.div
            animate={isInView ? { scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full border border-cabo-red/30"
          />
          <motion.div
            animate={isInView ? { scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            className="absolute inset-0 rounded-full border border-cabo-red/20"
          />

          <span
            className="font-display font-extrabold text-4xl md:text-5xl tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #e74c3c, #ff6b5a, #e74c3c)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(231,76,60,0.5))',
            }}
          >
            CABO
          </span>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-center max-w-2xl"
      >
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
          <span className="text-cabo-text">The Final </span>
          <span style={{ color: '#e74c3c' }}>Gambit</span>
        </h2>

        <p className="text-cabo-textDim text-base md:text-lg leading-relaxed mb-8">
          Think you have the lowest score? Call{' '}
          <strong className="text-cabo-red">CABO</strong> to trigger the endgame.
          Every other player gets one final turn. But beware…
        </p>

        {/* Warning cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="p-5 rounded-xl border border-cabo-red/20 text-left"
            style={{ background: 'rgba(231,76,60,0.05)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⚠️</span>
              <h3 className="font-display font-bold text-cabo-red text-sm">False Cabo Penalty</h3>
            </div>
            <p className="text-cabo-textDim text-sm leading-relaxed">
              If you don't have the lowest score when you call CABO, you receive an extra{' '}
              <strong className="text-cabo-red">{CONFIG.CABO_PENALTY}-point penalty</strong> on top of your hand value.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="p-5 rounded-xl border border-cabo-accent/20 text-left"
            style={{ background: 'rgba(212,175,55,0.05)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">👑</span>
              <h3 className="font-display font-bold text-cabo-accent text-sm">Legendary Instant Win</h3>
            </div>
            <p className="text-cabo-textDim text-sm leading-relaxed">
              Hold exactly two <strong className="text-cabo-accent">12s</strong> and two{' '}
              <strong className="text-cabo-accent">13s</strong> to instantly win and slam every opponent with{' '}
              <strong className="text-cabo-accent">{CONFIG.SPECIAL_WIN_PENALTY} penalty points</strong>.
            </p>
          </motion.div>
        </div>

        {/* 12-12-13-13 display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex justify-center gap-2"
        >
          {['12', '12', '13', '13'].map((val, i) => (
            <motion.div
              key={i}
              animate={isInView ? {
                boxShadow: [
                  '0 0 5px rgba(212,175,55,0.2)',
                  '0 0 20px rgba(212,175,55,0.5)',
                  '0 0 5px rgba(212,175,55,0.2)',
                ],
              } : {}}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              className="w-12 h-16 rounded-lg border border-cabo-accent/40 flex items-center justify-center bg-cabo-surface"
            >
              <span className="font-display font-bold text-lg text-cabo-accent">{val}</span>
            </motion.div>
          ))}
        </motion.div>
        <p className="text-cabo-textDim/50 text-xs mt-3 font-display">
          The legendary hand — instant victory
        </p>
      </motion.div>
    </section>
  );
};
