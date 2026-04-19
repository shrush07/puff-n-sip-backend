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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const database_config_1 = require("./configs/database.config");
const food_router_1 = __importDefault(require("./routers/food.router"));
const user_router_1 = __importDefault(require("./routers/user.router"));
const order_router_1 = __importDefault(require("./routers/order.router"));
const contact_router_1 = __importDefault(require("./routers/contact.router"));
const cart_router_1 = __importDefault(require("./routers/cart.router"));
const admin_router_1 = __importDefault(require("./routers/admin.router"));
const auth_mid_1 = __importDefault(require("./middlewares/auth.mid"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const express_list_endpoints_1 = __importDefault(require("express-list-endpoints"));
const ws_1 = require("ws");
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = __importDefault(require("./utils/logger"));
dotenv.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const httpServer = http_1.default.createServer(app);
//
// Connect to MongoDB
//
(0, database_config_1.dbConnect)().catch((err) => {
    logger_1.default.error(`Database connection error: ${err.message}`);
});
//
// CORS setup
//
const allowedOrigins = [
    'https://puff-n-sip.netlify.app',
    'http://localhost:4200'
];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('CORS not allowed from this origin: ' + origin));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
};
//
// Security Middlewares
//
app.use((0, helmet_1.default)());
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
}));
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
logger_1.default.info('CORS enabled');
//
// Static files (images)
//
const imagesPath = path_1.default.join(__dirname, 'public', 'images');
app.use('/images', express_1.default.static(imagesPath));
logger_1.default.info(`Serving images from: ${imagesPath}`);
//
// Request Logger
//
app.use((req, res, next) => {
    logger_1.default.info(`${req.method} ${req.originalUrl}`);
    next();
});
//
// Base URL (for reference only)
//
const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://puff-sip.onrender.com'
    : 'http://localhost:5000';
//
// WebSocket Setup
//
const wss = new ws_1.WebSocketServer({ server: httpServer });
wss.on('connection', (ws) => {
    logger_1.default.info('WebSocket client connected');
    ws.on('message', (message) => {
        logger_1.default.info(`Received: ${message.toString()}`);
        ws.send(`Echo: ${message}`);
    });
    ws.on('close', () => {
        logger_1.default.info('WebSocket client disconnected');
    });
});
logger_1.default.info('Server initializing...');
//
// API Routes
//
app.use('/api/foods', food_router_1.default);
app.use('/api/users', user_router_1.default);
app.use('/api/orders', order_router_1.default);
app.use('/api/cart', cart_router_1.default);
app.use('/api/contact', contact_router_1.default);
app.use('/api/admin', admin_router_1.default);
//
// Health Check
//
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is healthy.' });
});
//
// Root
//
app.get('/', (req, res) => {
    res.send('Server is running!');
});
//
// Protected Route
//
app.post('/protected-route', auth_mid_1.default, (req, res) => {
    res.json({ message: 'You are authenticated' });
});
//
// 404 Handler (ONLY ONE)
//
app.use((req, res) => {
    logger_1.default.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});
//
// Error Handler
//
const errorHandler = (err, req, res, next) => {
    logger_1.default.error(`Unhandled Error: ${err.stack}`);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
};
app.use(errorHandler);
//
// JWT Check
//
if (!process.env.JWT_SECRET) {
    logger_1.default.error('FATAL ERROR: JWT_SECRET is not defined');
    process.exit(1);
}
//
// Start Server
//
httpServer.listen(port, () => {
    logger_1.default.info(`Backend running at http://localhost:${port}`);
    const endpoints = (0, express_list_endpoints_1.default)(app);
    logger_1.default.info('Registered Endpoints:');
    endpoints.forEach((e) => {
        logger_1.default.info(`${e.methods.join(', ')} ${e.path}`);
    });
});
