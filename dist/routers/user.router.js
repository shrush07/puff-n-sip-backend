"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_1 = require("../data");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_model_1 = require("../models/user.model");
const http_status_1 = require("../constants/http_status");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const token_utils_1 = require("../utils/token.utils");
const crypto = __importStar(require("crypto"));
const nodemailer = __importStar(require("nodemailer"));
const isAdmin_mid_1 = __importDefault(require("../middlewares/isAdmin.mid"));
const auth_mid_1 = __importDefault(require("../middlewares/auth.mid"));
const router = (0, express_1.Router)();
// Seed route (for database seeding)
router.get("/seed", (0, express_async_handler_1.default)(async (req, res) => {
    const usersCount = await user_model_1.UserModel.countDocuments();
    if (usersCount > 0) {
        res.send("Seed is already done!");
        return;
    }
    await user_model_1.UserModel.create(data_1.sample_users);
    res.send("Seed Is Done!");
}));
// Login route
router.post('/login', (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    // Find user by email
    const user = await user_model_1.UserModel.findOne({ email });
    if (!user) {
        return res.status(400).send({ message: 'User not found' });
    }
    // Check password
    const isPasswordMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordMatch) {
        return res.status(http_status_1.HTTP_BAD_REQUEST).send({ message: "Username or password is invalid!" });
    }
    // Ensure user object has an 'id' for token generation
    const userForToken = {
        ...user.toObject(),
        id: user._id.toString()
    };
    // Generate token response
    const tokenResponse = (0, token_utils_1.generateTokenResponse)(userForToken);
    // Send full response including token & refreshToken
    res.status(200).send({
        id: tokenResponse.id,
        email: tokenResponse.email,
        name: tokenResponse.name,
        address: tokenResponse.address,
        isAdmin: tokenResponse.isAdmin,
        role: tokenResponse.role,
        token: tokenResponse.token,
        refreshToken: tokenResponse.refreshToken
    });
}));
// Register route
router.post('/register', (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, password, address } = req.body;
    const user = await user_model_1.UserModel.findOne({ email });
    if (user) {
        res.status(http_status_1.HTTP_BAD_REQUEST).send('User already exists, please log in!');
        return;
    }
    const encryptedPassword = await bcryptjs_1.default.hash(password, 10);
    const newUser = {
        id: '',
        name,
        email: email.toLowerCase(),
        password: encryptedPassword,
        address,
        isAdmin: false,
        token: ''
    };
    const dbUser = await user_model_1.UserModel.create(newUser);
    // Generate tokens for the newly registered user
    res.status(201).send((0, token_utils_1.generateTokenResponse)(dbUser));
}));
// Admin route
router.get('/', auth_mid_1.default, isAdmin_mid_1.default, (0, express_async_handler_1.default)(async (req, res) => {
    const users = await user_model_1.UserModel.find().select('-password -resetPasswordToken -resetPasswordExpires');
    res.json(users);
}));
// Request password reset route
router.post('/reset-password', (0, express_async_handler_1.default)(async (req, res) => {
    console.log('Reset password request - backend called');
    const { email } = req.body; // Get email from request body
    const user = await user_model_1.UserModel.findOne({ email });
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
    }
    catch (error) {
        console.error('Detailed error:', error);
        if (error instanceof Error) {
            // Now TypeScript knows that error is an instance of Error
            res.status(500).json({ message: error.message });
        }
        else {
            // Handle unexpected error types
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
}));
// Actual password reset route
router.post('/reset-password/:token', (0, express_async_handler_1.default)(async (req, res) => {
    console.log('Reset password - backend called');
    const { newPassword } = req.body;
    const { token } = req.params;
    try {
        // Find user by reset token and check expiration
        const user = await user_model_1.UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }
        // Check if the new password is the same as the old one
        const isSamePassword = await bcryptjs_1.default.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: 'New password must be different from the current password' });
        }
        // Update user's password
        user.password = await bcryptjs_1.default.hash(newPassword, 10);
        user.resetPasswordToken = undefined; // Clear the token after use
        user.resetPasswordExpires = undefined; // Clear expiration date after use
        await user.save();
        res.status(200).json({ message: 'Password has been reset' });
        // Optionally send a confirmation email or generate a new login token here
    }
    catch (error) {
        console.error('Error in password reset:', error);
        if (error instanceof Error) {
            // Now TypeScript knows that error is an instance of Error
            res.status(500).json({ message: error.message });
        }
        else {
            // Handle unexpected error types
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
}));
exports.default = router;
