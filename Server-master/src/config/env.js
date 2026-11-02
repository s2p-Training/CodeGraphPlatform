module.exports = {
  PORT: process.env.PORT || 5001,
  // MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/proquizmaster',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/proquizmaster',
  JWT_SECRET: process.env.JWT_SECRET || 'change_this_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '127828047574-ke1mb05rc6sjqusondg2jca1l513jpkc.apps.googleusercontent.com'
};
