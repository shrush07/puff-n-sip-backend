import { Router, Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';

const router = Router();

// Route to create a user with minimal required fields
router.post('/create-user', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Optional: Validate email/password presence
        if (!email || !password) {
            res.status(400).send({ message: 'Email and password are required' });
            return;
        }

        const newUser = await UserModel.create({ email, password });

        res.status(201).send(newUser);
    } catch (error) {
        next(error);
    }
});

// Route to generate and store a password reset token
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await UserModel.findOne({ where: { email } });

        if (!user) {
            res.status(404).send({ message: 'User not found' });
            return;
        }

        const resetToken = generateResetToken();
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;

        await user.save();

        res.status(200).send({ message: 'Password reset link sent to your email' });
    } catch (error) {
        next(error);
    }
});

// Simple token generator
const generateResetToken = (): string => {
    return Math.random().toString(36).substring(2);
};

export default router;
