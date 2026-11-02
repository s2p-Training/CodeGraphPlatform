const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    const dummyUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'student',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'student',
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'student',
      },
    ];

    for (const userData of dummyUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        await User.create(userData);
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to seed users:', error.message);
  }
};

module.exports = { seedUsers };
