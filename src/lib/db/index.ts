import { drizzle } from 'drizzle-orm/expo-sqlite';
import { pipe } from 'effect/Function';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

const db = pipe(SQLite.openDatabaseSync('nova.db'), (db) =>
  drizzle(db, { schema }),
);

export default db;
