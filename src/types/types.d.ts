import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    export interface Request {
      user?: string | JwtPayload;
    }
  }
}

// types/express.d.ts
declare namespace Express {
    export interface Request {
      user?: any; // Define 'user' property to store decoded token
    }
  }
  
