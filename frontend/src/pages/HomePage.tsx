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
import { AnimatedBox, GlowingBorder } from '../components/VisualEffects';
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
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Container maxWidth="md">
          <AnimatedBox effect="fadeInUp" delay={0.2}>
            <Box sx={{ mb: 4 }}>
              <Logo variant="default" size="large" color="white" />
            </Box>
          </AnimatedBox>
          
          <AnimatedBox effect="fadeInUp" delay={0.4}>
            <Typography variant="h6" component="h3" gutterBottom sx={{ opacity: 0.9 }}>
              Find and book sports turfs for football, cricket, tennis, and more
            </Typography>
          </AnimatedBox>
          
          <AnimatedBox effect="fadeInUp" delay={0.6}>
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/turfs')}
                sx={{ 
                  mr: 2, 
                  mb: 2,
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                  }
                }}
              >
                Browse Turfs
              </Button>
              {!user && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ 
                    mb: 2,
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'white',
                      background: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Get Started
                </Button>
              )}
            </Box>
          </AnimatedBox>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <AnimatedBox effect="fadeInUp" delay={0.2}>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Why Choose KhelWell?
          </Typography>
        </AnimatedBox>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <AnimatedBox effect="fadeInUp" delay={0.3 + index * 0.1}>
                <GlowingBorder>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      p: 2,
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        '& .feature-icon': {
                          transform: 'scale(1.1) rotate(5deg)'
                        }
                      }
                    }}
                  >
                    <Box 
                      className="feature-icon"
                      sx={{ 
                        color: 'primary.main', 
                        mb: 2,
                        transition: 'transform 0.3s ease'
                      }}
                    >
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
                </GlowingBorder>
              </AnimatedBox>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          py: 8,
          textAlign: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(46, 125, 50, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Container maxWidth="md">
          <AnimatedBox effect="fadeInUp" delay={0.2}>
            <Typography variant="h4" component="h2" gutterBottom>
              Ready to Play?
            </Typography>
          </AnimatedBox>
          
          <AnimatedBox effect="fadeInUp" delay={0.4}>
            <Typography variant="h6" color="text.secondary" paragraph>
              Join thousands of sports enthusiasts who trust KhelWell for their turf bookings and events
            </Typography>
          </AnimatedBox>
          
          <AnimatedBox effect="fadeInUp" delay={0.6}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/turfs')}
              sx={{
                background: 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)',
                boxShadow: '0 3px 5px 2px rgba(46, 125, 50, .3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(46, 125, 50, .4)'
                }
              }}
            >
              Start Booking Now
            </Button>
          </AnimatedBox>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 