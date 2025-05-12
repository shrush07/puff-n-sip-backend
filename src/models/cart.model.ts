import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
    food: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
        name: { type: String, required: true },
        price: { type: Number, required: true }
    },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true }
});

const CartSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [CartItemSchema],
    totalPrice: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

const CartModel = mongoose.model('Cart', CartSchema);

export { CartModel, CartSchema };
