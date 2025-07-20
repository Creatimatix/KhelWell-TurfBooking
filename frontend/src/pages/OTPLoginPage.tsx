import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OTPLoginPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('+91 ');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { login, setUser, setToken } = useAuth();

  const steps = ['Enter Phone Number', 'Enter OTP'];

  const handleSendOTP = async () => {
    if (!phone || phone.trim() === '+91 ' || phone.trim() === '+91') {
      setError('Please enter your phone number');
      return;
    }

    // Validate Indian phone number (10 digits after +91)
    const cleanPhone = phone.replace(/\s/g, '');
    let phoneNumber;
    
    if (cleanPhone.startsWith('+91')) {
      phoneNumber = cleanPhone.substring(3); // Remove +91
    } else {
      phoneNumber = cleanPhone.replace(/\D/g, '').replace('91', '');
    }
    
    if (phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit Indian phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Sending OTP request with phone:', phone);
      const response = await fetch('http://localhost:5001/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();
      console.log('OTP send response:', response.status, data);

      if (response.ok) {
        setSuccess(data.message);
        setStep(1);
        
        // Start resend countdown
        setResendDisabled(true);
        setResendCountdown(60);
        const countdownInterval = setInterval(() => {
          setResendCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setResendDisabled(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Show OTP in development mode
        if (data.otp) {
          setOtp(data.otp);
        }
      } else {
        setError(data.message || 'Failed to send OTP. Please check your phone number and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5001/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data directly since OTP login is different from email login
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Update auth context
        setUser(data.user);
        setToken(data.token);
        
        navigate('/user/dashboard');
      } else {
        setError(data.message || 'Invalid OTP. Please check the code and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5001/api/otp/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        
        // Start resend countdown
        setResendDisabled(true);
        setResendCountdown(60);
        const countdownInterval = setInterval(() => {
          setResendCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setResendDisabled(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Show OTP in development mode
        if (data.otp) {
          setOtp(data.otp);
        }
      } else {
        setError(data.message || 'Failed to resend OTP. Please try again later.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(0);
    setOtp('');
    setError(null);
    setSuccess(null);
  };

  const formatPhone = (value: string) => {
    // Remove all non-digits except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +91
    if (!cleaned.startsWith('+91')) {
      return '+91 ' + cleaned.replace('+91', '');
    }
    
    // Remove +91 and get the number part
    const numberPart = cleaned.replace('+91', '');
    
    // Format Indian phone number: +91 99999 99999
    if (numberPart.length <= 5) {
      return '+91 ' + numberPart;
    } else if (numberPart.length <= 10) {
      return '+91 ' + numberPart.slice(0, 5) + ' ' + numberPart.slice(5);
    } else {
      return '+91 ' + numberPart.slice(0, 5) + ' ' + numberPart.slice(5, 10);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = formatPhone(e.target.value);
    setPhone(newValue);
    
    // Set cursor position after +91 
    setTimeout(() => {
      if (phoneInputRef.current) {
        const cursorPosition = Math.max(4, newValue.length); // At least after "+91 "
        phoneInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  const handlePhoneFocus = () => {
    // When focusing, ensure cursor is after +91 
    setTimeout(() => {
      if (phoneInputRef.current) {
        const cursorPosition = Math.max(4, phone.length); // At least after "+91 "
        phoneInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" gutterBottom>
              OTP Login
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Login using your phone number and OTP
            </Typography>
          </Box>

          <Stepper activeStep={step} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {step === 0 ? (
            <Box>
              <TextField
                fullWidth
                label="Phone Number"
                value={phone}
                onChange={handlePhoneChange}
                onFocus={handlePhoneFocus}
                inputRef={phoneInputRef}
                placeholder="+91 99999 99999"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSendOTP}
                disabled={loading || !phone}
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Send OTP'}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/login')}
              >
                Back to Email Login
              </Button>
            </Box>
          ) : (
            <Box>
              <TextField
                fullWidth
                label="OTP Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                type={showOtp ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowOtp(!showOtp)}
                        edge="end"
                      >
                        {showOtp ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleVerifyOTP}
                    disabled={loading || !otp}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleResendOTP}
                    disabled={loading || resendDisabled}
                  >
                    {resendDisabled 
                      ? `Resend (${resendCountdown}s)` 
                      : 'Resend OTP'
                    }
                  </Button>
                </Grid>
              </Grid>

              <Button
                fullWidth
                variant="text"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{ mt: 2 }}
              >
                Back to Phone Number
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default OTPLoginPage; 