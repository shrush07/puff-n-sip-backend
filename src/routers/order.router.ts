import { Router, Request, Response, NextFunction } from 'express';
import { OrderModel } from '../models/order.model'; // Import correct model
import { UserModel } from '../models/user.model'; // Import UserModel

const router = Router();

// Example of fetching an order by userId
router.get('/orders/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Find the user's latest order
    const latestOrder = await OrderModel.findOne({
      where: { userId },  // Query based on userId
      order: [['createdAt', 'DESC']],  // Order by the created date descending
      include: [
        {
          model: UserModel,
          as: 'user',  // Include the user data as an association
          attributes: ['id', 'name', 'email'], // Example of user attributes
        },
      ],
    });

    if (!latestOrder) {
      return res.status(404).json({ message: 'No orders found for this user.' });
    }

    return res.json(latestOrder);
  } catch (error) {
    next(error);  // Error handling middleware
  }
});

// POST route to create a new order
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { name, address, items, userId, totalPrice, status, orderType } = req.body;

    console.log('Incoming order:', req.body); // Debugging incoming data

    const order = await OrderModel.create({
      name,
      address,
      items,
      userId,
      totalPrice,
      status,
      orderType
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation failed:', error); // This will help identify the Sequelize or DB error
    res.status(500).json({ message: 'Order creation failed', error });
  }
});


// Example of fetching order by primary key (ID)
router.get('/order/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Find order by primary key
    const order = await OrderModel.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    next(error);  // Error handling middleware
  }
});

export default router;
