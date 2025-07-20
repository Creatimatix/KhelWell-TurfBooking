import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { SportsSoccer } from '@mui/icons-material';

interface LogoProps {
  variant?: 'default' | 'compact' | 'text-only';
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'default', 
  size = 'medium',
  color 
}) => {
  const theme = useTheme();
  
  const getSize = () => {
    switch (size) {
      case 'small':
        return { icon: 24, text: 'h6' };
      case 'large':
        return { icon: 48, text: 'h3' };
      default:
        return { icon: 32, text: 'h5' };
    }
  };

  const { icon, text } = getSize();
  const logoColor = color || theme.palette.primary.main;

  if (variant === 'text-only') {
    return (
      <Typography 
        variant={text as any} 
        component="div"
        sx={{ 
          fontWeight: 'bold',
          color: logoColor,
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          letterSpacing: '0.5px'
        }}
      >
        KhelWell
      </Typography>
    );
  }

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SportsSoccer 
          sx={{ 
            fontSize: icon, 
            color: logoColor,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }} 
        />
        <Typography 
          variant={text as any} 
          component="div"
          sx={{ 
            fontWeight: 'bold',
            color: logoColor,
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            letterSpacing: '0.5px'
          }}
        >
          KhelWell
        </Typography>
      </Box>
    );
  }

  // Default variant with tagline
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <SportsSoccer 
          sx={{ 
            fontSize: icon, 
            color: logoColor,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }} 
        />
        <Typography 
          variant={text as any} 
          component="div"
          sx={{ 
            fontWeight: 'bold',
            color: logoColor,
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            letterSpacing: '0.5px'
          }}
        >
          KhelWell
        </Typography>
      </Box>
      <Typography 
        variant="caption" 
        sx={{ 
          color: theme.palette.text.secondary,
          fontStyle: 'italic',
          letterSpacing: '0.3px'
        }}
      >
        Your Game. Your Journey. All in One Place.
      </Typography>
    </Box>
  );
};

export default Logo; 