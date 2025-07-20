const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Turf = require('../models/Turf');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');

// @desc    Get owner's turf bookings
// @route   GET /api/owner/bookings
// @access  Private (Owner only)
router.get('/bookings', protect, authorize('owner'), async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get owner's turfs
    const ownerTurfs = await Turf.findAll({
      where: { owner_id: req.user.id },
      attributes: ['id']
    });

    const turfIds = ownerTurfs.map(turf => turf.id);

    // Build where clause
    const whereClause = {
      turf_id: { [Op.in]: turfIds }
    };

    if (status) {
      whereClause.status = status;
    }

    if (date) {
      whereClause.date = date;
    }

    const bookings = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Turf,
          as: 'turf',
          attributes: ['id', 'name', 'location_address', 'location_city']
        },
        {
          model: require('../models/User'),
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['date', 'DESC'], ['start_time', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      data: bookings.rows.map(booking => booking.toJSON()),
      pagination: {
        total: bookings.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(bookings.count / limit)
      }
    });
  } catch (error) {
    console.error('Get owner bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update booking status (confirm/cancel)
// @route   PUT /api/owner/bookings/:bookingId/status
// @access  Private (Owner only)
router.put('/bookings/:bookingId/status', protect, authorize('owner'), async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Turf,
          as: 'turf',
          attributes: ['id', 'name', 'owner_id']
        },
        {
          model: require('../models/User'),
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if owner owns the turf
    if (booking.turf.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Update booking status
    const updateData = { status };
    
    if (status === 'cancelled') {
      updateData.cancellation_reason = reason;
      updateData.cancelled_by = 'owner';
      updateData.cancelled_at = new Date();
    }

    await booking.update(updateData);

    // Create notification for user
    let notificationTitle, notificationMessage;
    
    if (status === 'confirmed') {
      notificationTitle = 'Booking Confirmed';
      notificationMessage = `Your booking for ${booking.turf.name} on ${booking.date} has been confirmed`;
    } else if (status === 'cancelled') {
      notificationTitle = 'Booking Cancelled';
      notificationMessage = `Your booking for ${booking.turf.name} on ${booking.date} has been cancelled by the owner`;
    }

    if (notificationTitle) {
      await Notification.create({
        user_id: booking.user_id,
        booking_id: booking.id,
        title: notificationTitle,
        message: notificationMessage,
        type: status === 'confirmed' ? 'booking_confirmed' : 'booking_cancelled'
      });
    }

    res.json({ 
      message: `Booking ${status} successfully`,
      booking: booking.toJSON()
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get owner's notifications
// @route   GET /api/owner/notifications
// @access  Private (Owner only)
router.get('/notifications', protect, authorize('owner'), async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { 
        user_id: req.user.id,
        is_active: true
      },
      include: [
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'date', 'start_time', 'end_time', 'status']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ data: notifications.map(notification => notification.toJSON()) });
  } catch (error) {
    console.error('Get owner notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get owner dashboard stats
// @route   GET /api/owner/dashboard/stats
// @access  Private (Owner only)
router.get('/dashboard/stats', protect, authorize('owner'), async (req, res) => {
  try {
    // Get owner's turfs
    const ownerTurfs = await Turf.findAll({
      where: { owner_id: req.user.id },
      attributes: ['id']
    });

    const turfIds = ownerTurfs.map(turf => turf.id);

    if (turfIds.length === 0) {
      return res.json({
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        thisMonthRevenue: 0,
        lastMonthRevenue: 0,
        revenueGrowth: 0
      });
    }

    // Get current date info
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Get booking stats
    const totalBookings = await Booking.count({
      where: { turf_id: { [Op.in]: turfIds } }
    });

    const pendingBookings = await Booking.count({
      where: { 
        turf_id: { [Op.in]: turfIds },
        status: 'pending'
      }
    });

    const confirmedBookings = await Booking.count({
      where: { 
        turf_id: { [Op.in]: turfIds },
        status: 'confirmed'
      }
    });

    const completedBookings = await Booking.count({
      where: { 
        turf_id: { [Op.in]: turfIds },
        status: 'completed'
      }
    });

    const cancelledBookings = await Booking.count({
      where: { 
        turf_id: { [Op.in]: turfIds },
        status: 'cancelled'
      }
    });

    // Get revenue stats
    const totalRevenue = await Booking.sum('total_amount', {
      where: { 
        turf_id: { [Op.in]: turfIds },
        status: { [Op.in]: ['confirmed', 'completed'] },
        payment_status: 'paid'
      }
    });

    // This month revenue
    const thisMonthRevenue = await Booking.sum('total_amount', {
      where: { 
        turf_id: { [Op.in]: turfIds },
        status: { [Op.in]: ['confirmed', 'completed'] },
        payment_status: 'paid',
        date: {
          [Op.gte]: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
          [Op.lt]: new Date(currentYear, currentMonth + 1, 1).toISOString().split('T')[0]
        }
      }
    });

    // Last month revenue
    const lastMonthRevenue = await Booking.sum('total_amount', {
      where: { 
        turf_id: { [Op.in]: turfIds },
        status: { [Op.in]: ['confirmed', 'completed'] },
        payment_status: 'paid',
        date: {
          [Op.gte]: new Date(lastMonthYear, lastMonth, 1).toISOString().split('T')[0],
          [Op.lt]: new Date(lastMonthYear, lastMonth + 1, 1).toISOString().split('T')[0]
        }
      }
    });

    // Calculate revenue growth
    let revenueGrowth = 0;
    if (lastMonthRevenue > 0) {
      revenueGrowth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    } else if (thisMonthRevenue > 0) {
      revenueGrowth = 100; // 100% growth if no revenue last month
    }

    res.json({
      totalBookings: totalBookings || 0,
      pendingBookings: pendingBookings || 0,
      confirmedBookings: confirmedBookings || 0,
      completedBookings: completedBookings || 0,
      cancelledBookings: cancelledBookings || 0,
      totalRevenue: totalRevenue || 0,
      thisMonthRevenue: thisMonthRevenue || 0,
      lastMonthRevenue: lastMonthRevenue || 0,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100 // Round to 2 decimal places
    });
  } catch (error) {
    console.error('Get owner dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get owner dashboard (legacy endpoint)
// @route   GET /api/owner/dashboard
// @access  Private (Owner only)
router.get('/dashboard', protect, authorize('owner'), async (req, res) => {
  try {
    // Get owner's turfs
    const ownerTurfs = await Turf.findAll({
      where: { owner_id: req.user.id },
      attributes: ['id']
    });

    const turfIds = ownerTurfs.map(turf => turf.id);

    // Get booking stats
    const totalBookings = await Booking.count({
      where: { turf_id: { [Op.in]: turfIds } }
    });

    const pendingBookings = await Booking.count({
      where: { 
        turf_id: { [Op.in]: turfIds },
        status: 'pending'
      }
    });

    const confirmedBookings = await Booking.count({
      where: { 
        turf_id: { [Op.in]: turfIds },
        status: 'confirmed'
      }
    });

    const todayBookings = await Booking.count({
      where: { 
        turf_id: { [Op.in]: turfIds },
        date: new Date().toISOString().split('T')[0]
      }
    });

    // Get unread notifications count
    const unreadNotifications = await Notification.count({
      where: { 
        user_id: req.user.id,
        is_read: false,
        is_active: true
      }
    });

    res.json({
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        todayBookings,
        unreadNotifications
      }
    });
  } catch (error) {
    console.error('Get owner dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 