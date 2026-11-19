import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DATA_DIR = path.resolve(process.cwd(), 'data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
export const DB_PATH = path.join(DATA_DIR, 'portfolio.db');

let instance: Database.Database | null = null;

export function initDatabase(dbFilePath: string = DB_PATH): Database.Database {
  if (dbFilePath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const db = new Database(dbFilePath);

  // Configure SQLite for high performance and strict relational integrity
  db.pragma('foreign_keys = ON');
  if (dbFilePath !== ':memory:') {
    db.pragma('journal_mode = WAL');
  }

  // Load and apply schema
  const schemaCandidates = [
    path.resolve(__dirname, 'schema.sql'),
    path.resolve(process.cwd(), 'server', 'schema.sql'),
    path.resolve(__dirname, 'server', 'schema.sql'),
  ];
  const schemaPath = schemaCandidates.find((p) => fs.existsSync(p));
  if (schemaPath) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }

  return db;
}

export function getDb(dbFilePath?: string): Database.Database {
  if (dbFilePath && dbFilePath !== DB_PATH) {
    return initDatabase(dbFilePath);
  }

  if (!instance) {
    instance = initDatabase(DB_PATH);
  }

  return instance;
}

export function closeDb(): void {
  if (instance) {
    try {
      instance.close();
    } catch {
      // ignore if already closed
    }
    instance = null;
  }
}
