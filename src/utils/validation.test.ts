import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidHttpUrl,
  slugifyTitle,
  validateContactInput,
} from './validation';

test('validateContactInput rejects invalid fields with clear messages', () => {
  const result = validateContactInput({
    name: 'A',
    email: 'invalid-email',
    subject: 'Hi',
    message: 'Short',
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.email);
  assert.ok(result.errors.subject);
  assert.ok(result.errors.message);
});

test('validateContactInput trims and accepts valid submissions', () => {
  const result = validateContactInput({
    name: '  Rohan Patel  ',
    email: '  rohan@example.com ',
    subject: ' Backend API Architecture Inquiry ',
    message: ' We are building a Laravel multi-tenant SaaS system and would like to discuss. ',
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.sanitized, {
    name: 'Rohan Patel',
    email: 'rohan@example.com',
    subject: 'Backend API Architecture Inquiry',
    message: 'We are building a Laravel multi-tenant SaaS system and would like to discuss.',
  });
});

test('slugifyTitle normalizes project titles into clean URL slugs', () => {
  assert.equal(
    slugifyTitle('Multi-Tenant Operations & Inventory API!'),
    'multi-tenant-operations-inventory-api',
  );
});

test('isValidHttpUrl validates empty or http/https URLs only', () => {
  assert.equal(isValidHttpUrl(''), true);
  assert.equal(isValidHttpUrl('https://github.com/ashishmakwana'), true);
  assert.equal(isValidHttpUrl('javascript:alert(1)'), false);
});
