import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Booking {
  id: number;
  turf_id: number;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  total_amount: number;
  special_requests: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  turf: {
    id: number;
    name: string;
    location_address: string;
    location_city: string;
  };
}

const UserBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch('http://localhost:5001/api/slots/my-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      
      // Validate and clean the booking data
      const validatedBookings = (data.data || []).map((booking: any) => ({
        ...booking,
        start_time: booking.start_time || '',
        end_time: booking.end_time || '',
        date: booking.date || '',
        total_amount: booking.total_amount || 0,
        duration: booking.duration || 1,
        status: booking.status || 'pending',
        payment_status: booking.payment_status || 'pending',
        special_requests: booking.special_requests || '',
        turf: booking.turf || { name: 'Unknown Turf', location_address: '', location_city: '' }
      }));
      
      setBookings(validatedBookings);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/slots/cancel/${selectedBooking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel booking');
      }

      setSuccess('Booking cancelled successfully!');
      setCancelDialogOpen(false);
      setCancelReason('');
      setSelectedBooking(null);
      fetchBookings(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true;
    return booking.status === statusFilter;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          My Bookings
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Bookings</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchBookings}
          >
            Refresh
          </Button>
        </Box>
      </Box>

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

      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" textAlign="center" color="text.secondary">
              No bookings found
            </Typography>
            <Typography textAlign="center" color="text.secondary">
              {statusFilter === 'all' ? 'You haven\'t made any bookings yet.' : `No ${statusFilter} bookings found.`}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Turf</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {booking.turf.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.turf.location_city}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      try {
                        const date = new Date(booking.date);
                        if (isNaN(date.getTime())) {
                          return 'Invalid date';
                        }
                        return format(date, 'MMM dd, yyyy');
                      } catch (error) {
                        return 'Invalid date';
                      }
                    })()}
                  </TableCell>
                  <TableCell>
                    {(booking.start_time || '').slice(0, 5)} - {(booking.end_time || '').slice(0, 5)}
                  </TableCell>
                  <TableCell>
                    {booking.duration} hour{booking.duration > 1 ? 's' : ''}
                  </TableCell>
                  <TableCell>
                    ₹{booking.total_amount}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      color={getStatusColor(booking.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.payment_status}
                      color={getPaymentStatusColor(booking.payment_status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setViewDialogOpen(true);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {booking.status === 'pending' && (
                        <Tooltip title="Cancel Booking">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setCancelDialogOpen(true);
                            }}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* View Booking Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedBooking.turf.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {selectedBooking.turf.location_address}, {selectedBooking.turf.location_city}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2">Date</Typography>
                </Box>
                <Typography>
                  {(() => {
                    try {
                      const date = new Date(selectedBooking.date);
                      if (isNaN(date.getTime())) {
                        return 'Invalid date';
                      }
                      return format(date, 'EEEE, MMMM dd, yyyy');
                    } catch (error) {
                      return 'Invalid date';
                    }
                  })()}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2">Time</Typography>
                </Box>
                <Typography>
                  {(selectedBooking.start_time || '').slice(0, 5)} - {(selectedBooking.end_time || '').slice(0, 5)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2">Amount</Typography>
                </Box>
                <Typography variant="h6" color="primary">
                  ₹{selectedBooking.total_amount}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Duration</Typography>
                <Typography>
                  {selectedBooking.duration} hour{selectedBooking.duration > 1 ? 's' : ''}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Status</Typography>
                <Box display="flex" gap={1}>
                  <Chip
                    label={selectedBooking.status}
                    color={getStatusColor(selectedBooking.status) as any}
                  />
                  <Chip
                    label={selectedBooking.payment_status}
                    color={getPaymentStatusColor(selectedBooking.payment_status) as any}
                  />
                </Box>
              </Grid>

              {selectedBooking.special_requests && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Special Requests</Typography>
                  <Typography color="text.secondary">
                    {selectedBooking.special_requests}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Booking Date</Typography>
                <Typography color="text.secondary">
                  {(() => {
                    try {
                      const date = new Date(selectedBooking.created_at);
                      if (isNaN(date.getTime())) {
                        return 'Invalid date';
                      }
                      return format(date, 'MMM dd, yyyy HH:mm');
                    } catch (error) {
                      return 'Invalid date';
                    }
                  })()}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to cancel this booking?
          </Typography>
          {selectedBooking && (
            <Box mb={2}>
              <Typography variant="subtitle2">
                {selectedBooking.turf.name} - {(() => {
                  try {
                    const date = new Date(selectedBooking.date);
                    if (isNaN(date.getTime())) {
                      return 'Invalid date';
                    }
                    return format(date, 'MMM dd, yyyy');
                  } catch (error) {
                    return 'Invalid date';
                  }
                })()} at {(selectedBooking.start_time || '').slice(0, 5)}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label="Reason for cancellation (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Booking</Button>
          <Button
            onClick={handleCancelBooking}
            color="error"
            variant="contained"
          >
            Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserBookings; 