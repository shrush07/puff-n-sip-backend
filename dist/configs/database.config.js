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
exports.jwtSecret = exports.dbConnect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
//const mongoose = require('mongoose');
// Connect to MongoDB
const dbConnect = async () => {
    const MONGO_URI = process.env.MONGO_URI;
    console.log('Loaded Environment Variables:', process.env);
    if (!MONGO_URI) {
        console.error('Error: MONGO_URI is missing in the environment variables.');
        throw new Error('MongoDB URI is required but not defined.');
    }
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log('Successfully connected to MongoDB.');
    }
    catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw new Error('Database connection failed.');
    }
};
exports.dbConnect = dbConnect;
// Export JWT_SECRET for other parts of the app
exports.jwtSecret = process.env.JWT_SECRET || '';
if (!exports.jwtSecret) {
    console.warn('Warning: JWT_SECRET is missing in the environment variables.');
}
