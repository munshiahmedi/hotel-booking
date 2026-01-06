// src/services/wishlist.service.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface WishlistItem {
  id: number;
  user_id: number;
  hotel_id: number;
  hotel_name: string;
  hotel_image?: string;
  hotel_price: number;
  hotel_rating: number;
  hotel_location: string;
  created_at: string;
}

export interface WishlistResponse {
  success: boolean;
  data: WishlistItem[];
  message?: string;
}

export interface WishlistActionResponse {
  success: boolean;
  message: string;
  data?: WishlistItem;
}

class WishlistService {
  // Get user's wishlist (using localStorage for now)
  async getWishlist(): Promise<WishlistResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      // For now, use localStorage as mock backend
      const userId = this.getUserIdFromToken(token);
      const wishlistData = localStorage.getItem(`wishlist_${userId}`);
      const wishlist: WishlistItem[] = wishlistData ? JSON.parse(wishlistData) : [];

      return {
        success: true,
        data: wishlist
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch wishlist');
    }
  }

  // Add hotel to wishlist
  async addToWishlist(hotelId: number): Promise<WishlistActionResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const userId = this.getUserIdFromToken(token);
      const wishlistData = localStorage.getItem(`wishlist_${userId}`);
      const wishlist: WishlistItem[] = wishlistData ? JSON.parse(wishlistData) : [];

      // Check if already in wishlist
      if (wishlist.some(item => item.hotel_id === hotelId)) {
        return {
          success: false,
          message: 'Hotel already in wishlist'
        };
      }

      // Create new wishlist item (mock data for hotel details)
      const newItem: WishlistItem = {
        id: Date.now(),
        user_id: userId,
        hotel_id: hotelId,
        hotel_name: `Hotel ${hotelId}`, // In real app, fetch from hotel API
        hotel_image: `https://picsum.photos/seed/hotel${hotelId}/300/200.jpg`,
        hotel_price: Math.floor(Math.random() * 200) + 50, // Mock price
        hotel_rating: Math.floor(Math.random() * 2) + 4, // Mock rating 4-5
        hotel_location: 'City, Country', // Mock location
        created_at: new Date().toISOString()
      };

      wishlist.push(newItem);
      localStorage.setItem(`wishlist_${userId}`, JSON.stringify(wishlist));

      return {
        success: true,
        message: 'Hotel added to wishlist',
        data: newItem
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add to wishlist');
    }
  }

  // Remove hotel from wishlist
  async removeFromWishlist(hotelId: number): Promise<WishlistActionResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const userId = this.getUserIdFromToken(token);
      const wishlistData = localStorage.getItem(`wishlist_${userId}`);
      const wishlist: WishlistItem[] = wishlistData ? JSON.parse(wishlistData) : [];

      const removedItem = wishlist.find(item => item.hotel_id === hotelId);
      if (!removedItem) {
        return {
          success: false,
          message: 'Hotel not found in wishlist'
        };
      }

      const updatedWishlist = wishlist.filter(item => item.hotel_id !== hotelId);
      localStorage.setItem(`wishlist_${userId}`, JSON.stringify(updatedWishlist));

      return {
        success: true,
        message: 'Hotel removed from wishlist',
        data: removedItem
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to remove from wishlist');
    }
  }

  // Check if hotel is in wishlist
  async isInWishlist(hotelId: number): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const userId = this.getUserIdFromToken(token);
      const wishlistData = localStorage.getItem(`wishlist_${userId}`);
      const wishlist: WishlistItem[] = wishlistData ? JSON.parse(wishlistData) : [];

      return wishlist.some(item => item.hotel_id === hotelId);
    } catch (error) {
      return false;
    }
  }

  // Toggle wishlist status (add or remove)
  async toggleWishlist(hotelId: number): Promise<WishlistActionResponse> {
    try {
      const isInList = await this.isInWishlist(hotelId);
      if (isInList) {
        return await this.removeFromWishlist(hotelId);
      } else {
        return await this.addToWishlist(hotelId);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to toggle wishlist');
    }
  }

  // Helper method to get user ID from token (mock implementation)
  private getUserIdFromToken(token: string): number {
    // In a real app, decode JWT token to get user ID
    // For now, return a mock user ID
    return 1;
  }
}

export const wishlistService = new WishlistService();
