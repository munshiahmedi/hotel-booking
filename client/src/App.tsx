// In App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import ProfilePage from './pages/Profile/ProfilePage';
import UserManagementPage from './pages/UserManagement/UserManagementPage';
import MyHotelsPage from './pages/MyHotels/MyHotelsPage';
import MyAddressesPage from './pages/MyAddresses/MyAddressesPage';
import MyBookingsPage from './pages/MyBookings/MyBookingsPage';
import BookingDetailsPage from './pages/BookingDetails/BookingDetailsPage';
import CreateBookingPage from './pages/CreateBooking/CreateBookingPage';
import HotelsListPage from './pages/HotelsList/HotelsListPage';
import HotelDetailsPage from './pages/HotelDetails/HotelDetailsPage';
import BookingConfirmationPage from './pages/booking/BookingConfirmationPage';
import PaymentPage from './pages/booking/PaymentPage';
import PaymentResultPage from './pages/booking/PaymentResultPage';
import HotelDashboard from './pages/hotel-management/HotelDashboard';
import RoomsManagement from './pages/hotel-management/RoomsManagement';
import PricingManagement from './pages/hotel-management/PricingManagement';
import AmenitiesFacilitiesManagement from './pages/hotel-management/AmenitiesFacilitiesManagement';
import DashboardUI from './pages/Dashboard/dashboard_ui';
import LandingUI from './pages/Landing/landing_ui';
import CreateHotelUI from './pages/CreateHotel/createhotel_ui';
import EditHotelUI from './pages/EditHotel/edit_hotel_ui';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CancelBookingPage from './pages/booking/CancelBookingPage';
import { message } from 'antd';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  return <>{children}</>;
};

// Landing page wrapper to handle the required props
const LandingPage = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      await login(credentials);
      // Redirect to dashboard after successful login
      navigate('/dashboard', { replace: true });
    } catch (error) {
      message.error('Login failed. Please try again.');
      // Don't re-throw the error to prevent page refresh
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData: { name: string; email: string; password: string }) => {
    // For now, we'll just redirect to the register page
    window.location.href = '/register';
  };

  return <LandingUI />;
};

// Create hotel page wrapper
const CreateHotelPage = () => {
  return <CreateHotelUI />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/hotels" element={<HotelsListPage />} />
          <Route path="/hotels/:id" element={<HotelDetailsPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardUI />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management"
            element={
              <ProtectedRoute>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-hotels"
            element={
              <ProtectedRoute>
                <MyHotelsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-hotels/:id"
            element={
              <ProtectedRoute>
                <HotelDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-addresses"
            element={
              <ProtectedRoute>
                <MyAddressesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hotels/:id/book"
            element={
              <ProtectedRoute>
                <CreateBookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-hotel"
            element={
              <ProtectedRoute>
                <CreateHotelPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hotels/:id/edit"
            element={
              <ProtectedRoute>
                <EditHotelUI />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-confirmation"
            element={
              <ProtectedRoute>
                <BookingConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-result"
            element={
              <ProtectedRoute>
                <PaymentResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hotels/:hotelId/dashboard"
            element={
              <ProtectedRoute>
                <HotelDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hotels/:hotelId/rooms"
            element={
              <ProtectedRoute>
                <RoomsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hotels/:hotelId/pricing"
            element={
              <ProtectedRoute>
                <PricingManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hotels/:hotelId/amenities"
            element={
              <ProtectedRoute>
                <AmenitiesFacilitiesManagement />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          {/* Cancel Booking Route */}
          <Route
            path="/bookings/:id/cancel"
            element={
              <ProtectedRoute>
                <CancelBookingPage />
              </ProtectedRoute>
            }
          />

          {/* 404 route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;