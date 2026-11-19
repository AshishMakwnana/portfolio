import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { runMigration } from '../scripts/migrate';
import { initDatabase } from '../server/db';

describe('Database Migration & Data Parity Verification Suite', () => {
  const testDbPath = path.resolve(process.cwd(), 'data', 'test-migration.db');
  const memDbPath = path.resolve(process.cwd(), 'data', 'test-idempotent.db');

  function safeUnlink(filePath: string) {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {}
    try {
      if (fs.existsSync(`${filePath}-wal`)) fs.unlinkSync(`${filePath}-wal`);
    } catch {}
    try {
      if (fs.existsSync(`${filePath}-shm`)) fs.unlinkSync(`${filePath}-shm`);
    } catch {}
  }

  test('runs migration cleanly on fresh database', () => {
    safeUnlink(testDbPath);

    runMigration(testDbPath);

    const db = initDatabase(testDbPath);

    const profileCount = (
      db.prepare('SELECT COUNT(*) as count FROM profile').get() as any
    ).count;
    assert.equal(profileCount, 1, 'Profile record should be seeded');

    const skillsCount = (
      db.prepare('SELECT COUNT(*) as count FROM skills').get() as any
    ).count;
    assert.ok(skillsCount >= 10, 'At least 10 skills should be populated');

    const projectsCount = (
      db.prepare('SELECT COUNT(*) as count FROM projects').get() as any
    ).count;
    assert.ok(projectsCount >= 2, 'At least 2 projects should be populated');

    const expCount = (
      db.prepare('SELECT COUNT(*) as count FROM experiences').get() as any
    ).count;
    assert.ok(expCount >= 1, 'Experiences should be populated');

    const workflowsCount = (
      db.prepare('SELECT COUNT(*) as count FROM architecture_workflows').get() as any
    ).count;
    assert.equal(workflowsCount, 3, '3 architecture workflows should be populated');

    db.close();
    safeUnlink(testDbPath);
  });

  test('migration is idempotent and does not overwrite existing data on second run', () => {
    safeUnlink(memDbPath);

    runMigration(memDbPath);

    const db1 = initDatabase(memDbPath);
    // Custom edit to verify it is not overwritten
    db1.prepare("UPDATE profile SET name = 'Custom Name Edited' WHERE id = 'default'").run();
    db1.close();

    // Run migration again
    runMigration(memDbPath);

    const db2 = initDatabase(memDbPath);
    const profile = db2.prepare("SELECT name FROM profile WHERE id = 'default'").get() as any;
    assert.equal(profile.name, 'Custom Name Edited', 'Existing records must be preserved');
    db2.close();

    safeUnlink(memDbPath);
  });
});
