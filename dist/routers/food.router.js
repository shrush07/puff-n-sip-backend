"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_1 = require("../data");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const food_model_1 = require("../models/food.model");
const router = (0, express_1.Router)();
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
router.get('/seed', (0, express_async_handler_1.default)(async (req, res) => {
    await food_model_1.FoodModel.deleteMany({}); // clear old data
    await food_model_1.FoodModel.create(data_1.sample_foods); // insert new data
    res.send('✅ Database reseeded with fresh data!');
}));
router.get('/', (0, express_async_handler_1.default)(async (req, res) => {
    const food = await food_model_1.FoodModel.find();
    res.send(food);
}));
router.get('/search/:searchTerm', (0, express_async_handler_1.default)(async (req, res) => {
    const searchRegex = new RegExp(req.params.searchTerm, 'i');
    const food = await food_model_1.FoodModel.find({ name: { $regex: searchRegex } });
    res.send(food);
}));
router.get('/tags', (0, express_async_handler_1.default)(async (req, res) => {
    const tags = await food_model_1.FoodModel.aggregate([
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
        count: await food_model_1.FoodModel.countDocuments(),
    };
    tags.unshift(all);
    res.send(tags);
}));
router.get('/tag/:tagName', (0, express_async_handler_1.default)(async (req, res) => {
    const foods = await food_model_1.FoodModel.find({ tags: req.params.tagName });
    res.send(foods);
}));
router.get('/:foodId', (0, express_async_handler_1.default)(async (req, res) => {
    const food = await food_model_1.FoodModel.findById(req.params.foodId);
    res.send(food);
}));
router.patch('/:id/favorite', (0, express_async_handler_1.default)(async (req, res) => {
    console.log('PATCH /api/foods/:id/favorite hit');
    const foodId = req.params.id;
    const { favorite } = req.body;
    const updatedFood = await food_model_1.FoodModel.findByIdAndUpdate(foodId, { favorite }, { new: true });
    if (!updatedFood) {
        return res.status(404).send('Food not found');
    }
    res.send(updatedFood);
}));
exports.default = router;
