// src/services/booking.service.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface GuestDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  special_requests?: string;
}

export interface BookingRequest {
  hotel_id: number;
  room_type_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  guest_details: GuestDetails;
  idempotency_key?: string;
}

export interface PriceCalculationRequest {
  hotel_id: number;
  room_type_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}

export interface PriceBreakdown {
  base_price: number;
  total_nights: number;
  subtotal: number;
  taxes: Array<{
    name: string;
    amount: number;
    percentage?: number;
  }>;
  service_fees: Array<{
    name: string;
    amount: number;
    percentage?: number;
  }>;
  total_taxes: number;
  total_fees: number;
  total_amount: number;
}

export interface BookingPreview {
  hotel: {
    id: number;
    name: string;
    address?: any;
  };
  room_type: {
    id: number;
    name: string;
    description: string;
    base_price: number;
    max_guests: number;
  };
  check_in: string;
  check_out: string;
  guests: number;
  price_breakdown: PriceBreakdown;
  policies?: {
    cancellation_policy?: string;
    checkin_time?: string;
    checkout_time?: string;
  };
}

export interface BookingResponse {
  id: number;
  hotel_id: number;
  room_type_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  status: string;
  created_at: string;
  booking_reference: string;
}

export class BookingService {
  async calculatePrice(request: PriceCalculationRequest): Promise<PriceBreakdown> {
    try {
      const response = await axios.post(`${API_BASE_URL}/price-calculation/calculate`, request);
      return response.data;
    } catch (error: any) {
      console.error('Error calculating price:', error);
      throw new Error(error.response?.data?.error || 'Failed to calculate price');
    }
  }

  async getBookingPreview(request: PriceCalculationRequest): Promise<BookingPreview> {
    try {
      const response = await axios.post(`${API_BASE_URL}/bookings/preview`, request);
      return response.data;
    } catch (error: any) {
      console.error('Error getting booking preview:', error);
      throw new Error(error.response?.data?.error || 'Failed to get booking preview');
    }
  }

  async createBooking(request: BookingRequest): Promise<BookingResponse> {
    try {
      // Generate idempotency key if not provided
      if (!request.idempotency_key) {
        request.idempotency_key = this.generateIdempotencyKey();
      }

      const response = await axios.post(`${API_BASE_URL}/bookings`, request, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      throw new Error(error.response?.data?.error || 'Failed to create booking');
    }
  }

  async getBookingById(bookingId: number): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch booking');
    }
  }

  async cancelBooking(bookingId: number): Promise<any> {
    try {
      const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      throw new Error(error.response?.data?.error || 'Failed to cancel booking');
    }
  }

  private generateIdempotencyKey(): string {
    return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  validateGuestDetails(guest: GuestDetails): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!guest.first_name || guest.first_name.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
    }

    if (!guest.last_name || guest.last_name.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    if (!guest.email || !this.isValidEmail(guest.email)) {
      errors.push('Please provide a valid email address');
    }

    if (!guest.phone || !this.isValidPhone(guest.phone)) {
      errors.push('Please provide a valid phone number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-+()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }
}

export const bookingService = new BookingService();
