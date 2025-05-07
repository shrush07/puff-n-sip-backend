import { Router, Request, Response, NextFunction } from 'express';
import { CartModel } from '../models/cart.model';

const router = Router();

router.post('/cart/add', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { foodId, quantity } = req.body;

    // Fetch the cart for the user
    const cart = await CartModel.findOne({ where: { userId: req.body.userId } });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Explicitly define the type for the item
    const existingItem = cart.items.find((item: { food: { name: string } }) => item?.food?.name.toString() === foodId);

    if (existingItem) {
      // Update the quantity
      existingItem.quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({ food: { name: foodId }, quantity });
    }

    await cart.save();
    return res.json(cart);
  } catch (error) {
    next(error);
  }
});

export default router;
