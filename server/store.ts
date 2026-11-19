import { UPLOADS_DIR } from './db';
import { queries } from './queries';
import type {
  AdminDatabaseRecord,
  PortfolioPayload,
} from '../src/types/portfolio';

export { UPLOADS_DIR };

/**
 * Direct SQLite implementation for public portfolio payload.
 * Serves live records directly from normalized SQLite database tables.
 */
export async function readPortfolioStore(): Promise<PortfolioPayload> {
  return queries.getPublicPortfolio();
}

/**
 * Direct SQLite implementation for admin dashboard records.
 * Serves live records directly from normalized SQLite database tables.
 */
export async function readAdminStore(): Promise<AdminDatabaseRecord> {
  return queries.getAdminDashboard();
}

/**
 * Atomic write adapter for full record updates into SQLite.
 */
export async function writeAdminStore(
  record: AdminDatabaseRecord,
): Promise<void> {
  if (record.profile) {
    queries.updateProfile(record.profile);
  }
  if (record.settings) {
    queries.updateSettings(record.settings);
  }
}
