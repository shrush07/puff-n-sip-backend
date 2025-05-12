import { JwtPayload } from "jsonwebtoken";
import * as express from 'express';

declare namespace Express {
  export interface Request {
    user?: string | JwtPayload; // Adjust type if necessary
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string; // Adjust based on your user model
        email: string;
        isAdmin: boolean;
        // Add other properties as needed
      };
    }
  }
}
