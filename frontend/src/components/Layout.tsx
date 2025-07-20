import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  SportsSoccer,
  Dashboard,
  BookOnline,
  Event,
  Person,
  Logout,
} from '@mui/icons-material';
import NotificationBell from './NotificationBell';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'user':
        return '/user/dashboard';
      case 'owner':
        return '/owner/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderNavigationItems = () => {
    if (!user) {
      return (
        <>
          <Button
            color="inherit"
            onClick={() => navigate('/turfs')}
            sx={{ mr: 2 }}
          >
            Turfs
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/events')}
            sx={{ mr: 2 }}
          >
            Events
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/login')}
            sx={{ mr: 1 }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </>
      );
    }

    return (
      <>
        <Button
          color="inherit"
          onClick={() => navigate('/turfs')}
          sx={{ mr: 2 }}
        >
          Turfs
        </Button>
        <Button
          color="inherit"
          onClick={() => navigate('/events')}
          sx={{ mr: 2 }}
        >
          Events
        </Button>
        <Button
          color="inherit"
          onClick={() => navigate(getDashboardPath())}
          sx={{ mr: 2 }}
        >
          Dashboard
        </Button>
        <NotificationBell />
        <IconButton
          size="large"
          edge="end"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleProfileMenuOpen}
          color="inherit"
        >
          <Avatar sx={{ width: 32, height: 32 }}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
      </>
    );
  };

  const renderMobileMenu = () => {
    if (!user) {
      return (
        <>
          <MenuItem onClick={() => { navigate('/turfs'); handleMenuClose(); }}>
            <SportsSoccer sx={{ mr: 1 }} />
            Turfs
          </MenuItem>
          <MenuItem onClick={() => { navigate('/events'); handleMenuClose(); }}>
            <Event sx={{ mr: 1 }} />
            Events
          </MenuItem>
          <MenuItem onClick={() => { navigate('/login'); handleMenuClose(); }}>
            <Person sx={{ mr: 1 }} />
            Login
          </MenuItem>
          <MenuItem onClick={() => { navigate('/register'); handleMenuClose(); }}>
            <Person sx={{ mr: 1 }} />
            Register
          </MenuItem>
        </>
      );
    }

    const menuItems: Array<{
      label: string;
      icon: React.ReactElement;
      path?: string;
      action?: () => void;
    }> = [
      {
        label: 'Turfs',
        icon: <SportsSoccer sx={{ mr: 1 }} />,
        path: '/turfs'
      },
      {
        label: 'Events',
        icon: <Event sx={{ mr: 1 }} />,
        path: '/events'
      },
      {
        label: 'Dashboard',
        icon: <Dashboard sx={{ mr: 1 }} />,
        path: getDashboardPath()
      }
    ];

    // Add role-specific menu items
    if (user && user.role === 'user') {
      menuItems.push(
        {
          label: 'My Bookings',
          icon: <BookOnline sx={{ mr: 1 }} />,
          path: '/user/bookings'
        },
        {
          label: 'Profile',
          icon: <Person sx={{ mr: 1 }} />,
          path: '/user/profile'
        }
      );
    } else if (user && user.role === 'owner') {
      menuItems.push(
        {
          label: 'My Turfs',
          icon: <SportsSoccer sx={{ mr: 1 }} />,
          path: '/owner/turfs'
        },
        {
          label: 'Bookings',
          icon: <BookOnline sx={{ mr: 1 }} />,
          path: '/owner/bookings'
        }
      );
    } else if (user && user.role === 'admin') {
      menuItems.push(
        {
          label: 'Users',
          icon: <Person sx={{ mr: 1 }} />,
          path: '/admin/users'
        },
        {
          label: 'Turfs',
          icon: <SportsSoccer sx={{ mr: 1 }} />,
          path: '/admin/turfs'
        },
        {
          label: 'Events',
          icon: <Event sx={{ mr: 1 }} />,
          path: '/admin/events'
        }
      );
    }

    menuItems.push({
      label: 'Logout',
      icon: <Logout sx={{ mr: 1 }} />,
      action: handleLogout
    });

    return (
      <>
        {menuItems.map((item, index) => (
          <MenuItem 
            key={index}
            onClick={() => { 
              if (item.action) {
                item.action();
              } else {
                navigate(item.path!);
              }
              handleMenuClose(); 
            }}
          >
            {item.icon}
            {item.label}
          </MenuItem>
        ))}
      </>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <SportsSoccer sx={{ mr: 1, verticalAlign: 'middle' }} />
            Turf Booking
          </Typography>

          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileMenuAnchor}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {renderMobileMenu()}
              </Menu>
            </>
          ) : (
            renderNavigationItems()
          )}

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {user && user.role === 'user' && (
              <>
                <MenuItem onClick={() => { navigate('/user/bookings'); handleMenuClose(); }}>
                  <BookOnline sx={{ mr: 1 }} />
                  My Bookings
                </MenuItem>
                <MenuItem onClick={() => { navigate('/user/profile'); handleMenuClose(); }}>
                  <Person sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
              </>
            )}
            {user && user.role === 'owner' && (
              <>
                <MenuItem onClick={() => { navigate('/owner/turfs'); handleMenuClose(); }}>
                  <SportsSoccer sx={{ mr: 1 }} />
                  My Turfs
                </MenuItem>
                <MenuItem onClick={() => { navigate('/owner/bookings'); handleMenuClose(); }}>
                  <BookOnline sx={{ mr: 1 }} />
                  Bookings
                </MenuItem>
              </>
            )}
            {user && user.role === 'admin' && (
              <>
                <MenuItem onClick={() => { navigate('/admin/users'); handleMenuClose(); }}>
                  <Person sx={{ mr: 1 }} />
                  Users
                </MenuItem>
                <MenuItem onClick={() => { navigate('/admin/turfs'); handleMenuClose(); }}>
                  <SportsSoccer sx={{ mr: 1 }} />
                  Turfs
                </MenuItem>
                <MenuItem onClick={() => { navigate('/admin/events'); handleMenuClose(); }}>
                  <Event sx={{ mr: 1 }} />
                  Events
                </MenuItem>
              </>
            )}
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2024 Turf Booking. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 