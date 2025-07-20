import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Container,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  LocationOn,
  SportsSoccer,
  FilterList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { turfService } from '../services/turfService';
import { Turf, SearchFilters } from '../types';

const sportTypes = [
  'football',
  'cricket',
  'tennis',
  'basketball',
  'badminton',
  'volleyball',
  'multi-sport',
];

const TurfListPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
    limit: 12,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: turfsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['turfs', filters],
    () => turfService.getTurfs(filters),
    {
      keepPreviousData: true,
    }
  );

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      city: searchTerm,
      page: 1,
    }));
  };

  const handleSportTypeChange = (sportType: string) => {
    setFilters(prev => ({
      ...prev,
      sportType: sportType === 'all' ? undefined : sportType,
      page: 1,
    }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load turfs. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Find Your Perfect Turf
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover and book the best sports turfs in your area
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sport Type</InputLabel>
              <Select
                value={filters.sportType || 'all'}
                onChange={(e) => handleSportTypeChange(e.target.value)}
                label="Sport Type"
              >
                <MenuItem value="all">All Sports</MenuItem>
                {sportTypes.map((sport) => (
                  <MenuItem key={sport} value={sport}>
                    {getSportIcon(sport)} {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              startIcon={<Search />}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Turfs Grid */}
      {turfsData && (
        <>
          <Grid container spacing={3}>
            {turfsData.data.map((turf) => (
              <Grid item xs={12} sm={6} md={4} key={turf._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    },
                  }}
                  onClick={() => navigate(`/turfs/${turf._id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={turf.images[0] || 'https://via.placeholder.com/400x200?text=Turf+Image'}
                    alt={turf.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                        {turf.name}
                      </Typography>
                      <Chip
                        label={turf.sportType}
                        size="small"
                        icon={<SportsSoccer />}
                        color="primary"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {turf.location.city}, {turf.location.state}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating value={turf.rating.average} precision={0.5} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({turf.rating.count} reviews)
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {formatPrice(turf.pricing.hourlyRate)}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/turfs/${turf._id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {turfsData.pagination && turfsData.pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={turfsData.pagination.totalPages}
                page={filters.page || 1}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}

          {/* No Results */}
          {turfsData.data.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No turfs found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default TurfListPage; 