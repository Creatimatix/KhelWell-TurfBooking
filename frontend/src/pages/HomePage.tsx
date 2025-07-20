import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Container,
} from '@mui/material';
import {
  SportsSoccer,
  Event,
  BookOnline,
  LocationOn,
} from '@mui/icons-material';
import Logo from '../components/Logo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <SportsSoccer sx={{ fontSize: 40 }} />,
      title: 'Premium Turfs',
      description: 'Find and book the best sports turfs in your area',
    },
    {
      icon: <BookOnline sx={{ fontSize: 40 }} />,
      title: 'Easy Booking',
      description: 'Book your preferred time slot with just a few clicks',
    },
    {
      icon: <Event sx={{ fontSize: 40 }} />,
      title: 'Sports Events',
      description: 'Participate in tournaments and events',
    },
    {
      icon: <LocationOn sx={{ fontSize: 40 }} />,
      title: 'Multiple Locations',
      description: 'Turfs available across different locations',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ mb: 4 }}>
            <Logo variant="default" size="large" color="white" />
          </Box>
          <Typography variant="h6" component="h3" gutterBottom sx={{ opacity: 0.9 }}>
            Find and book sports turfs for football, cricket, tennis, and more
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/turfs')}
              sx={{ mr: 2, mb: 2 }}
            >
              Browse Turfs
            </Button>
            {!user && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ mb: 2 }}
              >
                Get Started
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Why Choose KhelWell?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          backgroundColor: 'grey.100',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Play?
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Join thousands of sports enthusiasts who trust KhelWell for their turf bookings and events
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/turfs')}
          >
            Start Booking Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 