// src/services/roomAvailability.service.ts
import axios from 'axios';
import moment from 'moment';

const API_BASE_URL = 'http://localhost:3000/api';

export interface RoomType {
  id: number;
  name: string;
  description: string;
  base_price: number;
  max_guests: number;
  hotel_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AvailableRoomType extends RoomType {
  available_rooms: number;
  total_rooms: number;
  amenities?: string[];
  room_size?: number;
  bed_type?: string;
  private_bathroom?: boolean;
  free_wifi?: boolean;
  parking?: boolean;
  cancellation_policy?: string;
  guest_rating?: number;
  breakfast_included?: boolean;
  room_view?: string;
  reviews_count?: number;
  room_type?: string;
}

export interface RoomAvailabilityRequest {
  hotelId: number;
  checkIn: string;
  checkOut: string;
  guests?: number;
}

export interface RoomAvailabilityResponse {
  hotel_id: number;
  check_in: string;
  check_out: string;
  room_types: AvailableRoomType[];
}

export class RoomAvailabilityService {
  async getAvailableRooms(request: RoomAvailabilityRequest): Promise<RoomAvailabilityResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/room-types/hotel/${request.hotelId}/available`, {
        params: {
          checkIn: request.checkIn,
          checkOut: request.checkOut
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching available rooms:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch available rooms');
    }
  }

  async getRoomTypesByHotel(hotelId: number): Promise<RoomType[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/room-types/hotel/${hotelId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching room types:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch room types');
    }
  }

  async getAllRoomTypes(): Promise<RoomType[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/room-types`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching all room types:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch room types');
    }
  }

  validateDates(checkIn: string, checkOut: string): { isValid: boolean; error?: string } {
    const checkInDate = moment(checkIn);
    const checkOutDate = moment(checkOut);
    
    if (!checkInDate.isValid() || !checkOutDate.isValid()) {
      return { isValid: false, error: 'Invalid date format' };
    }
    
    if (checkInDate.isSameOrAfter(checkOutDate)) {
      return { isValid: false, error: 'Check-out must be after check-in' };
    }
    
    if (checkInDate.isBefore(moment(), 'day')) {
      return { isValid: false, error: 'Check-in cannot be in the past' };
    }
    
    return { isValid: true };
  }

  calculateTotalPrice(basePrice: number, checkIn: string, checkOut: string): number {
    const nights = moment(checkOut).diff(moment(checkIn), 'days');
    return basePrice * nights;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}

export const roomAvailabilityService = new RoomAvailabilityService();
