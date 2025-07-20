import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  SportsSoccer as SportsIcon,
  Cake as CakeIcon,
  Wc as GenderIcon,
  PhotoCamera as CameraIcon
} from '@mui/icons-material';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  profile_image?: string;
  interested_sports?: string[];
  bio?: string;
  date_of_birth?: string;
  gender?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Available sports options
  const sportsOptions = [
    'Cricket', 'Football', 'Tennis', 'Basketball', 'Badminton', 
    'Hockey', 'Volleyball', 'Table Tennis', 'Squash', 'Rugby',
    'Baseball', 'Golf', 'Swimming', 'Athletics', 'Boxing'
  ];

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch('http://localhost:5001/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch user profile');
      }

      const data = await response.json();
      
      // Validate and clean the user data
      const validatedUser = {
        ...data.user,
        address_street: data.user.address_street || '',
        address_city: data.user.address_city || '',
        address_state: data.user.address_state || '',
        address_zip_code: data.user.address_zip_code || '',
        profile_image: data.user.profile_image || '',
        phone: data.user.phone || '',
        is_verified: data.user.is_verified || false,
        is_active: data.user.is_active || true
      };
      
      setUser(validatedUser);
      setEditForm(validatedUser);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(user || {});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(user || {});
    setError(null);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaveLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      
      // Validate and clean the updated user data
      const validatedUser = {
        ...data.user,
        address_street: data.user.address_street || '',
        address_city: data.user.address_city || '',
        address_state: data.user.address_state || '',
        address_zip_code: data.user.address_zip_code || '',
        profile_image: data.user.profile_image || '',
        phone: data.user.phone || '',
        is_verified: data.user.is_verified || false,
        is_active: data.user.is_active || true
      };
      
      setUser(validatedUser);
      setEditForm(validatedUser);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const formatPhone = (value: string) => {
    // Remove all non-digits except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +91
    if (!cleaned.startsWith('+91')) {
      return '+91 ' + cleaned.replace('+91', '');
    }
    
    // Remove +91 and get the number part
    const numberPart = cleaned.replace('+91', '');
    
    // Format Indian phone number: +91 99999 99999
    if (numberPart.length <= 5) {
      return '+91 ' + numberPart;
    } else if (numberPart.length <= 10) {
      return '+91 ' + numberPart.slice(0, 5) + ' ' + numberPart.slice(5);
    } else {
      return '+91 ' + numberPart.slice(0, 5) + ' ' + numberPart.slice(5, 10);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: keyof User, value: string | string[]) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box>
        <Alert severity="error">Failed to load user profile</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <Box position="relative">
              <Avatar
                src={imagePreview || user.profile_image}
                sx={{ width: 80, height: 80, mr: 2 }}
              >
                <PersonIcon fontSize="large" />
              </Avatar>
              {isEditing && (
                <Box
                  position="absolute"
                  bottom={0}
                  right={8}
                  sx={{
                    backgroundColor: 'primary.main',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  }}
                >
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="profile-image-upload"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="profile-image-upload">
                    <CameraIcon sx={{ color: 'white', fontSize: 16, cursor: 'pointer' }} />
                  </label>
                </Box>
              )}
            </Box>
            <Box flex={1}>
              <Typography variant="h5" gutterBottom>
                {user.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={user.role}
                  color="primary"
                  size="small"
                />
                {user.is_verified && (
                  <Chip
                    label="Verified"
                    color="success"
                    size="small"
                  />
                )}
              </Box>
            </Box>
            {!isEditing && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit Profile
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={2}>
                <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
              </Box>
              {isEditing ? (
                <TextField
                  fullWidth
                  value={editForm.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  type="email"
                  size="small"
                />
              ) : (
                <Typography variant="body1">{user.email}</Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={2}>
                <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
              </Box>
              {isEditing ? (
                <TextField
                  fullWidth
                  value={editForm.phone || ''}
                  onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                  placeholder="+91 99999 99999"
                  size="small"
                />
              ) : (
                <Typography variant="body1">{user.phone || 'Not provided'}</Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" alignItems="center" mb={2}>
                <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
              </Box>
              {isEditing ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={editForm.address_street || ''}
                      onChange={(e) => handleInputChange('address_street', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="City"
                      value={editForm.address_city || ''}
                      onChange={(e) => handleInputChange('address_city', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="State"
                      value={editForm.address_state || ''}
                      onChange={(e) => handleInputChange('address_state', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      value={editForm.address_zip_code || ''}
                      onChange={(e) => handleInputChange('address_zip_code', e.target.value)}
                      size="small"
                    />
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body1">
                  {user.address_street}, {user.address_city}, {user.address_state} {user.address_zip_code}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" alignItems="center" mb={2}>
                <SportsIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Interested Sports
                </Typography>
              </Box>
              {isEditing ? (
                <FormControl fullWidth size="small">
                  <Select
                    multiple
                    value={editForm.interested_sports || []}
                    onChange={(e) => handleInputChange('interested_sports', e.target.value as string[])}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {sportsOptions.map((sport) => (
                      <MenuItem key={sport} value={sport}>
                        {sport}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {user.interested_sports && user.interested_sports.length > 0 ? (
                    user.interested_sports.map((sport) => (
                      <Chip key={sport} label={sport} size="small" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No sports selected
                    </Typography>
                  )}
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Bio
                </Typography>
              </Box>
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={editForm.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  size="small"
                />
              ) : (
                <Typography variant="body1">
                  {user.bio || 'No bio provided'}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={2}>
                <CakeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Date of Birth
                </Typography>
              </Box>
              {isEditing ? (
                <TextField
                  fullWidth
                  type="date"
                  value={editForm.date_of_birth || ''}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              ) : (
                <Typography variant="body1">
                  {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not provided'}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={2}>
                <GenderIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Gender
                </Typography>
              </Box>
              {isEditing ? (
                <FormControl fullWidth size="small">
                  <Select
                    value={editForm.gender || ''}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    {genderOptions.map((gender) => (
                      <MenuItem key={gender} value={gender}>
                        {gender}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Typography variant="body1">
                  {user.gender || 'Not specified'}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Member Since
              </Typography>
              <Typography variant="body1">
                {new Date(user.created_at).toLocaleDateString()}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Account Status
              </Typography>
              <Chip
                label={user.is_active ? 'Active' : 'Inactive'}
                color={user.is_active ? 'success' : 'error'}
                size="small"
              />
            </Grid>
          </Grid>

          {isEditing && (
            <Box display="flex" gap={2} mt={3}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saveLoading}
              >
                {saveLoading ? <CircularProgress size={20} /> : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={saveLoading}
              >
                Cancel
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserProfile; 