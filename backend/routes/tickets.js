const express = require('express');
const { body, validationResult } = require('express-validator');
const RecruitmentTicket = require('../models/RecruitmentTicket');
const User = require('../models/User');
const { authenticate, requireAdmin, requireCoLeader } = require('../middleware/auth');

const router = express.Router();

// Get user's tickets
router.get('/my-tickets', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const tickets = await RecruitmentTicket.find({
      createdBy: req.user._id,
      isActive: true
    })
      .populate('createdBy', 'username role badges profilePicture level')
      .populate('assignedTo', 'username role badges profilePicture level')
      .populate('messages.author', 'username role badges profilePicture level')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await RecruitmentTicket.countDocuments({
      createdBy: req.user._id,
      isActive: true
    });

    res.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all tickets (Admin and Co-Leader only)
router.get('/', authenticate, requireCoLeader, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const priority = req.query.priority;

    const filter = { isActive: true };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tickets = await RecruitmentTicket.find(filter)
      .populate('createdBy', 'username role badges profilePicture level')
      .populate('assignedTo', 'username role badges profilePicture level')
      .populate('messages.author', 'username role badges profilePicture level')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await RecruitmentTicket.countDocuments(filter);

    res.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single ticket by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const ticket = await RecruitmentTicket.findById(req.params.id)
      .populate('createdBy', 'username role badges profilePicture level')
      .populate('assignedTo', 'username role badges profilePicture level')
      .populate('messages.author', 'username role badges profilePicture level');

    if (!ticket || !ticket.isActive) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user has access to this ticket
    const isAdmin = req.user.role === 'Admin' || req.user.role === 'Co-Leader' || req.user.role === 'Leader';
    const isOwner = ticket.createdBy._id.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ ticket });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new ticket
router.post('/', authenticate, [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Content must be between 1 and 2000 characters'),
  body('category').optional().isIn(['general', 'recruitment', 'support', 'report']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, priority } = req.body;

    const ticket = new RecruitmentTicket({
      title,
      createdBy: req.user._id,
      category: category || 'recruitment',
      priority: priority || 'medium',
      messages: [{
        content,
        author: req.user._id
      }]
    });

    await ticket.save();

    // Add XP to user for creating ticket
    const user = await User.findById(req.user._id);
    user.addXP(15); // 15 XP for creating ticket
    await user.save();

    // Populate ticket data
    await ticket.populate('createdBy', 'username role badges profilePicture level');
    await ticket.populate('messages.author', 'username role badges profilePicture level');

    // Emit notification to admins
    const io = req.app.get('io');
    io.emit('new-ticket', {
      id: ticket._id,
      title: ticket.title,
      createdBy: ticket.createdBy,
      priority: ticket.priority,
      category: ticket.category,
      createdAt: ticket.createdAt
    });

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add message to ticket
router.post('/:id/messages', authenticate, [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Content must be between 1 and 2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;

    const ticket = await RecruitmentTicket.findById(req.params.id);
    if (!ticket || !ticket.isActive) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user has access to this ticket
    const isAdmin = req.user.role === 'Admin' || req.user.role === 'Co-Leader' || req.user.role === 'Leader';
    const isOwner = ticket.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if ticket is closed
    if (ticket.status === 'closed') {
      return res.status(403).json({ message: 'Ticket is closed' });
    }

    await ticket.addMessage(content, req.user._id);

    // Add XP for message (less than creating ticket)
    const user = await User.findById(req.user._id);
    user.addXP(2); // 2 XP for ticket message
    await user.save();

    // Get updated ticket with populated data
    const updatedTicket = await RecruitmentTicket.findById(req.params.id)
      .populate('createdBy', 'username role badges profilePicture level')
      .populate('assignedTo', 'username role badges profilePicture level')
      .populate('messages.author', 'username role badges profilePicture level');

    // Emit message to ticket room
    const io = req.app.get('io');
    io.to(`ticket-${req.params.id}`).emit('ticket-message', {
      ticketId: req.params.id,
      message: updatedTicket.messages[updatedTicket.messages.length - 1]
    });

    res.json({
      message: 'Message added successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Add ticket message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update ticket status (Admin and Co-Leader only)
router.put('/:id/status', authenticate, requireCoLeader, [
  body('status').isIn(['open', 'in-progress', 'closed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    const ticket = await RecruitmentTicket.findById(req.params.id);
    if (!ticket || !ticket.isActive) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = status;

    if (status === 'closed') {
      await ticket.closeTicket(req.user._id);
    } else {
      await ticket.save();
    }

    // Get updated ticket
    const updatedTicket = await RecruitmentTicket.findById(req.params.id)
      .populate('createdBy', 'username role badges profilePicture level')
      .populate('assignedTo', 'username role badges profilePicture level')
      .populate('messages.author', 'username role badges profilePicture level');

    // Emit status update
    const io = req.app.get('io');
    io.to(`ticket-${req.params.id}`).emit('ticket-status-update', {
      ticketId: req.params.id,
      status,
      closedAt: ticket.closedAt,
      closedBy: ticket.closedBy
    });

    res.json({
      message: 'Ticket status updated successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign ticket to user (Admin and Co-Leader only)
router.put('/:id/assign', authenticate, requireCoLeader, [
  body('assignedTo').optional().isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assignedTo } = req.body;

    const ticket = await RecruitmentTicket.findById(req.params.id);
    if (!ticket || !ticket.isActive) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // If assignedTo is provided, check if user exists
    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (!user || !user.isActive) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
    }

    ticket.assignedTo = assignedTo || null;
    await ticket.save();

    // Get updated ticket
    const updatedTicket = await RecruitmentTicket.findById(req.params.id)
      .populate('createdBy', 'username role badges profilePicture level')
      .populate('assignedTo', 'username role badges profilePicture level')
      .populate('messages.author', 'username role badges profilePicture level');

    // Emit assignment update
    const io = req.app.get('io');
    io.to(`ticket-${req.params.id}`).emit('ticket-assignment-update', {
      ticketId: req.params.id,
      assignedTo: updatedTicket.assignedTo
    });

    res.json({
      message: 'Ticket assigned successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete ticket (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const ticket = await RecruitmentTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.isActive = false;
    await ticket.save();

    // Emit deletion notification
    const io = req.app.get('io');
    io.to(`ticket-${req.params.id}`).emit('ticket-deleted', {
      ticketId: req.params.id
    });

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
