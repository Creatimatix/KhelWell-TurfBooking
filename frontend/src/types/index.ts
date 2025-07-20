export interface User {
  _id: string;
  id?: number; // For backend compatibility
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'owner' | 'admin';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Turf {
  _id: string;
  name: string;
  owner: User;
  description: string;
  sportType: 'football' | 'cricket' | 'tennis' | 'basketball' | 'badminton' | 'volleyball' | 'multi-sport';
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  amenities: string[];
  size?: {
    length: number;
    width: number;
    unit: 'meters' | 'feet';
  };
  surface: 'natural_grass' | 'artificial_grass' | 'clay' | 'hard_court' | 'synthetic';
  slots?: Slot[];
  pricing: {
    hourlyRate: number;
    currency: string;
  };
  operatingHours?: {
    openTime: string;
    closeTime: string;
    daysOpen: string[];
  };
  rating: {
    average: number;
    count: number;
  };
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  startTime: string;
  endTime: string;
  price: number;
  isAvailable: boolean;
}

export interface Booking {
  _id: string;
  user: User;
  turf: Turf;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'online' | 'card';
  paymentId?: string;
  specialRequests?: string;
  cancellationReason?: string;
  cancelledBy?: 'user' | 'owner' | 'admin';
  cancelledAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  formattedDate?: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  image?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  sportType: 'football' | 'cricket' | 'tennis' | 'basketball' | 'badminton' | 'volleyball' | 'multi-sport' | 'general';
  type: 'tournament' | 'championship' | 'league' | 'exhibition' | 'training' | 'other';
  entryFee: number;
  maxParticipants?: number;
  currentParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  createdBy: User;
  registrationDeadline?: string;
  prizes?: Array<{
    position: string;
    prize: string;
  }>;
  rules?: string[];
  contactInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  isOngoing?: boolean;
  isUpcoming?: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: 'user' | 'owner';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface SearchFilters {
  city?: string;
  sportType?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
} 