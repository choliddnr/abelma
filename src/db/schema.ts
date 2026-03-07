import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const belajarHurufGameState = sqliteTable('BelajarHurufGameState', {
  user: text('user').primaryKey(),
  score: integer('score').notNull().default(0),
  level: integer('level').notNull().default(0),
  weights: text('weights').notNull().default('{}'),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString())
});

