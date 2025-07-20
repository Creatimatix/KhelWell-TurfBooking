import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Avatar,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AttachMoney as MoneyIcon,
  SportsSoccer as SoccerIcon,
  CalendarToday as CalendarIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueGrowth: number;
}

interface RecentBooking {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: string;
  payment_status: string;
  user: {
    name: string;
    email: string;
  };
  turf: {
    name: string;
  };
}

const OwnerDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Fetch dashboard statistics
      const statsResponse = await fetch('http://localhost:5001/api/owner/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch recent bookings
      const bookingsResponse = await fetch('http://localhost:5001/api/owner/bookings?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!bookingsResponse.ok) {
        throw new Error('Failed to fetch recent bookings');
      }

      const bookingsData = await bookingsResponse.json();
      setRecentBookings(bookingsData.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
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
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₹0';
    }
    return `₹${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Owner Dashboard
      </Typography>

      {stats && (
        <>
          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Bookings
                      </Typography>
                      <Typography variant="h4">
                        {stats.totalBookings}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <CalendarIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Pending Bookings
                      </Typography>
                      <Typography variant="h4" color="warning.main">
                        {stats.pendingBookings}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <ScheduleIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Revenue
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {formatCurrency(stats.totalRevenue)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <MoneyIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        This Month
                      </Typography>
                      <Typography variant="h4" color="primary.main">
                        {formatCurrency(stats.thisMonthRevenue)}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        {(stats.revenueGrowth || 0) >= 0 ? (
                          <TrendingUpIcon color="success" fontSize="small" />
                        ) : (
                          <TrendingDownIcon color="error" fontSize="small" />
                        )}
                        <Typography 
                          variant="caption" 
                          color={(stats.revenueGrowth || 0) >= 0 ? 'success.main' : 'error.main'}
                          sx={{ ml: 0.5 }}
                        >
                          {Math.abs(stats.revenueGrowth || 0)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <TrendingUpIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Booking Status Breakdown */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Booking Status Breakdown
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center">
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        <Typography>Confirmed</Typography>
                      </Box>
                      <Chip label={stats.confirmedBookings} color="success" size="small" />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center">
                        <ScheduleIcon color="warning" sx={{ mr: 1 }} />
                        <Typography>Pending</Typography>
                      </Box>
                      <Chip label={stats.pendingBookings} color="warning" size="small" />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center">
                        <CheckCircleIcon color="info" sx={{ mr: 1 }} />
                        <Typography>Completed</Typography>
                      </Box>
                      <Chip label={stats.completedBookings} color="info" size="small" />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center">
                        <CancelIcon color="error" sx={{ mr: 1 }} />
                        <Typography>Cancelled</Typography>
                      </Box>
                      <Chip label={stats.cancelledBookings} color="error" size="small" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue Overview
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Total Revenue</Typography>
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(stats.totalRevenue)}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography>This Month</Typography>
                      <Typography variant="h6" color="primary.main">
                        {formatCurrency(stats.thisMonthRevenue)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Last Month</Typography>
                      <Typography variant="h6" color="textSecondary">
                        {formatCurrency(stats.lastMonthRevenue)}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography>Growth</Typography>
                      <Box display="flex" alignItems="center">
                        {(stats.revenueGrowth || 0) >= 0 ? (
                          <TrendingUpIcon color="success" fontSize="small" />
                        ) : (
                          <TrendingDownIcon color="error" fontSize="small" />
                        )}
                        <Typography 
                          variant="h6" 
                          color={(stats.revenueGrowth || 0) >= 0 ? 'success.main' : 'error.main'}
                          sx={{ ml: 0.5 }}
                        >
                          {Math.abs(stats.revenueGrowth || 0)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Recent Bookings */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Recent Bookings
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {/* TODO: Navigate to bookings page */}}
            >
              View All
            </Button>
          </Box>

          {recentBookings.length === 0 ? (
            <Typography textAlign="center" color="textSecondary" py={4}>
              No recent bookings found
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Turf</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">
                            {booking.user?.name || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {booking.user?.email || 'No email'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {booking.turf?.name || 'Unknown Turf'}
                        </Typography>
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
                        {formatCurrency(booking.total_amount)}
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
                        <Button
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => {/* TODO: Navigate to booking details */}}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default OwnerDashboard; 