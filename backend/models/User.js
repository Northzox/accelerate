const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['User', 'Official Member', 'Co-Leader', 'Leader', 'Admin'],
    default: 'User'
  },
  badges: [{
    type: String,
    enum: ['Official Member', 'Co-Leader', 'Leader', 'Admin']
  }],
  profilePicture: {
    type: String,
    default: ''
  },
  profileBanner: {
    type: String,
    default: ''
  },
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Check password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate level based on XP
userSchema.methods.calculateLevel = function() {
  const xp = this.xp;
  let level = 1;
  
  if (xp >= 10000) level = 10;
  else if (xp >= 8000) level = 9;
  else if (xp >= 6400) level = 8;
  else if (xp >= 5000) level = 7;
  else if (xp >= 3800) level = 6;
  else if (xp >= 2800) level = 5;
  else if (xp >= 1900) level = 4;
  else if (xp >= 1100) level = 3;
  else if (xp >= 500) level = 2;
  
  this.level = level;
  return level;
};

// Add XP and level up
userSchema.methods.addXP = function(amount) {
  this.xp += amount;
  const oldLevel = this.level;
  this.calculateLevel();
  return { levelUp: this.level > oldLevel, newLevel: this.level };
};

// Auto-admin for specific email
userSchema.pre('save', function(next) {
  if (this.email === 'northlable69@gmail.com' && this.role !== 'Admin') {
    this.role = 'Admin';
    if (!this.badges.includes('Admin')) {
      this.badges.push('Admin');
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
