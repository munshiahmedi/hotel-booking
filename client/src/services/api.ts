import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { name: string; email: string; password: string }) =>
    api.post('/auth/register', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData: any) =>
    api.put('/users/profile', userData),
  changePassword: (passwords: { currentPassword: string; newPassword: string }) =>
    api.put('/users/change-password', passwords),
  
  // Admin user management
  getAllUsers: () => api.get('/users'),
  getUserById: (id: number) => api.get(`/users/${id}`),
  updateUserProfile: (id: number, userData: any) => 
    api.put(`/users/${id}/profile`, userData),
  deactivateUser: (id: number) => 
    api.put(`/users/${id}/deactivate`),
};

// Hotel API
export const hotelApi = {
  // Public endpoints
  searchHotels: (queryParams: any) => 
    api.get('/hotels/search', { params: queryParams }),
  getAllHotels: (filters: any = {}) => 
    api.get('/hotels', { params: filters }),
  getHotelById: (id: string) => 
    api.get(`/hotels/${id}`),

  // Protected endpoints
  getMyHotels: () => 
    api.get('/hotels/my-hotels'),
  getMyHotelStatus: () => 
    api.get('/hotels/my-status'),
  createHotel: (hotelData: any) => 
    api.post('/hotels', hotelData),
  updateHotel: (id: string, hotelData: any) => 
    api.put(`/hotels/${id}`, hotelData),
  deleteHotel: (id: string) => 
    api.delete(`/hotels/${id}`),
  updateHotelStatus: (id: string, status: string) => 
    api.patch(`/hotels/${id}/status`, { status }),
};

// User API
export const userApi = {
  getAddresses: () => api.get('/addresses/my-addresses'),
  addAddress: (address: any) => api.post('/addresses/my-addresses', address),
  updateAddress: (id: string, address: any) => api.put(`/addresses/my-addresses/${id}`, address),
  deleteAddress: (id: string) => api.delete(`/addresses/my-addresses/${id}`),
  setDefaultAddress: (id: string) => api.put(`/addresses/my-addresses/${id}`, { isDefault: true }),
};

// Booking API
export const bookingApi = {
  createBooking: (bookingData: any) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getBookingById: (id: string) => api.get(`/bookings/${id}`),
  cancelBooking: (id: string) => api.put(`/bookings/${id}/cancel`),
};

export default api;
