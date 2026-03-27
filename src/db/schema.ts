import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  avatar: text('avatar').notNull(),
  points: integer('points').notNull().default(0),
  letterCase: text('letter_case').notNull().default('uppercase'),
  timerDuration: integer('timer_duration').notNull().default(30),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString())
});

export const rewards = sqliteTable('rewards', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  cost: integer('cost').notNull(),
  emoji: text('emoji').notNull(),
  status: text('status').notNull().default('available'), // 'available', 'claimed', 'fulfilled'
  claimedAt: text('claimed_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});

export const analytics = sqliteTable('analytics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'word' | 'letter'
  targetId: text('target_id').notNull(), // e.g., 'apel', 'B'
  mistakes: integer('mistakes').notNull().default(0),
  lastAttempt: text('last_attempt').notNull().$defaultFn(() => new Date().toISOString())
}, (table) => [
  uniqueIndex('analytics_unique_idx').on(table.profileId, table.type, table.targetId)
]);

export const stickers = sqliteTable('stickers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  stickerId: text('sticker_id').notNull(), // e.g., 'cool_cat'
  earnedAt: text('earned_at').notNull().$defaultFn(() => new Date().toISOString())
});

export const alphabetProgress = sqliteTable('alphabet_progress', {
  profileId: text('profile_id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  score: integer('score').notNull().default(0),
  level: integer('level').notNull().default(1),
  weights: text('weights').notNull().default('{}'),
  challengeConfig: text('challenge_config').notNull().default('[]'),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString())
});

export const storybookProgress = sqliteTable('storybook_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  letter: text('letter').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
  lastRead: text('last_read').notNull().$defaultFn(() => new Date().toISOString())
}, (table) => [
  uniqueIndex('storybook_unique_idx').on(table.profileId, table.letter)
]);

export const userRelations = relations(user, ({ many }) => ({
  profiles: many(profiles)
}));

export const profileRelations = relations(profiles, ({ one, many }) => ({
  user: one(user, {
    fields: [profiles.userId],
    references: [user.id]
  }),
  rewards: many(rewards),
  analytics: many(analytics),
  stickers: many(stickers),
  alphabetProgress: one(alphabetProgress, {
    fields: [profiles.id],
    references: [alphabetProgress.profileId]
  }),
  storybookProgress: many(storybookProgress)
}));

export const rewardRelations = relations(rewards, ({ one }) => ({
  profile: one(profiles, {
    fields: [rewards.profileId],
    references: [profiles.id]
  })
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  profile: one(profiles, {
    fields: [analytics.profileId],
    references: [profiles.id]
  })
}));

export const storybookProgressRelations = relations(storybookProgress, ({ one }) => ({
  profile: one(profiles, {
    fields: [storybookProgress.profileId],
    references: [profiles.id]
  })
}));

export const stickerRelations = relations(stickers, ({ one }) => ({
  profile: one(profiles, {
    fields: [stickers.profileId],
    references: [profiles.id]
  })
}));

export const alphabetProgressRelations = relations(alphabetProgress, ({ one }) => ({
  profile: one(profiles, {
    fields: [alphabetProgress.profileId],
    references: [profiles.id]
  })
}));

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id)
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
});
