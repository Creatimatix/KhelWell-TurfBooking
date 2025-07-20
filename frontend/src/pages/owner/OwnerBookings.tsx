import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Pagination,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Schedule,
  Person,
  LocationOn,
  AttachMoney,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Booking {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  specialRequests?: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  turf: {
    name: string;
    location_address: string;
    location_city: string;
  };
}

const OwnerBookings: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [action, setAction] = useState<'confirm' | 'cancel'>('confirm');
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const { data: bookingsData, isLoading, error } = useQuery(
    ['owner-bookings', statusFilter, dateFilter, page],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (statusFilter) params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);

      const response = await fetch(`http://localhost:5001/api/owner/bookings?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      return response.json();
    }
  );

  const updateBookingStatusMutation = useMutation(
    async ({ bookingId, status, reason }: { bookingId: string; status: string; reason?: string }) => {
      const response = await fetch(`http://localhost:5001/api/owner/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      return response.json();
    },
    {
      onSuccess: () => {
        toast.success('Booking status updated successfully');
        setActionDialogOpen(false);
        setSelectedBooking(null);
        setReason('');
        queryClient.invalidateQueries(['owner-bookings']);
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update booking status');
      },
    }
  );

  const handleStatusUpdate = (booking: Booking, action: 'confirm' | 'cancel') => {
    setSelectedBooking(booking);
    setAction(action);
    setActionDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedBooking) return;

    const status = action === 'confirm' ? 'confirmed' : 'cancelled';
    updateBookingStatusMutation.mutate({
      bookingId: selectedBooking._id,
      status,
      reason: action === 'cancel' ? reason : undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (date: string) => {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      return format(dateObj, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTime = (time: string) => {
    try {
      if (!time) return 'Invalid time';
      return time.slice(0, 5);
    } catch (error) {
      return 'Invalid time';
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price}`;
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load bookings. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Turf Bookings
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                onClick={() => {
                  setStatusFilter('');
                  setDateFilter('');
                  setPage(1);
                }}
                fullWidth
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Turf</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookingsData?.data?.map((booking: Booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">
                          {booking.user?.name || 'Unknown User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {booking.user?.email || 'No email'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {booking.user?.phone || 'No phone'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{booking.turf.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {booking.turf.location_city}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">
                          {formatDate(booking.date)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{booking.duration} hour(s)</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" color="primary">
                        {formatPrice(booking.totalAmount)}
                      </Typography>
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
                        label={booking.paymentStatus}
                        color={getPaymentStatusColor(booking.paymentStatus) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {booking.status === 'pending' && (
                        <Box>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => handleStatusUpdate(booking, 'confirm')}
                            sx={{ mb: 1, width: '100%' }}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => handleStatusUpdate(booking, 'cancel')}
                            sx={{ width: '100%' }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {bookingsData?.pagination && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={bookingsData.pagination.pages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {action === 'confirm' ? 'Confirm Booking' : 'Cancel Booking'}
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to {action} this booking?
              </Typography>
              <Box mt={2}>
                <Typography variant="subtitle2">Booking Details:</Typography>
                <Typography variant="body2">
                  • Customer: {selectedBooking.user?.name || 'Unknown User'}
                </Typography>
                <Typography variant="body2">
                  • Turf: {selectedBooking.turf.name}
                </Typography>
                <Typography variant="body2">
                  • Date: {formatDate(selectedBooking.date)}
                </Typography>
                <Typography variant="body2">
                  • Time: {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                </Typography>
                <Typography variant="body2">
                  • Amount: {formatPrice(selectedBooking.totalAmount)}
                </Typography>
              </Box>
              {action === 'cancel' && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Cancellation Reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  sx={{ mt: 2 }}
                  placeholder="Please provide a reason for cancellation..."
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={action === 'confirm' ? 'success' : 'error'}
            disabled={updateBookingStatusMutation.isLoading}
          >
            {updateBookingStatusMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : (
              action === 'confirm' ? 'Confirm' : 'Cancel Booking'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OwnerBookings; 