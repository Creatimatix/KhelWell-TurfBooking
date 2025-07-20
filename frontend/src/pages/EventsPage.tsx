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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  SportsSoccer as SoccerIcon,
  SportsCricket as CricketIcon,
  SportsTennis as TennisIcon,
  SportsBasketball as BasketballIcon,
  EmojiEvents as TrophyIcon,
  Add as AddIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Event {
  _id: string;
  title: string;
  description: string;
  sportType: string;
  type: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  entryFee: number;
  status: string;
  image?: string;
  createdBy: {
    name: string;
    email: string;
  };
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/events');
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'football': return <SoccerIcon />;
      case 'cricket': return <CricketIcon />;
      case 'tennis': return <TennisIcon />;
      case 'basketball': return <BasketballIcon />;
      default: return <TrophyIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'primary';
      case 'ongoing': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'tournament': return 'error';
      case 'league': return 'warning';
      case 'championship': return 'success';
      case 'friendly': return 'info';
      case 'training': return 'default';
      default: return 'default';
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSport = sportFilter === 'all' || event.sportType === sportFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesType = eventTypeFilter === 'all' || event.type === eventTypeFilter;

    return matchesSearch && matchesSport && matchesStatus && matchesType;
  });

  const isRegistrationOpen = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    return startDate > now && event.currentParticipants < (event.maxParticipants || 0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Helpdesk Ribbon for Users */}
      {user && user.role !== 'admin' && (
        <Paper 
          sx={{ 
            mb: 3, 
            p: 2, 
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" gutterBottom>
            🎯 Want to publish your event?
          </Typography>
          <Typography variant="body1">
            Contact our helpdesk at <strong>+91 99999 99999</strong> to get your event featured!
          </Typography>
        </Paper>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Sports Events & Tournaments
        </Typography>
        {user && user.role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/events')}
          >
            Create Event
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sport</InputLabel>
                <Select
                  value={sportFilter}
                  label="Sport"
                  onChange={(e) => setSportFilter(e.target.value)}
                >
                  <MenuItem value="all">All Sports</MenuItem>
                  <MenuItem value="football">Football</MenuItem>
                  <MenuItem value="cricket">Cricket</MenuItem>
                  <MenuItem value="tennis">Tennis</MenuItem>
                  <MenuItem value="basketball">Basketball</MenuItem>
                  <MenuItem value="badminton">Badminton</MenuItem>
                  <MenuItem value="volleyball">Volleyball</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="ongoing">Ongoing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={eventTypeFilter}
                  label="Event Type"
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="tournament">Tournament</MenuItem>
                  <MenuItem value="league">League</MenuItem>
                  <MenuItem value="championship">Championship</MenuItem>
                  <MenuItem value="friendly">Friendly</MenuItem>
                  <MenuItem value="training">Training</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setSportFilter('all');
                  setStatusFilter('all');
                  setEventTypeFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" textAlign="center" color="text.secondary">
              No events found
            </Typography>
            <Typography textAlign="center" color="text.secondary">
              Try adjusting your search criteria or check back later for new events.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} md={6} lg={4} key={event._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': { boxShadow: 4 }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                      {getSportIcon(event.sportType)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" noWrap>
                        {event.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.location}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {event.description}
                  </Typography>

                  <Box display="flex" gap={1} mb={2}>
                    <Chip
                      label={event.type}
                      color={getEventTypeColor(event.type) as any}
                      size="small"
                    />
                    <Chip
                      label={event.status}
                      color={getStatusColor(event.status) as any}
                      size="small"
                    />
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {format(new Date(event.startDate), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <TimeIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {(event.startTime || '').slice(0, 5)} - {(event.endTime || '').slice(0, 5)}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" noWrap>
                      {event.location}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={2}>
                    <GroupIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {event.currentParticipants} / {event.maxParticipants || '∞'} participants
                    </Typography>
                  </Box>

                  {event.entryFee > 0 && (
                    <Box display="flex" alignItems="center" mb={2}>
                      <MoneyIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        Entry Fee: ₹{event.entryFee}
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" gap={1} mt="auto">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => {
                        setSelectedEvent(event);
                        setViewDialogOpen(true);
                      }}
                      fullWidth
                    >
                      View Details
                    </Button>
                    {isRegistrationOpen(event) && (
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                      >
                        Register
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Event Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedEvent?.title}
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body1" paragraph>
                  {selectedEvent.description}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Event Type</Typography>
                <Chip
                  label={selectedEvent.type}
                  color={getEventTypeColor(selectedEvent.type) as any}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Status</Typography>
                <Chip
                  label={selectedEvent.status}
                  color={getStatusColor(selectedEvent.status) as any}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Date</Typography>
                <Typography>
                  {format(new Date(selectedEvent.startDate), 'EEEE, MMMM dd, yyyy')}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Time</Typography>
                <Typography>
                  {(selectedEvent.startTime || '').slice(0, 5)} - {(selectedEvent.endTime || '').slice(0, 5)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Location</Typography>
                <Typography>
                  {selectedEvent.location}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Participants</Typography>
                <Typography>
                  {selectedEvent.currentParticipants} / {selectedEvent.maxParticipants || '∞'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Entry Fee</Typography>
                <Typography>
                  {selectedEvent.entryFee > 0 ? `₹${selectedEvent.entryFee}` : 'Free'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Organizer</Typography>
                <Typography>
                  {selectedEvent.createdBy.name}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedEvent && isRegistrationOpen(selectedEvent) && (
            <Button variant="contained">
              Register for Event
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventsPage; 