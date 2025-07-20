const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Turf = require('../models/Turf');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin role
router.use(protect, authorize('admin'));

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalTurfs = await Turf.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalEvents = await Event.countDocuments();

    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('turf', 'name location')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get pending turfs for verification
    const pendingTurfs = await Turf.find({ isVerified: false })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get revenue statistics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueStats = await Booking.aggregate([
      { 
        $match: { 
          createdAt: { $gte: thirtyDaysAgo },
          status: 'completed',
          paymentStatus: 'paid'
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get top performing turfs
    const topTurfs = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $lookup: { from: 'turfs', localField: 'turf', foreignField: '_id', as: 'turfData' } },
      { $unwind: '$turfData' },
      {
        $group: {
          _id: '$turf',
          turfName: { $first: '$turfData.name' },
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // Get booking status distribution
    const bookingStatusStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalOwners,
        totalTurfs,
        totalBookings,
        totalEvents
      },
      recentBookings,
      pendingTurfs,
      revenueStats,
      topTurfs,
      bookingStatusStats
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', [
  query('role').optional().isIn(['user', 'owner', 'admin']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role, page = 1, limit = 20, search } = req.query;

    const query = {};
    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
router.put('/users/:id/status', [
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = req.body.isActive;
    if (req.body.isVerified !== undefined) {
      user.isVerified = req.body.isVerified;
    }

    await user.save();

    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all turfs for admin
// @route   GET /api/admin/turfs
// @access  Private (Admin only)
router.get('/turfs', [
  query('status').optional().isIn(['active', 'inactive', 'pending']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status === 'pending') {
      query.isVerified = false;
    } else if (status === 'active') {
      query.isActive = true;
      query.isVerified = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const skip = (page - 1) * limit;

    const turfs = await Turf.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Turf.countDocuments(query);

    res.json({
      turfs,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get admin turfs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get revenue analytics
// @route   GET /api/admin/analytics/revenue
// @access  Private (Admin only)
router.get('/analytics/revenue', [
  query('period').optional().isIn(['daily', 'weekly', 'monthly']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Default to last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      dateFilter = { createdAt: { $gte: twelveMonthsAgo } };
    }

    let groupBy = {};
    if (period === 'daily') {
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
    } else if (period === 'weekly') {
      groupBy = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
    } else {
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
    }

    const revenueData = await Booking.aggregate([
      { 
        $match: { 
          ...dateFilter,
          status: 'completed',
          paymentStatus: 'paid'
        } 
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json(revenueData);
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get sport type analytics
// @route   GET /api/admin/analytics/sports
// @access  Private (Admin only)
router.get('/analytics/sports', async (req, res) => {
  try {
    const sportStats = await Booking.aggregate([
      { $lookup: { from: 'turfs', localField: 'turf', foreignField: '_id', as: 'turfData' } },
      { $unwind: '$turfData' },
      {
        $group: {
          _id: '$turfData.sportType',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgRating: { $avg: '$turfData.rating.average' }
        }
      },
      { $sort: { totalBookings: -1 } }
    ]);

    res.json(sportStats);
  } catch (error) {
    console.error('Get sport analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Verify turf
// @route   PUT /api/admin/turfs/:id/verify
// @access  Private (Admin only)
router.put('/turfs/:id/verify', [
  body('isVerified').isBoolean().withMessage('isVerified must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const turf = await Turf.findById(req.params.id);
    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    turf.isVerified = req.body.isVerified;
    await turf.save();

    res.json({ message: 'Turf verification status updated successfully', turf });
  } catch (error) {
    console.error('Verify turf error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all bookings for admin
// @route   GET /api/admin/bookings
// @access  Private (Admin only)
router.get('/bookings', [
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('turf', 'name location sportType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get admin bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 