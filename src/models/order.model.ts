import { model, Schema, Types } from "mongoose";
import { OrderStatus } from "../constants/order_status";
import { Food, FoodSchema } from "./food.model";

export interface OrderItem {
  food: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
  price: number;
  quantity: number;
}

export const OrderItemSchema = new Schema<OrderItem>({
  food: {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true } 
  },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

export interface Order {
  items: OrderItem[];
  totalPrice: number;
  name: string;
  address: string;
  imageUrl: string; 
  paymentId?: string;
  status: OrderStatus;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  clientSecret: string;
  // isModified: boolean; 
}

const orderSchema = new Schema<Order>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    address: { type: String, required: true },
    imageUrl: { type: String, required: true }, 
    paymentId: { type: String },
    totalPrice: { type: Number, required: true },
    items: [OrderItemSchema],
    status: { type: String, default: OrderStatus.NEW },
    // isModified: { type: Boolean, default: false }, 
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

export const OrderModel = model("order", orderSchema);
