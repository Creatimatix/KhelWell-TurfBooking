import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  sportType: string;
  type: string;
  entryFee: number;
  maxParticipants?: number;
  currentParticipants: number;
  status: string;
  image?: string;
  createdBy: {
    name: string;
    email: string;
  };
}

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    sportType: 'general',
    type: 'tournament',
    entryFee: 0,
    maxParticipants: '',
    image: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      } else {
        throw new Error('Failed to fetch events');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      location: '',
      sportType: 'general',
      type: 'tournament',
      entryFee: 0,
      maxParticipants: '',
      image: ''
    });
    setDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate.split('T')[0],
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      sportType: event.sportType,
      type: event.type,
      entryFee: event.entryFee,
      maxParticipants: event.maxParticipants?.toString() || '',
      image: event.image || ''
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editingEvent 
        ? `http://localhost:5001/api/events/${editingEvent._id}`
        : 'http://localhost:5001/api/events';
      
      const method = editingEvent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined
        })
      });

      if (response.ok) {
        toast.success(editingEvent ? 'Event updated successfully!' : 'Event created successfully!');
        setDialogOpen(false);
        fetchEvents();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save event');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Event deleted successfully!');
        fetchEvents();
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Manage Events</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateEvent}
        >
          Create Event
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Sport</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Participants</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event._id}>
                <TableCell>{event.title}</TableCell>
                <TableCell>
                  <Chip label={event.type} size="small" />
                </TableCell>
                <TableCell>{event.sportType}</TableCell>
                <TableCell>{formatDate(event.startDate)}</TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>
                  <Chip 
                    label={event.status} 
                    color={getStatusColor(event.status) as any}
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  {event.currentParticipants}
                  {event.maxParticipants && ` / ${event.maxParticipants}`}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditEvent(event)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteEvent(event._id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Event Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEvent ? 'Edit Event' : 'Create New Event'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Event Type"
                >
                  <MenuItem value="tournament">Tournament</MenuItem>
                  <MenuItem value="championship">Championship</MenuItem>
                  <MenuItem value="league">League</MenuItem>
                  <MenuItem value="exhibition">Exhibition</MenuItem>
                  <MenuItem value="training">Training</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Sport Type</InputLabel>
                <Select
                  value={formData.sportType}
                  onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
                  label="Sport Type"
                >
                  <MenuItem value="football">Football</MenuItem>
                  <MenuItem value="cricket">Cricket</MenuItem>
                  <MenuItem value="tennis">Tennis</MenuItem>
                  <MenuItem value="basketball">Basketball</MenuItem>
                  <MenuItem value="badminton">Badminton</MenuItem>
                  <MenuItem value="volleyball">Volleyball</MenuItem>
                  <MenuItem value="multi-sport">Multi-Sport</MenuItem>
                  <MenuItem value="general">General</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Entry Fee (₹)"
                type="number"
                value={formData.entryFee}
                onChange={(e) => setFormData({ ...formData, entryFee: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Participants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL (optional)"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingEvent ? 'Update Event' : 'Create Event'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEvents; 