const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const User = require('../models/User');

/**
 * Verify JWT from Authorization: Bearer <token> header.
 * Attaches decoded payload to req.user: { id, role }.
 */
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session is still valid
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.isBanned) {
      return res.status(403).json({ 
        message: `Your account is banned. Reason: ${user.banReason || 'Academic Integrity Violation'}`,
        code: 'USER_BANNED'
      });
    }

    if (decoded.sid && user.currentSessionId && decoded.sid !== user.currentSessionId) {
      return res.status(401).json({ 
        message: 'Account accessed from another device. Please login again.',
        code: 'SESSION_INVALID'
      });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/** Allow only admin role. Must be used after authenticate. */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
