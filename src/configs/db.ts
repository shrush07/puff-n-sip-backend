import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize('Puff_Sip', 'Puff_Sip', 'Puff_Sip', {
  host: 'localhost',
  dialect: 'mysql',
});
