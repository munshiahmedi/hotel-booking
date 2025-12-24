// src/services/payment.service.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface PaymentRequest {
  booking_id: number;
  amount: number;
  payment_method: 'card' | 'bank';
  payment_details: {
    card_number?: string;
    card_holder?: string;
    expiry_date?: string;
    cvv?: string;
    account_number?: string;
    account_holder?: string;
    routing_number?: string;
  };
  idempotency_key: string;
}

export interface PaymentResponse {
  id: number;
  booking_id: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_id?: string;
  error_message?: string;
  processed_at?: string;
}

export class PaymentService {
  // Generate idempotency key
  generateIdempotencyKey(): string {
    return `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create payment
  async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments`, paymentRequest, {
        headers: {
          'Idempotency-Key': paymentRequest.idempotency_key
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating payment:', error);
      throw new Error(error.response?.data?.error || 'Payment failed');
    }
  }

  // Get payment status for booking
  async getPaymentStatus(bookingId: number): Promise<PaymentStatus> {
    try {
      const response = await axios.get(`${API_BASE_URL}/booking-payments/booking/${bookingId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting payment status:', error);
      throw new Error(error.response?.data?.error || 'Failed to get payment status');
    }
  }

  // Retry payment
  async retryPayment(bookingId: number, idempotencyKey: string): Promise<PaymentResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/${bookingId}/retry`, {}, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error retrying payment:', error);
      throw new Error(error.response?.data?.error || 'Payment retry failed');
    }
  }

  // Cancel payment
  async cancelPayment(bookingId: number): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/payments/${bookingId}/cancel`);
    } catch (error: any) {
      console.error('Error cancelling payment:', error);
      throw new Error(error.response?.data?.error || 'Failed to cancel payment');
    }
  }
}

export const paymentService = new PaymentService();
