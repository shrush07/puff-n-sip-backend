"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModel = exports.OrderItemSchema = void 0;
const mongoose_1 = require("mongoose");
const order_status_1 = require("../constants/order_status");
exports.OrderItemSchema = new mongoose_1.Schema({
    food: {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        imageUrl: { type: String, required: true }
    },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
});
const orderSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: false },
    name: { type: String },
    address: { type: String },
    imageUrl: { type: String, required: true },
    paymentId: { type: String },
    paymentMethod: { type: String },
    totalPrice: { type: Number, required: true },
    items: [exports.OrderItemSchema],
    status: { type: String, default: order_status_1.OrderStatus.NEW },
    orderType: {
        type: String,
        enum: ["online", "instore"],
        required: true
    },
    clientSecret: { type: String, required: false }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
exports.OrderModel = (0, mongoose_1.model)("order", orderSchema);
