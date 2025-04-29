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
import mongoose from 'mongoose';
import path from 'path';

// Load environment variables
dotenv.config();
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY); // Log the Stripe API key for debugging

// Initialize Stripe with your SECRET key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-12-18.acacia', // Update to a stable version if needed
});

const app = express();

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [process.env.CORS_ORIGIN || 'http://localhost:4200', 'https://puff-n-sip.netlify.app/'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  })
);

// Routes
app.use('/api/foods', foodRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/cart', cartRouter);
app.use('/api/contact', contactRouter);

// Serve static images from the public/images folder
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Log incoming requests
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.originalUrl);
  next();
});

// Protected Route Example
app.post('/protected-route', authMiddleware, (req, res) => {
  res.json({ message: 'You are authenticated' });
});

// Database Connection
dbConnect().catch((err) =>
  console.error('Failed to connect to the database:', err.message)
);

// Error Handling Middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Handle unmatched routes
app.use((req, res) => {
  console.log(`Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
