import React from "react";
import { Card } from "../components/Card";
import { motion } from "framer-motion";
import { CARD_ACTIONS } from "./cards";
import { CONFIG } from "@shared/rules";

const getCardsForAction = (action: string) => {
  return Object.entries(CARD_ACTIONS)
    .filter(([_, act]) => act === action)
    .map(([rank]) => rank)
    .join(' & ');
};

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
        <Card size="sm" card={{ rank: '1' } as any} disabled />
        <span className="text-2xl font-bold font-display text-cabo-textDim">
          +
        </span>
        <Card size="sm" card={{ rank: '2' } as any} disabled />
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
          <Card size="sm" card={{ rank: '5' } as any} disabled />
          <span className="text-xs tracking-widest uppercase font-display text-cabo-textDim">
            Discard
          </span>
        </div>
      </SlideVisual>
    ),
  },
  {
    title: "Risk vs Reward",
    icon: "🎲",
    content:
      "You can swap multiple cards of the SAME VALUE with one drawn card. But be careful! If the cards don't match, you lose your turn, keep the drawn card in the discard pile, and take your cards back.",
    visual: (
      <SlideVisual>
        <div className="relative w-32 h-24">
          <div className="absolute top-0 left-0 transform -rotate-6">
            <Card size="sm" card={{ rank: '8' } as any} disabled />
          </div>
          <div className="absolute top-2 left-6 transform rotate-6">
            <Card size="sm" card={{ rank: '8' } as any} disabled />
          </div>
        </div>
        <span className="text-2xl text-cabo-textDim mx-2">↔️</span>
        <Card size="sm" card={{ rank: '2' } as any} disabled />
      </SlideVisual>
    ),
  },
  {
    title: "Snapping",
    icon: "⚡",
    content:
      "SNAP an EXACT MATCH from your hand to the top discard card at any time—even out of turn! ⚠️ Penalty: Snapping a wrong card adds 1 penalty card to your grid.",
    visual: (
      <SlideVisual>
        <Card size="sm" card={{ rank: '10' } as any} disabled />
        <motion.div
          initial={{ x: 50, y: -20, rotate: 15 }}
          animate={{ x: 0, y: 0, rotate: 0 }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Card size="sm" card={{ rank: '10' } as any} glowing disabled />
        </motion.div>
      </SlideVisual>
    ),
  },
  {
    title: "Power Cards",
    icon: "⚡",
    content:
      `${getCardsForAction('PEEK')}: PEEK at your own card.\n${getCardsForAction('SPY')}: SPY on an opponent's card.\n${getCardsForAction('SWAP')}: blindly SWAP one of your cards with an opponent's card.\nJust remember, action cards only work when drawn from the deck and discarded immediately!`,
    visual: (
      <SlideVisual>
        <div className="flex flex-col items-center group">
          <Card size="sm" card={{ rank: '7' } as any} glowing disabled />
          <span className="mt-2 text-xs font-bold text-cabo-accent font-display">
            PEEK
          </span>
        </div>
        <div className="flex flex-col items-center group">
          <Card size="sm" card={{ rank: '9' } as any} glowing disabled />
          <span className="mt-2 text-xs font-bold text-cabo-accent font-display">
            SPY
          </span>
        </div>
        <div className="flex flex-col items-center group">
          <Card size="sm" card={{ rank: '11' } as any} glowing disabled />
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
  {
    title: "Kamikaze (Special Win)",
    icon: "👑",
    content:
      `If you end the round with exactly two 12s and two 13s, you instantly win the round! You get 0 points, and every other player is slammed with ${CONFIG.SPECIAL_WIN_PENALTY} penalty points.`,
    visual: (
      <SlideVisual>
        <Card size="sm" card={{ rank: '12' } as any} disabled glowing />
        <Card size="sm" card={{ rank: '12' } as any} disabled glowing />
        <Card size="sm" card={{ rank: '13' } as any} disabled glowing />
        <Card size="sm" card={{ rank: '13' } as any} disabled glowing />
      </SlideVisual>
    ),
  },
  {
    title: "Game Over",
    icon: "🏁",
    content:
      `The game ends when a player reaches or exceeds ${CONFIG.GAME_END_SCORE} points. The player with the lowest score at that point is crowned the ultimate CABO champion!`,
    visual: (
      <SlideVisual>
        <span className="text-4xl text-cabo-accent font-display font-bold">
          {CONFIG.GAME_END_SCORE} PTS
        </span>
      </SlideVisual>
    ),
  },
];
