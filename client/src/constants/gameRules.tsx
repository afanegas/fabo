import React from "react";
import { Card } from "../components/Card";
import { motion } from "framer-motion";

const SlideVisual = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-center gap-4 py-4 my-2 h-32">
    {children}
  </div>
);

export const GAME_RULES_SLIDES = [
  {
    title: "Objective",
    icon: "🎯",
    content:
      "The goal of CABO is to have the lowest sum of cards in front of you. When you think you have the lowest score, call 'CABO'!",
    visual: (
      <SlideVisual>
        <Card size="sm" card={{ rank: 1, suit: "spades" } as any} disabled />
        <span className="text-2xl font-bold font-display text-cabo-textDim">
          +
        </span>
        <Card size="sm" card={{ rank: 2, suit: "hearts" } as any} disabled />
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
          <Card size="sm" faceDown disabled />
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
          <Card size="sm" faceDown disabled />
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
        <Card size="sm" faceDown disabled />
        <Card size="sm" faceDown disabled />
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
          <Card size="sm" faceDown disabled />
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
          <Card size="sm" card={{ rank: 5, suit: "diamonds" } as any} disabled />
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
          <Card size="sm" card={{ rank: 7, suit: "clubs" } as any} glowing disabled />
          <span className="mt-2 text-xs font-bold text-cabo-accent font-display">
            PEEK
          </span>
        </div>
        <div className="flex flex-col items-center group">
          <Card size="sm" card={{ rank: 9, suit: "spades" } as any} glowing disabled />
          <span className="mt-2 text-xs font-bold text-cabo-accent font-display">
            SPY
          </span>
        </div>
        <div className="flex flex-col items-center group">
          <Card size="sm" card={{ rank: 11, suit: "hearts" } as any} glowing disabled />
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
