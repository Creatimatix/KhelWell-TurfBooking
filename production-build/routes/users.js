const express = require('express');
const { query, body } = require('express-validator');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (User only)
router.get('/profile', protect, authorize('user'), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (User only)
router.put('/profile', protect, authorize('user'), [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true; // Allow empty phone
      
      // Remove spaces and check if it's a valid Indian phone number
      const cleanPhone = value.replace(/\s/g, '');
      
      // Check if it starts with +91 and has 10 digits after
      if (cleanPhone.startsWith('+91')) {
        const numberPart = cleanPhone.substring(3);
        if (numberPart.length === 10 && /^\d{10}$/.test(numberPart)) {
          return true;
        }
      }
      
      // Also accept numbers without +91 prefix (for backward compatibility)
      if (/^\d{10}$/.test(cleanPhone)) {
        return true;
      }
      
      throw new Error('Please provide a valid 10-digit Indian phone number (e.g., +91 99999 99999)');
    }),
  body('address_street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address must be less than 200 characters'),
  body('address_city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  body('address_state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must be less than 100 characters'),
  body('address_zip_code')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('ZIP code must be less than 10 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('date_of_birth')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
    .withMessage('Please select a valid gender option'),
  body('interested_sports')
    .optional()
    .isArray()
    .withMessage('Interested sports must be an array')
], async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return res.status(400).json({ 
        message: errorMessages
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User account not found. Please log in again.' });
    }

    // Update allowed fields
    const allowedFields = [
      'name', 'phone', 'address_street', 'address_city', 
      'address_state', 'address_zip_code', 'interested_sports', 
      'bio', 'date_of_birth', 'gender', 'profile_image'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Special handling for phone number formatting
        if (field === 'phone' && req.body[field]) {
          const cleanPhone = req.body[field].replace(/\s/g, '');
          const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone : `+91${cleanPhone}`;
          updateData[field] = formattedPhone;
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    await user.update(updateData);

    // Return updated user without password
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({ 
      message: 'Your profile has been updated successfully!',
      user: updatedUser.toJSON()
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Failed to update profile. Please try again later.' });
  }
});

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private (User only)
router.get('/dashboard', protect, authorize('user'), async (req, res) => {
  try {
    const { Op, fn, col } = require('sequelize');

    // Get user's recent bookings
    const recentBookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: require('../models/Turf'),
          as: 'turf',
          attributes: ['id', 'name', 'location_address', 'location_city', 'sport_type', 'images']
        }
      ],
      order: [['date', 'DESC'], ['start_time', 'ASC']],
      limit: 5
    });

    // Get booking statistics
    const totalBookings = await Booking.count({
      where: { user_id: req.user.id }
    });
    const confirmedBookings = await Booking.count({
      where: { 
        user_id: req.user.id, 
        status: 'confirmed' 
      }
    });
    const pendingBookings = await Booking.count({
      where: { 
        user_id: req.user.id, 
        status: 'pending' 
      }
    });
    const completedBookings = await Booking.count({
      where: { 
        user_id: req.user.id, 
        status: 'completed' 
      }
    });

    // Get total amount spent
    const totalSpentResult = await Booking.findOne({
      where: { 
        user_id: req.user.id, 
        status: 'completed' 
      },
      attributes: [
        [fn('SUM', col('total_amount')), 'total']
      ]
    });

    const totalSpent = totalSpentResult ? parseFloat(totalSpentResult.getDataValue('total') || 0) : 0;

    // Get favorite sport based on booking history
    const favoriteSportResult = await Booking.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: require('../models/Turf'),
          as: 'turf',
          attributes: ['sport_type']
        }
      ],
      attributes: [
        'turf_id',
        [fn('COUNT', col('Booking.id')), 'count']
      ],
      group: ['turf_id', 'turf.sport_type'],
      order: [[fn('COUNT', col('Booking.id')), 'DESC']],
      limit: 1
    });

    const favoriteSport = favoriteSportResult ? favoriteSportResult.turf.sport_type : '';

    // Get upcoming bookings
    const upcomingBookings = await Booking.findAll({
      where: {
        user_id: req.user.id,
        date: { [Op.gte]: new Date().toISOString().split('T')[0] },
        status: { [Op.in]: ['pending', 'confirmed'] }
      },
      include: [
        {
          model: require('../models/Turf'),
          as: 'turf',
          attributes: ['id', 'name', 'location_address', 'location_city', 'sport_type', 'images']
        }
      ],
      order: [['date', 'ASC'], ['start_time', 'ASC']],
      limit: 3
    });

    res.json({
      recentBookings: recentBookings.map(booking => booking.toJSON()),
      statistics: {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        completedBookings,
        totalSpent,
        favoriteSport
      },
      upcomingBookings: upcomingBookings.map(booking => booking.toJSON())
    });
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user's favorite sports (based on booking history)
// @route   GET /api/users/favorite-sports
// @access  Private (User only)
router.get('/favorite-sports', protect, authorize('user'), async (req, res) => {
  try {
    const { fn, col } = require('sequelize');
    const favoriteSports = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: require('../models/Turf'),
          as: 'turf',
          attributes: ['sport_type']
        }
      ],
      attributes: [
        'turf_id',
        [fn('COUNT', col('Booking.id')), 'count']
      ],
      group: ['turf_id', 'turf.sport_type'],
      order: [[fn('COUNT', col('Booking.id')), 'DESC']],
      limit: 5
    });

    const result = favoriteSports.map(item => ({
      sportType: item.turf.sport_type,
      count: parseInt(item.getDataValue('count'))
    }));

    res.json(result);
  } catch (error) {
    console.error('Get favorite sports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user's booking history
// @route   GET /api/users/booking-history
// @access  Private (User only)
router.get('/booking-history', protect, authorize('user'), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])
], async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const whereClause = { user_id: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const offset = (page - 1) * limit;

    const bookings = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: require('../models/Turf'),
          as: 'turf',
          attributes: ['id', 'name', 'location_address', 'location_city', 'sport_type', 'images']
        }
      ],
      order: [['date', 'DESC'], ['created_at', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    });

    res.json({
      bookings: bookings.rows.map(booking => booking.toJSON()),
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(bookings.count / limit),
        totalItems: bookings.count,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get booking history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user profile statistics
// @route   GET /api/users/profile-stats
// @access  Private (User only)
router.get('/profile-stats', protect, authorize('user'), async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const { fn, col, literal } = require('sequelize');

    // Get user's booking statistics by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Booking.findAll({
      where: {
        user_id: req.user.id,
        created_at: { [Op.gte]: sixMonthsAgo }
      },
      attributes: [
        [fn('YEAR', col('created_at')), 'year'],
        [fn('MONTH', col('created_at')), 'month'],
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('total_amount')), 'totalAmount']
      ],
      group: [fn('YEAR', col('created_at')), fn('MONTH', col('created_at'))],
      order: [[fn('YEAR', col('created_at')), 'ASC'], [fn('MONTH', col('created_at')), 'ASC']]
    });

    // Get most visited turfs
    const mostVisitedTurfs = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: require('../models/Turf'),
          as: 'turf',
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'turf_id',
        [fn('COUNT', col('id')), 'visitCount'],
        [fn('SUM', col('total_amount')), 'totalSpent']
      ],
      group: ['turf_id', 'turf.id', 'turf.name'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 5
    });

    res.json({
      monthlyStats: monthlyStats.map(stat => ({
        year: parseInt(stat.getDataValue('year')),
        month: parseInt(stat.getDataValue('month')),
        count: parseInt(stat.getDataValue('count')),
        totalAmount: parseFloat(stat.getDataValue('totalAmount') || 0)
      })),
      mostVisitedTurfs: mostVisitedTurfs.map(turf => ({
        turfId: turf.turf_id,
        turfName: turf.turf.name,
        visitCount: parseInt(turf.getDataValue('visitCount')),
        totalSpent: parseFloat(turf.getDataValue('totalSpent') || 0)
      }))
    });
  } catch (error) {
    console.error('Get profile stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 