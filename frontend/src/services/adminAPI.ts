// Admin API Service
import apiClient from './apiClient';
import { User, Artwork, Order, ApiResponse } from '../types';

export const adminAPI = {
  // User Management
  getUsers: async (params?: { 
    page?: number; 
    limit?: number; 
    role?: string;
    status?: string;
  }): Promise<{
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/users', { params });
    return response.data.data;
  },

  updateUserStatus: async (userId: string, status: string): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${userId}/status`, {
      status,
    });
    return response.data.data;
  },

  updateUserRole: async (userId: string, role: string): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${userId}/role`, {
      role,
    });
    return response.data.data;
  },

  // Artwork Management
  getArtworks: async (params?: { 
    page?: number; 
    limit?: number; 
    category?: string;
    status?: string;
  }): Promise<{
    artworks: Artwork[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/artworks', { params });
    return response.data.data;
  },

  updateArtwork: async (artworkId: string, artworkData: any): Promise<Artwork> => {
    const response = await apiClient.put<ApiResponse<Artwork>>(`/admin/artworks/${artworkId}`, artworkData);
    return response.data.data;
  },

  deleteArtwork: async (artworkId: string): Promise<void> => {
    await apiClient.delete(`/admin/artworks/${artworkId}`);
  },

  // Order Management
  getOrders: async (params?: { 
    page?: number; 
    limit?: number; 
    status?: string;
  }): Promise<{
    orders: Order[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/orders', { params });
    return response.data.data;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    const response = await apiClient.put<ApiResponse<Order>>(`/admin/orders/${orderId}/status`, {
      status,
    });
    return response.data.data;
  },

  // Analytics
  getAnalytics: async (): Promise<{
    totalUsers: number;
    totalArtists: number;
    totalCustomers: number;
    totalArtworks: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: Order[];
    monthlyStats: Array<{
      month: string;
      year: number;
      orders: number;
      revenue: number;
    }>;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/analytics');
    return response.data.data;
  },
};

export default adminAPI;
