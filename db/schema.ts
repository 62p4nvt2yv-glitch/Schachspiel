import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  inviteHash: text('invite_hash').notNull(),
  whiteHash: text('white_hash').notNull(),
  blackHash: text('black_hash'),
  pgn: text('pgn').notNull().default(''),
  version: integer('version').notNull().default(0),
  resigned: text('resigned'),
  createdAt: integer('created_at').notNull(),
});
