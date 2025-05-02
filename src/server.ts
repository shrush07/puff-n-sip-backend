import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { dbConnect } from './configs/database.config';
import foodRouter from './routers/food.router';
import userRouter from './routers/user.router';
import orderRouter from './routers/order.router';
import contactRouter from './routers/contact.router';
import authMiddleware from './middlewares/auth.mid';
import cartRouter from './routers/cart.router';
import Stripe from 'stripe';
import path from 'path';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// ✅ Allow both deployed frontend and local dev frontend
const allowedOrigins = ['https://puff-n-sip.netlify.app', 'http://localhost:4200'];

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
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

// ✅ Apply CORS middleware before routes
app.use(cors(corsOptions));

// JSON parser
app.use(express.json());

// Static Images
const imagesPath = path.join(__dirname, 'public/images');
console.log('Serving images from:', imagesPath);
app.use('/images', express.static(imagesPath));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// WebSocket setup
const wss = new WebSocketServer({ server: httpServer });
wss.on('connection', (ws: WebSocket) => {
  console.log('WebSocket client connected');

  ws.on('message', (message: string | Buffer) => {
    console.log('Received:', message.toString());
    ws.send(`Echo: ${message}`);
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// API Routes
app.use('/api/foods', foodRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/cart', cartRouter);
app.use('/api/contact', contactRouter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy.' });
});

// Root
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Protected Route
app.post('/protected-route', authMiddleware, (req, res) => {
  res.json({ message: 'You are authenticated' });
});

// Connect to DB
dbConnect().catch((err) => {
  console.error('Database connection error:', err.message);
});

// Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// 404 Handler
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Start HTTP Server
httpServer.listen(port, () => {
  console.log(`Backend and WebSocket server running at http://localhost:${port}`);
});
