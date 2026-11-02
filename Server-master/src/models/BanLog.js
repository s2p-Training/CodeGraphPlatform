const mongoose = require('mongoose');

const banLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    reason: { type: String, required: true },
    action: { type: String, enum: ['ban', 'unban'], required: true },
    performedBy: { type: String, default: 'SYSTEM' }, // For SYSTEM bans (detect tab switch) or 'ADMIN'
  },
  { timestamps: true }
);

module.exports = mongoose.model('BanLog', banLogSchema);
