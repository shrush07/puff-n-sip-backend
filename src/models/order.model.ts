import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../configs/db';
import { UserModel } from './user.model';

interface OrderAttributes {
  id?: number;
  name: string;
  address: string;
  imageUrl?: string;
  paymentId?: string;
  paymentMethod?: string;
  totalPrice: number;
  status?: string;
  orderType: 'online' | 'instore';
  clientSecret?: string;
  userId: number;
  items: object; // ✅ Add this
  createdAt?: Date;
  updatedAt?: Date;
}

export class OrderModel extends Model<OrderAttributes> implements OrderAttributes {
  public id!: number;
  public name!: string;
  public address!: string;
  public imageUrl?: string;
  public paymentId?: string;
  public paymentMethod?: string;
  public totalPrice!: number;
  public status!: string;
  public orderType!: 'online' | 'instore';
  public clientSecret?: string;
  public userId!: number;
  public items!: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderModel.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  imageUrl: { type: DataTypes.STRING },
  paymentId: { type: DataTypes.STRING },
  paymentMethod: { type: DataTypes.STRING },
  totalPrice: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'NEW' },
  orderType: {
    type: DataTypes.ENUM('online', 'instore'),
    allowNull: false
  },
  clientSecret: { type: DataTypes.STRING },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  items: { type: DataTypes.JSON, allowNull: false }, 
}, {
  sequelize,
  modelName: 'Order',
  timestamps: true,
});

OrderModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });
