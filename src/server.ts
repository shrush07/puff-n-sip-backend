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
import fs from 'fs';

// Load environment variables
dotenv.config();
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-12-18.acacia',
});

const app = express();

// Get allowed origins from environment variables
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://puff-n-sip.netlify.app']  
  : ['http://localhost:4200']; 

// Middleware
app.use(express.json());
app.use(
  cors({  
    origin: allowedOrigins, // Allow only specific origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  })
);

// Static Image Serving
const imagesPath = path.join(__dirname, 'public/images');
console.log('Configured to serve images from:', imagesPath);

// Confirm the folder exists
if (!fs.existsSync(imagesPath)) {
  console.warn('WARNING: Images path does not exist:', imagesPath);
} else {
  console.log('Static images folder exists.');
}

app.use('/images', express.static(imagesPath));

// Log all incoming requests
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.originalUrl);
  next();
});

// Routes
app.use('/api/foods', foodRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/cart', cartRouter);
app.use('/api/contact', contactRouter);

// Root route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Protected test route
app.post('/protected-route', authMiddleware, (req, res) => {
  res.json({ message: 'You are authenticated' });
});

// Connect to database
dbConnect().catch((err) =>
  console.error('Failed to connect to the database:', err.message)
);

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Catch unmatched routes
app.use((req, res) => {
  console.warn(`Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
