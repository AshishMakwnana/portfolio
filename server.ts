import './server/env';
import { createExpressApp, startServer } from './server/app';

export { createExpressApp, startServer };

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
