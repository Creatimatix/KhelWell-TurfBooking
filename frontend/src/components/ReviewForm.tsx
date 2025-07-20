import React, { useState } from 'react';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';

interface ReviewFormProps {
  turfId: number;
  turfName: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel: () => void;
  existingReview?: {
    rating: number;
    comment: string;
  };
  isEditing?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  turfId,
  turfName,
  onSubmit,
  onCancel,
  existingReview,
  isEditing = false
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(rating, comment);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (comment.trim() || rating > 0) {
      if (window.confirm('Are you sure you want to cancel? Your changes will be lost.')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Edit Review' : 'Write a Review'}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {isEditing 
          ? `Update your review for ${turfName}`
          : `Share your experience with ${turfName}`
        }
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Box mb={3}>
          <Typography component="legend" gutterBottom>
            Rating *
          </Typography>
          <Rating
            name="rating"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue || 0);
              setError(null);
            }}
            size="large"
            emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
          />
          <Typography variant="body2" color="text.secondary" mt={1}>
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
            {rating === 0 && 'Select a rating'}
          </Typography>
        </Box>

        <Box mb={3}>
          <TextField
            fullWidth
            label="Comment (optional)"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience, what you liked, what could be improved..."
            inputProps={{ maxLength: 1000 }}
            helperText={`${comment.length}/1000 characters`}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || rating === 0}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Submitting...' : (isEditing ? 'Update Review' : 'Submit Review')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ReviewForm; 