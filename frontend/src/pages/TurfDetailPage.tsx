import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Container,
  Rating,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  LocationOn,
  SportsSoccer,
  AccessTime,
  AttachMoney,
  Star,
  CheckCircle,
  Cancel,
  Schedule,
  Event,
  RateReview,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { turfService } from '../services/turfService';
import { useAuth } from '../context/AuthContext';
import { Turf } from '../types';
import toast from 'react-hot-toast';
import SlotBooking from '../components/SlotBooking';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';

const TurfDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const {
    data: turf,
    isLoading,
    error,
  } = useQuery(['turf', id], () => turfService.getTurfById(id!), {
    enabled: !!id,
  });

  const handleBooking = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingDialogOpen(true);
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          turf_id: parseInt(id!),
          rating,
          comment
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Review submitted successfully!');
        setShowReviewForm(false);
        // Refresh the turf data to update rating
        queryClient.invalidateQueries(['turf', id]);
      } else {
        throw new Error(data.message || 'Failed to submit review');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    }
  };

  const getSportIcon = (sportType: string) => {
    switch (sportType) {
      case 'football':
        return '⚽';
      case 'cricket':
        return '🏏';
      case 'tennis':
        return '🎾';
      case 'basketball':
        return '🏀';
      case 'badminton':
        return '🏸';
      case 'volleyball':
        return '🏐';
      default:
        return '🏟️';
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price}/hour`;
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !turf) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load turf details. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {turf.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn sx={{ color: 'text.secondary', mr: 1 }} />
            <Typography variant="body1" color="text.secondary">
              {turf.location.address}, {turf.location.city}, {turf.location.state} - {turf.location.zipCode}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<SportsSoccer />}
              label={turf.sportType}
              color="primary"
              variant="outlined"
            />
            <Rating value={turf.rating.average} precision={0.5} readOnly />
            <Typography variant="body2" color="text.secondary">
              ({turf.rating.count} reviews)
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Images */}
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="400"
                image={turf.images[0] || 'https://via.placeholder.com/800x400?text=Turf+Image'}
                alt={turf.name}
              />
            </Card>

            {/* Description */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  About this turf
                </Typography>
                <Typography variant="body1" paragraph>
                  {turf.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Turf Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <SportsSoccer />
                        </ListItemIcon>
                        <ListItemText
                          primary="Sport Type"
                          secondary={turf.sportType.charAt(0).toUpperCase() + turf.sportType.slice(1)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AttachMoney />
                        </ListItemIcon>
                        <ListItemText
                          primary="Price"
                          secondary={formatPrice(turf.pricing.hourlyRate)}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle />
                        </ListItemIcon>
                        <ListItemText
                          primary="Surface"
                          secondary={turf.surface.replace('_', ' ').charAt(0).toUpperCase() + turf.surface.replace('_', ' ').slice(1)}
                        />
                      </ListItem>
                      {turf.size && (
                        <ListItem>
                          <ListItemIcon>
                            <Schedule />
                          </ListItemIcon>
                          <ListItemText
                            primary="Size"
                            secondary={`${turf.size.length} x ${turf.size.width} ${turf.size.unit}`}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Amenities */}
            {turf.amenities.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Amenities
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {turf.amenities.map((amenity, index) => (
                      <Chip key={index} label={amenity} variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Operating Hours */}
            {turf.operatingHours && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Operating Hours
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {turf.operatingHours.openTime} - {turf.operatingHours.closeTime}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Open on: {turf.operatingHours.daysOpen.join(', ')}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Reviews & Ratings
                  </Typography>
                  {user && (
                    <Button
                      variant="outlined"
                      startIcon={<RateReview />}
                      onClick={() => setShowReviewForm(!showReviewForm)}
                    >
                      {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                    </Button>
                  )}
                </Box>

                {showReviewForm && (
                  <ReviewForm
                    turfId={parseInt(id!)}
                    turfName={turf.name}
                    onSubmit={handleReviewSubmit}
                    onCancel={() => setShowReviewForm(false)}
                  />
                )}

                <ReviewList 
                  turfId={parseInt(id!)} 
                  onReviewUpdate={() => {
                    queryClient.invalidateQueries(['turf', id]);
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h4" color="primary" gutterBottom>
                  {formatPrice(turf.pricing.hourlyRate)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  per hour
                </Typography>
                
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleBooking}
                  sx={{ mt: 2, mb: 2 }}
                >
                  Book Now
                </Button>

                {user && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<RateReview />}
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    sx={{ mb: 2 }}
                  >
                    {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                  </Button>
                )}

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Quick Info
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Star color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Rating"
                        secondary={`${turf.rating.average}/5 (${turf.rating.count} reviews)`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Status"
                        secondary={turf.isActive ? 'Available' : 'Not Available'}
                      />
                    </ListItem>
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Slot Booking Component */}
        {bookingDialogOpen && (
          <SlotBooking
            turfId={id!}
            onBookingComplete={(booking) => {
              toast.success('Booking created successfully!');
              setBookingDialogOpen(false);
              queryClient.invalidateQueries(['bookings']);
            }}
            onClose={() => setBookingDialogOpen(false)}
          />
        )}
      </Container>
  );
};

export default TurfDetailPage; 