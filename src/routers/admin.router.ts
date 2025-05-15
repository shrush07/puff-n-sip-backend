import express from 'express';
import { UserModel } from '../models/user.model'; 
import { OrderModel } from '../models/order.model';
import { OrderStatus } from '../constants/order_status';

const router = express.Router();

router.get('/overview', async (req, res) => {
  try {
    // Fetch actual data from MongoDB
    const [usersCount, ordersCount, liveOrdersCount, cancelledOrdersCount] = await Promise.all([
      UserModel.countDocuments(),
      OrderModel.countDocuments(),
      OrderModel.countDocuments({ status: OrderStatus.NEW }),
      OrderModel.countDocuments({ status: 'live' }),
      OrderModel.countDocuments({ status: 'cancelled' })
    ]);

    const dashboardData = {
      users: usersCount,
      orders: ordersCount,
      liveOrders: liveOrdersCount,
      cancelledOrders: cancelledOrdersCount
    };
    console.log('Fetching dashboard data from MongoDB');
    res.json(dashboardData);
  } catch (err) {
    // Leave existing logs untouched
    console.error('Error getting dashboard data:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
