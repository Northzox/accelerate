const express = require('express');
const { body, validationResult } = require('express-validator');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get chat messages with pagination
router.get('/messages', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({ isActive: true })
      .populate('author', 'username role badges profilePicture level')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ChatMessage.countDocuments({ isActive: true });

    // Reverse to show oldest first
    const reversedMessages = messages.reverse();

    res.json({
      messages: reversedMessages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send chat message
router.post('/messages', authenticate, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;

    const message = new ChatMessage({
      content,
      author: req.user._id,
      type: 'message'
    });

    await message.save();

    // Add XP to user for sending message (1 XP per message, max 50 per day)
    const user = await User.findById(req.user._id);
    const today = new Date().toDateString();
    const lastMessageDate = user.lastSeen?.toDateString();
    
    if (lastMessageDate !== today) {
      user.dailyMessageCount = 0;
    }
    
    if ((user.dailyMessageCount || 0) < 50) {
      user.addXP(1);
      user.dailyMessageCount = (user.dailyMessageCount || 0) + 1;
    }
    
    user.lastSeen = new Date();
    await user.save();

    // Populate message data
    await message.populate('author', 'username role badges profilePicture level');

    // Emit to all connected clients
    const io = req.app.get('io');
    io.to('global-chat').emit('chat-message', {
      id: message._id,
      content: message.content,
      author: message.author,
      type: message.type,
      createdAt: message.createdAt
    });

    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message (Admin only)
router.delete('/messages/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const message = await ChatMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.isActive = false;
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear all messages (Admin only)
router.delete('/messages', authenticate, requireAdmin, async (req, res) => {
  try {
    await ChatMessage.updateMany({}, { isActive: false });

    // Emit clear event to all clients
    const io = req.app.get('io');
    io.to('global-chat').emit('chat-cleared');

    res.json({ message: 'All messages cleared successfully' });
  } catch (error) {
    console.error('Clear messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get online users count
router.get('/online-users', authenticate, async (req, res) => {
  try {
    const io = req.app.get('io');
    const sockets = await io.fetchSockets();
    const onlineUserIds = [...new Set(sockets.map(socket => socket.userId).filter(id => id))];
    
    const onlineUsers = await User.find({
      _id: { $in: onlineUserIds },
      isActive: true
    }).select('username role badges profilePicture level');

    res.json({
      count: onlineUsers.length,
      users: onlineUsers
    });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
