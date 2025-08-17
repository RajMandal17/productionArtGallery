import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import {
  User,
  Artist,
  Artwork,
  Order,
  Review,
  LoginCredentials,
  RegisterData,
  ApiResponse,
  CartItem,
  WishlistItem,
  LoginResponse,
} from '../types';
import TokenManager from '../utils/tokenManager';
import tokenRefreshService from './tokenRefresh';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const DIRECT_API_URL = process.env.REACT_APP_DIRECT_URL || 'http://localhost:8080';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  async (config) => {
    let token = TokenManager.getToken();
    
    // Check for auth inconsistency
    const appState = window.localStorage.getItem('app_state');
    if (appState) {
      try {
        const parsedState = JSON.parse(appState);
        if (parsedState.auth?.isAuthenticated === true && !token) {
          console.error('❌ Auth inconsistency detected in API request');
          setTimeout(() => { window.location.href = '/login'; }, 100);
          throw new Error('Auth inconsistency: Token missing but marked as authenticated');
        }
      } catch (err) {
        console.error('Error parsing app state:', err);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log secured requests
    if (config.url?.includes('/dashboard') || 
        config.url?.includes('/artworks') ||
        config.url?.includes('/orders') ||
        config.url?.includes('/auth/verify')) {
      console.log(`Secured request to ${config.url} with auth:`, !!token);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      TokenManager.clearTokens();
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied. Insufficient permissions.');
    }
    return Promise.reject(error);
  }
);

// Review API
export const reviewAPI = {
  create: async (reviewData: {
    artworkId: string;
    rating: number;
    comment: string;
  }): Promise<Review> => {
    const response = await apiClient.post<ApiResponse<Review>>('/reviews', reviewData);
    return response.data.data;
  },

  getByArtwork: async (artworkId: string): Promise<Review[]> => {
    try {
      console.log(`Fetching reviews for artwork: ${artworkId}`);
      const response = await apiClient.get(`/reviews/artwork/${artworkId}`);
      console.log('Review API Response:', response.data);
      
      // Handle different response formats
      if (response.data && typeof response.data === 'object') {
        // If it's the structured format with reviews property
        if (Array.isArray(response.data.reviews)) {
          return response.data.reviews;
        }
        // If the response itself is the array
        if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      console.warn('Unexpected review response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching artwork reviews:', error);
      return [];
    }
  },

  update: async (id: string, reviewData: { rating: number; comment: string }): Promise<Review> => {
    const response = await apiClient.put<ApiResponse<Review>>(`/reviews/${id}`, reviewData);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },
};

// Export other APIs...

export default apiClient;
