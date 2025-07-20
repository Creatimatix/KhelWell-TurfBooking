const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const Turf = require('../models/Turf');
const User = require('../models/User');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get nearby turfs for user dashboard
// @route   GET /api/turfs/nearby
// @access  Private (User only)
router.get('/nearby', protect, authorize('user'), async (req, res) => {
  try {
    // Get user's location from profile or use default city
    const user = await User.findByPk(req.user.id);
    const userCity = user.address_city || 'Mumbai'; // Default to Mumbai if no city set

    // Get turfs in user's city or nearby
    const turfs = await Turf.findAll({
      where: {
        is_active: true,
        is_verified: true,
        location_city: { [Op.like]: `%${userCity}%` }
      },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name']
      }],
      order: [['rating_average', 'DESC'], ['created_at', 'DESC']],
      limit: 6
    });

    const turfsData = turfs.map(turf => turf.toJSON());

    res.json({ turfs: turfsData });
  } catch (error) {
    console.error('Get nearby turfs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all turfs (public search)
// @route   GET /api/turfs
// @access  Public
router.get('/', optionalAuth, [
  query('city').optional().trim(),
  query('sportType').optional().isIn(['football', 'cricket', 'tennis', 'basketball', 'badminton', 'volleyball', 'multi-sport']),
  query('date').optional().isISO8601(),
  query('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  query('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  query('minPrice').optional().isNumeric(),
  query('maxPrice').optional().isNumeric(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      city,
      sportType,
      date,
      startTime,
      endTime,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10
    } = req.query;

    // Build search query
    const whereClause = { 
      is_active: true, 
      is_verified: true 
    };

    if (city) {
      whereClause.location_city = { [sequelize.Op.like]: `%${city}%` };
    }

    if (sportType) {
      whereClause.sport_type = sportType;
    }

    if (minPrice || maxPrice) {
      whereClause.pricing_hourly_rate = {};
      if (minPrice) whereClause.pricing_hourly_rate[sequelize.Op.gte] = Number(minPrice);
      if (maxPrice) whereClause.pricing_hourly_rate[sequelize.Op.lte] = Number(maxPrice);
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get turfs with populated owner info
    const { count, rows: turfs } = await Turf.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'phone']
      }],
      order: [['rating_average', 'DESC'], ['created_at', 'DESC']],
      offset: offset,
      limit: Number(limit)
    });

    // If user is logged in, show full details, otherwise show limited info
    const turfsData = turfs.map(turf => {
      const turfObj = turf.toJSON();
      
      if (!req.user) {
        // Limited info for non-logged in users
        delete turfObj.operatingHours;
        delete turfObj.owner.phone;
        delete turfObj.owner.email;
      }
      
      return turfObj;
    });

    res.json({
      data: turfsData,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get turfs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get owner's turfs
// @route   GET /api/turfs/owner/my-turfs
// @access  Private (Owner only)
router.get('/owner/my-turfs', protect, authorize('owner'), async (req, res) => {
  try {
    const turfs = await Turf.findAll({
      where: { owner_id: req.user.id },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'phone']
      }],
      order: [['created_at', 'DESC']]
    });

    const turfsData = turfs.map(turf => turf.toJSON());
    res.json(turfsData);
  } catch (error) {
    console.error('Get owner turfs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single turf by ID
// @route   GET /api/turfs/:id
// @access  Public (limited info) / Private (full info)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const turf = await Turf.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'phone']
      }]
    });

    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    if (!turf.is_active) {
      return res.status(404).json({ message: 'Turf not available' });
    }

    const turfObj = turf.toJSON();

    // If user is not logged in, show limited info
    if (!req.user) {
      delete turfObj.operatingHours;
      delete turfObj.owner.phone;
      delete turfObj.owner.email;
    }

    res.json(turfObj);
  } catch (error) {
    console.error('Get turf error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new turf
// @route   POST /api/turfs
// @access  Private (Owner only)
router.post('/', protect, authorize('owner'), [
  body('name').trim().isLength({ min: 2 }).withMessage('Turf name must be at least 2 characters'),
  body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('sportType').isIn(['football', 'cricket', 'tennis', 'basketball', 'badminton', 'volleyball', 'multi-sport']),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('location.zipCode').notEmpty().withMessage('Zip code is required'),
  body('pricing.hourlyRate').isNumeric().withMessage('Hourly rate must be a number'),
  body('operatingHours.openTime').notEmpty().withMessage('Open time is required'),
  body('operatingHours.closeTime').notEmpty().withMessage('Close time is required'),
  body('surface').isIn(['natural_grass', 'artificial_grass', 'clay', 'hard_court', 'synthetic'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const turfData = {
      ...req.body,
      owner_id: req.user.id
    };

    const turf = await Turf.create(turfData);
    const turfWithOwner = await Turf.findByPk(turf.id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'phone']
      }]
    });

    res.status(201).json(turfWithOwner.toJSON());
  } catch (error) {
    console.error('Create turf error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update turf
// @route   PUT /api/turfs/:id
// @access  Private (Owner only)
router.put('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const turf = await Turf.findByPk(req.params.id);

    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    // Check if user owns this turf
    if (turf.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this turf' });
    }

    await turf.update(req.body);
    const updatedTurf = await Turf.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'phone']
      }]
    });

    res.json(updatedTurf.toJSON());
  } catch (error) {
    console.error('Update turf error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete turf
// @route   DELETE /api/turfs/:id
// @access  Private (Owner only)
router.delete('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const turf = await Turf.findByPk(req.params.id);

    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    // Check if user owns this turf
    if (turf.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this turf' });
    }

    await turf.destroy();

    res.json({ message: 'Turf removed successfully' });
  } catch (error) {
    console.error('Delete turf error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 