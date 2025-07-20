import axios from 'axios';
import { Turf, SearchFilters, ApiResponse } from '../types';

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

export const turfService = {
  async getTurfs(filters?: SearchFilters): Promise<ApiResponse<Turf[]>> {
    const response = await api.get<ApiResponse<Turf[]>>('/turfs', { params: filters });
    return response.data;
  },

  async getTurfById(id: string): Promise<Turf> {
    const response = await api.get<Turf>(`/turfs/${id}`);
    return response.data;
  },

  async searchTurfs(filters: SearchFilters): Promise<ApiResponse<Turf[]>> {
    const response = await api.get<ApiResponse<Turf[]>>('/turfs/search', { params: filters });
    return response.data;
  },

  async getTurfsByOwner(): Promise<Turf[]> {
    const response = await api.get<Turf[]>('/turfs/owner');
    return response.data;
  },

  async createTurf(turfData: Partial<Turf>): Promise<Turf> {
    const response = await api.post<Turf>('/turfs', turfData);
    return response.data;
  },

  async updateTurf(id: string, turfData: Partial<Turf>): Promise<Turf> {
    const response = await api.put<Turf>(`/turfs/${id}`, turfData);
    return response.data;
  },

  async deleteTurf(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/turfs/${id}`);
    return response.data;
  },
}; 