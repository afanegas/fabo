import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

import { TUTORIAL_CARDS, TUTORIAL_ACTIONS } from '../../constants/tutorial';
import { Rank } from '@shared/types';
import { CardFace } from '../CardFace';

// ─── Hook: Section visibility ───
const useSectionInView = (threshold = 0.3) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: threshold });
  return { ref, isInView };
};

// ─── Interactive Card (flippable) ───
const FlipCard: React.FC<{
  value: Rank;
  index: number;
  canPeek: boolean;
  onPeek: () => void;
  isPeeked: boolean;
}> = ({ value, index, canPeek, onPeek, isPeeked }) => {
  return (
    <motion.div
      className="flip-card-container cursor-pointer"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, type: 'spring', stiffness: 150 }}
      onHoverStart={() => canPeek && onPeek()}
      onClick={() => canPeek && onPeek()}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="flip-card-inner w-20 h-28 md:w-24 md:h-36 relative"
        animate={{ rotateY: isPeeked ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 25 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Face down */}
        <div
          className="flip-card-face card-face-down absolute inset-0 rounded-xl border border-cabo-border shadow-xl flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {canPeek && (
            <motion.div
              className="absolute inset-0 rounded-xl"
              animate={{ boxShadow: ['0 0 0px rgba(212,175,55,0)', '0 0 20px rgba(212,175,55,0.3)', '0 0 0px rgba(212,175,55,0)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Face up */}
        <div
          className="flip-card-face absolute inset-0 rounded-xl border border-cabo-border shadow-xl overflow-hidden text-lg"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <CardFace rank={value} />
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Memory Phase Section ───
const MemoryPhase: React.FC = () => {
  const { ref, isInView } = useSectionInView(0.4);
  const [peekedCards, setPeekedCards] = useState<Set<number>>(new Set());
  const [peekCount, setPeekCount] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!isInView) {
      setPeekedCards(new Set());
      setPeekCount(0);
      setShowMessage(false);
    }
  }, [isInView]);

  const handlePeek = (index: number) => {
    if (peekCount >= 2 || peekedCards.has(index)) return;
    setPeekedCards(prev => new Set(prev).add(index));
    setPeekCount(prev => prev + 1);

    setTimeout(() => {
      setPeekedCards(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 2000);

    if (peekCount === 1) {
      setTimeout(() => setShowMessage(true), 2500);
    }
  };

  return (
    <div ref={ref} className="tutorial-phase min-h-[80vh] flex flex-col items-center justify-center py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <span className="text-cabo-accent/60 text-sm font-display tracking-[0.3em] uppercase mb-3 block">
          Phase 01
        </span>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-cabo-text mb-4">
          The Memory Phase
        </h2>
        <p className="text-cabo-textDim text-base md:text-lg max-w-md mx-auto">
          Each player is dealt 4 face-down cards. You may peek at exactly <strong className="text-cabo-accent">two</strong> before the game begins.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex gap-3 md:gap-5 mb-8"
      >
        {TUTORIAL_CARDS.map((card, i) => (
          <FlipCard
            key={i}
            value={card.value}
            index={i}
            canPeek={isInView && peekCount < 2 && !peekedCards.has(i)}
            onPeek={() => handlePeek(i)}
            isPeeked={peekedCards.has(i)}
          />
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView && !showMessage ? { opacity: [0.4, 0.9, 0.4] } : { opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-cabo-accent text-sm font-display"
      >
        {peekCount < 2 ? `👁 Hover or tap to peek (${2 - peekCount} remaining)` : ''}
      </motion.p>

      <AnimatePresence>
        {showMessage && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-cabo-accent font-display text-lg font-semibold mt-4 text-center"
          >
            Memorize your hand. You only get one look. 🧠
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Action Arsenal Section ───
const ActionArsenal: React.FC = () => {
  const { ref, isInView } = useSectionInView(0.3);

  const actions = [
    {
      icon: '👁',
      name: 'Peek',
      cards: '7 & 8',
      description: 'Look at one of your own face-down cards. Knowledge is power — but can you remember?',
      color: '#d4af37',
      gradient: 'from-amber-500/20 to-yellow-600/10',
    },
    {
      icon: '🔍',
      name: 'Spy',
      cards: '9 & 10',
      description: "Secretly look at one of an opponent's cards. Use their secrets against them.",
      color: '#2ecc71',
      gradient: 'from-emerald-500/20 to-green-600/10',
    },
    {
      icon: '🔄',
      name: 'Swap',
      cards: '11 & 12',
      description: "Blind swap — exchange one of your cards with an opponent's. Neither player sees what moves.",
      color: '#6c3483',
      gradient: 'from-purple-500/20 to-violet-600/10',
    },
  ];

  return (
    <div ref={ref} className="tutorial-phase min-h-[80vh] flex flex-col items-center justify-center py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <span className="text-cabo-accent/60 text-sm font-display tracking-[0.3em] uppercase mb-3 block">
          Phase 02
        </span>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-cabo-text mb-4">
          The Action Arsenal
        </h2>
        <p className="text-cabo-textDim text-base md:text-lg max-w-md mx-auto">
          Draw action cards from the deck to gain powerful abilities.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl w-full">
        {TUTORIAL_ACTIONS.map((action, i) => (
          <motion.div
            key={action.name}
            initial={{ opacity: 0, y: 50, rotateX: 15 }}
            animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: 15 }}
            transition={{ delay: i * 0.2, duration: 0.8, type: 'spring' }}
            whileHover={{ scale: 1.05, y: -8 }}
            className={`action-card relative rounded-2xl border border-cabo-border/50 p-6 bg-gradient-to-br ${action.gradient} backdrop-blur-sm overflow-hidden group cursor-default`}
            style={{
              background: `linear-gradient(135deg, rgba(22,22,42,0.9), rgba(26,26,46,0.9))`,
              boxShadow: `0 0 0 1px ${action.color}15`,
            }}
          >
            {/* Glow effect on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
              style={{ boxShadow: `inset 0 0 40px ${action.color}20, 0 0 30px ${action.color}10` }}
            />

            <div className="relative z-10">
              <div className="text-5xl mb-4">{action.icon}</div>
              <h3 className="font-display font-bold text-xl mb-1" style={{ color: action.color }}>
                {action.name}
              </h3>
              <p className="text-cabo-textDim/80 text-xs font-display mb-3">Cards {action.cards}</p>
              <p className="text-cabo-textDim text-sm leading-relaxed">
                {action.description}
              </p>
            </div>

            {/* Floating card values */}
            <div className="absolute top-4 right-4 flex gap-1">
              {action.cards.split(' & ').map(num => (
                <span
                  key={num}
                  className="w-7 h-9 rounded-md border flex items-center justify-center text-xs font-display font-bold"
                  style={{ borderColor: `${action.color}40`, color: action.color }}
                >
                  {num}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── Risk/Reward Section ───
const RiskReward: React.FC = () => {
  const { ref, isInView } = useSectionInView(0.3);
  const [showSuccess, setShowSuccess] = useState(true);

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setShowSuccess(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <div ref={ref} className="tutorial-phase min-h-[70vh] flex flex-col items-center justify-center py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <span className="text-cabo-accent/60 text-sm font-display tracking-[0.3em] uppercase mb-3 block">
          Phase 03
        </span>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-cabo-text mb-4">
          Risk vs. Reward
        </h2>
        <p className="text-cabo-textDim text-base md:text-lg max-w-lg mx-auto">
          Swap multiple cards of the <strong className="text-cabo-accent">same value</strong> at once for massive plays.
          But mistake your memory, and you'll pay the price.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.3 }}
        className="relative w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center p-8 rounded-2xl border border-cabo-green/30"
              style={{
                background: 'linear-gradient(135deg, rgba(46,204,113,0.08), rgba(22,22,42,0.9))',
                boxShadow: '0 0 40px rgba(46,204,113,0.1)',
              }}
            >
              <div className="flex justify-center gap-3 mb-6">
                {['5', '5', '5'].map((val, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.15, type: 'spring' }}
                    className="w-14 h-20 rounded-xl border-2 border-cabo-green/50 flex items-center justify-center bg-cabo-surface"
                    style={{ boxShadow: '0 0 15px rgba(46,204,113,0.3)' }}
                  >
                    <span className="font-display font-bold text-xl text-cabo-green">{val}</span>
                  </motion.div>
                ))}
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-cabo-green font-display font-bold text-lg"
              >
                ✓ Triple Swap! Cards discarded.
              </motion.p>
              <p className="text-cabo-textDim text-sm mt-2">
                All three 5s matched — removed from your display.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="failure"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center p-8 rounded-2xl border border-cabo-red/30"
              style={{
                background: 'linear-gradient(135deg, rgba(231,76,60,0.08), rgba(22,22,42,0.9))',
                boxShadow: '0 0 40px rgba(231,76,60,0.1)',
              }}
            >
              <div className="flex justify-center gap-3 mb-6">
                {['5', '5', '7'].map((val, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: 20 }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                      x: i === 2 ? [0, -5, 5, -3, 3, 0] : 0,
                    }}
                    transition={{
                      delay: i * 0.15,
                      type: 'spring',
                      x: { delay: 0.6, duration: 0.4 },
                    }}
                    className={`w-14 h-20 rounded-xl border-2 flex items-center justify-center bg-cabo-surface ${
                      i === 2 ? 'border-cabo-red/70' : 'border-cabo-red/30'
                    }`}
                    style={i === 2 ? { boxShadow: '0 0 15px rgba(231,76,60,0.4)' } : {}}
                  >
                    <span className={`font-display font-bold text-xl ${i === 2 ? 'text-cabo-red' : 'text-cabo-textDim'}`}>
                      {val}
                    </span>
                  </motion.div>
                ))}
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-cabo-red font-display font-bold text-lg"
              >
                ✗ Memory Mistake — Turn Lost!
              </motion.p>
              <p className="text-cabo-textDim text-sm mt-2">
                The 7 didn't match. Cards return, drawn card discarded.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// ─── Exported Tutorial Section ───
export const TutorialSection: React.FC = () => {
  return (
    <section id="tutorial" className="relative">
      {/* Section divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-cabo-accent/30 to-transparent" />

      <MemoryPhase />

      <div className="w-full h-px bg-gradient-to-r from-transparent via-cabo-accent/20 to-transparent" />

      <ActionArsenal />

      <div className="w-full h-px bg-gradient-to-r from-transparent via-cabo-accent/20 to-transparent" />

      <RiskReward />
    </section>
  );
};
