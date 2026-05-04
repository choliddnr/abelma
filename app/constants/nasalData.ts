// Types
export type NasalFusionItem = {
  id: string;
  letter1: string;
  letter2: string;
  fused: string;
  syllables: string[];
  emoji: string;
};

export type NasalEndingItem = {
  id: string;
  word: string;
  syllables: string[];
  blank: string;
  answer: string;
  emoji: string;
};

export type NasalWordItem = {
  id: string;
  word: string;
  syllables: string[];
  nasalIndices: number[]; // Indices of syllables containing the nasal sound
  emoji: string;
};

export type NasalQuizItem = {
  id: string;
  word: string;
  syllables: string[];
  blankWord: string; // e.g., "PE_U"
  answer: "NG" | "NY";
  options: ["NG", "NY"];
  emoji: string;
};

export type NasalLevel = {
  id: number;
  name: string;
  description: string;
  emoji: string;
  type: "fusion" | "ending" | "wordlab" | "quiz";
  items: (NasalFusionItem | NasalEndingItem | NasalWordItem | NasalQuizItem)[];
};

// ==================== LEARNING LEVELS ====================
export const nasalLevels: NasalLevel[] = [
  {
    id: 1,
    name: "Fusion NG",
    description: "Gabungkan N dan G jadi bunyi NG!",
    emoji: "👃",
    type: "fusion",
    items: [
      {
        id: "ng-fusion",
        letter1: "N",
        letter2: "G",
        fused: "NG",
        syllables: ["NGA", "NGI", "NGU", "NGE", "NGO"],
        emoji: "🐝",
      },
    ],
  },
  {
    id: 2,
    name: "Ekor NG",
    description: "Pasang bunyi NG di akhir kata!",
    emoji: "🐕",
    type: "ending",
    items: [
      { id: "pisang", word: "PISANG", syllables: ["PI", "SANG"], blank: "PISA_", answer: "NG", emoji: "🍌" },
      { id: "burung", word: "BURUNG", syllables: ["BU", "RUNG"], blank: "BURU_", answer: "NG", emoji: "🐦" },
      { id: "musang", word: "MUSANG", syllables: ["MU", "SANG"], blank: "MUSA_", answer: "NG", emoji: "🦊" },
      { id: "gayung", word: "GAYUNG", syllables: ["GA", "YUNG"], blank: "GAYU_", answer: "NG", emoji: "🪣" },
    ],
  },
  {
    id: 3,
    name: "Fusion NY",
    description: "Gabungkan N dan Y jadi bunyi NY!",
    emoji: "🤧",
    type: "fusion",
    items: [
      {
        id: "ny-fusion",
        letter1: "N",
        letter2: "Y",
        fused: "NY",
        syllables: ["NYA", "NYI", "NYU", "NYE", "NYO"],
        emoji: "🎤",
      },
    ],
  },
  {
    id: 4,
    name: "Lab Kata Sengau",
    description: "Temukan bunyi sengau dalam kata!",
    emoji: "🔬",
    type: "wordlab",
    items: [
      { id: "nyanyi", word: "NYANYI", syllables: ["NYA", "NYI"], nasalIndices: [0, 1], emoji: "🎤" },
      { id: "penyu", word: "PENYU", syllables: ["PE", "NYU"], nasalIndices: [1], emoji: "🐢" },
      { id: "monyet", word: "MONYET", syllables: ["MO", "NYET"], nasalIndices: [1], emoji: "🐒" },
      { id: "bunga", word: "BUNGA", syllables: ["BU", "NGA"], nasalIndices: [1], emoji: "🌸" },
      { id: "tangan", word: "TANGAN", syllables: ["TA", "NGAN"], nasalIndices: [1], emoji: "🖐️" },
    ],
  },
  {
    id: 5,
    name: "Kuis Sengau",
    description: "Pilih NG atau NY yang tepat!",
    emoji: "🎯",
    type: "quiz",
    items: [
      { id: "penyu", word: "PENYU", syllables: ["PE", "NYU"], blankWord: "PE_U", answer: "NY", options: ["NG", "NY"], emoji: "🐢" },
      { id: "pisang", word: "PISANG", syllables: ["PI", "SANG"], blankWord: "PISA_", answer: "NG", options: ["NG", "NY"], emoji: "🍌" },
      { id: "nyanyi", word: "NYANYI", syllables: ["NYA", "NYI"], blankWord: "_A_I", answer: "NY", options: ["NG", "NY"], emoji: "🎤" },
      { id: "bunga", word: "BUNGA", syllables: ["BU", "NGA"], blankWord: "BU_A", answer: "NG", options: ["NG", "NY"], emoji: "🌸" },
      { id: "monyet", word: "MONYET", syllables: ["MO", "NYET"], blankWord: "MO_ET", answer: "NY", options: ["NG", "NY"], emoji: "🐒" },
      { id: "tangan", word: "TANGAN", syllables: ["TA", "NGAN"], blankWord: "TA_AN", answer: "NG", options: ["NG", "NY"], emoji: "🖐️" },
    ],
  },
];
