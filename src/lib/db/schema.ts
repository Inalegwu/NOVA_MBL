import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const issues = sqliteTable('issues', {
  id: text('id').primaryKey(), // archiveId
  filePath: text('file_path').notNull(),
  series: text('series').notNull(),
  title: text('title').notNull(),
  pageCount: integer('page_count').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  addedAt: integer('added_at').notNull(),
});

export const readingProgress = sqliteTable('reading_progress', {
  issueId: text('issue_id')
    .primaryKey()
    .references(() => issues.id),
  currentPage: integer('current_page').notNull().default(0),
  updatedAt: integer('updated_at').notNull(),
});
