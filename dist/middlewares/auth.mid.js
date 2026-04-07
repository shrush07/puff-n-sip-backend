"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
//const jwt = require('jsonwebtoken');
exports.default = async (req, res, next) => {
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
        const decoded = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET || "puff_n_sip");
        console.log('Decoded token:', decoded);
        if (!decoded.id) {
            console.error('User ID not found in token');
            return res.status(401).json({ message: "User ID not found in token" });
        }
        req.user = decoded; // Attach the user to the request
        console.log('User:', req.user);
        next();
    }
    catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
