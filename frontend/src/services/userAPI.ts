import apiClient from './api';
import { User } from '../types';

export const userAPI = {
  // Get the current user's profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/users/profile');
    return response.data;
  },

  // Update the user's profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>('/api/users/profile', userData);
    return response.data;
  },

  // Update profile with image
  updateProfileWithImage: async (formData: FormData): Promise<string> => {
    const response = await apiClient.post<string>('/api/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Backend returns image URL as string, not full user object
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.put<{ status: string, message: string }>('/api/users/password', {
      oldPassword,
      newPassword,
    });
    return { message: response.data.message };
  },
};

export default userAPI;
