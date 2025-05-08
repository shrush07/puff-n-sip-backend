import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configs/db.config';

interface FoodAttributes {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  tags?: string[]; 
  favorite?: boolean;
  createdAt?: Date;
}

interface FoodCreationAttributes extends Optional<FoodAttributes, 'id' | 'favorite' | 'createdAt'> {}

export class FoodModel extends Model<FoodAttributes, FoodCreationAttributes> implements FoodAttributes {
  public id!: number;
  public name!: string;
  public price!: number;
  public imageUrl?: string;
  public tags?: string[];
  public favorite?: boolean;
  public createdAt?: Date;
}

FoodModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    imageUrl: { type: DataTypes.STRING },
    tags: { type: DataTypes.JSON },
    favorite: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    tableName: 'foods',
    modelName: 'Food',
    timestamps: true,
  }
);
