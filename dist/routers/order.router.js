"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_1 = require("../constants/http_status");
const order_status_1 = require("../constants/order_status");
const order_model_1 = require("../models/order.model");
const auth_mid_1 = __importDefault(require("../middlewares/auth.mid"));
const mongoose_1 = __importDefault(require("mongoose"));
const stripe_1 = __importDefault(require("stripe"));
const environment_prod_1 = require("../environments/environment.prod");
console.log('Order router initialized');
const router = (0, express_1.Router)();
router.use(auth_mid_1.default);
// Initialize Stripe with your secret key
const stripe = new stripe_1.default(environment_prod_1.environment.stripeSecretKey, {
    apiVersion: '2024-12-18.acacia'
});
if (!environment_prod_1.environment.stripeSecretKey) {
    console.error("Stripe Secret Key is missing!");
    process.exit(1);
}
// Create Order
router.post("/create", (0, express_async_handler_1.default)(async (req, res) => {
    console.log('Received data in /create:', req.body);
    const { name, address, imageUrl, items, orderType } = req.body;
    const userId = req.user?.id;
    if (!name || !address || !imageUrl || !items || items.length === 0 || orderType === 0) {
        console.error('Validation error: Missing required fields');
        return res.status(http_status_1.HTTP_BAD_REQUEST).json({ message: "All fields are required." });
    }
    if (!userId) {
        console.error('User not authenticated');
        return res.status(401).json({ message: 'User not authenticated' });
    }
    try {
        const newOrder = new order_model_1.OrderModel({ ...req.body, user: userId });
        const savedOrder = await newOrder.save();
        console.log('Order saved successfully:', savedOrder);
        res.status(201).json(savedOrder);
    }
    catch (error) {
        console.error('Error saving order to DB:', error);
        res.status(500).json({ message: 'Failed to save order.' });
    }
}));
// Get the new or existing order for the current user
router.get("/newOrderForCurrentUser", (0, express_async_handler_1.default)(async (req, res) => {
    console.log('Route hit: /api/orders/newOrderForCurrentUser');
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    // Check for an existing order with NEW or MODIFIED status
    let order = await order_model_1.OrderModel.findOne({
        user: userId,
        status: { $in: [order_status_1.OrderStatus.NEW, order_status_1.OrderStatus.MODIFIED] },
    });
    if (!order) {
        console.log("No existing order found. Creating a new order.");
        // If no order exists, create a new one
        order = new order_model_1.OrderModel({
            user: userId,
            items: [],
            status: order_status_1.OrderStatus.NEW,
        });
        await order.save();
    }
    res.status(200).json(order);
}));
router.get('/order/:orderId', (0, express_async_handler_1.default)(async (req, res) => {
    const orderId = req.params.orderId;
    console.log('Received order ID:', orderId);
    if (!orderId || !mongoose_1.default.isValidObjectId(orderId)) {
        console.log('Invalid Order ID:', orderId);
        return res.status(400).json({ message: 'Invalid Order ID' });
    }
    try {
        const order = await order_model_1.OrderModel.findById(orderId);
        if (!order) {
            console.log('Order not found for ID:', orderId);
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// Create Payment Intent
router.post('/payment/create-payment-intent', async (req, res) => {
    console.log('Payment intent creation request received:', req.body);
    const { totalAmount } = req.body;
    // Check if the amount is valid for Stripe
    if (totalAmount < 50) {
        return res.status(400).json({ error: 'Amount must be at least ₹50' });
    }
    // Create a PaymentIntent
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount * 100,
            currency: 'inr',
            description: 'Order Payment',
        });
        // Log the response to verify the clientSecret
        console.log('Stripe payment intent created:', paymentIntent.client_secret);
        res.json({ clientSecret: paymentIntent.client_secret });
    }
    catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).send({ error: 'Failed to create payment intent' });
    }
});
// Update Order Status and Save Payment Information on Payment Success
router.post('/payment/success', (0, express_async_handler_1.default)(async (req, res) => {
    console.log('POST /payment/success called with:', req.body);
    const { orderId, paymentId } = req.body;
    // Validate request body
    if (!orderId || !paymentId) {
        console.error('Validation error: Missing orderId or paymentId.');
        return res.status(400).json({ message: 'Order ID and Payment ID are required.' });
    }
    try {
        // Find the order
        const order = await order_model_1.OrderModel.findById(orderId);
        if (!order) {
            console.error('Order not found for ID:', orderId);
            return res.status(404).json({ message: 'Order not found.' });
        }
        // Update the order status and save payment information
        order.status = order_status_1.OrderStatus.COMPLETED;
        order.paymentId = paymentId;
        await order.save();
        console.log('Order successfully updated to COMPLETED:', order);
        return res.status(200).json({ message: 'Order updated to completed.', order });
    }
    catch (error) {
        console.error('Error updating order in /payment/success:', error);
        return res.status(500).json({ message: 'Internal Server Error while updating order.' });
    }
}));
// Fetch the latest order for the logged-in user
router.get('/latest', auth_mid_1.default, (0, express_async_handler_1.default)(async (req, res) => {
    console.log('Incoming request: GET /api/orders/latest');
    const userId = req.user?.id; // Ensure `auth` middleware sets `req.user`
    if (!userId) {
        console.error('Unauthorized request: No user ID found in token');
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const latestOrder = await order_model_1.OrderModel.findOne({ user: userId }).sort({ createdAt: -1 });
        if (!latestOrder) {
            console.error('No recent orders found for user:', userId);
            return res.status(404).json({ message: 'No recent orders found.' });
        }
        console.log('Latest order fetched successfully:', latestOrder);
        res.status(200).json(latestOrder);
    }
    catch (error) {
        console.error('Error fetching latest order:', error);
        res.status(500).json({ message: 'Failed to fetch latest order.' });
    }
}));
exports.default = router;
