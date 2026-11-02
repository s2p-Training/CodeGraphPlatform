require('dotenv').config();
const { connectDB } = require('./src/config/database');
const { PORT } = require('./src/config/env');
const app = require('./src/app');
const { seedAdmin } = require('./src/seeds/seedAdmin');
const { seedUsers } = require('./src/seeds/seedUsers');

const port = PORT || 5001;

connectDB().then(async () => {
  await seedAdmin();
  await seedUsers();
  app.listen(port, () => {
    console.log(`ProQuizMaster API running on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});
