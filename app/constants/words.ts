export interface Word {
  id: string;
  word: string;
  syllables: string[];
  emoji: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  words: Word[];
}

export const wordCategories: Category[] = [
  {
    id: "hewan",
    name: "Hewan",
    emoji: "🦁",
    words: [
      { id: "sapi", word: "SAPI", syllables: ["SA", "PI"], emoji: "🐄" },
      { id: "kucing", word: "KUCING", syllables: ["KU", "CING"], emoji: "🐈" },
      { id: "bebek", word: "BEBEK", syllables: ["BE", "BEK"], emoji: "🦆" },
      { id: "ikan", word: "IKAN", syllables: ["I", "KAN"], emoji: "🐟" },
      { id: "jerapah", word: "JERAPAH", syllables: ["JE", "RA", "PAH"], emoji: "🦒" },
    ],
  },
  {
    id: "buah",
    name: "Buah",
    emoji: "🍎",
    words: [
      { id: "apel", word: "APEL", syllables: ["A", "PEL"], emoji: "🍎" },
      { id: "pisang", word: "PISANG", syllables: ["PI", "SANG"], emoji: "🍌" },
      { id: "mangga", word: "MANGGA", syllables: ["MANG", "GA"], emoji: "🥭" },
      { id: "jeruk", word: "JERUK", syllables: ["JE", "RUK"], emoji: "🍊" },
      { id: "nanas", word: "NANAS", syllables: ["NA", "NAS"], emoji: "🍍" },
    ],
  },
  {
    id: "benda",
    name: "Benda",
    emoji: "🪑",
    words: [
      { id: "buku", word: "BUKU", syllables: ["BU", "KU"], emoji: "📚" },
      { id: "topi", word: "TOPI", syllables: ["TO", "PI"], emoji: "🎩" },
      { id: "bola", word: "BOLA", syllables: ["BO", "LA"], emoji: "⚽" },
      { id: "lampu", word: "LAMPU", syllables: ["LAM", "PU"], emoji: "💡" },
      { id: "sepatu", word: "SEPATU", syllables: ["SE", "PA", "TU"], emoji: "👞" },
    ],
  },
  {
    id: "aksi",
    name: "Aksi",
    emoji: "🏃",
    words: [
      { id: "makan", word: "MAKAN", syllables: ["MA", "KAN"], emoji: "🍴" },
      { id: "lari", word: "LARI", syllables: ["LA", "RI"], emoji: "🏃" },
      { id: "tidur", word: "TIDUR", syllables: ["TI", "DUR"], emoji: "😴" },
      { id: "mandi", word: "MANDI", syllables: ["MAN", "DI"], emoji: "🛁" },
      { id: "baca", word: "BACA", syllables: ["BA", "CA"], emoji: "📖" },
    ],
  },
];
