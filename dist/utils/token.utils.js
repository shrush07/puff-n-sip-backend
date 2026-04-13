"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokenResponse = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateTokenResponse = (user) => {
    const secretKey = process.env.JWT_SECRET || "puff_n_sip";
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin, role: user.isAdmin ? 'admin' : 'user' }, secretKey, { expiresIn: '1d' });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, secretKey, { expiresIn: '7d' });
    if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET is not set in production environment');
    }
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        address: user.address,
        isAdmin: user.isAdmin,
        role: user.isAdmin ? 'admin' : 'user',
        token: accessToken,
        refreshToken: refreshToken
    };
};
exports.generateTokenResponse = generateTokenResponse;
