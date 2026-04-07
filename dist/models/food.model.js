"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodModel = exports.FoodSchema = void 0;
const mongoose_1 = require("mongoose");
exports.FoodSchema = new mongoose_1.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    tags: { type: [String] },
    favorite: { type: Boolean, default: false },
    imageUrl: { type: String, required: true },
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
    timestamps: true
});
exports.FoodModel = (0, mongoose_1.model)('food', exports.FoodSchema);
