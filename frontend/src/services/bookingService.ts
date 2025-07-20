import axios from 'axios';
import { Booking, ApiResponse } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface CreateBookingData {
  turfId: string;
  date: string;
  startTime: string;
  endTime: string;
  specialRequests?: string;
}

export const bookingService = {
  async createBooking(bookingData: CreateBookingData): Promise<Booking> {
    const response = await api.post<Booking>('/bookings', bookingData);
    return response.data;
  },

  async getUserBookings(): Promise<Booking[]> {
    const response = await api.get<Booking[]>('/bookings/user');
    return response.data;
  },

  async getOwnerBookings(): Promise<Booking[]> {
    const response = await api.get<Booking[]>('/bookings/owner');
    return response.data;
  },

  async getBookingById(id: string): Promise<Booking> {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  async cancelBooking(id: string, reason?: string): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    const response = await api.put<Booking>(`/bookings/${id}/status`, { status });
    return response.data;
  },
}; 