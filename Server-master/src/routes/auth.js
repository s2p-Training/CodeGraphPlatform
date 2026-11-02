const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/authService');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

const getLogDetails = (req, loginType = 'Email') => {
  const ua = new UAParser(req.headers['user-agent']);
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const geo = geoip.lookup(ip);
  
  // Custom device categorization for icons
  const os = ua.getOS().name;
  const uaType = ua.getDevice().type;
  const rawUA = req.headers['user-agent'] || '';
  
  let deviceType = 'Desktop';
  if (uaType === 'mobile' || uaType === 'tablet' || /iPhone|Android|iPad/i.test(rawUA)) {
    if (/iPhone/i.test(rawUA) || os === 'iOS') {
      deviceType = uaType === 'tablet' || /iPad/i.test(rawUA) ? 'iPad' : 'iPhone';
    } else if (/Android/i.test(rawUA)) {
      deviceType = uaType === 'tablet' ? 'Android Tablet' : 'Android Phone';
    } else {
      deviceType = 'Mobile Device';
    }
  } else if (os === 'Mac OS') {
    deviceType = 'Mac';
  } else if (os === 'Windows') {
    deviceType = 'Windows PC';
  }

  return {
    ipAddress: ip,
    deviceOS: ua.getOS().name || 'Unknown',
    deviceType: deviceType,
    loginType,
    location: geo ? `${geo.city}, ${geo.country}` : 'Nagpur, IN',
    coordinates: geo ? `${geo.ll[1].toFixed(5)}, ${geo.ll[0].toFixed(5)}` : '79.08491, 21.14631'
  };
};

// POST /api/auth/register
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'name, email, and password are required' });
    }
    const result = await authService.register(name, email, password);
    res.status(201).json(result);
  })
);

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'email and password are required' });
    }
    const result = await authService.login(email, password);
    await authService.createLoginLog(result.user, getLogDetails(req, 'Email'));
    res.json(result);
  })
);

// POST /api/auth/google
router.post(
  '/google',
  asyncHandler(async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Google ID token is required' });
    }
    const result = await authService.googleLogin(idToken);
    await authService.createLoginLog(result.user, getLogDetails(req, 'Google'));
    res.json(result);
  })
);

// GET /api/auth/profile
router.get(
  '/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate('batchId', 'name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // We use a custom response here to match the formatUser expectation
    res.json({
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
      profilePicture: user.profilePicture,
      dob: user.dob,
      avatarUrl: user.avatarUrl,
      username: user.username,
      profileUrl: user.profileUrl
    });
  })
);

// PATCH /api/auth/profile
router.patch(
  '/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    // Prevent non-admins from updating sensitive fields
    const updates = { ...req.body };
    if (req.user.role !== 'admin') {
      delete updates.role;
      delete updates.membershipType;
      delete updates.trialDurationDays;
      delete updates.batchId;
      delete updates.isBanned;
      delete updates.violationCount;
      delete updates.createdAt;
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).populate('batchId', 'name');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  })
);

module.exports = router;
