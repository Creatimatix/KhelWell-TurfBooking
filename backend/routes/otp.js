const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const twilio = require('twilio');
const OTP = require('../models/OTP');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Twilio configuration
// Only initialize Twilio client if proper credentials are provided
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_ACCOUNT_SID !== 'your_account_sid_here' &&
    process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_AUTH_TOKEN !== 'your_auth_token_here') {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Send OTP to phone number
// @route   POST /api/otp/send
// @access  Public
router.post('/send', [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .custom((value) => {
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
    })
], async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return res.status(400).json({ 
        message: errorMessages
      });
    }

    let { phone } = req.body;

    // Clean phone number - remove spaces and ensure proper format
    const cleanPhone = phone.replace(/\s/g, '');
    
    // If it starts with +91, keep it; otherwise add +91 prefix
    const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone : `+91${cleanPhone}`;

    // Check if user exists - try both formats
    let user = await User.findOne({ where: { phone: formattedPhone } });
    
    // If not found with +91 prefix, try without prefix
    if (!user) {
      const numberWithoutPrefix = formattedPhone.replace('+91', '');
      user = await User.findOne({ where: { phone: numberWithoutPrefix } });
    }
    
    if (!user) {
      return res.status(404).json({ 
        message: 'No account found with this phone number. Please register first or check your phone number.' 
      });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await OTP.create({
      phone: formattedPhone,
      otp_code: otpCode,
      expires_at: expiresAt
    });

    // Force SMS sending in development mode for testing
    if (client && process.env.NODE_ENV === 'development') {
      try {
        console.log('Attempting to send SMS via Twilio...');
        console.log('To:', formattedPhone);
        console.log('From:', process.env.TWILIO_PHONE_NUMBER);
        console.log('Message:', `Your KhelWell verification code is: ${otpCode}. Valid for 10 minutes.`);
        
        await client.messages.create({
          body: `Your KhelWell verification code is: ${otpCode}. Valid for 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone
        });

        console.log('SMS sent successfully via Twilio!');
        res.json({ 
          message: 'OTP sent successfully via SMS to your phone number',
          phone: formattedPhone.replace(/(\+91)(\d{3})(\d{3})(\d{4})/, '$1 $2***$4'),
          otp: otpCode // Show OTP in development for verification
        });
      } catch (twilioError) {
        console.error('Twilio SMS error:', twilioError);
        console.error('Error details:', {
          code: twilioError.code,
          message: twilioError.message,
          moreInfo: twilioError.moreInfo
        });
        
        // Return OTP in response even if Twilio fails
        res.json({ 
          message: 'OTP sent successfully (SMS failed - check console for details)',
          otp: otpCode,
          phone: formattedPhone.replace(/(\+91)(\d{3})(\d{3})(\d{4})/, '$1 $2***$4'),
          smsError: twilioError.message
        });
      }
    } else if (client) {
      // Production mode - send SMS without showing OTP
      try {
        await client.messages.create({
          body: `Your KhelWell verification code is: ${otpCode}. Valid for 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone
        });

        res.json({ 
          message: 'OTP sent successfully to your phone number',
          phone: formattedPhone.replace(/(\+91)(\d{3})(\d{3})(\d{4})/, '$1 $2***$4')
        });
      } catch (twilioError) {
        console.error('Twilio error:', twilioError);
        res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
      }
    } else {
      // No Twilio client available
      if (process.env.NODE_ENV === 'development') {
        res.json({ 
          message: 'OTP sent successfully (development mode - no SMS service configured)',
          otp: otpCode,
          phone: formattedPhone.replace(/(\+91)(\d{3})(\d{3})(\d{4})/, '$1 $2***$4')
        });
      } else {
        res.status(500).json({ message: 'SMS service is currently unavailable. Please try again later or contact support.' });
      }
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Verify OTP and login
// @route   POST /api/otp/verify
// @access  Public
router.post('/verify', [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .custom((value) => {
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
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
], async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return res.status(400).json({ 
        message: errorMessages
      });
    }

    let { phone, otp } = req.body;

    // Clean phone number - remove spaces and ensure proper format
    const cleanPhone = phone.replace(/\s/g, '');
    const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone : `+91${cleanPhone}`;

    // Find the most recent valid OTP
    const otpRecord = await OTP.findOne({
      where: {
        phone: formattedPhone,
        otp_code: otp,
        is_used: false,
        expires_at: { [require('sequelize').Op.gt]: new Date() }
      },
      order: [['created_at', 'DESC']]
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        message: 'Invalid or expired OTP. Please request a new OTP.' 
      });
    }

    // Mark OTP as used
    await otpRecord.update({ is_used: true });

    // Find user - try both formats
    let user = await User.findOne({ where: { phone: formattedPhone } });
    
    // If not found with +91 prefix, try without prefix
    if (!user) {
      const numberWithoutPrefix = formattedPhone.replace('+91', '');
      user = await User.findOne({ where: { phone: numberWithoutPrefix } });
    }
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User account not found. Please check your phone number.' 
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_verified: user.is_verified,
        is_active: user.is_active
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Resend OTP
// @route   POST /api/otp/resend
// @access  Public
router.post('/resend', [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .custom((value) => {
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
    })
], async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return res.status(400).json({ 
        message: errorMessages
      });
    }

    let { phone } = req.body;

    // Clean phone number - remove spaces and ensure proper format
    const cleanPhone = phone.replace(/\s/g, '');
    const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone : `+91${cleanPhone}`;

    // Check if user exists - try both formats
    let user = await User.findOne({ where: { phone: formattedPhone } });
    
    // If not found with +91 prefix, try without prefix
    if (!user) {
      const numberWithoutPrefix = formattedPhone.replace('+91', '');
      user = await User.findOne({ where: { phone: numberWithoutPrefix } });
    }
    
    if (!user) {
      return res.status(404).json({ 
        message: 'No account found with this phone number. Please register first or check your phone number.' 
      });
    }

    // Invalidate previous OTPs
    await OTP.update(
      { is_used: true },
      { where: { phone: formattedPhone, is_used: false } }
    );

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save new OTP
    await OTP.create({
      phone: formattedPhone,
      otp_code: otpCode,
      expires_at: expiresAt
    });

    // Send SMS via Twilio (if available) or return OTP in development
    if (client) {
      try {
        await client.messages.create({
          body: `Your new KhelWell verification code is: ${otpCode}. Valid for 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone
        });

        res.json({ 
          message: 'OTP resent successfully to your phone number',
          phone: formattedPhone.replace(/(\+91)(\d{3})(\d{3})(\d{4})/, '$1 $2***$4'),
          otp: process.env.NODE_ENV === 'development' ? otpCode : undefined // Show OTP in development
        });
      } catch (twilioError) {
        console.error('Twilio error:', twilioError);
        
        // In development, return OTP in response even if Twilio fails
        if (process.env.NODE_ENV === 'development') {
          res.json({ 
            message: 'OTP resent successfully (development mode - SMS failed)',
            otp: otpCode, // Only in development
            phone: formattedPhone.replace(/(\+91)(\d{3})(\d{3})(\d{4})/, '$1 $2***$4')
          });
        } else {
          res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
        }
      }
    } else {
      // No Twilio client available - return OTP in development mode
      if (process.env.NODE_ENV === 'development') {
        res.json({ 
          message: 'OTP resent successfully (development mode - no SMS service)',
          otp: otpCode, // Only in development
          phone: formattedPhone.replace(/(\+91)(\d{3})(\d{3})(\d{4})/, '$1 $2***$4')
        });
      } else {
        res.status(500).json({ message: 'SMS service is currently unavailable. Please try again later or contact support.' });
      }
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 