import Express from 'express';
import config from './config/config';
import cors from 'cors';
import APIRouter from './api/routes';

const app = Express();

app.use(cors({
  origin: '*', // Allow all origins. Change this to your specific origin in production.
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

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
