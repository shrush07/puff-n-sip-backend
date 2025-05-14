import { Router } from 'express';
import { sample_users } from '../data';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { User, UserModel } from '../models/user.model';
import { HTTP_BAD_REQUEST } from '../constants/http_status';
import bcrypt from 'bcryptjs';
import { generateTokenResponse } from '../utils/token.utils';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import isAdminMiddleware from '../middlewares/isAdmin.mid';
import authMiddleware from '../middlewares/auth.mid';

const router = Router();

// Seed route (for database seeding)
router.get("/seed", asyncHandler(
  async (req, res) => {
    const usersCount = await UserModel.countDocuments();
    if (usersCount > 0) {
      res.send("Seed is already done!");
      return;
    }

    await UserModel.create(sample_users);
    res.send("Seed Is Done!");
  }
))

// Login route
router.post('/login', asyncHandler(async (req: any, res: any) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(400).send({ message: 'User not found' });
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(HTTP_BAD_REQUEST).send("Username or password is invalid!");
    }



  res.send({
    id: user._id,
    email: user.email,
    name: user.name,
    address: user.address,
    isAdmin: user.isAdmin,
    token: generateTokenResponse(user), 
  });
}));

// Register route
router.post('/register', asyncHandler(
  async (req, res) => {
    const { name, email, password, address } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      res.status(HTTP_BAD_REQUEST).send('User already exists, please log in!');
      return;
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: '',
      name,
      email: email.toLowerCase(),
      password: encryptedPassword,
      address,
      isAdmin: false,
      token: ''
    };

    const dbUser = await UserModel.create(newUser);

    // Generate tokens for the newly registered user
    res.status(201).send(generateTokenResponse(dbUser));
  }
));

// Admin route
router.get('/', authMiddleware, isAdminMiddleware, asyncHandler(async (req, res) => {
  const users = await UserModel.find().select('-password -resetPasswordToken -resetPasswordExpires');
  res.json(users);
}));

// Request password reset route
router.post('/reset-password', asyncHandler(async (req: any, res: any) => {
  console.log('Reset password request - backend called');
  const { email } = req.body; // Get email from request body
  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate a reset token
  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 3600000); // Token valid for 1 hour
  await user.save();

  // Log the generated reset token and user email
  console.log(`Reset token generated for ${email}: ${resetToken}`);

  // Configure your email service
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  console.log('Sending email to:', user.email);

  const resetUrl = `http://localhost:4200/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: user.email, // Send to the user's email
    subject: 'Password Reset Request',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
    Please click on the following link, or paste this into your browser to complete the process:\n\n
    ${resetUrl}\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    res.status(200).json({ message: 'Reset password email sent' });
  } catch (error) {
    console.error('Detailed error:', error);
    if (error instanceof Error) {
      // Now TypeScript knows that error is an instance of Error
      res.status(500).json({ message: error.message });
    } else {
      // Handle unexpected error types
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }

}));

// Actual password reset route
router.post('/reset-password/:token', asyncHandler(async (req: any, res: any) => {
  console.log('Reset password - backend called');

  const { newPassword } = req.body;
  const { token } = req.params;

  try {
    // Find user by reset token and check expiration
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    // Check if the new password is the same as the old one
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must be different from the current password' });
    }

    // Update user's password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined; // Clear the token after use
    user.resetPasswordExpires = undefined; // Clear expiration date after use
    await user.save();

    res.status(200).json({ message: 'Password has been reset' });

    // Optionally send a confirmation email or generate a new login token here

  } catch (error) {
    console.error('Error in password reset:', error);
    if (error instanceof Error) {
      // Now TypeScript knows that error is an instance of Error
      res.status(500).json({ message: error.message });
    } else {
      // Handle unexpected error types
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
}));

export default router;
