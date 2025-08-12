import apiClient, { getFullImageUrl } from './api';
import { Artist } from '../types';

export const artistsAPI = {
  /**
   * Get all artists with pagination and search
   */
  getAllArtists: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    sort?: string;
  }): Promise<{ artists: Artist[]; total: number; totalPages: number; currentPage: number }> => {
    try {
      console.log('Fetching artists with params:', params);
      const response = await apiClient.get('/artists', { params });
      console.log('Artists response:', response.data);
      
      // Process image URLs
      const artists = response.data.artists.map((artist: Artist) => ({
        ...artist,
        profileImage: artist.profileImage ? getFullImageUrl(artist.profileImage) : null
      }));
      
      return {
        artists,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 0
      };
    } catch (error) {
      console.error("Error fetching artists:", error);
      throw error;
    }
  },
  
  /**
   * Get artist by ID
   */
  getArtistById: async (id: string): Promise<Artist> => {
    try {
      const response = await apiClient.get(`/artists/${id}`);
      const artist = response.data;
      
      // Process image URL
      if (artist.profileImage) {
        artist.profileImage = getFullImageUrl(artist.profileImage);
      }
      
      return artist;
    } catch (error) {
      console.error(`Error fetching artist with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get featured artists
   */
  getFeaturedArtists: async (): Promise<Artist[]> => {
    try {
      const response = await apiClient.get('/artists/featured');
      
      // Process image URLs
      const artists = response.data.artists.map((artist: Artist) => ({
        ...artist,
        profileImage: artist.profileImage ? getFullImageUrl(artist.profileImage) : null
      }));
      
      return artists;
    } catch (error) {
      console.error("Error fetching featured artists:", error);
      throw error;
    }
  }
};

export default artistsAPI;
