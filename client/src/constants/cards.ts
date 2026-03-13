import { Heart, Diamond, Club, Spade } from "lucide-react";
import React from "react";
import { Suit } from "@shared/types";
import { CARD_POINTS, CARD_ACTIONS } from "@shared/rules";

export { CARD_POINTS, CARD_ACTIONS };

export const SUIT_ICONS: Record<Suit, React.ElementType> = {
  hearts: Heart,
  diamonds: Diamond,
  clubs: Club,
  spades: Spade,
};

export const SUIT_COLORS: Record<Suit, string> = {
  hearts: "text-red-500",
  diamonds: "text-red-500",
  clubs: "text-gray-800",
  spades: "text-gray-800",
};

export const CARD_SIZE_CLASSES = {
  sm: "w-10 h-14 md:w-14 md:h-20 text-[10px] md:text-xs",
  md: "w-16 h-24 md:w-20 md:h-28 text-xs md:text-sm",
  lg: "w-16 h-24 md:w-24 md:h-36 text-sm md:text-base",
};
