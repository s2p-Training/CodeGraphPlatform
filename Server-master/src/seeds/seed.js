require('dotenv').config();
const { connectDB } = require('../config/database');
const { seedAdmin } = require('./seedAdmin');
const { seedUsers } = require('./seedUsers');
const mongoose = require('mongoose');

const runSeeds = async () => {
  try {
    await connectDB();
    console.log('Connected to Database...');

    console.log('Seeding admin...');
    await seedAdmin();
    
    console.log('Seeding users...');
    await seedUsers();

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

runSeeds();
