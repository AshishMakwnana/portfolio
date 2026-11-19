import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { runMigration } from '../scripts/migrate';
import { createExpressApp } from '../server';

describe('API HTTP Endpoints Contract Suite', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    runMigration();
    const app = createExpressApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  test('GET /api/health returns 200 OK with timestamp', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as { ok: boolean; timestamp: string };
    assert.equal(body.ok, true);
    assert.ok(body.timestamp);
  });

  test('GET /api/portfolio returns 200 with complete public data', async () => {
    const res = await fetch(`${baseUrl}/api/portfolio`);
    assert.equal(res.status, 200);
    const data = (await res.json()) as any;
    assert.ok(data.profile);
    assert.ok(data.skills.length > 0);
    assert.ok(data.projects.length > 0);
    // Messages must NOT be leaked to public API
    assert.equal(data.messages, undefined);
  });

  test('GET /api/projects/:slug returns 200 for valid project, 404 for invalid', async () => {
    const valid = await fetch(`${baseUrl}/api/projects/multi-tenant-business-operations-api`);
    assert.equal(valid.status, 200);
    const proj = (await valid.json()) as any;
    assert.equal(proj.slug, 'multi-tenant-business-operations-api');

    const invalid = await fetch(`${baseUrl}/api/projects/unknown-slug-xyz`);
    assert.equal(invalid.status, 404);
  });

  test('POST /api/contact validates inputs and creates message', async () => {
    // Missing fields should fail
    const badRes = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }),
    });
    assert.equal(badRes.status, 400);

    // Valid submission
    const goodRes = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'API Tester',
        email: 'tester@example.com',
        subject: 'API Contract Test',
        message: 'Valid message content for automated endpoint test.',
      }),
    });
    assert.equal(goodRes.status, 201);
    const body = (await goodRes.json()) as any;
    assert.equal(body.ok, true);
    assert.ok(body.id);
  });

  test('POST /api/admin/login validates credentials', async () => {
    // Bad credentials
    const badRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad@example.com', password: 'wrong' }),
    });
    assert.equal(badRes.status, 401);
  });
});
