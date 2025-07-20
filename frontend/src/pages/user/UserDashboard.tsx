import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Rating,
  Badge,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  SportsSoccer as SportsIcon,
  Event as EventIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingIcon,
  CalendarToday as CalendarIcon,
  DirectionsRun as ActivityIcon,
  BookOnline as BookingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Turf {
  id: number;
  name: string;
  sportType: string;
  location: {
    address: string;
    city: string;
  };
  images: string[];
  rating: {
    average: number;
    count: number;
  };
  pricing: {
    hourlyRate: number;
    currency: string;
  };
  distance?: number;
  isAvailable?: boolean;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  image?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  sportType: string;
  type: string;
  entryFee: number;
  status: string;
  currentParticipants: number;
  maxParticipants?: number;
}

interface Booking {
  id: number;
  turf: {
    name: string;
    sportType: string;
    location: {
      city: string;
    };
  };
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
}

const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nearbyTurfs, setNearbyTurfs] = useState<Turf[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [statistics, setStatistics] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    favoriteSport: ''
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch nearby turfs
      const turfsResponse = await fetch('http://localhost:5001/api/turfs/nearby', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const turfsData = await turfsResponse.json();

      // Fetch events
      const eventsResponse = await fetch('http://localhost:5001/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const eventsData = await eventsResponse.json();

      // Fetch user dashboard data
      const dashboardResponse = await fetch('http://localhost:5001/api/users/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const dashboardData = await dashboardResponse.json();

      setNearbyTurfs(turfsData.turfs || []);
      setEvents(eventsData.events || []);
      setRecentBookings(dashboardData.recentBookings || []);
      setStatistics({
        totalBookings: dashboardData.statistics?.totalBookings || 0,
        completedBookings: dashboardData.statistics?.completedBookings || 0,
        totalSpent: dashboardData.statistics?.totalSpent || 0,
        favoriteSport: dashboardData.statistics?.favoriteSport || ''
      });
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover nearby turfs, upcoming events, and manage your bookings
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <BookingIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{statistics.totalBookings}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Bookings
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <ActivityIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{statistics.completedBookings}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">₹{statistics.totalSpent}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Spent
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <SportsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{statistics.favoriteSport || 'N/A'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Favorite Sport
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<BookingIcon />}
              onClick={() => navigate('/turfs')}
            >
              Book a Turf
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<EventIcon />}
              onClick={() => navigate('/events')}
            >
              View Events
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<CalendarIcon />}
              onClick={() => navigate('/user/bookings')}
            >
              My Bookings
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Nearby Turfs" />
          <Tab label="Upcoming Events" />
          <Tab label="Recent Bookings" />
        </Tabs>

        {/* Nearby Turfs Tab */}
        {activeTab === 0 && (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Turfs Near You
            </Typography>
            <Grid container spacing={3}>
              {nearbyTurfs.map((turf) => (
                <Grid item xs={12} sm={6} md={4} key={turf.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={turf.images[0] || '/default-turf.jpg'}
                      alt={turf.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {turf.name}
                      </Typography>
                      <Box display="flex" alignItems="center" mb={1}>
                        <SportsIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {turf.sportType}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {turf.location.city}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Rating value={turf.rating.average} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({turf.rating.count})
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" color="primary">
                          ₹{turf.pricing.hourlyRate}/hr
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate(`/turfs/${turf.id}`)}
                        >
                          Book Now
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {nearbyTurfs.length === 0 && (
                <Grid item xs={12}>
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="text.secondary">
                      No turfs found nearby. Try expanding your search area.
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Events Tab */}
        {activeTab === 1 && (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Upcoming Events
            </Typography>
            <Grid container spacing={3}>
              {events.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={event.image || '/default-event.jpg'}
                      alt={event.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {event.title}
                      </Typography>
                      <Box display="flex" alignItems="center" mb={1}>
                        <SportsIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {event.sportType}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <CalendarIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(event.startDate)}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <TimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={2}>
                        <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {event.location}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" color="primary">
                          ₹{event.entryFee}
                        </Typography>
                        <Chip
                          label={`${event.currentParticipants}/${event.maxParticipants || '∞'}`}
                          size="small"
                          color="primary"
                        />
                      </Box>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => navigate(`/events/${event._id}`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {events.length === 0 && (
                <Grid item xs={12}>
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="text.secondary">
                      No upcoming events found.
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Recent Bookings Tab */}
        {activeTab === 2 && (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Recent Bookings
            </Typography>
            <List>
              {recentBookings.map((booking, index) => (
                <React.Fragment key={booking.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <SportsIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={booking.turf.name}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {formatDate(booking.date)} • {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {booking.turf.location.city} • ₹{booking.totalAmount}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status) as any}
                        size="small"
                      />
                      <Chip
                        label={booking.paymentStatus}
                        color={booking.paymentStatus === 'paid' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </ListItem>
                  {index < recentBookings.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {recentBookings.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">
                    No recent bookings found.
                  </Typography>
                </Box>
              )}
            </List>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default UserDashboard; 