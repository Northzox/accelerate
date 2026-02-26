const mongoose = require('mongoose');

const ticketMessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['general', 'recruitment', 'support', 'report'],
    default: 'recruitment'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messages: [ticketMessageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  closedAt: {
    type: Date
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Add message to ticket
ticketSchema.methods.addMessage = function(content, authorId) {
  this.messages.push({ content, author: authorId });
  return this.save();
};

// Close ticket
ticketSchema.methods.closeTicket = function(closedBy) {
  this.status = 'closed';
  this.closedAt = new Date();
  this.closedBy = closedBy;
  return this.save();
};

module.exports = mongoose.model('RecruitmentTicket', ticketSchema);
