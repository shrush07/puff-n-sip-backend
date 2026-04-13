"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartSchema = exports.CartModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const CartItemSchema = new Schema({
    food: {
        _id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Food' },
        name: { type: String, required: true },
        price: { type: Number, required: true }
    },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true }
});
const CartSchema = new Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [CartItemSchema],
    totalPrice: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});
exports.CartSchema = CartSchema;
const CartModel = mongoose_1.default.model('Cart', CartSchema);
exports.CartModel = CartModel;
