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
import Logo from './Logo';
import { AnimatedBox } from './VisualEffects';
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
            sx={{ 
              mr: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
          >
            Turfs
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/events')}
            sx={{ 
              mr: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
          >
            Events
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/login')}
            sx={{ 
              mr: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/register')}
            sx={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255,255,255,0.3)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
              }
            }}
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
          sx={{ 
            mr: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(255,255,255,0.1)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }
          }}
        >
          Turfs
        </Button>
        <Button
          color="inherit"
          onClick={() => navigate('/events')}
          sx={{ 
            mr: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(255,255,255,0.1)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }
          }}
        >
          Events
        </Button>
        <Button
          color="inherit"
          onClick={() => navigate(getDashboardPath())}
          sx={{ 
            mr: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(255,255,255,0.1)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }
          }}
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
          sx={{
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              background: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          <Avatar sx={{ 
            width: 32, 
            height: 32,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}>
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
      <AppBar 
        position="static"
        sx={{
          background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Toolbar>
          <Box
            sx={{ 
              flexGrow: 1, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
            onClick={() => navigate('/')}
          >
            <Logo variant="menu" size="medium" />
          </Box>

          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(90deg)',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
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
                PaperProps={{
                  sx: {
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                  }
                }}
              >
                {renderMobileMenu()}
              </Menu>
            </>
          ) : (
            <AnimatedBox effect="fadeInUp" delay={0.2}>
              {renderNavigationItems()}
            </AnimatedBox>
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
            PaperProps={{
              sx: {
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }
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
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(46, 125, 50, 0.05) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2024 KhelWell. Your Game. Your Journey. All in One Place.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 