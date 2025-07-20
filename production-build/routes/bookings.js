const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (User only)
router.post('/', protect, authorize('user'), [
  body('turfId').isMongoId().withMessage('Valid turf ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
  body('duration').isNumeric().withMessage('Duration is required'),
  body('specialRequests').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { turfId, date, startTime, endTime, duration, specialRequests } = req.body;

    // Check if turf exists and is active
    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    if (!turf.isActive || !turf.isVerified) {
      return res.status(400).json({ message: 'Turf is not available for booking' });
    }

    // Check if booking date is in the future
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({ message: 'Cannot book for past dates' });
    }

    // Check if time slot is within operating hours
    if (startTime < turf.operatingHours.openTime || endTime > turf.operatingHours.closeTime) {
      return res.status(400).json({ 
        message: `Booking time must be between ${turf.operatingHours.openTime} and ${turf.operatingHours.closeTime}` 
      });
    }

    // Check if slot is available
    const existingBooking = await Booking.findOne({
      turf: turfId,
      date: bookingDate,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Calculate total amount
    const totalAmount = turf.pricing.hourlyRate * duration;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      turf: turfId,
      date: bookingDate,
      startTime,
      endTime,
      duration,
      totalAmount,
      specialRequests
    });

    await booking.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'turf', select: 'name location sportType' }
    ]);

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (User only)
router.get('/my-bookings', protect, authorize('user'), [
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate('turf', 'name location sportType images')
      .sort({ date: -1, createdAt: -1 })
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
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('turf', 'name location sportType images owner');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has access to this booking
    if (req.user.role === 'user' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    if (req.user.role === 'owner' && booking.turf.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, [
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('turf', 'name owner');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user can cancel this booking
    const canCancel = 
      (req.user.role === 'user' && booking.user._id.toString() === req.user._id.toString()) ||
      (req.user.role === 'owner' && booking.turf.owner._id.toString() === req.user._id.toString()) ||
      req.user.role === 'admin';

    if (!canCancel) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    // Check if booking is within cancellation window (e.g., 2 hours before)
    const bookingDateTime = new Date(booking.date);
    const [hours, minutes] = booking.startTime.split(':');
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const now = new Date();
    const timeDiff = bookingDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 2 && req.user.role === 'user') {
      return res.status(400).json({ message: 'Cannot cancel booking within 2 hours of start time' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    booking.cancelledBy = req.user.role;
    booking.cancelledAt = new Date();

    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get turf bookings (for owners)
// @route   GET /api/bookings/turf/:turfId
// @access  Private (Owner only)
router.get('/turf/:turfId', protect, authorize('owner'), [
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']),
  query('date').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, date, page = 1, limit = 10 } = req.query;

    // Check if user owns this turf
    const turf = await Turf.findById(req.params.turfId);
    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    if (turf.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view bookings for this turf' });
    }

    const query = { turf: req.params.turfId };
    if (status) {
      query.status = status;
    }
    if (date) {
      query.date = new Date(date);
    }

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .sort({ date: -1, createdAt: -1 })
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
    console.error('Get turf bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update booking status (for owners/admins)
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner/Admin only)
router.put('/:id/status', protect, authorize('owner', 'admin'), [
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).withMessage('Invalid status'),
  body('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('turf', 'owner');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user can update this booking
    const canUpdate = 
      (req.user.role === 'owner' && booking.turf.owner._id.toString() === req.user._id.toString()) ||
      req.user.role === 'admin';

    if (!canUpdate) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = req.body.status;
    if (req.body.paymentStatus) {
      booking.paymentStatus = req.body.paymentStatus;
    }

    await booking.save();

    res.json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 