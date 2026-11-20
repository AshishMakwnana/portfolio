import './env';
import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export function getTokenSecret(): string {
  return (
    process.env.ADMIN_TOKEN_SECRET ||
    crypto.createHash('sha256').update(process.cwd()).digest('hex')
  );
}

export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || 'ashishmakwana435@gmail.com').trim();
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'PortfolioAdmin#2026';
}

export interface AdminTokenPayload {
  email: string;
  exp: number;
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const expectedEmail = getAdminEmail().toLowerCase();

  if (normalizedEmail !== expectedEmail) {
    return false;
  }

  const expectedPassword = getAdminPassword();
  const providedBuffer = Buffer.from(password, 'utf8');
  const expectedBuffer = Buffer.from(expectedPassword, 'utf8');
  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

export function issueAdminToken(email: string): string {
  const payload: AdminTokenPayload = {
    email,
    exp: Date.now() + 1000 * 60 * 60 * 12,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', getTokenSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encoded, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', getTokenSecret())
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expectedSignature, 'utf8');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8'),
    ) as AdminTokenPayload;
    if (!parsed.exp || parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : '';

  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Session expired or invalid.' });
    return;
  }

  next();
}
