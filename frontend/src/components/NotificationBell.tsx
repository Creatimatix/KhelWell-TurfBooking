import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  isRead?: boolean;
  created_at: string;
  booking?: {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
  };
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Validate and clean notification data
        const validatedNotifications = (data.data || []).map((notification: any) => ({
          id: notification._id || notification.id || 0,
          title: notification.title || 'Notification',
          message: notification.message || '',
          type: notification.type || 'general',
          is_read: notification.isRead || notification.is_read || false,
          created_at: notification.createdAt || notification.created_at || new Date().toISOString(),
          booking: notification.booking ? {
            id: typeof notification.booking === 'object' ? notification.booking.id : notification.booking,
            date: typeof notification.booking === 'object' ? notification.booking.date : '',
            start_time: typeof notification.booking === 'object' ? notification.booking.start_time : '',
            end_time: typeof notification.booking === 'object' ? notification.booking.end_time : '',
            status: typeof notification.booking === 'object' ? notification.booking.status : ''
          } : undefined
        }));
        
        setNotifications(validatedNotifications);
        setUnreadCount(validatedNotifications.filter((n: Notification) => n.id && n.title && !(n.is_read || n.isRead)).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = async (notificationId: number) => {
    if (!notificationId) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5001/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, is_read: true, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
        return <CheckCircleIcon color="success" />;
      case 'booking_cancelled':
        return <CancelIcon color="error" />;
      case 'booking_reminder':
        return <ScheduleIcon color="warning" />;
      case 'event_notification':
        return <EventIcon color="info" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
        return 'success';
      case 'booking_cancelled':
        return 'error';
      case 'booking_reminder':
        return 'warning';
      case 'event_notification':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatNotificationTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else {
        return format(date, 'MMM dd, yyyy');
      }
    } catch (error) {
      return 'Recently';
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={unreadCount > 0 ? unreadCount : undefined} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500
          }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.filter(n => n.id && n.title).length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <>
            {notifications.filter(n => n.id && n.title).slice(0, 10).map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                sx={{
                  backgroundColor: (notification.is_read || notification.isRead) ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected'
                  }
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" component="span">
                        {notification.title}
                      </Typography>
                      <Chip
                        label={getNotificationColor(notification.type)}
                        size="small"
                        color={getNotificationColor(notification.type) as any}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {notification.message}
                      </Typography>
                      {notification.booking && (
                        <Typography variant="caption" color="textSecondary">
                          {(() => {
                            try {
                              const date = new Date(notification.booking.date);
                              if (isNaN(date.getTime())) {
                                return 'Date not available';
                              }
                              return `${format(date, 'MMM dd, yyyy')} at ${(notification.booking.start_time || '').slice(0, 5)}`;
                            } catch (error) {
                              return 'Date not available';
                            }
                          })()}
                        </Typography>
                      )}
                      <Typography variant="caption" display="block" color="textSecondary">
                        {formatNotificationTime(notification.created_at)}
                      </Typography>
                    </Box>
                  }
                />
              </MenuItem>
            ))}

            {notifications.length > 10 && (
              <MenuItem>
                <Typography variant="body2" color="primary">
                  View all notifications
                </Typography>
              </MenuItem>
            )}

            {unreadCount > 0 && (
              <>
                <Divider />
                <MenuItem onClick={markAllAsRead}>
                  <ListItemIcon>
                    <ClearIcon />
                  </ListItemIcon>
                  <ListItemText primary="Mark all as read" />
                </MenuItem>
              </>
            )}
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell; 