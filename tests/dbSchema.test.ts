import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Database Schema & Constraint Verification Suite', () => {
  function createTestDb() {
    const db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    const schemaSql = fs.readFileSync(
      path.resolve(__dirname, '../server/schema.sql'),
      'utf8',
    );
    db.exec(schemaSql);
    return db;
  }

  test('creates all required tables successfully', () => {
    const db = createTestDb();
    const tables = (
      db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
        .all() as { name: string }[]
    ).map((t) => t.name);

    const expectedTables = [
      'profile',
      'social_links',
      'site_settings',
      'skill_categories',
      'skills',
      'projects',
      'project_highlights',
      'project_technologies',
      'project_screenshots',
      'experiences',
      'experience_responsibilities',
      'experience_technologies',
      'education',
      'certifications',
      'contact_messages',
      'architecture_nodes',
      'architecture_workflows',
      'workflow_terminal_lines',
      'workflow_active_nodes',
    ];

    for (const expected of expectedTables) {
      assert.ok(
        tables.includes(expected),
        `Table "${expected}" should exist in database.`,
      );
    }

    db.close();
  });

  test('enforces foreign key constraints on skills and skill_categories', () => {
    const db = createTestDb();

    // Inserting a skill with non-existent category_id should throw foreign key violation
    assert.throws(() => {
      db.prepare(`
        INSERT INTO skills (id, name, category_id, is_primary, focus_note)
        VALUES ('skill-test', 'Test Skill', 'non-existent-cat', 1, 'Note')
      `).run();
    }, /FOREIGN KEY constraint failed/);

    db.close();
  });

  test('enforces cascading delete on projects and child relations', () => {
    const db = createTestDb();

    // Insert project
    db.prepare(`
      INSERT INTO projects (
        id, slug, title, category, status, featured, short_description,
        problem_statement, solution_summary
      ) VALUES (
        'proj-test', 'test-slug', 'Test Project', 'Backend', 'Completed', 1,
        'Short desc', 'Problem', 'Solution'
      )
    `).run();

    // Insert highlights, technologies, screenshots
    db.prepare(`
      INSERT INTO project_highlights (project_id, highlight, sort_order)
      VALUES ('proj-test', 'Highlight 1', 1)
    `).run();

    db.prepare(`
      INSERT INTO project_technologies (project_id, technology, sort_order)
      VALUES ('proj-test', 'TypeScript', 1)
    `).run();

    db.prepare(`
      INSERT INTO project_screenshots (project_id, image_url, sort_order)
      VALUES ('proj-test', '/uploads/test.png', 1)
    `).run();

    // Verify children exist
    assert.equal(
      (
        db
          .prepare('SELECT COUNT(*) as count FROM project_highlights WHERE project_id = ?')
          .get('proj-test') as any
      ).count,
      1,
    );

    // Delete parent project
    db.prepare('DELETE FROM projects WHERE id = ?').run('proj-test');

    // Children should be automatically cascaded and deleted
    assert.equal(
      (
        db
          .prepare('SELECT COUNT(*) as count FROM project_highlights WHERE project_id = ?')
          .get('proj-test') as any
      ).count,
      0,
    );
    assert.equal(
      (
        db
          .prepare('SELECT COUNT(*) as count FROM project_technologies WHERE project_id = ?')
          .get('proj-test') as any
      ).count,
      0,
    );
    assert.equal(
      (
        db
          .prepare('SELECT COUNT(*) as count FROM project_screenshots WHERE project_id = ?')
          .get('proj-test') as any
      ).count,
      0,
    );

    db.close();
  });

  test('enforces unique constraints on project slug', () => {
    const db = createTestDb();

    db.prepare(`
      INSERT INTO projects (
        id, slug, title, category, status, featured, short_description,
        problem_statement, solution_summary
      ) VALUES (
        'proj-1', 'unique-slug', 'Project 1', 'Backend', 'Completed', 1,
        'Desc 1', 'Prob 1', 'Sol 1'
      )
    `).run();

    assert.throws(() => {
      db.prepare(`
        INSERT INTO projects (
          id, slug, title, category, status, featured, short_description,
          problem_statement, solution_summary
        ) VALUES (
          'proj-2', 'unique-slug', 'Project 2', 'Backend', 'Completed', 1,
          'Desc 2', 'Prob 2', 'Sol 2'
        )
      `).run();
    }, /UNIQUE constraint failed/);

    db.close();
  });

  test('enforces CHECK constraints on project status and social platform', () => {
    const db = createTestDb();

    // Invalid status should fail
    assert.throws(() => {
      db.prepare(`
        INSERT INTO projects (
          id, slug, title, category, status, featured, short_description,
          problem_statement, solution_summary
        ) VALUES (
          'proj-bad', 'bad-status', 'Bad Project', 'Backend', 'Archived', 1,
          'Desc', 'Prob', 'Sol'
        )
      `).run();
    }, /CHECK constraint failed/);

    // Invalid social link platform should fail
    assert.throws(() => {
      db.prepare(`
        INSERT INTO social_links (id, label, url, platform, sort_order)
        VALUES ('soc-bad', 'Bad Platform', 'https://bad.com', 'twitter', 0)
      `).run();
    }, /CHECK constraint failed/);

    db.close();
  });
});
