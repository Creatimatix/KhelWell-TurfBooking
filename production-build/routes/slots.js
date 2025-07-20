const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const Slot = require('../models/Slot');
const Turf = require('../models/Turf');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// @desc    Get available slots for a turf on a specific date
// @route   GET /api/slots/turf/:turfId
// @access  Public
router.get('/turf/:turfId', async (req, res) => {
  try {
    const { turfId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }

    // Get turf details
    const turf = await Turf.findByPk(turfId);
    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    // Generate slots for the date if they don't exist
    await generateSlotsForDate(turfId, date);

    // Get available slots for the date
    const slots = await Slot.findAll({
      where: {
        turf_id: turfId,
        date: date,
        is_available: true,
        is_active: true
      },
      order: [['start_time', 'ASC']]
    });

    res.json({
      data: slots.map(slot => ({
        _id: slot.id,
        startTime: slot.start_time.slice(0, 5), // Remove seconds
        endTime: slot.end_time.slice(0, 5), // Remove seconds
        price: slot.price,
        isAvailable: slot.is_available
      })),
      turf: {
        name: turf.name,
        hourlyRate: turf.pricing_hourly_rate,
        operatingHours: {
          openTime: turf.operating_hours_open,
          closeTime: turf.operating_hours_close
        }
      }
    });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Book a slot
// @route   POST /api/slots/book
// @access  Private
router.post('/book', protect, [
  body('turfId').isInt().withMessage('Valid turf ID is required'),
  body('date').isDate().withMessage('Valid date is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
  body('specialRequests').optional().isString().withMessage('Special requests must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { turfId, date, startTime, endTime, specialRequests } = req.body;

    // Use transaction to ensure atomicity
    const result = await sequelize.transaction(async (t) => {
      // Check if all slots in the range are available WITH LOCK
      const slots = await Slot.findAll({
        where: {
          turf_id: turfId,
          date: date,
          start_time: `${startTime}:00`,
          is_available: true,
          is_active: true
        },
        order: [['start_time', 'ASC']],
        lock: true,
        transaction: t
      });

      console.log('Found slots in database:', slots.map(s => ({ id: s.id, start_time: s.start_time, end_time: s.end_time, is_available: s.is_available })));

      // Check if the specific slot is available
      if (slots.length === 0) {
        console.log('Booking validation debug:');
        console.log('Requested startTime:', startTime);
        console.log('No slots found for this time');
        throw new Error('The selected slot is not available');
      }

      console.log('Booking validation debug:');
      console.log('Requested startTime:', startTime);
      console.log('Found slots:', slots.map(s => ({ id: s.id, start_time: s.start_time, is_available: s.is_available })));

      // Get turf details for pricing
      const turf = await Turf.findByPk(turfId, { transaction: t });
      if (!turf) {
        throw new Error('Turf not found');
      }

      // Calculate duration and total amount
      const startCalc = new Date(`2000-01-01T${startTime}`);
      const endCalc = new Date(`2000-01-01T${endTime}`);
      const duration = Math.ceil((endCalc - startCalc) / (1000 * 60 * 60)); // hours
      const totalAmount = duration * turf.pricing_hourly_rate;

      // Create booking
      const booking = await Booking.create({
        user_id: req.user.id,
        turf_id: turfId,
        date: date,
        start_time: startTime,
        end_time: endTime,
        duration: duration,
        total_amount: totalAmount,
        special_requests: specialRequests,
        status: 'pending',
        payment_status: 'pending'
      }, { transaction: t });

      // Mark the specific slot as unavailable
      await Slot.update(
        { is_available: false },
        {
          where: {
            turf_id: turfId,
            date: date,
            start_time: `${startTime}:00`,
            is_available: true,
            is_active: true
          },
          transaction: t
        }
      );

      // Create notification for turf owner
      await Notification.create({
        user_id: turf.owner_id,
        booking_id: booking.id,
        title: 'New Booking Request',
        message: `New booking request for ${turf.name} on ${date} from ${startTime} to ${endTime}`,
        type: 'booking_created'
      }, { transaction: t });

      return { booking, turf };
    });

    // Get booking with populated data
    const bookingWithDetails = await Booking.findByPk(result.booking.id, {
      include: [
        {
          model: Turf,
          as: 'turf',
          attributes: ['id', 'name', 'location_address', 'location_city']
        }
      ]
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking: bookingWithDetails.toJSON()
    });
  } catch (error) {
    console.error('Book slot error:', error);
    
    // Handle specific transaction errors
    if (error.message.includes('Some slots in the selected range are not available') || error.message.includes('The selected slot is not available')) {
      return res.status(400).json({ message: 'The selected slot is not available' });
    }
    if (error.message === 'Turf not found') {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user's bookings
// @route   GET /api/slots/my-bookings
// @access  Private
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Turf,
          as: 'turf',
          attributes: ['id', 'name', 'location_address', 'location_city']
        }
      ],
      order: [['date', 'DESC'], ['start_time', 'ASC']]
    });

    res.json({ data: bookings.map(booking => booking.toJSON()) });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Cancel booking
// @route   PUT /api/slots/cancel/:bookingId
// @access  Private
router.put('/cancel/:bookingId', protect, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Turf,
          as: 'turf',
          attributes: ['id', 'name', 'owner_id']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled (not completed or already cancelled)
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
    }

    // Update booking
    await booking.update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_by: 'user',
      cancelled_at: new Date()
    });

    // Mark slot as available again
    await Slot.update(
      { is_available: true },
      {
        where: {
          turf_id: booking.turf_id,
          date: booking.date,
          start_time: booking.start_time,
          end_time: booking.end_time
        }
      }
    );

    // Create notification for turf owner
    await Notification.create({
      user_id: booking.turf.owner_id,
      booking_id: booking.id,
      title: 'Booking Cancelled',
      message: `Booking for ${booking.turf.name} on ${booking.date} has been cancelled`,
      type: 'booking_cancelled'
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate slots for a date
async function generateSlotsForDate(turfId, date) {
  const turf = await Turf.findByPk(turfId);
  if (!turf || !turf.operating_hours_open || !turf.operating_hours_close) {
    return;
  }

  const openTime = turf.operating_hours_open;
  const closeTime = turf.operating_hours_close;
  const hourlyRate = turf.pricing_hourly_rate;

  // Check if slots already exist for this date
  const existingSlots = await Slot.findOne({
    where: {
      turf_id: turfId,
      date: date
    }
  });

  if (existingSlots) {
    return; // Slots already generated
  }

  // Generate 1-hour slots
  const slots = [];
  const start = new Date(`2000-01-01T${openTime}`);
  const end = new Date(`2000-01-01T${closeTime}`);

  while (start < end) {
    const slotStart = start.toTimeString().slice(0, 5);
    start.setHours(start.getHours() + 1);
    const slotEnd = start.toTimeString().slice(0, 5);

    slots.push({
      turf_id: turfId,
      date: date,
      start_time: slotStart,
      end_time: slotEnd,
      price: hourlyRate,
      is_available: true,
      is_active: true
    });
  }

  await Slot.bulkCreate(slots);
}

module.exports = router; 