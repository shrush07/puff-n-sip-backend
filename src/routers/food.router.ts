import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { FoodModel } from '../models/food.model';
import { Op } from 'sequelize';
import { sample_foods } from '../data';

const router = Router();

// SEED ROUTE
router.get('/seed', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const foodsCount = await FoodModel.count();
  if (foodsCount > 0) {
    res.send('Seed is already done!');
    return;
  }

  await FoodModel.bulkCreate(sample_foods);
  res.send('Seed Is Done!');
}));

// GET ALL FOODS
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const foods = await FoodModel.findAll();
  res.send(foods);
}));

// SEARCH FOODS
router.get('/search/:searchTerm', asyncHandler(async (req: Request, res: Response) => {
  const searchTerm = req.params.searchTerm;
  const foods = await FoodModel.findAll({
    where: {
      name: {
        [Op.substring]: searchTerm,
      },
    },
  });
  res.send(foods);
}));

// GET FOODS BY TAG (Manual filter for JSON array)
router.get('/tag/:tagName', asyncHandler(async (req: Request, res: Response) => {
  const tagName = req.params.tagName;
  const foods = await FoodModel.findAll();
  const filtered = foods.filter(food => (food.tags || []).includes(tagName));
  res.send(filtered);
}));

// GET TAGS SUMMARY
router.get('/tags', asyncHandler(async (req: Request, res: Response) => {
  const foods = await FoodModel.findAll();
  const tagMap: Record<string, number> = {};

  for (const food of foods) {
    const tags = food.tags || [];
    tags.forEach((tag: string) => {
      tagMap[tag] = (tagMap[tag] || 0) + 1;
    });
  }

  const tagsArray = Object.entries(tagMap).map(([name, count]) => ({
    name,
    count,
  }));

  const all = {
    name: 'All',
    count: await FoodModel.count(),
  };

  res.send([all, ...tagsArray.sort((a, b) => b.count - a.count)]);
}));

// GET FOOD BY ID
router.get('/:foodId', asyncHandler(async (req: Request, res: Response) => {
  const food = await FoodModel.findByPk(req.params.foodId);
  res.send(food);
}));

// TOGGLE FAVORITE
router.patch('/:id/favorite', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const foodId = req.params.id;
  const { favorite } = req.body;

  await FoodModel.update({ favorite }, { where: { id: foodId } });
  const updatedFood = await FoodModel.findByPk(foodId);

  if (!updatedFood) {
    res.send('Food not found');
    return;
  }

  res.send(updatedFood);
}));

export default router;
