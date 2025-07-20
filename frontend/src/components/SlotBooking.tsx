import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { Close as CloseIcon, Info as InfoIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  price: number;
  isAvailable: boolean;
}

interface SelectedSlots {
  slots: Slot[];
  totalPrice: number;
  duration: number;
  startTime: string;
  endTime: string;
}

interface Turf {
  name: string;
  hourlyRate: number;
  operatingHours: {
    openTime: string;
    closeTime: string;
  };
}

interface SlotBookingProps {
  turfId: string;
  onBookingComplete?: (booking: any) => void;
  onClose?: () => void;
}

const SlotBooking: React.FC<SlotBookingProps> = ({ turfId, onBookingComplete, onClose }) => {
  // Add CSS animation for pulse effect
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
  const [selectedDate, setSelectedDate] = useState<Date | null>(addDays(new Date(), 1));
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlots | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [turf, setTurf] = useState<Turf | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [specialRequests, setSpecialRequests] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [selectionMode, setSelectionMode] = useState<'single' | 'range'>('single');
  const [rangeStart, setRangeStart] = useState<Slot | null>(null);
  const [maxSlots, setMaxSlots] = useState(4);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const steps = ['Select Date & Time', 'Booking Details', 'Confirmation'];

  useEffect(() => {
    if (selectedDate) {
      fetchSlots();
    }
  }, [selectedDate, turfId]);

  // Set up periodic refresh of slots to check availability
  useEffect(() => {
    if (selectedDate && activeStep === 0) {
      // Refresh slots every 10 seconds when on the slot selection step
      const interval = setInterval(() => {
        fetchSlots();
      }, 10000);
      
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      // Clear interval when not on slot selection step
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [selectedDate, activeStep]);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  const fetchSlots = async () => {
    if (!selectedDate) return;

    setLoading(true);
    setError(null);

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`http://localhost:5001/api/slots/turf/${turfId}?date=${dateStr}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch slots');
      }

      const data = await response.json();
      setSlots(data.data);
      setTurf(data.turf);
    } catch (err) {
      setError('Failed to load available slots');
      console.error('Fetch slots error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slot: Slot) => {
    if (!slot.isAvailable) return;

    if (selectionMode === 'single') {
      // Single slot selection
      const totalPrice = Number(slot.price);
      setSelectedSlots({
        slots: [slot],
        totalPrice,
        duration: 1,
        startTime: slot.startTime,
        endTime: slot.endTime
      });
      setActiveStep(1);
    } else {
      // Range selection
      if (!rangeStart) {
        // First click - set start of range
        setRangeStart(slot);
      } else {
        // Second click - set end of range
        const startIndex = slots.findIndex(s => s._id === rangeStart._id);
        const endIndex = slots.findIndex(s => s._id === slot._id);
        
        if (startIndex === -1 || endIndex === -1) return;
        
        const startIdx = Math.min(startIndex, endIndex);
        const endIdx = Math.max(startIndex, endIndex);
        
        // Get all slots in the range and validate availability
        const rangeSlots: Slot[] = [];
        const unavailableSlots: Slot[] = [];
        
        for (let i = startIdx; i <= endIdx; i++) {
          const currentSlot = slots[i];
          if (currentSlot.isAvailable) {
            rangeSlots.push(currentSlot);
          } else {
            unavailableSlots.push(currentSlot);
          }
        }
        
        // If any slots are unavailable, show error and reset
        if (unavailableSlots.length > 0) {
          setError(`Some slots in the selected range are no longer available: ${unavailableSlots.map(s => `${s.startTime}-${s.endTime}`).join(', ')}`);
          setRangeStart(null);
          return;
        }
        
        // Check if slots are consecutive
        let isConsecutive = true;
        for (let i = 1; i < rangeSlots.length; i++) {
          if (rangeSlots[i-1].endTime !== rangeSlots[i].startTime) {
            isConsecutive = false;
            break;
          }
        }
        
        if (!isConsecutive) {
          setError('Selected slots must be consecutive');
          setRangeStart(null);
          return;
        }
        
        if (rangeSlots.length > maxSlots) {
          setError(`Maximum ${maxSlots} slots can be booked at once`);
          setRangeStart(null);
          return;
        }
        
        const totalPrice = rangeSlots.reduce((sum, s) => sum + Number(s.price), 0);
        setSelectedSlots({
          slots: rangeSlots,
          totalPrice,
          duration: rangeSlots.length,
          startTime: rangeSlots[0].startTime,
          endTime: rangeSlots[rangeSlots.length - 1].endTime
        });
        setRangeStart(null);
        setError(null); // Clear any previous errors
        setActiveStep(1);
      }
    }
  };

  const isSlotInRange = (slot: Slot) => {
    if (!rangeStart) return false;
    const startIndex = slots.findIndex(s => s._id === rangeStart._id);
    const currentIndex = slots.findIndex(s => s._id === slot._id);
    if (startIndex === -1 || currentIndex === -1) return false;
    
    const startIdx = Math.min(startIndex, currentIndex);
    const endIdx = Math.max(startIndex, currentIndex);
    return currentIndex >= startIdx && currentIndex <= endIdx;
  };

  const isSlotSelected = (slot: Slot) => {
    return selectedSlots?.slots.some(s => s._id === slot._id) || false;
  };

  const validateSlotsBeforeBooking = async () => {
    if (!selectedSlots || !selectedDate) return false;

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`http://localhost:5001/api/slots/turf/${turfId}?date=${dateStr}`);
      
      if (!response.ok) {
        throw new Error('Failed to validate slots');
      }

      const data = await response.json();
      const currentSlots = data.data;
      
      // Check if all selected slots are still available
      for (const selectedSlot of selectedSlots.slots) {
        const currentSlot = currentSlots.find((s: Slot) => s._id === selectedSlot._id);
        if (!currentSlot || !currentSlot.isAvailable) {
          return false;
        }
      }
      
      return true;
    } catch (err) {
      console.error('Slot validation error:', err);
      return false;
    }
  };

  const handleBooking = async () => {
    if (!selectedSlots || !selectedDate) return;

    setBookingLoading(true);
    setError(null);

    try {
      // Validate slots before booking
      const slotsValid = await validateSlotsBeforeBooking();
      if (!slotsValid) {
        setError('Some selected slots are no longer available. Please refresh and try again.');
        setActiveStep(0); // Go back to slot selection
        return;
      }

      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch('http://localhost:5001/api/slots/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          turfId: parseInt(turfId),
          date: dateStr,
          startTime: selectedSlots.startTime,
          endTime: selectedSlots.endTime,
          specialRequests: specialRequests.trim() || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Booking error response:', errorData);
        throw new Error(errorData.message || errorData.errors?.[0]?.msg || 'Booking failed');
      }

      const data = await response.json();
      setSuccess('Booking created successfully!');
      setActiveStep(2);
      
      if (onBookingComplete) {
        onBookingComplete(data.booking);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const resetSelection = () => {
    setSelectedSlots(null);
    setRangeStart(null);
    setActiveStep(0);
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const formatPrice = (price: number) => {
    return `₹${price}`;
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  const getSlotColor = (slot: Slot) => {
    if (!slot.isAvailable) return 'error';
    if (isSlotSelected(slot)) return 'primary';
    if (isSlotInRange(slot)) return 'warning';
    return 'default';
  };

  const getSlotVariant = (slot: Slot) => {
    if (!slot.isAvailable) return 'outlined';
    if (isSlotSelected(slot)) return 'filled';
    if (isSlotInRange(slot)) return 'outlined';
    return 'outlined';
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Date & Time
            </Typography>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={(newDate) => {
                  setSelectedDate(newDate);
                  resetSelection();
                }}
                shouldDisableDate={isDateDisabled}
                minDate={addDays(new Date(), 1)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal"
                  }
                }}
              />
            </LocalizationProvider>

            {selectedDate && (
              <Box mt={3}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1">
                      Available Slots for {format(selectedDate, 'MMM dd, yyyy')}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={fetchSlots}
                      disabled={loading}
                      title="Refresh slots"
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Selection Mode</InputLabel>
                    <Select
                      value={selectionMode}
                      label="Selection Mode"
                      onChange={(e) => {
                        setSelectionMode(e.target.value as 'single' | 'range');
                        resetSelection();
                      }}
                    >
                      <MenuItem value="single">Single Slot</MenuItem>
                      <MenuItem value="range">Range Selection</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {selectionMode === 'range' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Click on the first slot to start your range, then click on the last slot to complete your selection.
                      Maximum {maxSlots} consecutive slots allowed.
                    </Typography>
                  </Alert>
                )}

                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="caption" color="text.secondary">
                    Slots refresh automatically every 10 seconds
                  </Typography>
                  {refreshInterval && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'success.main',
                          animation: 'pulse 2s infinite'
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Live
                      </Typography>
                    </Box>
                  )}
                </Box>

                {rangeStart && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Range started at {formatTime(rangeStart.startTime)}. Click on another slot to complete your range.
                    </Typography>
                  </Alert>
                )}

                {loading ? (
                  <Box display="flex" justifyContent="center" mt={3}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ mt: 2 }} action={
                    <Button color="inherit" size="small" onClick={() => setError(null)}>
                      Dismiss
                    </Button>
                  }>
                    {error}
                  </Alert>
                ) : slots.length > 0 ? (
                  <Grid container spacing={2}>
                    {slots.map((slot) => (
                      <Grid item xs={12} sm={6} md={4} key={slot._id}>
                        <Card 
                          sx={{ 
                            cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                            '&:hover': slot.isAvailable ? { boxShadow: 3 } : {},
                            border: 2,
                            borderColor: getSlotColor(slot) === 'default' ? 'divider' : `${getSlotColor(slot)}.main`,
                            opacity: slot.isAvailable ? 1 : 0.6,
                            transition: 'all 0.2s ease-in-out'
                          }}
                          onClick={() => handleSlotClick(slot)}
                        >
                          <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="h6" color={getSlotColor(slot)}>
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {formatPrice(slot.price)}
                            </Typography>
                            <Chip 
                              label={slot.isAvailable ? 'Available' : 'Booked'} 
                              color={getSlotColor(slot)}
                              variant={getSlotVariant(slot)}
                              size="small" 
                              sx={{ mt: 1, width: '100%' }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    No available slots for this date.
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Booking Details
            </Typography>
            
            {selectedSlots && (
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Selected Slots ({selectedSlots.slots.length} hour{selectedSlots.slots.length > 1 ? 's' : ''})
                </Typography>
                <Card sx={{ border: 2, borderColor: 'primary.main' }}>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {formatTime(selectedSlots.startTime)} - {formatTime(selectedSlots.endTime)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDate && format(selectedDate, 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="h5" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                      Total: {formatPrice(selectedSlots.totalPrice)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {selectedSlots.slots.map(slot => 
                        `${formatTime(slot.startTime)}-${formatTime(slot.endTime)}`
                      ).join(', ')}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Special Requests (Optional)"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requirements or requests..."
              sx={{ mb: 2 }}
            />

            <Alert severity="info">
              <Typography variant="body2">
                Please review your booking details above. You can modify your selection by going back to the previous step.
              </Typography>
            </Alert>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Booking Confirmation
            </Typography>
            
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="h6">Booking Successful!</Typography>
              <Typography variant="body2">
                Your booking has been confirmed. You will receive a confirmation email shortly.
              </Typography>
            </Alert>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Booking Summary
                </Typography>
                <Box>
                  <Typography variant="body2">
                    • Date: {selectedDate && format(selectedDate, 'MMM dd, yyyy')}
                  </Typography>
                  <Typography variant="body2">
                    • Time: {selectedSlots && `${formatTime(selectedSlots.startTime)} - ${formatTime(selectedSlots.endTime)}`}
                  </Typography>
                  <Typography variant="body2">
                    • Duration: {selectedSlots?.duration || 1} hour{(selectedSlots?.duration || 1) > 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="body2">
                    • Total Amount: {selectedSlots && formatPrice(selectedSlots.totalPrice)}
                  </Typography>
                  {specialRequests && (
                    <Typography variant="body2">
                      • Special Requests: {specialRequests}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={true} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">
            Book Turf Slot
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {activeStep > 0 && activeStep < 2 && (
          <Button onClick={() => setActiveStep(activeStep - 1)}>
            Back
          </Button>
        )}
        
        {activeStep === 0 && selectedSlots && (
          <Button 
            variant="contained" 
            onClick={() => setActiveStep(1)}
            disabled={!selectedSlots}
          >
            Continue
          </Button>
        )}
        
        {activeStep === 1 && (
          <Button 
            variant="contained" 
            onClick={handleBooking}
            disabled={bookingLoading || !selectedSlots}
          >
            {bookingLoading ? <CircularProgress size={20} /> : 'Confirm Booking'}
          </Button>
        )}
        
        {activeStep === 2 && (
          <Button variant="contained" onClick={handleClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SlotBooking; 