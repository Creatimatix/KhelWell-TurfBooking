import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { SportsSoccer } from '@mui/icons-material';

interface LogoProps {
  variant?: 'default' | 'compact' | 'text-only' | 'menu';
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
        return { icon: 24, text: 'h6', logoHeight: 28 };
      case 'large':
        return { icon: 48, text: 'h3', logoHeight: 56 };
      default:
        return { icon: 32, text: 'h5', logoHeight: 40 };
    }
  };

  const { icon, text, logoHeight } = getSize();
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
          letterSpacing: '0.5px',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        KhelWell
      </Typography>
    );
  }

  if (variant === 'menu') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* Khelo India Logo */}
        <Box
          component="img"
          src="/khelo-india-logo.svg"
          alt="Khelo India"
          sx={{
            height: logoHeight,
            width: 'auto',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05) rotate(5deg)'
            }
          }}
        />
        
        {/* Divider */}
        <Box
          sx={{
            width: 2,
            height: logoHeight * 0.6,
            background: `linear-gradient(180deg, ${logoColor} 0%, transparent 100%)`,
            borderRadius: 1,
            opacity: 0.7
          }}
        />
        
        {/* Brand Name */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography 
            variant={text as any} 
            component="div"
            sx={{ 
              fontWeight: 'bold',
              color: logoColor,
              fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
              letterSpacing: '0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              lineHeight: 1.1
            }}
          >
            KhelWell
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontStyle: 'italic',
              letterSpacing: '0.3px',
              opacity: 0.8
            }}
          >
            Your Game. Your Journey.
          </Typography>
        </Box>
      </Box>
    );
  }

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SportsSoccer 
          sx={{ 
            fontSize: icon, 
            color: logoColor,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1) rotate(10deg)'
            }
          }} 
        />
        <Typography 
          variant={text as any} 
          component="div"
          sx={{ 
            fontWeight: 'bold',
            color: logoColor,
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            letterSpacing: '0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1) rotate(10deg)'
            }
          }} 
        />
        <Typography 
          variant={text as any} 
          component="div"
          sx={{ 
            fontWeight: 'bold',
            color: logoColor,
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            letterSpacing: '0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
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