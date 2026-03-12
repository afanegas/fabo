import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GAME_RULES_SLIDES } from "../constants/gameRules";

interface GameRulesCarouselProps {
  onClose: () => void;
}

export const GameRulesCarousel: React.FC<GameRulesCarouselProps> = ({
  onClose,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < GAME_RULES_SLIDES.length - 1) {
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
                {GAME_RULES_SLIDES[currentSlide].icon}
              </div>
              <h3 className="mb-4 text-3xl font-bold text-white font-display tracking-wide">
                {GAME_RULES_SLIDES[currentSlide].title}
              </h3>

              {/* Added Visual Component */}
              <div className="w-full max-w-lg mb-6 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
                {GAME_RULES_SLIDES[currentSlide].visual}
              </div>

              <p className="max-w-md text-base leading-relaxed md:text-lg text-cabo-textDim whitespace-pre-line">
                {GAME_RULES_SLIDES[currentSlide].content}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 p-5 border-t border-cabo-accent/20 bg-cabo-darker/80 backdrop-blur-sm">
          {/* Indicators */}
          <div className="flex gap-3 px-2">
            {GAME_RULES_SLIDES.map((_, idx) => (
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
                  currentSlide === GAME_RULES_SLIDES.length - 1
                    ? "0 0 20px rgba(212,175,55,0.6)"
                    : "0 0 10px rgba(212,175,55,0.3)",
              }}
            >
              {currentSlide === GAME_RULES_SLIDES.length - 1 ? "Let's Play! 🎴" : "Next ➔"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
