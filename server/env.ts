import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const candidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(currentDir, '.env'),
  path.resolve(currentDir, '..', '.env'),
  path.resolve(currentDir, '..', '..', '.env'),
];

for (const envPath of candidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}
