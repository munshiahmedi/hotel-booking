import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API responses
export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface RegisterResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// Auth service class
export class AuthService {
  // Login method
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || 'Login failed';
        throw new Error(message);
      }
      throw new Error('Network error occurred');
    }
  }

  // Register method
  static async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', userData);
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || 'Registration failed';
        throw new Error(message);
      }
      throw new Error('Network error occurred');
    }
  }

  // Get current user from localStorage
  static getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get token from localStorage
  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if user is logged in
  static isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Logout method
  static logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Setup axios interceptor for adding auth token to requests
  static setupAuthInterceptor(): void {
    api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Handle 401 errors (unauthorized)
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
}

// Initialize auth interceptor
AuthService.setupAuthInterceptor();

export default api;
