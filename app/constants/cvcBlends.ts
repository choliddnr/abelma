export interface CvcItem {
  id: string;
  cv: string;
  c: string;
  blend: string;
  emoji: string;
}

export interface CvcWordItem {
  id: string;
  part1: string;
  part2: string;
  word: string;
  emoji: string;
}

export interface CvcQuizWord {
  id: string;
  prefix: string;    // e.g. "RU"
  blend: string;     // e.g. "MAH"
  cv: string;        // e.g. "MA"
  answer: string;    // e.g. "H"
  word: string;      // e.g. "RUMAH"
  emoji: string;     // e.g. "🏠"
}

export interface CvcLevel {
  id: number;
  name: string;
  description: string;
  emoji: string;
  items: (CvcItem | CvcWordItem)[];
  type: "blend" | "word";
}

export const cvcLevels: CvcLevel[] = [
  {
    id: 1,
    name: "Akhiran H & S",
    description: "Belajar gabungkan bunyi 'h' dan 's' di akhir.",
    emoji: "🐍",
    type: "blend",
    items: [
      { id: "lah", cv: "LA", c: "H", blend: "LAH", emoji: "🗣️" },
      { id: "mah", cv: "MA", c: "H", blend: "MAH", emoji: "🏠" },
      { id: "sah", cv: "SA", c: "H", blend: "SAH", emoji: "✅" },
      { id: "bah", cv: "BA", c: "H", blend: "BAH", emoji: "💦" },
      { id: "las", cv: "LA", c: "S", blend: "LAS", emoji: "🔥" },
      { id: "mas", cv: "MA", c: "S", blend: "MAS", emoji: "🪙" },
      { id: "pas", cv: "PA", c: "S", blend: "PAS", emoji: "👍" },
      { id: "bas", cv: "BA", c: "S", blend: "BAS", emoji: "🚌" },
    ],
  },
  {
    id: 2,
    name: "Akhiran N & R",
    description: "Belajar gabungkan bunyi 'n' dan 'r' di akhir.",
    emoji: "🚗",
    type: "blend",
    items: [
      { id: "ban", cv: "BA", c: "N", blend: "BAN", emoji: "🛞" },
      { id: "kan", cv: "KA", c: "N", blend: "KAN", emoji: "🐟" },
      { id: "tan", cv: "TA", c: "N", blend: "TAN", emoji: "🌳" },
      { id: "man", cv: "MA", c: "N", blend: "MAN", emoji: "🧔" },
      { id: "bar", cv: "BA", c: "R", blend: "BAR", emoji: "🍫" },
      { id: "kar", cv: "KA", c: "R", blend: "KAR", emoji: "📦" },
      { id: "tar", cv: "TA", c: "R", blend: "TAR", emoji: "🍰" },
      { id: "par", cv: "PA", c: "R", blend: "PAR", emoji: "⛳" },
    ],
  },
  {
    id: 3,
    name: "Kata Campuran",
    description: "Latihan menggabungkan kata lengkap.",
    emoji: "🍱",
    type: "word",
    items: [
      { id: "makan", part1: "MA", part2: "KAN", word: "MAKAN", emoji: "🍴" },
      { id: "bayar", part1: "BA", part2: "YAR", word: "BAYAR", emoji: "💰" },
      { id: "bagus", part1: "BA", part2: "GUS", word: "BAGUS", emoji: "🌟" },
      { id: "mahal", part1: "MA", part2: "HAL", word: "MAHAL", emoji: "💎" },
      { id: "pasar", part1: "PA", part2: "SAR", word: "PASAR", emoji: "🛒" },
      { id: "tahan", part1: "TA", part2: "HAN", word: "TAHAN", emoji: "🛑" },
      { id: "kapas", part1: "KA", part2: "PAS", word: "KAPAS", emoji: "☁️" },
      { id: "balas", part1: "BA", part2: "LAS", word: "BALAS", emoji: "↩️" },
    ],
  },
  {
    id: 4,
    name: "Akhiran L & M",
    description: "Belajar gabungkan bunyi 'l' dan 'm' di akhir.",
    emoji: "🔔",
    type: "blend",
    items: [
      { id: "bel", cv: "BE", c: "L", blend: "BEL", emoji: "🔔" },
      { id: "hal", cv: "HA", c: "L", blend: "HAL", emoji: "🧐" },
      { id: "mal", cv: "MA", c: "L", blend: "MAL", emoji: "🏢" },
      { id: "pil", cv: "PI", c: "L", blend: "PIL", emoji: "💊" },
      { id: "jam", cv: "JA", c: "M", blend: "JAM", emoji: "⏰" },
      { id: "lem", cv: "LE", c: "M", blend: "LEM", emoji: "🧴" },
      { id: "rem", cv: "RE", c: "M", blend: "REM", emoji: "🛑" },
      { id: "bom", cv: "BO", c: "M", blend: "BOM", emoji: "💣" },
    ],
  },
  {
    id: 5,
    name: "Akhiran P & T",
    description: "Belajar gabungkan bunyi 'p' dan 't' di akhir.",
    emoji: "🏹",
    type: "blend",
    items: [
      { id: "sap", cv: "SA", c: "P", blend: "SAP", emoji: "🧼" },
      { id: "top", cv: "TO", c: "P", blend: "TOP", emoji: "🔝" },
      { id: "uap", cv: "UA", c: "P", blend: "UAP", emoji: "💨" },
      { id: "lap", cv: "LA", c: "P", blend: "LAP", emoji: "🧻" },
      { id: "cat", cv: "CA", c: "T", blend: "CAT", emoji: "🎨" },
      { id: "set", cv: "SE", c: "T", blend: "SET", emoji: "🔌" },
      { id: "pot", cv: "PO", c: "T", blend: "POT", emoji: "🪴" },
      { id: "bot", cv: "BO", c: "T", blend: "BOT", emoji: "🤖" },
    ],
  },
  {
    id: 6,
    name: "Kata Campuran 2",
    description: "Latihan kata-kata yang lebih menantang.",
    emoji: "🎢",
    type: "word",
    items: [
      { id: "kapal", part1: "KA", part2: "PAL", word: "KAPAL", emoji: "🚢" },
      { id: "jarum", part1: "JA", part2: "RUM", word: "JARUM", emoji: "🪡" },
      { id: "sayap", part1: "SA", part2: "YAP", word: "SAYAP", emoji: "🪽" },
      { id: "robot", part1: "RO", part2: "BOT", word: "ROBOT", emoji: "🤖" },
      { id: "bakal", part1: "BA", part2: "KAL", word: "BAKAL", emoji: "🌱" },
      { id: "kirim", part1: "KI", part2: "RIM", word: "KIRIM", emoji: "📦" },
      { id: "atap", part1: "A", part2: "TAP", word: "ATAP", emoji: "🏠" },
      { id: "sakit", part1: "SA", part2: "KIT", word: "SAKIT", emoji: "🤕" },
    ],
  },
  {
    id: 7,
    name: "Akhiran K",
    description: "Belajar gabungkan bunyi 'k' di akhir.",
    emoji: "🦆",
    type: "blend",
    items: [
      { id: "bak", cv: "BA", c: "K", blend: "BAK", emoji: "🛁" },
      { id: "cek", cv: "CE", c: "K", blend: "CEK", emoji: "✔️" },
      { id: "dok", cv: "DO", c: "K", blend: "DOK", emoji: "👨‍⚕️" },
      { id: "rak", cv: "RA", c: "K", blend: "RAK", emoji: "📚" },
      { id: "tik", cv: "TI", c: "K", blend: "TIK", emoji: "⌨️" },
      { id: "rok", cv: "RO", c: "K", blend: "ROK", emoji: "👗" },
      { id: "sok", cv: "SO", c: "K", blend: "SOK", emoji: "🕶️" },
      { id: "yuk", cv: "YU", c: "K", blend: "YUK", emoji: "👋" },
    ],
  },
  {
    id: 8,
    name: "Kata Campuran 3",
    description: "Latihan kata dengan berbagai akhiran baru.",
    emoji: "🧩",
    type: "word",
    items: [
      { id: "masak", part1: "MA", part2: "SAK", word: "MASAK", emoji: "🍳" },
      { id: "adik", part1: "A", part2: "DIK", word: "ADIK", emoji: "👶" },
      { id: "bebek", part1: "BE", part2: "BEK", word: "BEBEK", emoji: "🦆" },
      { id: "cicak", part1: "CI", part2: "CAK", word: "CICAK", emoji: "🦎" },
      { id: "pisang", part1: "PI", part2: "SANG", word: "PISANG", emoji: "🍌" },
      { id: "burung", part1: "BU", part2: "RUNG", word: "BURUNG", emoji: "🐦" },
      { id: "tulang", part1: "TU", part2: "LANG", word: "TULANG", emoji: "🦴" },
      { id: "cacing", part1: "CA", part2: "CING", word: "CACING", emoji: "🪱" },
    ],
  }
];

export const cvcQuizWords: CvcQuizWord[] = [
  // H endings
  { id: "rumah", prefix: "RU", blend: "MAH", cv: "MA", answer: "H", word: "RUMAH", emoji: "🏠" },
  { id: "salah", prefix: "SA", blend: "LAH", cv: "LA", answer: "H", word: "SALAH", emoji: "❌" },
  { id: "tubuh", prefix: "TU", blend: "BUH", cv: "BU", answer: "H", word: "TUBUH", emoji: "🧍" },
  { id: "mudah", prefix: "MU", blend: "DAH", cv: "DA", answer: "H", word: "MUDAH", emoji: "👌" },
  // S endings
  { id: "emas", prefix: "E", blend: "MAS", cv: "MA", answer: "S", word: "EMAS", emoji: "🪙" },
  { id: "keras", prefix: "KE", blend: "RAS", cv: "RA", answer: "S", word: "KERAS", emoji: "💪" },
  { id: "bagus", prefix: "BA", blend: "GUS", cv: "GU", answer: "S", word: "BAGUS", emoji: "🌟" },
  { id: "kapas", prefix: "KA", blend: "PAS", cv: "PA", answer: "S", word: "KAPAS", emoji: "☁️" },
  // N endings
  { id: "makan", prefix: "MA", blend: "KAN", cv: "KA", answer: "N", word: "MAKAN", emoji: "🍴" },
  { id: "teman", prefix: "TE", blend: "MAN", cv: "MA", answer: "N", word: "TEMAN", emoji: "🤝" },
  { id: "jalan", prefix: "JA", blend: "LAN", cv: "LA", answer: "N", word: "JALAN", emoji: "🛤️" },
  { id: "hujan", prefix: "HU", blend: "JAN", cv: "JA", answer: "N", word: "HUJAN", emoji: "🌧️" },
  // R endings
  { id: "bayar", prefix: "BA", blend: "YAR", cv: "YA", answer: "R", word: "BAYAR", emoji: "💰" },
  { id: "pintar", prefix: "PIN", blend: "TAR", cv: "TA", answer: "R", word: "PINTAR", emoji: "🧠" },
  { id: "sabar", prefix: "SA", blend: "BAR", cv: "BA", answer: "R", word: "SABAR", emoji: "🧘" },
  { id: "pasar", prefix: "PA", blend: "SAR", cv: "SA", answer: "R", word: "PASAR", emoji: "🛒" },
  // L endings
  { id: "kapal", prefix: "KA", blend: "PAL", cv: "PA", answer: "L", word: "KAPAL", emoji: "🚢" },
  { id: "mahal", prefix: "MA", blend: "HAL", cv: "HA", answer: "L", word: "MAHAL", emoji: "💎" },
  // M endings
  { id: "jarum", prefix: "JA", blend: "RUM", cv: "RU", answer: "M", word: "JARUM", emoji: "🪡" },
  { id: "kirim", prefix: "KI", blend: "RIM", cv: "RI", answer: "M", word: "KIRIM", emoji: "📦" },
  // P endings
  { id: "atap", prefix: "A", blend: "TAP", cv: "TA", answer: "P", word: "ATAP", emoji: "🏠" },
  { id: "sayap", prefix: "SA", blend: "YAP", cv: "YA", answer: "P", word: "SAYAP", emoji: "🪽" },
  // T endings
  { id: "sakit", prefix: "SA", blend: "KIT", cv: "KI", answer: "T", word: "SAKIT", emoji: "🤕" },
  { id: "robot", prefix: "RO", blend: "BOT", cv: "BO", answer: "T", word: "ROBOT", emoji: "🤖" },
  // K endings
  { id: "masak", prefix: "MA", blend: "SAK", cv: "SA", answer: "K", word: "MASAK", emoji: "🍳" },
  { id: "bebek", prefix: "BE", blend: "BEK", cv: "BE", answer: "K", word: "BEBEK", emoji: "🦆" },
  { id: "batuk", prefix: "BA", blend: "TUK", cv: "TU", answer: "K", word: "BATUK", emoji: "😷" },
  { id: "jeruk", prefix: "JE", blend: "RUK", cv: "RU", answer: "K", word: "JERUK", emoji: "🍊" },
];
