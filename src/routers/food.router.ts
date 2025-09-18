import { Router } from 'express';
import { sample_foods, sample_tags } from '../data';
import asyncHandler from 'express-async-handler';
import { FoodModel } from '../models/food.model';
const router = Router();

// router.get(
//   '/seed',
//   asyncHandler(async (req, res) => {
//     const foodsCount = await FoodModel.countDocuments();
//     if (foodsCount > 0) {
//       res.send('Seed is already done!');
//       return;
//     }

//     await FoodModel.create(sample_foods);
//     res.send('Seed Is Done!');
//   })
// );


router.get(
  '/seed',
  asyncHandler(async (req, res) => {
    await FoodModel.deleteMany({}); // clear old data
    await FoodModel.create(sample_foods); // insert new data
    res.send('✅ Database reseeded with fresh data!');
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

router.patch('/:id/favorite', asyncHandler(async (req:any, res:any) => {
  
  console.log('PATCH /api/foods/:id/favorite hit');
  const foodId = req.params.id;
  const { favorite } = req.body;

  const updatedFood = await FoodModel.findByIdAndUpdate(
    foodId,
    { favorite },
    { new: true }
  );

  if (!updatedFood) {
    return res.status(404).send('Food not found');
  }


  res.send(updatedFood);
}));




export default router;