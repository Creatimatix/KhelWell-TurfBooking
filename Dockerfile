# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm run install-all

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install only production dependencies
RUN npm install --only=production
RUN cd backend && npm install --only=production

# Copy built frontend
COPY --from=builder /app/frontend/build ./frontend/build

# Copy backend source
COPY backend ./backend

# Expose port
EXPOSE 5001

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"] 