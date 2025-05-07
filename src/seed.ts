import { sample_foods } from './data'; 
import { FoodModel } from './models/food.model';

const seedDatabase = async () => {
  try {
    // Sync the models to ensure the database schema is up-to-date
    await FoodModel.sync({ force: true }); 
    console.log('Food table synced.');

    // Bulk create the sample data in the database
    await FoodModel.bulkCreate(sample_foods, {
      ignoreDuplicates: true, 
    });
    console.log('Sample foods data seeded!');
  } catch (error) {
    console.error('Error seeding data: ', error);
  }
};

seedDatabase();
