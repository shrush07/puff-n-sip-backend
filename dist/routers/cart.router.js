"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const cart_model_1 = require("../models/cart.model");
const router = express_1.default.Router();
// Get the cart for a user or guest
router.get('/', (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { guestCartId } = req.query;
        let cart;
        if (userId) {
            cart = await cart_model_1.CartModel.findOne({ user: userId });
        }
        else if (guestCartId) {
            cart = await cart_model_1.CartModel.findOne({ _id: guestCartId, user: null });
        }
        if (!cart) {
            res.status(404).json({ message: 'Cart not found.' });
        }
        else {
            res.status(200).json(cart);
        }
    }
    catch (error) {
        next(error);
    }
}));
// Add item to cart
router.post('/add', (0, express_async_handler_1.default)(async (req, res) => {
    console.log('Add to cart route hit');
    console.log('Request body:', req.body);
    // console.log('User:', req.user);
    const userId = req.user.id;
    const { foodId } = req.body;
    let cart = await cart_model_1.CartModel.findOne({ user: userId });
    if (!cart) {
        cart = new cart_model_1.CartModel({ user: userId, items: [] });
    }
    const existingItem = cart.items.find(item => item?.food?.name.toString() === foodId);
    if (existingItem) {
        existingItem.quantity += 1;
    }
    else {
        cart.items.push({ food: foodId, quantity: 1 });
    }
    await cart.save();
    res.status(200).json(cart);
}));
// Remove an item from the cart
router.delete('/items/:itemId', (0, express_async_handler_1.default)(async (req, res, next) => {
    const userId = req.user?.id;
    const { itemId } = req.params;
    const { guestCartId } = req.body;
    if (!itemId) {
        res.status(400).json({ message: 'Item ID is required.' });
    }
    let updatedCart;
    if (userId) {
        updatedCart = await cart_model_1.CartModel.findOneAndUpdate({ user: userId }, { $pull: { items: { _id: itemId } }, updatedAt: new Date() }, { new: true });
    }
    else if (guestCartId) {
        updatedCart = await cart_model_1.CartModel.findOneAndUpdate({ _id: guestCartId, user: null }, { $pull: { items: { _id: itemId } }, updatedAt: new Date() }, { new: true });
    }
    res.status(200).json(updatedCart);
}));
// Change the quantity of an item in the cart
router.put('/:userId/items/:itemId', (0, express_async_handler_1.default)(async (req, res) => {
    const { userId, itemId } = req.params;
    const { quantity, price } = req.body;
    if (!userId || !itemId || quantity == null || price == null) {
        return res.status(400).json({ message: 'Invalid payload.' });
    }
    const updatedCart = await cart_model_1.CartModel.findOneAndUpdate({ user: userId, 'items._id': itemId }, { $set: { 'items.$.quantity': quantity, 'items.$.price': price }, updatedAt: new Date() }, { new: true });
    res.status(200).json(updatedCart);
}));
// Clear cart
router.delete('/', (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user.id;
    await cart_model_1.CartModel.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
    res.status(200).json({ items: [] });
}));
exports.default = router;
