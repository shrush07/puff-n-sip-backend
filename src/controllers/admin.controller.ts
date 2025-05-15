import { Request, Response } from 'express';
import { OrderModel } from '../models/order.model'; 

export async function fetchTopProducts(range: 'weekly' | 'monthly' | 'yearly') {
  const now = new Date();
  let startDate: Date;

  if (range === 'weekly') {
    startDate = new Date(now.setDate(now.getDate() - 7));
  } else if (range === 'monthly') {
    startDate = new Date(now.setMonth(now.getMonth() - 1));
  } else {
    startDate = new Date(now.setFullYear(now.getFullYear() - 1));
  }

  // Sample MongoDB aggregation to get top 10 selling products
  const topProducts = await OrderModel.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.productId',
        totalSold: { $sum: '$orderItems.quantity' }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        productId: '$_id',
        name: '$product.name',
        totalSold: 1
      }
    }
  ]);

  return topProducts;
}
