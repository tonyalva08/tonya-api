import Database, { Database as DatabaseType } from 'better-sqlite3';

export function createTestDb(): DatabaseType {
  return new Database(':memory:');
}
