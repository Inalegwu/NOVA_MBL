import { drizzle } from 'drizzle-orm/expo-sqlite';
import { pipe } from 'effect/Function';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

const db = pipe(SQLite.openDatabaseSync('nova.db'), (db) =>
  drizzle(db, { schema }),
);

export async function upsertProgress(
  issueId: string,
  page: number,
): Promise<void> {
  await db
    .insert(schema.readingProgress)
    .values({ issueId, currentPage: page, updatedAt: Date.now() })
    .onConflictDoUpdate({
      target: schema.readingProgress.issueId,
      set: { currentPage: page, updatedAt: Date.now() },
    });
}

export default db;
