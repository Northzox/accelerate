const express = require('express');
const { body, validationResult } = require('express-validator');
const ForumCategory = require('../models/ForumCategory');
const ForumThread = require('../models/ForumThread');
const ForumReply = require('../models/ForumReply');
const User = require('../models/User');
const { authenticate, requireAdmin, requireCoLeader } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await ForumCategory.find({ isActive: true })
      .sort({ order: 1, name: 1 });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category (Admin only)
router.post('/categories', authenticate, requireAdmin, [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must not exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, icon, color, order } = req.body;

    const category = new ForumCategory({
      name,
      description,
      icon: icon || '📁',
      color: color || '#3B82F6',
      order: order || 0
    });

    await category.save();
    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get threads by category
router.get('/categories/:categoryId/threads', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const threads = await ForumThread.find({ 
      category: req.params.categoryId,
      isActive: true 
    })
      .populate('author', 'username role badges profilePicture level')
      .populate('lastReplyBy', 'username')
      .populate('category', 'name color')
      .sort({ isPinned: -1, lastReplyAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ForumThread.countDocuments({ 
      category: req.params.categoryId,
      isActive: true 
    });

    res.json({
      threads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create thread
router.post('/threads', authenticate, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('content').trim().isLength({ min: 1, max: 10000 }).withMessage('Content must be between 1 and 10000 characters'),
  body('categoryId').isMongoId().withMessage('Invalid category ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, categoryId } = req.body;

    // Check if category exists
    const category = await ForumCategory.findById(categoryId);
    if (!category || !category.isActive) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const thread = new ForumThread({
      title,
      content,
      author: req.user._id,
      category: categoryId
    });

    await thread.save();

    // Add XP to user for creating thread
    const user = await User.findById(req.user._id);
    user.addXP(10); // 10 XP for creating thread
    await user.save();

    // Populate thread data
    await thread.populate('author', 'username role badges profilePicture level');
    await thread.populate('category', 'name color');

    res.status(201).json({
      message: 'Thread created successfully',
      thread
    });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get thread by ID with replies
router.get('/threads/:id', async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id)
      .populate('author', 'username role badges profilePicture level')
      .populate('category', 'name color')
      .populate('lastReplyBy', 'username');

    if (!thread || !thread.isActive) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    // Increment view count
    thread.views += 1;
    await thread.save();

    // Get replies
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const replies = await ForumReply.find({
      thread: req.params.id,
      isActive: true
    })
      .populate('author', 'username role badges profilePicture level')
      .populate('parentReply', 'author content')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const totalReplies = await ForumReply.countDocuments({
      thread: req.params.id,
      isActive: true
    });

    res.json({
      thread,
      replies,
      pagination: {
        page,
        limit,
        total: totalReplies,
        pages: Math.ceil(totalReplies / limit)
      }
    });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create reply
router.post('/threads/:id/replies', authenticate, [
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Content must be between 1 and 5000 characters'),
  body('parentReplyId').optional().isMongoId().withMessage('Invalid parent reply ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, parentReplyId } = req.body;

    // Check if thread exists and is not locked
    const thread = await ForumThread.findById(req.params.id);
    if (!thread || !thread.isActive) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    if (thread.isLocked) {
      return res.status(403).json({ message: 'Thread is locked' });
    }

    // Check if parent reply exists (if provided)
    if (parentReplyId) {
      const parentReply = await ForumReply.findById(parentReplyId);
      if (!parentReply || !parentReply.isActive) {
        return res.status(404).json({ message: 'Parent reply not found' });
      }
    }

    const reply = new ForumReply({
      content,
      author: req.user._id,
      thread: req.params.id,
      parentReply: parentReplyId || null
    });

    await reply.save();

    // Update thread reply info
    await thread.updateReplyInfo(req.user._id);

    // Add XP to user for creating reply
    const user = await User.findById(req.user._id);
    user.addXP(5); // 5 XP for creating reply
    await user.save();

    // Populate reply data
    await reply.populate('author', 'username role badges profilePicture level');
    if (reply.parentReply) {
      await reply.populate('parentReply', 'author content');
    }

    res.status(201).json({
      message: 'Reply created successfully',
      reply
    });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike reply
router.post('/replies/:id/like', authenticate, async (req, res) => {
  try {
    const reply = await ForumReply.findById(req.params.id);
    if (!reply || !reply.isActive) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const existingLike = reply.likes.find(like => 
      like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Remove like
      reply.likes = reply.likes.filter(like => 
        like.user.toString() !== req.user._id.toString()
      );
      await reply.updateLikeCount();
      
      res.json({
        message: 'Like removed',
        likeCount: reply.likeCount,
        liked: false
      });
    } else {
      // Add like
      await reply.addLike(req.user._id);
      
      res.json({
        message: 'Reply liked',
        likeCount: reply.likeCount,
        liked: true
      });
    }
  } catch (error) {
    console.error('Like reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pin/unpin thread (Co-Leader and above)
router.put('/threads/:id/pin', authenticate, requireCoLeader, async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id);
    if (!thread || !thread.isActive) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    thread.isPinned = !thread.isPinned;
    await thread.save();

    res.json({
      message: `Thread ${thread.isPinned ? 'pinned' : 'unpinned'} successfully`,
      isPinned: thread.isPinned
    });
  } catch (error) {
    console.error('Pin thread error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Lock/unlock thread (Co-Leader and above)
router.put('/threads/:id/lock', authenticate, requireCoLeader, async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id);
    if (!thread || !thread.isActive) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    thread.isLocked = !thread.isLocked;
    await thread.save();

    res.json({
      message: `Thread ${thread.isLocked ? 'locked' : 'unlocked'} successfully`,
      isLocked: thread.isLocked
    });
  } catch (error) {
    console.error('Lock thread error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete thread (Admin only)
router.delete('/threads/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    thread.isActive = false;
    await thread.save();

    // Also deactivate all replies
    await ForumReply.updateMany(
      { thread: req.params.id },
      { isActive: false }
    );

    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    console.error('Delete thread error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete reply (Admin only)
router.delete('/replies/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const reply = await ForumReply.findById(req.params.id);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    reply.isActive = false;
    await reply.save();

    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
