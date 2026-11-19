import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { runMigration } from '../scripts/migrate';
import { queries } from '../server/queries';

describe('Relational Query Service Layer Suite', () => {
  // Ensure the main database is ready
  runMigration();

  test('getPublicPortfolio returns well-formed payload without null/undefined crashes', () => {
    const payload = queries.getPublicPortfolio();

    assert.ok(payload.profile, 'Profile must exist');
    assert.ok(payload.profile.name, 'Profile name must be present');
    assert.ok(Array.isArray(payload.profile.aboutParagraphs), 'aboutParagraphs must be array');
    assert.ok(Array.isArray(payload.profile.aboutHighlights), 'aboutHighlights must be array');
    assert.ok(Array.isArray(payload.skills), 'skills must be array');
    assert.ok(payload.skills.length > 0, 'skills must not be empty');
    assert.ok(Array.isArray(payload.projects), 'projects must be array');
    assert.ok(payload.projects.length > 0, 'projects must not be empty');
    assert.ok(Array.isArray(payload.experiences), 'experiences must be array');
    assert.ok(Array.isArray(payload.education), 'education must be array');
    assert.ok(Array.isArray(payload.certifications), 'certifications must be array');
    assert.ok(Array.isArray(payload.architectureNodes), 'architectureNodes must be array');
    assert.ok(Array.isArray(payload.architectureWorkflows), 'architectureWorkflows must be array');
    assert.ok(payload.settings, 'settings must exist');
  });

  test('getProjectBySlug retrieves project with relations or returns null for non-existent slug', () => {
    const valid = queries.getProjectBySlug('multi-tenant-business-operations-api');
    assert.ok(valid, 'Valid project slug should return project');
    assert.equal(valid.slug, 'multi-tenant-business-operations-api');
    assert.ok(Array.isArray(valid.technicalHighlights), 'technicalHighlights must be array');
    assert.ok(Array.isArray(valid.technologies), 'technologies must be array');

    const invalid = queries.getProjectBySlug('non-existent-project-xyz');
    assert.equal(invalid, null, 'Non-existent project should return null');
  });

  test('createContactMessage inserts and retrieves new message', () => {
    const msg = queries.createContactMessage({
      name: 'Verification Bot',
      email: 'test@example.com',
      subject: 'Inquiry',
      message: 'Hello, this is an automated query test.',
    });

    assert.ok(msg.id, 'Message must have an id');
    assert.equal(msg.name, 'Verification Bot');
    assert.equal(msg.read, false);

    const all = queries.getContactMessages();
    const found = all.find((m) => m.id === msg.id);
    assert.ok(found, 'Inserted message should be found in queries.getContactMessages()');

    // Clean up
    queries.deleteMessage(msg.id);
  });

  test('skill CRUD operations maintain referential integrity', () => {
    const created = queries.createSkill({
      name: 'Automated Test Framework',
      category: 'Software Quality & Testing',
      isPrimary: true,
      focusNote: 'Verification note',
    });

    assert.ok(created.id, 'Created skill should have an id');
    assert.equal(created.name, 'Automated Test Framework');
    assert.equal(created.category, 'Software Quality & Testing');

    const updated = queries.updateSkill(created.id, {
      name: 'Updated Test Framework',
      focusNote: 'Updated note',
    });
    assert.equal(updated.name, 'Updated Test Framework');

    queries.deleteSkill(created.id);
    const skills = queries.getSkills();
    assert.ok(!skills.some((s) => s.id === created.id), 'Deleted skill should not exist');
  });
});
