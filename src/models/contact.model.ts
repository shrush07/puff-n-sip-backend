import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/db';

export const Contact = sequelize.define('Contact', {
  username: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: false },
  contact: { type: DataTypes.STRING, allowNull: false },
  ratings: { type: DataTypes.FLOAT, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
});
