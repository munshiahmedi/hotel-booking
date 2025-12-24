import api from './authService';

export interface Address {
  id: number;
  line1: string;
  line2?: string;
  zipcode: string;
  city: string;
  state: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface AddressFormData {
  line1: string;
  line2?: string;
  zipcode: string;
  country_id: number;
  state_id: number;
  city_id: number;
}

export interface AddressResponse {
  data: Address[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class AddressService {
  // Get user's addresses
  static async getMyAddresses(page: number = 1, limit: number = 10): Promise<AddressResponse> {
    try {
      const response = await api.get<AddressResponse>('/addresses/my-addresses', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch addresses');
    }
  }

  // Create new address
  static async createAddress(data: AddressFormData): Promise<Address> {
    try {
      const response = await api.post<Address>('/addresses/my-addresses', data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create address');
    }
  }

  // Update address
  static async updateAddress(id: number, data: Partial<AddressFormData>): Promise<Address> {
    try {
      const response = await api.put<Address>(`/addresses/my-addresses/${id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update address');
    }
  }

  // Delete address
  static async deleteAddress(id: number): Promise<void> {
    try {
      await api.delete(`/addresses/my-addresses/${id}`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete address');
    }
  }

  // Get address by ID (for admin or owner)
  static async getAddressById(id: number): Promise<Address> {
    try {
      const response = await api.get<Address>(`/addresses/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch address');
    }
  }

  // Get all addresses (admin only)
  static async getAllAddresses(page: number = 1, limit: number = 10): Promise<AddressResponse> {
    try {
      const response = await api.get<AddressResponse>('/addresses', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch addresses');
    }
  }
}

export default AddressService;
