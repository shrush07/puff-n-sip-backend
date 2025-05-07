import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../configs/db';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  address: string;
  isAdmin: boolean;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'name' | 'address' | 'isAdmin' | 'resetPasswordToken' | 'resetPasswordExpires'> {}

export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public address!: string;
  public isAdmin!: boolean;
  public resetPasswordToken!: string | null;
  public resetPasswordExpires!: Date | null;
}

UserModel.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: DataTypes.STRING,
  address: DataTypes.STRING,
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  resetPasswordToken: DataTypes.STRING,
  resetPasswordExpires: DataTypes.DATE
}, {
  sequelize,
  modelName: 'User',
  timestamps: true,
});
