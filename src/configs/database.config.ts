import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();
//const mongoose = require('mongoose');


// Connect to MongoDB
export const dbConnect = async (): Promise<void> => {
  const MONGO_URI = process.env.MONGO_URI;
  console.log('Loaded Environment Variables:', process.env);

  if (!MONGO_URI) {
    console.error('Error: MONGO_URI is missing in the environment variables.');
    throw new Error('MongoDB URI is required but not defined.');
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to MongoDB.');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Database connection failed.');
  }
};

// Export JWT_SECRET for other parts of the app
export const jwtSecret = process.env.JWT_SECRET || '';
if (!jwtSecret) {
  console.warn('Warning: JWT_SECRET is missing in the environment variables.');
}