import express from 'express';
const router = express.Router();

router.get('/overview', async (req, res) => {
    try {
    const dashboardData = {
    users: 102,
    orders: 230,
    liveOrders: 7,
    cancelledOrders: 12
    };
    res.json(dashboardData);
    } catch (err) {
    console.error('Error getting dashboard data:', err);
    res.status(500).json({ message: 'Server Error' });
    }
    });

export default router;