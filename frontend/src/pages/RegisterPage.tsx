import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Link,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RegisterData } from '../types';

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  phone: yup.string().required('Phone number is required').matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  role: yup.string().oneOf(['user', 'owner'], 'Please select a valid role').required('Role is required'),
  address: yup.object({
    street: yup.string().required('Street address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    zipCode: yup.string().required('ZIP code is required').matches(/^[0-9]{6}$/, 'ZIP code must be 6 digits'),
  }).required(),
}).required();

type RegisterFormData = yup.InferType<typeof schema>;

const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      role: 'user',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData as RegisterData);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join us to start booking your favorite sports turfs
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('name')}
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                autoComplete="name"
                autoFocus
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('phone')}
                margin="normal"
                required
                fullWidth
                id="phone"
                label="Phone Number"
                autoComplete="tel"
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                {...register('email')}
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                autoComplete="email"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('password')}
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('confirmPassword')}
                margin="normal"
                required
                fullWidth
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" error={!!errors.role}>
                <InputLabel id="role-label">Account Type</InputLabel>
                <Select
                  {...register('role')}
                  labelId="role-label"
                  id="role"
                  label="Account Type"
                >
                  <MenuItem value="user">Sports Enthusiast</MenuItem>
                  <MenuItem value="owner">Turf Owner</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Address Fields */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Address Information
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                {...register('address.street')}
                margin="normal"
                required
                fullWidth
                id="street"
                label="Street Address"
                error={!!errors.address?.street}
                helperText={errors.address?.street?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('address.city')}
                margin="normal"
                required
                fullWidth
                id="city"
                label="City"
                error={!!errors.address?.city}
                helperText={errors.address?.city?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('address.state')}
                margin="normal"
                required
                fullWidth
                id="state"
                label="State"
                error={!!errors.address?.state}
                helperText={errors.address?.state?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                {...register('address.zipCode')}
                margin="normal"
                required
                fullWidth
                id="zipCode"
                label="ZIP Code"
                error={!!errors.address?.zipCode}
                helperText={errors.address?.zipCode?.message}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" variant="body2">
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage; 