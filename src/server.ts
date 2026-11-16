import express, { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import * as dotenv from 'dotenv';
import { dbConnect } from './configs/database.config';

import foodRouter from './routers/food.router';
import userRouter from './routers/user.router';
import orderRouter from './routers/order.router';
import contactRouter from './routers/contact.router';
import cartRouter from './routers/cart.router';
import adminRouter from './routers/admin.router';

import authMiddleware from './middlewares/auth.mid';

import path from 'path';
import http from 'http';
import listEndpoints from 'express-list-endpoints';
import { WebSocketServer, WebSocket } from 'ws';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const httpServer = http.createServer(app);

//
// Connect to MongoDB
//
dbConnect().catch((err) => {
  logger.error(`Database connection error: ${err.message}`);
});

//
// CORS setup
//
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://puff-n-sip.netlify.app',
  'http://localhost:4200',
  'http://localhost:8080',
].filter(Boolean);

const corsOptions: CorsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
};

//
// Security Middlewares
//
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

// Configure trusted proxy (one hop: Kubernetes Ingress/load balancer)
app.set('trust proxy', 1);

// Configurable rate limiter
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    process.env.DISABLE_RATE_LIMIT === 'true' ||
    (Boolean(process.env.LOAD_TEST_TOKEN) &&
      req.headers['x-load-test-token'] === process.env.LOAD_TEST_TOKEN),
  message: 'Too many requests, please try again later.',
});

app.use(limiter);

app.use(cors(corsOptions));
app.use(express.json());

logger.info('CORS enabled');

//
// Static files (images)
//
const imagesPath = path.join(__dirname, 'public', 'images');
app.use('/images', express.static(imagesPath));
logger.info(`Serving images from: ${imagesPath}`);

//
// Request Logger
//
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

//
// Base URL (for reference only)
//
const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://puff-sip.onrender.com'
    : 'http://localhost:5000';

//
// WebSocket Setup
//
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws: WebSocket) => {
  logger.info('WebSocket client connected');

  ws.on('message', (message: string | Buffer) => {
    logger.info(`Received: ${message.toString()}`);
    ws.send(`Echo: ${message}`);
  });

  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
  });
});

logger.info('Server initializing...');

//
// API Routes
//
app.use('/api/foods', foodRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/cart', cartRouter);
app.use('/api/contact', contactRouter);
app.use('/api/admin', adminRouter);

//
// Health Check
//
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy.' });
});

//
// Root
//
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running!');
});

//
// Protected Route
//
app.post('/protected-route', authMiddleware, (req: Request, res: Response) => {
  res.json({ message: 'You are authenticated' });
});

//
// 404 Handler (ONLY ONE)
//
app.use((req: Request, res: Response) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

//
// Error Handler
//
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(`Unhandled Error: ${err.stack}`);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

app.use(errorHandler);

//
// JWT Check
//
if (!process.env.JWT_SECRET) {
  logger.error('FATAL ERROR: JWT_SECRET is not defined');
  process.exit(1);
}

//
// Start Server
//
httpServer.listen(port, () => {
  logger.info(`Backend running at http://localhost:${port}`);

  const endpoints = listEndpoints(app);
  logger.info('Registered Endpoints:');

  endpoints.forEach((e) => {
    logger.info(`${e.methods.join(', ')} ${e.path}`);
  });
});