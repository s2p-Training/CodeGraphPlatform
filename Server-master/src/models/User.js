const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['admin', 'student'], default: 'student' },
    membershipType: { type: String, enum: ['enquiry', 'premium'], default: 'enquiry' },
    trialDurationDays: { type: Number, default: 10 },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: null },
    violationCount: { type: Number, default: 0 },
    currentSessionId: { type: String, default: null },
    
    // Profile Details
    username: { type: String, trim: true },
    profileUrl: { type: String, trim: true },
    phone: { type: String, trim: true },
    dob: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    location: {
      city: { type: String, trim: true },
      pinCode: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true }
    },
    profilePicture: { type: String, default: null },
    
    education: {
      collegeName: { type: String, trim: true },
      branch: { type: String, trim: true },
      graduationYear: { type: String, trim: true }
    },

    socialLinks: {
      github: { type: String, trim: true, default: '' },
      twitter: { type: String, trim: true, default: '' },
      linkedin: { type: String, trim: true, default: '' },
      others: { type: String, trim: true, default: '' },
      resume: { type: String, trim: true, default: '' }
    },

    bio: { type: String, trim: true, default: '' },
    
    skills: {
      languages: [{ type: String, trim: true }],
      frameworks: [{ type: String, trim: true }],
      databases: [{ type: String, trim: true }],
      tools: [{ type: String, trim: true }]
    },

    codingProfiles: {
      leetcode: { type: String, trim: true, default: '' },
      hackerrank: { type: String, trim: true, default: '' },
      codeforces: { type: String, trim: true, default: '' },
      geeksforgeeks: { type: String, trim: true, default: '' },
      others: { type: String, trim: true, default: '' }
    },

    workExperience: [
      {
        company: { type: String, trim: true },
        mode: { type: String, trim: true }, // e.g., 'Remote', 'Office', 'Hybrid'
        role: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date },
        isOngoing: { type: Boolean, default: false },
        description: { type: String, trim: true }
      }
    ],

    projects: [
      {
        title: { type: String, trim: true },
        role: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date },
        isOngoing: { type: Boolean, default: false },
        highlights: { type: String, trim: true }
      }
    ],

    batchId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Batch',
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
