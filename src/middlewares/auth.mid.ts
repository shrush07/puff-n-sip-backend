import { JwtPayload, verify } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

//const jwt = require('jsonwebtoken');

export default async (req: Request, res: Response, next: NextFunction) => {
  console.log('Auth middleware called');
  
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader);

  const token = authHeader?.split(' ')[1];
  console.log('Extracted token:', token);

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ message: "Authentication token not found" });
  }

  try {
    console.log('JWT_SECRET:', process.env.JWT_SECRET); // Log the secret
    const decoded = verify(token, process.env.JWT_SECRET || "puff_n_sip") as JwtPayload;
    console.log('Decoded token:', decoded);

    if (!decoded.id) {
      console.error('User ID not found in token');
      return res.status(401).json({ message: "User ID not found in token" });
    }

    (req as any).user = decoded; // Attach the user to the request
    console.log('User:', (req as any).user);
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};