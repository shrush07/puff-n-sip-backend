import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../configs/db';

interface CartAttributes {
  id?: number;
  userId: number;
  items: any[];  // Define this type based on the structure of your items
  createdAt?: Date;
  updatedAt?: Date;
}

export class CartModel extends Model<CartAttributes> implements CartAttributes {
  public id!: number;
  public userId!: number;
  public items!: any[];  // Define this type more specifically if possible
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CartModel.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  items: { type: DataTypes.JSON, allowNull: false },  // Changed to MySQL-compatible JSON
}, {
  sequelize,
  modelName: 'Cart',
  timestamps: true,
});
