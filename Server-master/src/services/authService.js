const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
const { OAuth2Client } = require('google-auth-library');
const { JWT_SECRET, JWT_EXPIRES_IN, GOOGLE_CLIENT_ID } = require('../config/env');
const BanLog = require('../models/BanLog');

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (user, sessionId) =>
  jwt.sign({ id: user._id, role: user.role, sid: sessionId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  membershipType: user.membershipType || 'enquiry',
  trialDurationDays: user.trialDurationDays || 10,
  batchId: user.batchId,
  isBanned: user.isBanned,
  banReason: user.banReason,
  violationCount: user.violationCount || 0,
  createdAt: user.createdAt,
  phone: user.phone,
  location: user.location,
  education: user.education,
  socialLinks: user.socialLinks,
  codingProfiles: user.codingProfiles,
  workExperience: user.workExperience,
  projects: user.projects,
  bio: user.bio,
  skills: user.skills || { languages: [], frameworks: [], databases: [], tools: [] },
  profilePicture: user.profilePicture
});

const register = async (name, email, password) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already in use');
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 12);
  const sessionId = Math.random().toString(36).substring(7) + Date.now().toString(36);
  let user = await User.create({ name, email, password: hashed, role: 'student', currentSessionId: sessionId });
  user = await user.populate('batchId', 'name');
  const token = generateToken(user, sessionId);
  return { user: formatUser(user), token };
};

const login = async (email, password) => {
  const user = await User.findOne({ email }).populate('batchId', 'name');
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  if (user.isBanned) {
    const err = new Error(`Your account is banned. Reason: ${user.banReason || 'Academic Integrity Violation'}`);
    err.status = 403;
    throw err;
  }

  const sessionId = Math.random().toString(36).substring(7) + Date.now().toString(36);
  user.currentSessionId = sessionId;
  await user.save();

  const token = generateToken(user, sessionId);
  return { user: formatUser(user), token };
};

const googleLogin = async (idToken) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const { name, email } = ticket.getPayload();

  let user = await User.findOne({ email }).populate('batchId', 'name');
  if (user && user.isBanned) {
    const err = new Error(`Your account is banned. Reason: ${user.banReason || 'Academic Integrity Violation'}`);
    err.status = 403;
    throw err;
  }
  const sessionId = Math.random().toString(36).substring(7) + Date.now().toString(36);
  if (!user) {
    user = await User.create({
      name,
      email,
      password: await bcrypt.hash(Math.random().toString(36), 12),
      role: 'student',
      currentSessionId: sessionId
    });
    user = await user.populate('batchId', 'name');
  } else {
    user.currentSessionId = sessionId;
    await user.save();
  }

  const token = generateToken(user, sessionId);
  return { user: formatUser(user), token };
};

const createLoginLog = async (user, logDetails) => {
  await LoginLog.create({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    ipAddress: logDetails.ipAddress,
    deviceOS: logDetails.deviceOS,
    deviceType: logDetails.deviceType,
    loginType: logDetails.loginType,
    location: logDetails.location || "Unknown",
    coordinates: logDetails.coordinates || "0, 0"
  });
};

const logViolation = async (userId, reason, performedBy = 'SYSTEM') => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  user.violationCount = (user.violationCount || 0) + 1;
  await user.save();

  await BanLog.create({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    reason: reason,
    action: 'warning',
    performedBy: performedBy
  });

  return formatUser(user);
};

const banUser = async (userId, reason, performedBy = 'SYSTEM') => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  user.isBanned = true;
  user.banReason = reason;
  user.violationCount = 4; // Force count to 4
  user.currentSessionId = null; // Kick out
  await user.save();

  await BanLog.create({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    reason: reason,
    action: 'ban',
    performedBy: performedBy
  });

  return formatUser(user);
};

const unbanUser = async (userId, performedBy = 'ADMIN') => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  user.isBanned = false;
  user.banReason = null;
  user.violationCount = 0; // Reset count
  await user.save();

  // Permanently delete all ban/warning logs for this user to keep a clean slate
  await BanLog.deleteMany({ userId });

  return formatUser(user);
};

module.exports = { register, login, googleLogin, createLoginLog, banUser, unbanUser, logViolation };
