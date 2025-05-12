import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

export const generateTokenResponse = (user: User) => {
  const secretKey = process.env.JWT_SECRET || "puff_n_sip";
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin },
    secretKey,
    { expiresIn: '1d' } // Set expiration for access token
  );

 const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "puff_n_sip", { expiresIn: '1d' });
  };
 
  const refreshToken = jwt.sign(
    { id: user.id },
    secretKey,
    { expiresIn: '7d' } // Set expiration for refresh token
  );

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