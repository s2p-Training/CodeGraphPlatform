const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    ipAddress: { type: String },
    deviceOS: { type: String },
    deviceType: { type: String, default: 'Desktop' },
    loginType: { type: String, default: 'Email' },
    location: { type: String, default: 'Unknown' },
    coordinates: { type: String, default: '0, 0' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoginLog', loginLogSchema);
