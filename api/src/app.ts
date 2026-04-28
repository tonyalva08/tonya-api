import express, { Express } from 'express';
import cors from 'cors';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { errorMiddleware } from './middleware/error';
import { healthRouter } from './routes/health';
import { parseUrlRouter } from './routes/parseUrl';
import { snapshotRouter } from './routes/snapshot';
import { roiRouter } from './routes/roi';

export function createApp(): Express {
  const app = express();

  // rate-limit middleware mounts FIRST per project conventions
  app.use(rateLimitMiddleware);
  app.use(cors());
  app.use(express.json());

  app.use('/api', healthRouter);
  app.use('/api', parseUrlRouter);
  app.use('/api', snapshotRouter);
  app.use('/api', roiRouter);

  app.use(errorMiddleware);

  return app;
}
