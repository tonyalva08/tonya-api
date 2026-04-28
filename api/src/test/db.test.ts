import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Database as DatabaseType } from 'better-sqlite3';
import { createTestDb } from './db';

describe('createTestDb', () => {
  let db: DatabaseType;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    db.close();
  });

  it('opens an in-memory sqlite db that supports basic SQL', () => {
    db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY)');
    db.prepare('INSERT INTO t (id) VALUES (?)').run(1);
    const row = db.prepare('SELECT id FROM t').get() as { id: number };
    expect(row.id).toBe(1);
  });
});
