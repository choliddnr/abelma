// Types
export type DdvDiphthongItem = {
  id: string;
  vowel1: string;
  vowel2: string;
  fused: string;
  emoji: string;
};

export type DdvWordItem = {
  id: string;
  word: string;
  syllables: string[];
  highlight: string;
  highlightIndex: number;
  emoji: string;
};

export type DdvClusterItem = {
  id: string;
  vowel1: string;
  vowel2: string;
  fused: string;
  emoji: string;
};

export type DdvConnectPair = {
  id: string;
  vokalRangkap: string;
  word: string;
  syllables: string[];
  emoji: string;
};

export type DdvDiphthongQuizItem = {
  id: string;
  word: string;
  blank: string;
  syllables: string[];
  blankIndex: number;
  answer: string;
  options: string[];
  emoji: string;
};

export type DdvClusterQuizItem = {
  id: string;
  word: string;
  syllables: string[];
  blanks: number[];
  answers: string[];
  emoji: string;
};

export type DdvLevel = {
  id: number;
  name: string;
  description: string;
  emoji: string;
  type: "diphthong" | "wordlab" | "cluster" | "quiz";
  items: (DdvDiphthongItem | DdvWordItem | DdvClusterItem | DdvConnectPair)[];
};

// ==================== LEARNING LEVELS ====================
export const ddvLevels: DdvLevel[] = [
  {
    id: 1,
    name: "Bunyi Meluncur",
    description: "Geserkan dua vokal jadi satu bunyi!",
    emoji: "🎵",
    type: "diphthong",
    items: [
      { id: "ai", vowel1: "A", vowel2: "I", fused: "AI", emoji: "🏖️" },
      { id: "au", vowel1: "A", vowel2: "U", fused: "AU", emoji: "🏝️" },
      { id: "oi", vowel1: "O", vowel2: "I", fused: "OI", emoji: "😲" },
      { id: "ei", vowel1: "E", vowel2: "I", fused: "EI", emoji: "📊" },
    ]
  },
  {
    id: 2,
    name: "Lab Kata Vokal",
    description: "Temukan vokal rangkap dalam kata!",
    emoji: "🔬",
    type: "wordlab",
    items: [
      { id: "pantai", word: "PANTAI", syllables: ["PAN", "TAI"], highlight: "AI", highlightIndex: 1, emoji: "🏖️" },
      { id: "pulau", word: "PULAU", syllables: ["PU", "LAU"], highlight: "AU", highlightIndex: 1, emoji: "🏝️" },
      { id: "amboi", word: "AMBOI", syllables: ["AM", "BOI"], highlight: "OI", highlightIndex: 1, emoji: "😲" },
      { id: "survei", word: "SURVEI", syllables: ["SUR", "VEI"], highlight: "EI", highlightIndex: 1, emoji: "📊" },
      { id: "balai", word: "BALAI", syllables: ["BA", "LAI"], highlight: "AI", highlightIndex: 1, emoji: "🏛️" },
      { id: "kalau", word: "KALAU", syllables: ["KA", "LAU"], highlight: "AU", highlightIndex: 1, emoji: "🤔" },
      { id: "kerbau", word: "KERBAU", syllables: ["KER", "BAU"], highlight: "AU", highlightIndex: 1, emoji: "🐃" },
    ]
  },
  {
    id: 3,
    name: "Vokal Berjejer",
    description: "Dua vokal bersebelahan, dua bunyi berbeda!",
    emoji: "🔗",
    type: "cluster",
    items: [
      { id: "ua", vowel1: "U", vowel2: "A", fused: "UA", emoji: "✌️" },
      { id: "ia", vowel1: "I", vowel2: "A", fused: "IA", emoji: "👋" },
      { id: "io", vowel1: "I", vowel2: "O", fused: "IO", emoji: "📻" },
      { id: "ue", vowel1: "U", vowel2: "E", fused: "UE", emoji: "🧁" },
      { id: "iu", vowel1: "I", vowel2: "U", fused: "IU", emoji: "🌬️" },
      { id: "eo", vowel1: "E", vowel2: "O", fused: "EO", emoji: "🐦" },
    ]
  },
  {
    id: 4,
    name: "Kata Vokal Berjejer",
    description: "Temukan vokal berjejer dalam kata!",
    emoji: "📖",
    type: "wordlab",
    items: [
      { id: "dua", word: "DUA", syllables: ["DU", "A"], highlight: "UA", highlightIndex: 0, emoji: "✌️" },
      { id: "dia", word: "DIA", syllables: ["DI", "A"], highlight: "IA", highlightIndex: 0, emoji: "👋" },
      { id: "radio", word: "RADIO", syllables: ["RA", "DI", "O"], highlight: "IO", highlightIndex: 1, emoji: "📻" },
      { id: "kue", word: "KUE", syllables: ["KU", "E"], highlight: "UE", highlightIndex: 0, emoji: "🧁" },
      { id: "tiup", word: "TIUP", syllables: ["TI", "UP"], highlight: "IU", highlightIndex: 0, emoji: "🌬️" },
      { id: "beo", word: "BEO", syllables: ["BE", "O"], highlight: "EO", highlightIndex: 0, emoji: "🐦" },
      { id: "buaya", word: "BUAYA", syllables: ["BU", "A", "YA"], highlight: "UA", highlightIndex: 0, emoji: "🐊" },
      { id: "tiara", word: "TIARA", syllables: ["TI", "A", "RA"], highlight: "IA", highlightIndex: 0, emoji: "👑" },
    ]
  },
  {
    id: 5,
    name: "Sambung Vokal",
    description: "Cocokkan vokal rangkap dengan katanya!",
    emoji: "🎮",
    type: "quiz",
    items: [
      { id: "g-ai", vokalRangkap: "AI", word: "PANTAI", syllables: ["PAN", "TAI"], emoji: "🏖️" },
      { id: "g-au", vokalRangkap: "AU", word: "PULAU", syllables: ["PU", "LAU"], emoji: "🏝️" },
      { id: "g-oi", vokalRangkap: "OI", word: "AMBOI", syllables: ["AM", "BOI"], emoji: "😲" },
      { id: "g-ei", vokalRangkap: "EI", word: "SURVEI", syllables: ["SUR", "VEI"], emoji: "📊" },
      { id: "g-ua", vokalRangkap: "UA", word: "DUA", syllables: ["DU", "A"], emoji: "✌️" },
      { id: "g-ia", vokalRangkap: "IA", word: "DIA", syllables: ["DI", "A"], emoji: "👋" },
      { id: "g-io", vokalRangkap: "IO", word: "RADIO", syllables: ["RA", "DI", "O"], emoji: "📻" },
      { id: "g-ue", vokalRangkap: "UE", word: "KUE", syllables: ["KU", "E"], emoji: "🧁" },
      { id: "g-iu", vokalRangkap: "IU", word: "TIUP", syllables: ["TI", "UP"], emoji: "🌬️" },
      { id: "g-eo", vokalRangkap: "EO", word: "BEO", syllables: ["BE", "O"], emoji: "🐦" },
    ]
  },
];

// ==================== STANDALONE QUIZ DATA ====================
export const ddvDiphthongQuizItems: DdvDiphthongQuizItem[] = [
  { id: "dq1", word: "PANTAI", syllables: ["PAN", "TAI"], blankIndex: 1, blank: "PANT__", answer: "AI", options: ["AI", "AU", "OI", "EI"], emoji: "🏖️" },
  { id: "dq2", word: "PULAU", syllables: ["PU", "LAU"], blankIndex: 1, blank: "PUL__", answer: "AU", options: ["AI", "AU", "OI", "EI"], emoji: "🏝️" },
  { id: "dq3", word: "AMBOI", syllables: ["AM", "BOI"], blankIndex: 1, blank: "AMB__", answer: "OI", options: ["AI", "AU", "OI", "EI"], emoji: "😲" },
  { id: "dq4", word: "SURVEI", syllables: ["SUR", "VEI"], blankIndex: 1, blank: "SURV__", answer: "EI", options: ["AI", "AU", "OI", "EI"], emoji: "📊" },
  { id: "dq5", word: "BALAI", syllables: ["BA", "LAI"], blankIndex: 1, blank: "BAL__", answer: "AI", options: ["AI", "AU", "OI", "EI"], emoji: "🏛️" },
  { id: "dq6", word: "KERBAU", syllables: ["KER", "BAU"], blankIndex: 1, blank: "KERB__", answer: "AU", options: ["AU", "AI", "OI", "EI"], emoji: "🐃" },
];

export const ddvClusterQuizItems: DdvClusterQuizItem[] = [
  { id: "cq1", word: "DUA", syllables: ["DU", "A"], blanks: [0, 1], answers: ["U", "A"], emoji: "✌️" },
  { id: "cq2", word: "DIA", syllables: ["DI", "A"], blanks: [0, 1], answers: ["I", "A"], emoji: "👋" },
  { id: "cq3", word: "RADIO", syllables: ["RA", "DI", "O"], blanks: [1, 2], answers: ["I", "O"], emoji: "📻" },
  { id: "cq4", word: "KUE", syllables: ["KU", "E"], blanks: [0, 1], answers: ["U", "E"], emoji: "🧁" },
  { id: "cq5", word: "BEO", syllables: ["BE", "O"], blanks: [0, 1], answers: ["E", "O"], emoji: "🐦" },
  { id: "cq6", word: "TIUP", syllables: ["TI", "UP"], blanks: [0, 1], answers: ["I", "U"], emoji: "🌬️" },
];
