"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_model_1 = require("../models/user.model");
const order_model_1 = require("../models/order.model");
const order_status_1 = require("../constants/order_status");
const admin_controller_1 = require("../controllers/admin.controller");
const router = express_1.default.Router();
router.get('/overview', async (req, res) => {
    try {
        // Fetch actual data from MongoDB
        const [usersCount, ordersCount, liveOrdersCount, cancelledOrdersCount] = await Promise.all([
            user_model_1.UserModel.countDocuments(),
            order_model_1.OrderModel.countDocuments(),
            order_model_1.OrderModel.countDocuments({ status: order_status_1.OrderStatus.NEW }),
            order_model_1.OrderModel.countDocuments({ status: 'live' }),
            order_model_1.OrderModel.countDocuments({ status: 'cancelled' })
        ]);
        const dashboardData = {
            users: usersCount,
            orders: ordersCount,
            liveOrders: liveOrdersCount,
            cancelledOrders: cancelledOrdersCount
        };
        console.log('Fetching dashboard data from MongoDB');
        res.json(dashboardData);
    }
    catch (err) {
        // Leave existing logs untouched
        console.error('Error getting dashboard data:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});
router.get('/top-products', async (req, res) => {
    const range = req.query.range;
    if (range === 'weekly' || range === 'monthly' || range === 'yearly') {
        try {
            const data = await (0, admin_controller_1.fetchTopProducts)(range);
            res.json(data);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch top products' });
        }
    }
    else {
        res.status(400).json({ error: 'Invalid range value' });
    }
});
exports.default = router;
