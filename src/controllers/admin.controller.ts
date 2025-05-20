import { OrderModel } from '../models/order.model'; 

export async function fetchTopProducts(range: 'weekly' | 'monthly' | 'yearly') {
  const now = new Date();
  let startDate: Date;

  if (range === 'weekly') {
    startDate = new Date();
    startDate.setDate(now.getDate() - 7);
  } else if (range === 'monthly') {
    startDate = new Date();
    startDate.setMonth(now.getMonth() - 1);
  } else {
    startDate = new Date();
    startDate.setFullYear(now.getFullYear() - 1);
  }

  const topProducts = await OrderModel.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.food._id',
        name: { $first: '$items.food.name' },
        imageUrl: { $first: '$items.food.imageUrl' },
        totalSold: { $sum: '$items.quantity' }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    {
      $project: {
        productId: '$_id',
        name: 1,
        imageUrl: 1,
        totalSold: 1
      }
    }
  ]);

  return topProducts;
}
