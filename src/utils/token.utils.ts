import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

export const generateTokenResponse = (user: User) => {
  const secretKey = process.env.JWT_SECRET || "puff_n_sip";
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin },
    secretKey,
    { expiresIn: '1d' } // Set expiration for access token
  );
 
  const refreshToken = jwt.sign(
    { id: user.id },
    secretKey,
    { expiresIn: '7d' } // Set expiration for refresh token
  );
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is not set in production environment');
}


  return {
    id: user.id,
    email: user.email,
    name: user.name,
    address: user.address,
    isAdmin: user.isAdmin,
    token: accessToken,
    refreshToken: refreshToken // Include refresh token in response
  };
};