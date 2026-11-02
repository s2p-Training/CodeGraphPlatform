const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: 'pranay@s2pedutech.com' });
    if (existingAdmin) {
      return;
    }

    const hashedPassword = await bcrypt.hash('phoenix@600', 12);
    const admin = await User.create({
      name: 'pranay',
      email: 'pranay@s2pedutech.com',
      password: hashedPassword,
      role: 'admin',
    });

    console.log(admin);

    return admin;
  } catch (error) {
    console.error('Failed to seed admin user:', error.message);
  }
};

module.exports = { seedAdmin };
