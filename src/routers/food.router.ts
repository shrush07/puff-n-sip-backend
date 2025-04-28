import { Router } from 'express';
import { sample_foods, sample_tags } from '../data';
import asyncHandler from 'express-async-handler';
import { FoodModel } from '../models/food.model';
const router = Router();

router.get(
  '/seed',
  asyncHandler(async (req, res) => {
    const foodsCount = await FoodModel.countDocuments();
    if (foodsCount > 0) {
      res.send('Seed is already done!');
      return;
    }

    await FoodModel.create(sample_foods);
    res.send('Seed Is Done!');
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const food = await FoodModel.find();
    res.send(food);
  })
);

router.get(
  '/search/:searchTerm',
  asyncHandler(async (req, res) => {
    const searchRegex = new RegExp(req.params.searchTerm, 'i');
    const food = await FoodModel.find({ name: { $regex: searchRegex } });
    res.send(food);
  })
);

router.get(
  '/tags',
  asyncHandler(async (req, res) => {
    const tags = await FoodModel.aggregate([
      {
        $unwind: '$tags',
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: '$count',
        },
      },
    ]).sort({ count: -1 });

    const all = {
      name: 'All',
      count: await FoodModel.countDocuments(),
    };

    tags.unshift(all);
    res.send(tags);
  })
);

router.get(
  '/tag/:tagName',
  asyncHandler(async (req, res) => {
    const foods = await FoodModel.find({ tags: req.params.tagName });
    res.send(foods);
  })
);

router.get(
  '/:foodId',
  asyncHandler(async (req, res) => {
    const food = await FoodModel.findById(req.params.foodId);
    res.send(food);
  })
);

// PATCH endpoint to toggle the favorite status
router.patch('/:id/favorite/:foodId', (req, res) => {
  // const { foodId } = req.params.id;
  const { favorite } = req.body; // Expect `favorite` in the request body

  // if ( !foodId) {
  //   return res.status(400).send('Invalid request parameters.');
  // }

  // console.log(`Updating favorite status for user food ${foodId}`);
  
  // Example response
  res.status(200).send('Favorite status updated successfully.');
});


export default router;