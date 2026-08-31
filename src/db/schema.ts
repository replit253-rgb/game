import { pgTable, serial, text, integer, timestamp, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('player').notNull(), // 'admin' | 'player'
  avatar: text('avatar').default('🐻').notNull(),
  coins: integer('coins').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  level: integer('level').notNull(),
  stars: integer('stars').default(0).notNull(),
  score: integer('score').default(0).notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('user_level_idx').on(table.userId, table.level),
]);

export const userRewards = pgTable('user_rewards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  openedChests: jsonb('opened_chests').$type<Record<number, boolean>>().default({}).notNull(),
  unlockedCards: jsonb('unlocked_cards').$type<string[]>().default([]).notNull(),
  claimedBadges: jsonb('claimed_badges').$type<string[]>().default([]).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const gameLogs = pgTable('game_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  username: text('username'),
  level: integer('level').notNull(),
  stars: integer('stars').notNull(),
  score: integer('score').default(0).notNull(),
  timeSpentSeconds: integer('time_spent_seconds').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type UserRewards = typeof userRewards.$inferSelect;
export type GameLog = typeof gameLogs.$inferSelect;
