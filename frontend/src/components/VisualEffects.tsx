import React from 'react';
import { Box, keyframes } from '@mui/material';

// Keyframe animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

interface VisualEffectsProps {
  children: React.ReactNode;
  effect?: 'fadeInUp' | 'pulse' | 'float' | 'shimmer' | 'rotate';
  delay?: number;
  duration?: number;
  className?: string;
}

export const AnimatedBox: React.FC<VisualEffectsProps> = ({
  children,
  effect = 'fadeInUp',
  delay = 0,
  duration = 0.6,
  className
}) => {
  const getAnimation = () => {
    switch (effect) {
      case 'fadeInUp':
        return `${fadeInUp} ${duration}s ease-out ${delay}s both`;
      case 'pulse':
        return `${pulse} 2s ease-in-out infinite`;
      case 'float':
        return `${float} 3s ease-in-out infinite`;
      case 'shimmer':
        return `${shimmer} 2s linear infinite`;
      case 'rotate':
        return `${rotate} 20s linear infinite`;
      default:
        return `${fadeInUp} ${duration}s ease-out ${delay}s both`;
    }
  };

  return (
    <Box
      className={className}
      sx={{
        animation: getAnimation(),
        '&:hover': {
          transform: effect === 'rotate' ? 'scale(1.1)' : 'scale(1.02)',
          transition: 'transform 0.3s ease-in-out'
        }
      }}
    >
      {children}
    </Box>
  );
};

// Gradient background component
export const GradientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      {children}
    </Box>
  );
};

// Particle effect component
export const ParticleEffect: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden',
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          width: '4px',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '50%',
          animation: `${float} 6s ease-in-out infinite`
        },
        '&::before': {
          top: '20%',
          left: '10%',
          animationDelay: '0s'
        },
        '&::after': {
          top: '60%',
          right: '10%',
          animationDelay: '3s'
        }
      }}
    />
  );
};

// Glowing border component
export const GlowingBorder: React.FC<{ children: React.ReactNode; color?: string }> = ({ 
  children, 
  color = '#2e7d32' 
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          background: `linear-gradient(45deg, ${color}, transparent, ${color})`,
          borderRadius: 'inherit',
          zIndex: -1,
          animation: `${rotate} 3s linear infinite`,
          opacity: 0.7
        }
      }}
    >
      {children}
    </Box>
  );
};

// Shimmer loading effect
export const ShimmerEffect: React.FC<{ width?: string; height?: string }> = ({ 
  width = '100%', 
  height = '20px' 
}) => {
  return (
    <Box
      sx={{
        width,
        height,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200px 100%',
        animation: `${shimmer} 1.5s infinite`,
        borderRadius: 1
      }}
    />
  );
};

const VisualEffects = {
  AnimatedBox,
  GradientBackground,
  ParticleEffect,
  GlowingBorder,
  ShimmerEffect
};

export default VisualEffects; 