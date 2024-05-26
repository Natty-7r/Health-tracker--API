import Express from 'express';
import config from './config/config';

import APIRouter from './api/routes';

const app = Express();
const ignite = () => {
  app.use(Express.json());
  app.use(Express.urlencoded({ extended: true }));

  // ROUTES
  app.use('/admin', APIRouter);

  const server = app.listen(config.port, () => {
    console.log(`bot is running on port ${config.port}`);
  });

  // Graceful shutdown
  process.once('SIGINT', () => {
    server.close();
  });
  process.once('SIGTERM', () => {
    server.close();
  });
};
ignite();
