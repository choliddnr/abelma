export const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""); //ABCDEFGHIJKLMNOPQRSTUVWXYZ

export const colors = [
  "bg-[#FFD93D]", // Yellow
  "bg-[#6BCB77]", // Green
  "bg-[#4D96FF]", // Blue
  "bg-[#ff9a9a]", // Pink
  "bg-[#A084E8]", // Purple
];

export const getLetterColor = (letter: string) => {
  const index = letters.indexOf(letter.toUpperCase());
  return colors[index % colors.length];
};

// Fixed mapping for more accurate Indonesian learning
export const idLetterMap: Record<string, { emoji: string; word: string }> = {
  A: { emoji: "🍎", word: "Apel" },
  B: { emoji: "⚽", word: "Bola" },
  C: { emoji: "🍒", word: "Ceri" },
  D: { emoji: "🐑", word: "Domba" },
  E: { emoji: "🦅", word: "Elang" },
  F: { emoji: "📷", word: "Foto" },
  G: { emoji: "🐘", word: "Gajah" },
  H: { emoji: "🚁", word: "Helikopter" },
  I: { emoji: "🐟", word: "Ikan" },
  J: { emoji: "🦒", word: "Jerapah" },
  K: { emoji: "🐈", word: "Kucing" },
  L: { emoji: "💡", word: "Lampu" },
  M: { emoji: "🥭", word: "Mangga" },
  N: { emoji: "🍍", word: "Nanas" },
  O: { emoji: "💊", word: "Obat" },
  P: { emoji: "🍌", word: "Pisang" },
  Q: { emoji: "📖", word: "Qur'an" },
  R: { emoji: "🏠", word: "Rumah" },
  S: { emoji: "🐄", word: "Sapi" },
  T: { emoji: "🎩", word: "Topi" },
  U: { emoji: "🐪", word: "Unta" },
  V: { emoji: "🏺", word: "Vas" },
  W: { emoji: "🥕", word: "Wortel" },
  X: { emoji: "🎼", word: "Xilofon" },
  Y: { emoji: "🪀", word: "Yoyo" },
  Z: { emoji: "🦓", word: "Zebra" },
};

import type { AlphabetQuizModeConfig, AlphabetQuizProgress } from "@/types/stores";

/**
 * Default quiz progression levels.
 * Used when seeding a new profile and as an in-game fallback when no config is loaded.
 * Level index is 0-based; the game uses level (1-based) to index as level-1.
 */
export const DEFAULT_ALPHABET_QUIZ_CONFIG: AlphabetQuizModeConfig = [
  { targetWeight: 2, timer: 0, streak: 0, streakReward: 0 }, // Level 1 — Beginner
  { targetWeight: 3, timer: 0, streak: 5, streakReward: 20 }, // Level 2 — Steady
  { targetWeight: 3, timer: 10, streak: 5, streakReward: 50 }, // Level 3 — Timed
  { targetWeight: 3, timer: 5, streak: 3, streakReward: 100 }, // Level 4 — Sprint
];

export const DEFAULT_ALPHABET_QUIZ_PROGRESS: AlphabetQuizProgress = {
  score: 0,
  level: 1,
  weights: {},
  config: DEFAULT_ALPHABET_QUIZ_CONFIG,
  updatedAt: new Date(),
};
