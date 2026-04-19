import { sqliteTable, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// --- BETTER-AUTH TABLES ---
// Better-Auth uses text IDs by default for compatibility across adapters

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  username: text("username").unique(),
  displayUsername: text("display_username"),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// --- APP CORE TABLES ---

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(), // Using text PK as requested
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  avatar: text("avatar").notNull(),
  coins: integer("coins").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const rewards = sqliteTable("rewards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  cost: integer("cost").notNull(),
  emoji: text("emoji").notNull(),
  status: text("status").notNull().default("available"), // 'available', 'claimed', 'fulfilled'
  claimedAt: integer("claimed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const challenges = sqliteTable("challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  coinReward: integer("coin_reward").notNull(),
  status: text("status").notNull().default("available"), // 'available', 'pending_validation', 'completed'
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const analytics = sqliteTable(
  "analytics",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'word' | 'letter'
    targetId: text("target_id").notNull(), // e.g., 'apel', 'B'
    mistakes: integer("mistakes").notNull().default(0),
    lastAttempt: integer("last_attempt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("analytics_unique_idx").on(table.profileId, table.type, table.targetId)],
);

export const stickers = sqliteTable("stickers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  stickerId: text("sticker_id").notNull(), // e.g., 'cool_cat'
  earnedAt: integer("earned_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const alphabetQuizProgress = sqliteTable("alphabet_quiz_progress", {
  profileId: text("profile_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  score: integer("score").notNull().default(0),
  level: integer("level").notNull().default(1),
  isFinished: integer("is_finished", { mode: "boolean" }).notNull().default(false),
  weights: text("weights").notNull().default("{}"),
  quizConfig: text("quiz_config").notNull().default("[]"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const storybookProgress = sqliteTable(
  "storybook_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    letter: text("letter").notNull(),
    isCompleted: integer("is_completed", { mode: "boolean" }).notNull().default(false),
    lastRead: integer("last_read", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("storybook_unique_idx").on(table.profileId, table.letter)],
);

export const wordQuizProgress = sqliteTable("word_quiz_progress", {
  profileId: text("profile_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  score: integer("score").notNull().default(0),
  level: integer("level").notNull().default(1),
  weights: text("weights").notNull().default("{}"),
  quizConfig: text("quiz_config").notNull().default("[]"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// --- RELATIONS ---

export const userRelations = relations(user, ({ many }) => ({
  profiles: many(profiles),
  sessions: many(session),
  accounts: many(account),
}));

export const profileRelations = relations(profiles, ({ one, many }) => ({
  user: one(user, {
    fields: [profiles.userId],
    references: [user.id],
  }),
  rewards: many(rewards),
  challenges: many(challenges),
  analytics: many(analytics),
  stickers: many(stickers),
  alphabetQuizProgress: one(alphabetQuizProgress, {
    fields: [profiles.id],
    references: [alphabetQuizProgress.profileId],
  }),
  wordQuizProgress: one(wordQuizProgress, {
    fields: [profiles.id],
    references: [wordQuizProgress.profileId],
  }),
  storybookProgress: many(storybookProgress),
}));

export const rewardRelations = relations(rewards, ({ one }) => ({
  profile: one(profiles, {
    fields: [rewards.profileId],
    references: [profiles.id],
  }),
}));

export const challengeRelations = relations(challenges, ({ one }) => ({
  profile: one(profiles, {
    fields: [challenges.profileId],
    references: [profiles.id],
  }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  profile: one(profiles, {
    fields: [analytics.profileId],
    references: [profiles.id],
  }),
}));

export const storybookProgressRelations = relations(storybookProgress, ({ one }) => ({
  profile: one(profiles, {
    fields: [storybookProgress.profileId],
    references: [profiles.id],
  }),
}));

export const stickerRelations = relations(stickers, ({ one }) => ({
  profile: one(profiles, {
    fields: [stickers.profileId],
    references: [profiles.id],
  }),
}));

export const alphabetQuizProgressRelations = relations(
  alphabetQuizProgress,
  ({ one }) => ({
    profile: one(profiles, {
      fields: [alphabetQuizProgress.profileId],
      references: [profiles.id],
    }),
  }),
);

export const wordQuizProgressRelations = relations(wordQuizProgress, ({ one }) => ({
  profile: one(profiles, {
    fields: [wordQuizProgress.profileId],
    references: [profiles.id],
  }),
}));
