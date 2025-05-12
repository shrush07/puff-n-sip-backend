import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';

const isAdminMiddleware = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Missing user ID' });
    }

    const user = await UserModel.findById(userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    next(); // User is admin, continue
  } catch (error) {
    console.error('isAdminMiddleware error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export default isAdminMiddleware;
