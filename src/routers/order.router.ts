import { Router } from "express";
import asyncHandler from "express-async-handler";
import { HTTP_BAD_REQUEST } from "../constants/http_status";
import { OrderStatus } from "../constants/order_status";
import { OrderModel } from "../models/order.model";
import auth from "../middlewares/auth.mid";
import mongoose from "mongoose";
import Stripe from "stripe"; 
import authMid from "../middlewares/auth.mid";
import { environment } from "../environments/environment.prod";


console.log('Order router initialized');

const router = Router();
router.use(auth);

// Initialize Stripe with your secret key
const stripe = new Stripe(environment.stripeSecretKey, {
  apiVersion: '2024-12-18.acacia'
});

if (!environment.stripeSecretKey) {
  console.error("Stripe Secret Key is missing!");
  process.exit(1);
}

// Create Order
router.post("/create", asyncHandler(async (req: any, res: any) => {
  console.log('Received data in /create:', req.body);
  const { name, address, imageUrl, items, orderType } = req.body;
  const userId = req.user?.id;

  if (!name || !address || !imageUrl || !items || items.length === 0 || orderType === 0) {
    console.error('Validation error: Missing required fields');
    return res.status(HTTP_BAD_REQUEST).json({ message: "All fields are required." });
  }
  
  if (!userId) {
    console.error('User not authenticated');
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const newOrder = new OrderModel({ ...req.body, user: userId });
    const savedOrder = await newOrder.save();
    console.log('Order saved successfully:', savedOrder);
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error saving order to DB:', error);
    res.status(500).json({ message: 'Failed to save order.' });
  }  

}));

// Get the new or existing order for the current user
router.get("/newOrderForCurrentUser", asyncHandler(async (req: any, res: any) => {
  console.log('Route hit: /api/orders/newOrderForCurrentUser');
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check for an existing order with NEW or MODIFIED status
  let order = await OrderModel.findOne({
    user: userId,
    status: { $in: [OrderStatus.NEW, OrderStatus.MODIFIED] },
  });

  if (!order) {
    console.log("No existing order found. Creating a new order.");
    // If no order exists, create a new one
    order = new OrderModel({
      user: userId,
      items: [], 
      status: OrderStatus.NEW,
    });
    await order.save();
  } 
  res.status(200).json(order);

}));

router.get('/order/:orderId', asyncHandler(async(req: any, res: any) => {
  const orderId = req.params.orderId;
  console.log('Received order ID:', orderId);

  if (!orderId || !mongoose.isValidObjectId(orderId)) {
    console.log('Invalid Order ID:', orderId);
    return res.status(400).json({ message: 'Invalid Order ID' });
  }

  try {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      console.log('Order not found for ID:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
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
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).send({ error: 'Failed to create payment intent' });
  }
});

// Update Order Status and Save Payment Information on Payment Success
router.post('/payment/success', asyncHandler(async (req: any, res: any) => {
  console.log('POST /payment/success called with:', req.body);
  const { orderId, paymentId } = req.body;
  // Validate request body
  if (!orderId || !paymentId) {
    console.error('Validation error: Missing orderId or paymentId.');
    return res.status(400).json({ message: 'Order ID and Payment ID are required.' });
  }

  try {
    // Find the order
    const order = await OrderModel.findById(orderId);
    if (!order) {
      console.error('Order not found for ID:', orderId);
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Update the order status and save payment information
    order.status = OrderStatus.COMPLETED;
    order.paymentId = paymentId;
    await order.save();

    console.log('Order successfully updated to COMPLETED:', order);
    return res.status(200).json({ message: 'Order updated to completed.', order });
  } catch (error) {
    console.error('Error updating order in /payment/success:', error);
    return res.status(500).json({ message: 'Internal Server Error while updating order.' });
  }
}));

// Fetch the latest order for the logged-in user
router.get('/latest', auth, asyncHandler(async (req: any, res: any) => {
  console.log('Incoming request: GET /api/orders/latest');
  
  const userId = req.user?.id; // Ensure `auth` middleware sets `req.user`
  if (!userId) {
    console.error('Unauthorized request: No user ID found in token');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const latestOrder = await OrderModel.findOne({ user: userId }).sort({ createdAt: -1 });
    if (!latestOrder) {
      console.error('No recent orders found for user:', userId);
      return res.status(404).json({ message: 'No recent orders found.' });
    }

    console.log('Latest order fetched successfully:', latestOrder);
    res.status(200).json(latestOrder);
  } catch (error) {
    console.error('Error fetching latest order:', error);
    res.status(500).json({ message: 'Failed to fetch latest order.' });
  }
}));


export default router;