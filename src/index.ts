import Express from 'express';
import config from './config/config';

import APIRouter from './api/doctor/routes';

const app = Express();

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

// ROUTES
app.use('/', APIRouter);

const server = app.listen(config.port, () => {
  console.log(`app is running on port ${config.port}`);
});

// Graceful shutdown
process.once('SIGINT', () => {
  server.close();
});
process.once('SIGTERM', () => {
  server.close();
});
