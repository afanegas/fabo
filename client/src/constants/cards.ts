import { Rank } from "@shared/types";
import { CARD_POINTS, CARD_ACTIONS, CARD_TITLES } from "@shared/rules";
import cardBack from "../assets/cards/back.webp";

export { CARD_POINTS, CARD_ACTIONS, CARD_TITLES };

const cardImageModules = import.meta.glob<string>("../assets/cards/*.webp", {
  eager: true,
  import: "default",
});

export const CARD_IMAGES = Object.fromEntries(
  Object.entries(cardImageModules).map(([path, url]) => [
    path.split("/").pop()!.replace(".webp", ""),
    url,
  ]),
) as Record<Rank, string>;

export const CARD_BACK_IMAGE = cardBack;

export const CARD_SIZE_CLASSES = {
  sm: "w-10 h-14 md:w-14 md:h-20 text-[10px] md:text-xs",
  md: "w-16 h-24 md:w-20 md:h-28 text-xs md:text-sm",
  lg: "w-16 h-24 md:w-24 md:h-36 text-sm md:text-base",
  // Cards on the table grow and shrink with the screen height, so the game always fits without scrolling
  table: "card-size-table text-sm md:text-base",
  pile: "card-size-pile text-xs md:text-sm",
};

export type CardSize = keyof typeof CARD_SIZE_CLASSES;
