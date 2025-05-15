import express from 'express';
import { UserModel } from '../models/user.model'; 
import { OrderModel } from '../models/order.model';
import { OrderStatus } from '../constants/order_status';
import { fetchTopProducts } from '../controllers/admin.controller';

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

router.get('/top-products', async (req, res) => {
  const range = req.query.range;

  if (range === 'weekly' || range === 'monthly' || range === 'yearly') {
    try {
      const data = await fetchTopProducts(range);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch top products' });
    }
  } else {
    res.status(400).json({ error: 'Invalid range value' });
  }
});


export default router;
