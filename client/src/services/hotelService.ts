import api from './authService';

export interface Hotel {
  id: number;
  name: string;
  slug: string;
  description: string;
  star_rating: number;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  owner_id: number;
  hotel_address?: {
    id: number;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
    country_id: number;
    state_id: number;
    city_id: number;
  };
  hotel_images?: Array<{
    id: number;
    image_url: string;
    alt_text?: string;
    is_primary: boolean;
  }>;
  hotel_facilities?: Array<{
    id: number;
    facility: {
      id: number;
      name: string;
      description?: string;
    };
  }>;
  room_types?: Array<{
    id: number;
    name: string;
    price_per_night: number;
    max_occupancy: number;
    description?: string;
    status: string;
  }>;
}

export interface HotelFilters {
  search?: string;
  city_id?: number;
  state_id?: number;
  country_id?: number;
  star_rating?: number;
  status?: string;
  page?: number;
  limit?: number;
}

export interface HotelResponse {
  data: Hotel[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HotelStatistics {
  total_bookings: number;
  total_revenue: number;
  average_rating: number;
  total_rooms: number;
  occupancy_rate: number;
}

export interface CreateHotelData {
  name: string;
  description: string;
  star_rating: number;
  hotel_address: {
    line1: string;
    line2?: string;
    country_id: number;
    state_id: number;
    city_id: number;
    zipcode: string;
  };
}

export interface UpdateHotelData {
  name?: string;
  description?: string;
  star_rating?: number;
  status?: string;
}

export class HotelService {
  // Get all hotels (public)
  static async getHotels(filters: HotelFilters = {}): Promise<HotelResponse> {
    try {
      const response = await api.get<HotelResponse>('/hotels', { params: filters });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch hotels');
    }
  }

  // Search hotels (public)
  static async searchHotels(query: string, filters: HotelFilters = {}): Promise<HotelResponse> {
    try {
      const response = await api.get<HotelResponse>('/hotels/search', {
        params: { search: query, ...filters }
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to search hotels');
    }
  }

  // Get hotel by ID (public)
  static async getHotelById(id: number): Promise<Hotel> {
    try {
      const response = await api.get<Hotel>(`/hotels/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch hotel details');
    }
  }

  // Get my hotels (authenticated user)
  static async getMyHotels(filters: HotelFilters = {}): Promise<HotelResponse> {
    try {
      const response = await api.get<HotelResponse>('/hotels/my-hotels', { params: filters });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch your hotels');
    }
  }

  // Get my hotel statistics
  static async getMyHotelStatistics(): Promise<HotelStatistics[]> {
    try {
      const response = await api.get<HotelStatistics[]>('/hotels/my-status');
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch hotel statistics');
    }
  }

  // Create new hotel (authenticated user)
  static async createHotel(data: CreateHotelData): Promise<Hotel> {
    try {
      const response = await api.post<Hotel>('/hotels', data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create hotel');
    }
  }

  // Update hotel (authenticated user)
  static async updateHotel(id: number, data: UpdateHotelData): Promise<Hotel> {
    try {
      const response = await api.put<Hotel>(`/hotels/${id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update hotel');
    }
  }

  // Update hotel status (admin)
  static async updateHotelStatus(id: number, status: string): Promise<Hotel> {
    try {
      const response = await api.put<Hotel>(`/hotels/${id}/status`, { status });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update hotel status');
    }
  }

  // Delete hotel (authenticated user)
  static async deleteHotel(id: number): Promise<void> {
    try {
      await api.delete(`/hotels/${id}`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete hotel');
    }
  }

  // Get all hotels (admin)
  static async getAllHotels(filters: HotelFilters = {}): Promise<HotelResponse> {
    try {
      const response = await api.get<HotelResponse>('/hotels', { params: filters });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch hotels');
    }
  }

  // Get hotel by ID (admin)
  static async getHotelByIdAdmin(id: number): Promise<Hotel> {
    try {
      const response = await api.get<Hotel>(`/hotels/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch hotel details');
    }
  }

  // Update hotel (admin)
  static async updateHotelAdmin(id: number, data: UpdateHotelData): Promise<Hotel> {
    try {
      const response = await api.put<Hotel>(`/hotels/${id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update hotel');
    }
  }

  // Delete hotel (admin)
  static async deleteHotelAdmin(id: number): Promise<void> {
    try {
      await api.delete(`/hotels/${id}`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete hotel');
    }
  }
}

export default HotelService;
