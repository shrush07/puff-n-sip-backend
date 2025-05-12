import express, { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import * as dotenv from 'dotenv';
import { dbConnect } from './configs/database.config';
import foodRouter from './routers/food.router';
import userRouter from './routers/user.router';
import orderRouter from './routers/order.router';
import contactRouter from './routers/contact.router';
import authMiddleware from './middlewares/auth.mid';
import cartRouter from './routers/cart.router';
import path from 'path';
import http from 'http';
import listEndpoints from 'express-list-endpoints';
import { WebSocketServer, WebSocket } from 'ws';
import router from './routers/user.router';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// Connect to MongoDB
dbConnect().catch((err) => {
  console.error('Database connection error:', err.message);
});

// CORS setup
const allowedOrigins = ['https://puff-n-sip.netlify.app', 'http://localhost:4200'];

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

app.use(cors(corsOptions));
app.use(express.json());

// Serve images
const imagesPath = path.join(__dirname, 'public/images');
console.log('Serving images from:', imagesPath);
app.use('/images', express.static(imagesPath));

// Request logger
app.use((req: Request, res: Response, next: NextFunction) => {
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

console.log("Deployed server.ts is running!");


// API routes
app.use('/api/foods', foodRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/cart', cartRouter);
app.use('/api/contact', contactRouter);

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy.' });
});

router.get('/ping', (req:any, res:any) => {
  res.send('pong');
});


// Root
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running!');
});

// Protected Route
app.post('/protected-route', authMiddleware, (req: Request, res: Response) => {
  res.json({ message: 'You are authenticated' });
});

// General error handler
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
};

app.use(errorHandler);

// 404 Handler
app.use((req: Request, res: Response) => {
  console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Start server
httpServer.listen(port, () => {
  console.log(`Backend and WebSocket server running at http://localhost:${port}`);

  const endpoints = listEndpoints(app);
  console.log('Registered Endpoints:');
  endpoints.forEach((e) => {
    console.log(`${e.methods.join(', ')} ${e.path}`);
  });
});
