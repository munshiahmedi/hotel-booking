// src/services/hotelManagement.service.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Hotel Dashboard Stats
export interface HotelStats {
  total_bookings: number;
  total_revenue: number;
  occupancy_rate: number;
  average_rating: number;
  active_rooms: number;
  total_rooms: number;
  monthly_revenue: number[];
  recent_bookings: any[];
}

// Room Management
export interface Room {
  id: number;
  hotel_id: number;
  room_number: string;
  room_type: string;
  capacity: number;
  base_price: number;
  status: 'available' | 'blocked' | 'maintenance';
  amenities: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateRoomRequest {
  hotel_id: number;
  room_number: string;
  room_type: string;
  capacity: number;
  base_price: number;
  amenities: string[];
}

export interface UpdateRoomRequest {
  room_number?: string;
  room_type?: string;
  capacity?: number;
  base_price?: number;
  status?: 'available' | 'blocked' | 'maintenance';
  amenities?: string[];
}

// Pricing Management
export interface RoomPricing {
  id: number;
  room_id: number;
  weekday_price: number;
  weekend_price: number;
  seasonal_price?: number;
  seasonal_start?: string;
  seasonal_end?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdatePricingRequest {
  weekday_price: number;
  weekend_price: number;
  seasonal_price?: number;
  seasonal_start?: string;
  seasonal_end?: string;
}

// Amenities & Facilities
export interface HotelAmenity {
  id: number;
  hotel_id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  created_at: string;
}

export interface HotelFacility {
  id: number;
  hotel_id: number;
  name: string;
  description: string;
  operating_hours: string;
  availability: boolean;
  created_at: string;
}

export interface CreateAmenityRequest {
  hotel_id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export interface CreateFacilityRequest {
  hotel_id: number;
  name: string;
  description: string;
  operating_hours: string;
  availability: boolean;
}

export class HotelManagementService {
  // Hotel Dashboard
  async getHotelStats(hotelId: number): Promise<HotelStats> {
    try {
      const response = await axios.get(`${API_BASE_URL}/hotels/${hotelId}/dashboard/stats`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching hotel stats:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch hotel statistics');
    }
  }

  // Room Management
  async getRooms(hotelId: number): Promise<Room[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/hotels/${hotelId}/rooms`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch rooms');
    }
  }

  async createRoom(roomData: CreateRoomRequest): Promise<Room> {
    try {
      const response = await axios.post(`${API_BASE_URL}/rooms`, roomData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating room:', error);
      throw new Error(error.response?.data?.error || 'Failed to create room');
    }
  }

  async updateRoom(roomId: number, roomData: UpdateRoomRequest): Promise<Room> {
    try {
      const response = await axios.put(`${API_BASE_URL}/rooms/${roomId}`, roomData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating room:', error);
      throw new Error(error.response?.data?.error || 'Failed to update room');
    }
  }

  async deleteRoom(roomId: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/rooms/${roomId}`);
    } catch (error: any) {
      console.error('Error deleting room:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete room');
    }
  }

  async updateRoomStatus(roomId: number, status: 'available' | 'blocked' | 'maintenance'): Promise<Room> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/rooms/${roomId}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Error updating room status:', error);
      throw new Error(error.response?.data?.error || 'Failed to update room status');
    }
  }

  // Pricing Management
  async getRoomPricing(roomId: number): Promise<RoomPricing> {
    try {
      const response = await axios.get(`${API_BASE_URL}/room-pricing/${roomId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching room pricing:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch room pricing');
    }
  }

  async updateRoomPricing(roomId: number, pricingData: UpdatePricingRequest): Promise<RoomPricing> {
    try {
      const response = await axios.put(`${API_BASE_URL}/room-pricing/${roomId}`, pricingData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating room pricing:', error);
      throw new Error(error.response?.data?.error || 'Failed to update room pricing');
    }
  }

  async getHotelPricing(hotelId: number): Promise<RoomPricing[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/hotels/${hotelId}/pricing`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching hotel pricing:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch hotel pricing');
    }
  }

  // Amenities Management
  async getHotelAmenities(hotelId: number): Promise<HotelAmenity[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/hotel-amenities/hotel/${hotelId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching hotel amenities:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch hotel amenities');
    }
  }

  async createAmenity(amenityData: CreateAmenityRequest): Promise<HotelAmenity> {
    try {
      const response = await axios.post(`${API_BASE_URL}/hotel-amenities`, amenityData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating amenity:', error);
      throw new Error(error.response?.data?.error || 'Failed to create amenity');
    }
  }

  async updateAmenity(amenityId: number, amenityData: Partial<CreateAmenityRequest>): Promise<HotelAmenity> {
    try {
      const response = await axios.put(`${API_BASE_URL}/hotel-amenities/${amenityId}`, amenityData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating amenity:', error);
      throw new Error(error.response?.data?.error || 'Failed to update amenity');
    }
  }

  async deleteAmenity(amenityId: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/hotel-amenities/${amenityId}`);
    } catch (error: any) {
      console.error('Error deleting amenity:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete amenity');
    }
  }

  // Facilities Management
  async getHotelFacilities(hotelId: number): Promise<HotelFacility[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/hotel-facilities/hotel/${hotelId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching hotel facilities:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch hotel facilities');
    }
  }

  async createFacility(facilityData: CreateFacilityRequest): Promise<HotelFacility> {
    try {
      const response = await axios.post(`${API_BASE_URL}/hotel-facilities`, facilityData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating facility:', error);
      throw new Error(error.response?.data?.error || 'Failed to create facility');
    }
  }

  async updateFacility(facilityId: number, facilityData: Partial<CreateFacilityRequest>): Promise<HotelFacility> {
    try {
      const response = await axios.put(`${API_BASE_URL}/hotel-facilities/${facilityId}`, facilityData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating facility:', error);
      throw new Error(error.response?.data?.error || 'Failed to update facility');
    }
  }

  async deleteFacility(facilityId: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/hotel-facilities/${facilityId}`);
    } catch (error: any) {
      console.error('Error deleting facility:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete facility');
    }
  }

  async toggleFacilityAvailability(facilityId: number): Promise<HotelFacility> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/hotel-facilities/${facilityId}/toggle`);
      return response.data;
    } catch (error: any) {
      console.error('Error toggling facility availability:', error);
      throw new Error(error.response?.data?.error || 'Failed to toggle facility availability');
    }
  }
}

export const hotelManagementService = new HotelManagementService();
