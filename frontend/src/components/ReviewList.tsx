import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  Divider,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  is_verified: boolean;
  user: {
    id: number;
    name: string;
    profile_image?: string;
  };
}

interface ReviewListProps {
  turfId: number;
  onReviewUpdate?: () => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ turfId, onReviewUpdate }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [turfId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5001/api/reviews/turf/${turfId}?page=${page}&limit=5`
      );
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
        setTotalPages(data.pagination.totalPages);
        setTotalReviews(data.pagination.totalItems);
        setAverageRating(data.summary.averageRating);
      } else {
        setError(data.message || 'Failed to load reviews');
      }
    } catch (err: any) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = async (reviewId: number, rating: number, comment: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      const data = await response.json();

      if (response.ok) {
        // Update the review in the list
        setReviews(prevReviews =>
          prevReviews.map(review =>
            review.id === reviewId
              ? { ...review, rating, comment, updated_at: new Date().toISOString() }
              : review
          )
        );
        onReviewUpdate?.();
      } else {
        throw new Error(data.message || 'Failed to update review');
      }
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Remove the review from the list
        setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
        setTotalReviews(prev => prev - 1);
        onReviewUpdate?.();
      } else {
        throw new Error(data.message || 'Failed to delete review');
      }
    } catch (err: any) {
      console.error('Delete review error:', err);
      alert('Failed to delete review');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, review: Review) => {
    setAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReview(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Reviews Summary */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Reviews ({totalReviews})
        </Typography>
        {totalReviews > 0 && (
          <Box display="flex" alignItems="center" gap={2}>
            <Rating value={averageRating} readOnly precision={0.1} />
            <Typography variant="body1">
              {averageRating.toFixed(1)} out of 5
            </Typography>
            <Typography variant="body2" color="text.secondary">
              based on {totalReviews} reviews
            </Typography>
          </Box>
        )}
      </Box>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No reviews yet. Be the first to review this turf!
          </Typography>
        </Box>
      ) : (
        <Box>
          {reviews.map((review) => (
            <Card key={review.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={review.user.profile_image}
                      sx={{ width: 40, height: 40 }}
                    >
                      {getInitials(review.user.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {review.user.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(review.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1}>
                    {review.is_verified && (
                      <Chip
                        icon={<VerifiedIcon />}
                        label="Verified"
                        size="small"
                        color="success"
                      />
                    )}
                    
                    {(user?.id || user?._id) === review.user.id && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, review)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
                
                {review.comment && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {review.comment}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </Box>
      )}

      {/* Review Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            // Handle edit - you can implement this based on your needs
            console.log('Edit review:', selectedReview);
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Edit Review
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            if (selectedReview) {
              handleDeleteReview(selectedReview.id);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Review
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ReviewList; 