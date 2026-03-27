import type { AlphabetChallengeModeConfig } from '@/types/stores'

/**
 * Default challenge progression levels.
 * Used when seeding a new profile and as an in-game fallback when no config is loaded.
 * Level index is 0-based; the game uses level (1-based) to index as level-1.
 */
export const DEFAULT_CHALLENGE_CONFIG: AlphabetChallengeModeConfig[] = [
  { targetWeight: 2, timer: 0, streak: 0, streakReward: 0 }, // Level 1 — Beginner
  { targetWeight: 3, timer: 0, streak: 5, streakReward: 20 }, // Level 2 — Steady
  { targetWeight: 3, timer: 10, streak: 5, streakReward: 50 }, // Level 3 — Timed
  { targetWeight: 3, timer: 5, streak: 3, streakReward: 100 }, // Level 4 — Sprint
]

