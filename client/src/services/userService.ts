import api from './authService';

export interface ProfileUpdateData {
  name: string;
  phone?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export class UserService {
  // Get user profile
  static async getProfile(): Promise<User> {
    try {
      const response = await api.get<User>('/users/profile');
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch profile');
    }
  }

  // Update user profile
  static async updateProfile(data: ProfileUpdateData): Promise<User> {
    try {
      const response = await api.put<User>('/users/profile', data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update profile');
    }
  }

  // Change password
  static async changePassword(data: PasswordChangeData): Promise<void> {
    try {
      await api.put('/users/change-password', data);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to change password');
    }
  }
}

export default UserService;
