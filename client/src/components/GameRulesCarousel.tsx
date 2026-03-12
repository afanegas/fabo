import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./Card"; // Import the new Card visuals

interface GameRulesCarouselProps {
  onClose: () => void;
}

const SlideVisual = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-center gap-4 py-4 my-2 h-32">
    {children}
  </div>
);

const slides = [
  {
    title: "Objective",
    icon: "🎯",
    content:
      "The goal of CABO is to have the lowest sum of cards in front of you. When you think you have the lowest score, call 'CABO'!",
    visual: (
      <SlideVisual>
        <Card size="sm" card={{ rank: 1, suit: "spades" } as any} />
        <span className="text-2xl font-bold font-display text-cabo-textDim">
          +
        </span>
        <Card size="sm" card={{ rank: 2, suit: "hearts" } as any} />
        <span className="text-2xl font-bold font-display text-cabo-textDim">
          =
        </span>
        <div className="flex items-center justify-center w-12 h-12 text-2xl font-bold text-white border-2 rounded-full border-cabo-green bg-cabo-green/20 font-display shadow-[0_0_15px_rgba(46,204,113,0.5)]">
          3
        </div>
      </SlideVisual>
    ),
  },
  {
    title: "Setup & Memorize",
    icon: "🧠",
    content:
      "Each player is dealt 4 face-down cards. At the start, you can peek at two of your cards. Remember them well!",
    visual: (
      <SlideVisual>
        <div className="relative">
          <Card size="sm" faceDown />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.5,
            }}
            className="absolute z-10 text-2xl -top-3 -right-3 drop-shadow-md"
          >
            👁️
          </motion.div>
        </div>
        <div className="relative">
          <Card size="sm" faceDown />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.5,
              delay: 0.5,
            }}
            className="absolute z-10 text-2xl -top-3 -right-3 drop-shadow-md"
          >
            👁️
          </motion.div>
        </div>
        <Card size="sm" faceDown />
        <Card size="sm" faceDown />
      </SlideVisual>
    ),
  },
  {
    title: "Your Turn",
    icon: "🔄",
    content:
      "On your turn, you can:\n1. Draw from the deck.\n2. Draw from the discard pile.\n3. Call CABO.\nIf you draw from the deck, you can swap it with one of your cards, or discard it.",
    visual: (
      <SlideVisual>
        <div className="flex flex-col items-center gap-2">
          <Card size="sm" faceDown />
          <span className="text-xs tracking-widest uppercase font-display text-cabo-textDim">
            Deck
          </span>
        </div>
        <motion.div
          animate={{ x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-2xl text-cabo-accent"
        >
          ➔
        </motion.div>
        <div className="flex flex-col items-center gap-2">
          <Card size="sm" card={{ rank: 5, suit: "diamonds" } as any} />
          <span className="text-xs tracking-widest uppercase font-display text-cabo-textDim">
            Discard
          </span>
        </div>
      </SlideVisual>
    ),
  },
  {
    title: "Power Cards",
    icon: "⚡",
    content:
      "7 & 8: PEEK at your own card.\n9 & 10: SPY on an opponent's card.\n11 & 12: SWAP a card with an opponent.\nJust remember, action cards only work when drawn from the deck and discarded immediately!",
    visual: (
      <SlideVisual>
        <div className="flex flex-col items-center group">
          <Card size="sm" card={{ rank: 7, suit: "clubs" } as any} glowing />
          <span className="mt-2 text-xs font-bold text-cabo-accent font-display">
            PEEK
          </span>
        </div>
        <div className="flex flex-col items-center group">
          <Card size="sm" card={{ rank: 9, suit: "spades" } as any} glowing />
          <span className="mt-2 text-xs font-bold text-cabo-accent font-display">
            SPY
          </span>
        </div>
        <div className="flex flex-col items-center group">
          <Card size="sm" card={{ rank: 11, suit: "hearts" } as any} glowing />
          <span className="mt-2 text-xs font-bold text-cabo-accent font-display">
            SWAP
          </span>
        </div>
      </SlideVisual>
    ),
  },
  {
    title: "Calling CABO",
    icon: "🔔",
    content:
      "When you think you have the lowest hand, call CABO. Everyone else gets one final turn. If you have the lowest score, you get 0 points. If you don't, you get your score + a penalty!",
    visual: (
      <SlideVisual>
        <motion.button
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 0 10px rgba(231,76,60,0.5)",
              "0 0 25px rgba(231,76,60,0.8)",
              "0 0 10px rgba(231,76,60,0.5)",
            ],
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="px-8 py-3 text-lg font-bold text-white border-2 rounded-xl bg-cabo-red/20 font-display border-cabo-red"
        >
          🔔 Call CABO
        </motion.button>
      </SlideVisual>
    ),
  },
];

export const GameRulesCarousel: React.FC<GameRulesCarouselProps> = ({
  onClose,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onClose(); // Finish rules
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl overflow-hidden border shadow-2xl bg-cabo-dark rounded-2xl border-cabo-accent/30"
      >
        {/* Header with Skip */}
        <div className="flex items-center justify-between p-4 border-b border-cabo-accent/20">
          <h2 className="text-2xl font-bold tracking-wider font-display text-cabo-accent flex items-center gap-2">
            <span className="text-2xl">📖</span> CABO Rules
          </h2>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm transition-colors rounded-lg font-display text-cabo-textDim hover:text-white hover:bg-white/10"
          >
            Skip Rules ⏭
          </button>
        </div>

        {/* Carousel Content */}
        <div className="relative h-[450px] overflow-hidden bg-gradient-to-b from-cabo-darker to-cabo-dark">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center"
            >
              <div className="mb-2 text-5xl md:text-6xl drop-shadow-xl">
                {slides[currentSlide].icon}
              </div>
              <h3 className="mb-4 text-3xl font-bold text-white font-display tracking-wide">
                {slides[currentSlide].title}
              </h3>

              {/* Added Visual Component */}
              <div className="w-full max-w-lg mb-6 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
                {slides[currentSlide].visual}
              </div>

              <p className="max-w-md text-base leading-relaxed md:text-lg text-cabo-textDim whitespace-pre-line">
                {slides[currentSlide].content}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 p-5 border-t border-cabo-accent/20 bg-cabo-darker/80 backdrop-blur-sm">
          {/* Indicators */}
          <div className="flex gap-3 px-2">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? "bg-cabo-accent scale-125 shadow-[0_0_8px_#d4af37]"
                    : "bg-cabo-accent/20"
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`w-full sm:w-auto justify-center px-5 py-2.5 text-sm font-bold rounded-xl font-display transition-all ${
                currentSlide === 0
                  ? "text-cabo-textDim/30 cursor-not-allowed hidden sm:block"
                  : "text-cabo-text hover:bg-white/10 active:scale-95"
              }`}
            >
              Previous
            </button>
            <button
              onClick={nextSlide}
              className="w-full sm:w-auto justify-center px-8 py-2.5 text-lg font-bold transition-all border rounded-xl font-display bg-cabo-accent text-cabo-dark hover:bg-cabo-accentLight active:scale-95 flex items-center gap-2"
              style={{
                boxShadow:
                  currentSlide === slides.length - 1
                    ? "0 0 20px rgba(212,175,55,0.6)"
                    : "0 0 10px rgba(212,175,55,0.3)",
              }}
            >
              {currentSlide === slides.length - 1 ? "Let's Play! 🎴" : "Next ➔"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
