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

const API_BASE_URL = 'https://backend-dev-ce5d.up.railway.app/api';
const DIRECT_API_URL = 'https://backend-dev-ce5d.up.railway.app';

// Utility function to construct full image URLs
export const getFullImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl; // Already a full URL
  }
  return `${DIRECT_API_URL}${imageUrl}`; // Construct full URL for relative paths
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token with automatic refresh
apiClient.interceptors.request.use(
  async (config) => {
    let token = TokenManager.getToken();
    
    // Check for auth inconsistency
    const appState = window.localStorage.getItem('app_state');
    if (appState) {
      try {
        const parsedState = JSON.parse(appState);
        if (parsedState.auth?.isAuthenticated === true && !token) {
          console.error('❌ Auth inconsistency detected in API request: Token missing but marked as authenticated');
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
          throw new Error('Auth inconsistency: Token missing but marked as authenticated');
        }
      } catch (err) {
        console.error('Error parsing app state:', err);
      }
    }
    
    if (token) {
      // Check if token is expired and try to refresh
      if (!TokenManager.isTokenValid(token)) {
        console.log('🔄 Token expired in request interceptor, attempting refresh...');
        try {
          const refreshedToken = await tokenRefreshService.refreshAccessToken();
          if (refreshedToken) {
            token = refreshedToken;
            console.log('✅ Token refreshed in request interceptor');
          } else {
            console.warn('❌ Token refresh failed in request interceptor');
            TokenManager.clearTokens();
            token = null;
          }
        } catch (error) {
          console.error('❌ Token refresh error in request interceptor:', error);
          TokenManager.clearTokens();
          token = null;
        }
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header set:', `Bearer ${token.substring(0, 15)}...`);
      }
    } else {
      console.warn('No token found for API request');
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
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.error('API Error Response:', error.response);
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('🔄 401 error, attempting token refresh...');
      
      try {
        const refreshedToken = await tokenRefreshService.refreshAccessToken();
        if (refreshedToken) {
          console.log('✅ Token refreshed, retrying original request');
          // Update the authorization header and retry
          originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        TokenManager.clearTokens();
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
        return Promise.reject(refreshError);
      }
    } else if (error.response?.status === 401) {
      console.error('401 Unauthorized error after retry. Redirecting to login.');
      TokenManager.clearTokens();
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      console.error('403 Forbidden error. User lacks required permissions.');
      toast.error('Access denied. Insufficient permissions.');
      
      // Show detailed error if available
      if (error.response?.data?.message) {
        toast.error(`Access denied: ${error.response.data.message}`);
      }
    } else if (error.response?.status >= 500) {
      console.error('500+ Server error:', error.response.data);
      toast.error('Server error. Please try again later.');
    } else if (error.message === 'Network Error') {
      console.error('Network error - API server may be down');
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  register: async (userData: RegisterData): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/auth/register',
      userData
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  verifyToken: async (token: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },
};

// Artwork API
export const artworkAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    artistId?: string;
  }): Promise<{ artworks: Artwork[]; total: number; totalPages: number }> => {
    try {
      // Don't adjust page index - backend expects 1-based pagination
      console.log('Fetching artworks with params:', params);
      const response = await apiClient.get('/artworks', { params });
      console.log('API Response:', response.data);
      
      // Direct response structure from our controller (no wrapping)
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.artworks)) {
          console.log('Standard response structure detected');
          return response.data;
        }
        // Wrapped response in data property (API standard pattern)
        else if (response.data.data && Array.isArray(response.data.data.artworks)) {
          console.log('Wrapped response structure detected');
          return response.data.data;
        }
        // The response itself might be the artworks array
        else if (Array.isArray(response.data)) {
          console.log('Array response structure detected');
          return { 
            artworks: response.data, 
            total: response.data.length, 
            totalPages: 1 
          };
        }
      }
      
      // Log unexpected structure for debugging
      console.warn('Could not parse artworks from response:', response.data);
      
      // Default return for any other cases
      return { 
        artworks: [], 
        total: 0, 
        totalPages: 0 
      };
    } catch (error) {
      console.error("Error fetching artworks:", error);
      return { 
        artworks: [], 
        total: 0, 
        totalPages: 0 
      };
    }
  },

  getById: async (id: string): Promise<Artwork> => {
    try {
      // Try to get artwork from our backend first
      const response = await apiClient.get(`/artworks/${id}`);
      if (response.data) {
        return response.data.data || response.data;
      }
    } catch (error) {
      console.error("Error fetching artwork:", error);
    }
    
    // Fallback to placeholder data if backend fails or doesn't return expected data
    return {
      id: id,
      title: "Artwork Title",
      description: "This artwork is currently unavailable",
      price: 0,
      category: "unknown",
      medium: "Unknown",
      images: ["https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg"],
      tags: ["art"],
      isAvailable: false,
      artistId: "unknown",
      artist: { id: "unknown", firstName: "Artist", lastName: "Unknown" },
      dimensions: { width: 0, height: 0 },
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  create: async (artworkData: FormData): Promise<Artwork> => {
    const response = await apiClient.post<ApiResponse<Artwork>>('/artworks', artworkData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  update: async (id: string, artworkData: Partial<Artwork>): Promise<Artwork> => {
    const response = await apiClient.put<ApiResponse<Artwork>>(`/artworks/${id}`, artworkData);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/artworks/${id}`);
  },

  getByArtist: async (artistId: string): Promise<{artworks: Artwork[], total: number, totalPages: number}> => {
    const response = await apiClient.get<{artworks: Artwork[], total: number, totalPages: number}>(`/artworks/artist/${artistId}`);
    return response.data;
  },
};

// Cart API
export const cartAPI = {
  add: async (artworkId: string, quantity: number = 1): Promise<CartItem> => {
    const response = await apiClient.post<ApiResponse<CartItem>>('/cart/add', {
      artworkId,
      quantity,
    });
    return response.data.data;
  },

  getItems: async (): Promise<CartItem[]> => {
    const response = await apiClient.get<ApiResponse<CartItem[]>>('/cart');
    return response.data.data;
  },

  updateQuantity: async (itemId: string, quantity: number): Promise<CartItem> => {
    const response = await apiClient.put<ApiResponse<CartItem>>(`/cart/${itemId}`, { quantity });
    return response.data.data;
  },

  remove: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/cart/${itemId}`);
  },

  clear: async (): Promise<void> => {
    await apiClient.delete('/cart/clear');
  },
};

// Wishlist API
export const wishlistAPI = {
  add: async (artworkId: string): Promise<WishlistItem> => {
    const response = await apiClient.post<ApiResponse<WishlistItem>>('/wishlist/add', {
      artworkId,
    });
    return response.data.data;
  },

  getItems: async (): Promise<WishlistItem[]> => {
    const response = await apiClient.get<ApiResponse<WishlistItem[]>>('/wishlist');
    return response.data.data;
  },

  remove: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/wishlist/${itemId}`);
  },
};

// Order API
export const orderAPI = {
  create: async (orderData: {
    items: { artworkId: string; quantity: number }[];
    shippingAddress: any;
    paymentMethod: string;
  }): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', orderData);
    return response.data.data;
  },

  getAll: async (params?: { page?: number; limit?: number }): Promise<{ orders: Order[]; total: number }> => {
    const response = await apiClient.get<ApiResponse<{ orders: Order[]; total: number }>>(
      '/orders',
      { params }
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data.data;
  },

  updateStatus: async (id: string, status: string): Promise<Order> => {
    const response = await apiClient.put<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return response.data.data;
  },
};

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
    const response = await apiClient.get<Review[]>(`/reviews/artwork/${artworkId}`);
    return response.data;
  },

  update: async (id: string, reviewData: { rating: number; comment: string }): Promise<Review> => {
    const response = await apiClient.put<ApiResponse<Review>>(`/reviews/${id}`, reviewData);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },
};

// Admin API
export const adminAPI = {
  getUsers: async (params?: { page?: number; limit?: number; role?: string }): Promise<{
    users: User[];
    total: number;
  }> => {
    const response = await apiClient.get<ApiResponse<{ users: User[]; total: number }>>(
      '/admin/users',
      { params }
    );
    return response.data.data;
  },

  updateUserStatus: async (userId: string, status: string): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${userId}/status`, {
      status,
    });
    return response.data.data;
  },

  getAnalytics: async (): Promise<{
    totalUsers: number;
    totalArtworks: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: Order[];
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/analytics');
    return response.data.data;
  },
};

export default apiClient;