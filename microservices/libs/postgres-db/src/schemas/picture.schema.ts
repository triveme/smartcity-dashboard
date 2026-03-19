import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { project } from './project.schema';

export const picture = pgTable('project_picture', {
  id: uuid('id').primaryKey(),
  data: text('data').notNull(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { mode: 'date', precision: 6 }).default(
    sql`now()`,
  ),
});

export type Picture = typeof picture.$inferSelect;
export type NewPicture = typeof picture.$inferInsert;
