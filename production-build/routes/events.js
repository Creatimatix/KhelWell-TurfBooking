const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Event = require('../models/Event');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all events (public)
// @route   GET /api/events
// @access  Public
router.get('/', optionalAuth, [
  query('status').optional().isIn(['upcoming', 'ongoing', 'completed']),
  query('sportType').optional().isIn(['football', 'cricket', 'tennis', 'basketball', 'badminton', 'volleyball', 'multi-sport', 'general']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, sportType, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    if (status) {
      query.status = status;
    }

    if (sportType) {
      query.sportType = sportType;
    }

    const skip = (page - 1) * limit;

    const { Op } = require('sequelize');
    
    const whereClause = { is_active: true };

    if (status) {
      whereClause.status = status;
    }

    if (sportType) {
      whereClause.sport_type = sportType;
    }

    const events = await Event.findAll({
      where: whereClause,
      include: [
        {
          model: require('../models/User'),
          as: 'createdBy',
          attributes: ['name']
        }
      ],
      order: [['start_date', 'ASC'], ['created_at', 'DESC']],
      limit: Number(limit),
      offset: Number(skip)
    });

    const total = await Event.count({ where: whereClause });

    res.json({
      events,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Public
router.get('/upcoming', optionalAuth, [
  query('limit').optional().isInt({ min: 1, max: 20 })
], async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const { Op } = require('sequelize');
    
    const events = await Event.findAll({
      where: {
        is_active: true,
        start_date: { [Op.gt]: new Date().toISOString().split('T')[0] },
        status: 'upcoming'
      },
      include: [
        {
          model: require('../models/User'),
          as: 'createdBy',
          attributes: ['name']
        }
      ],
      order: [['start_date', 'ASC']],
      limit: Number(limit)
    });

    res.json(events);
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get ongoing events
// @route   GET /api/events/ongoing
// @access  Public
router.get('/ongoing', optionalAuth, [
  query('limit').optional().isInt({ min: 1, max: 20 })
], async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const { Op } = require('sequelize');
    const now = new Date().toISOString().split('T')[0];
    
    const events = await Event.findAll({
      where: {
        is_active: true,
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
        status: 'ongoing'
      },
      include: [
        {
          model: require('../models/User'),
          as: 'createdBy',
          attributes: ['name']
        }
      ],
      order: [['start_date', 'ASC']],
      limit: Number(limit)
    });

    res.json(events);
  } catch (error) {
    console.error('Get ongoing events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: require('../models/User'),
          as: 'createdBy',
          attributes: ['name', 'email']
        }
      ]
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.isActive) {
      return res.status(404).json({ message: 'Event not available' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('type').isIn(['tournament', 'championship', 'league', 'exhibition', 'training', 'other']).withMessage('Valid event type is required'),
  body('sportType').optional().isIn(['football', 'cricket', 'tennis', 'basketball', 'badminton', 'volleyball', 'multi-sport', 'general']),
  body('entryFee').optional().isNumeric().withMessage('Entry fee must be a number'),
  body('maxParticipants').optional().isInt({ min: 1 }).withMessage('Max participants must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      sportType = 'general',
      type,
      entryFee = 0,
      maxParticipants,
      prizes,
      rules,
      contactInfo,
      image
    } = req.body;

    // Check if end date is after start date
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Check if start date is in the future
    if (new Date(startDate) <= new Date()) {
      return res.status(400).json({ message: 'Start date must be in the future' });
    }

    const eventData = {
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      location,
      sport_type: sportType,
      type,
      entry_fee: entryFee,
      max_participants: maxParticipants,
      prizes: prizes || [],
      rules: rules || [],
      contact_info: contactInfo,
      image,
      created_by: req.user.id
    };

    const event = await Event.create(eventData);
    const eventWithUser = await Event.findByPk(event.id, {
      include: [
        {
          model: require('../models/User'),
          as: 'createdBy',
          attributes: ['name', 'email']
        }
      ]
    });

    res.status(201).json(eventWithUser);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event has already started
    if (new Date() >= new Date(event.start_date)) {
      return res.status(400).json({ message: 'Cannot update event that has already started' });
    }

    await event.update(req.body);
    
    const updatedEvent = await Event.findByPk(req.params.id, {
      include: [
        {
          model: require('../models/User'),
          as: 'createdBy',
          attributes: ['name', 'email']
        }
      ]
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event has already started
    if (new Date() >= new Date(event.start_date)) {
      return res.status(400).json({ message: 'Cannot delete event that has already started' });
    }

    await event.destroy();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update event status (for admin)
// @route   PUT /api/events/:id/status
// @access  Private (Admin only)
router.put('/:id/status', protect, authorize('admin'), [
  body('status').isIn(['upcoming', 'ongoing', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.update({ status: req.body.status });

    res.json({ message: 'Event status updated successfully', event });
  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 