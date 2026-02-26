const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate, requireAdmin, requireCoLeader } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get user profile by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('badges');

    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userResponse = {
      id: user._id,
      username: user.username,
      role: user.role,
      badges: user.badges,
      profilePicture: user.profilePicture,
      profileBanner: user.profileBanner,
      xp: user.xp,
      level: user.level,
      createdAt: user.createdAt,
      lastSeen: user.lastSeen
    };

    res.json({ user: userResponse });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticate, [
  body('username').optional().trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email } = req.body;
    const updateData = {};

    if (username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      updateData.username = username;
    }

    if (email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Email already taken' });
      }
      
      updateData.email = email;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      badges: user.badges,
      profilePicture: user.profilePicture,
      profileBanner: user.profileBanner,
      xp: user.xp,
      level: user.level,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile picture
router.post('/profile-picture', authenticate, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profilePictureUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: profilePictureUrl },
      { new: true }
    ).select('-password');

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      badges: user.badges,
      profilePicture: user.profilePicture,
      profileBanner: user.profileBanner,
      xp: user.xp,
      level: user.level,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Profile picture updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile banner
router.post('/profile-banner', authenticate, upload.single('profileBanner'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profileBannerUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileBanner: profileBannerUrl },
      { new: true }
    ).select('-password');

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      badges: user.badges,
      profilePicture: user.profilePicture,
      profileBanner: user.profileBanner,
      xp: user.xp,
      level: user.level,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Profile banner updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Upload profile banner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (Admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ isActive: true });

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign/remove badges (Co-Leader and above)
router.put('/:id/badges', authenticate, requireCoLeader, [
  body('badges').isArray().withMessage('Badges must be an array'),
  body('badges.*').isIn(['Official Member', 'Co-Leader', 'Leader', 'Admin']).withMessage('Invalid badge')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { badges } = req.body;
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only Admin can assign Admin badge
    if (badges.includes('Admin') && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admin can assign Admin badge' });
    }

    targetUser.badges = badges;
    await targetUser.save();

    res.json({
      message: 'Badges updated successfully',
      badges: targetUser.badges
    });
  } catch (error) {
    console.error('Update badges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add XP to user (Admin only)
router.post('/:id/xp', authenticate, requireAdmin, [
  body('amount').isInt({ min: 1 }).withMessage('XP amount must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = user.addXP(amount);
    await user.save();

    res.json({
      message: 'XP added successfully',
      xp: user.xp,
      level: user.level,
      levelUp: result.levelUp
    });
  } catch (error) {
    console.error('Add XP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
