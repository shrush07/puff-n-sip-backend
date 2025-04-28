import express from 'express';
import asyncHandler from 'express-async-handler';
import { CartModel } from '../models/cart.model';
import { Request, Response, NextFunction } from 'express';
import authMiddleware from '../middlewares/auth.mid';
import { Document, Types } from 'mongoose';

const router = express.Router();

// Get the cart for a user or guest
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { guestCartId } = req.query;
  
      let cart;
      if (userId) {
        cart = await CartModel.findOne({ user: userId });
      } else if (guestCartId) {
        cart = await CartModel.findOne({ _id: guestCartId, user: null });
      }
  
      if (!cart) {
        res.status(404).json({ message: 'Cart not found.' });
      } else {
        res.status(200).json(cart);
      }
    } catch (error) {
      next(error);
    }
  }));

  // Add item to cart
router.post('/add', asyncHandler(async (req: Request, res: Response) => {
  console.log('Add to cart route hit');
  console.log('Request body:', req.body);
  // console.log('User:', req.user);
  
  const userId = (req as any).user.id;
  const { foodId } = req.body;

  let cart = await CartModel.findOne({ user: userId });

  if (!cart) {
    cart = new CartModel({ user: userId, items: [] });
  }

  const existingItem = cart.items.find(item => item?.food?.name.toString() === foodId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({ food: foodId, quantity: 1 });
  }

  await cart.save();
  res.status(200).json(cart);
}));

// Remove an item from the cart
router.delete('/items/:itemId', asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req as any).user?.id;
    const { itemId } = req.params;
    const { guestCartId } = req.body;

    if (!itemId) {
        res.status(400).json({ message: 'Item ID is required.' });
    }

    let updatedCart;
    if (userId) {
        updatedCart = await CartModel.findOneAndUpdate(
            { user: userId },
            { $pull: { items: { _id: itemId } }, updatedAt: new Date() },
            { new: true }
        );
    } else if (guestCartId) {
        updatedCart = await CartModel.findOneAndUpdate(
            { _id: guestCartId, user: null },
            { $pull: { items: { _id: itemId } }, updatedAt: new Date() },
            { new: true }
        );
    }

    res.status(200).json(updatedCart);
}));

// Change the quantity of an item in the cart
router.put('/:userId/items/:itemId', asyncHandler(async (req: any, res: any) => {
    const { userId, itemId } = req.params;
    const { quantity, price } = req.body;

    if (!userId || !itemId || quantity == null || price == null) {
        return res.status(400).json({ message: 'Invalid payload.' });
    }

    const updatedCart = await CartModel.findOneAndUpdate(
        { user: userId, 'items._id': itemId },
        { $set: { 'items.$.quantity': quantity, 'items.$.price': price }, updatedAt: new Date() },
        { new: true }
    );

    res.status(200).json(updatedCart);
}));

// Clear cart
router.delete('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  await CartModel.findOneAndUpdate(
    { user: userId },
    { $set: { items: [] } }
  );

  res.status(200).json({ items: [] });
}));

export default router;