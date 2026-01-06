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
import AnalyticsPage from './pages/AnalyticsPage';
import RoomsManagement from './pages/hotel-management/RoomsManagement';
import PricingManagement from './pages/hotel-management/PricingManagement';
import AmenitiesFacilitiesManagement from './pages/hotel-management/AmenitiesFacilitiesManagement';
import DashboardUI from './pages/Dashboard/dashboard_ui';
import LandingUI from './pages/Landing/landing_ui';
import CreateHotelUI from './pages/CreateHotel/createhotel_ui';
import EditHotelUI from './pages/EditHotel/edit_hotel_ui';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import HotelApproval from './pages/admin/HotelApproval';
import BookingsManagement from './pages/admin/BookingsManagement';
import PaymentsManagement from './pages/admin/PaymentsManagement';
import AuditLogs from './pages/admin/AuditLogs';
import CancelBookingPage from './pages/booking/CancelBookingPage';
import WishlistPage from './pages/wishlist/WishlistPage';
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
  const navigate = useNavigate();

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
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hotel-management"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
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
          <Route
            path="/admin/hotel-approval"
            element={
              <ProtectedRoute>
                <HotelApproval />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute>
                <BookingsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute>
                <PaymentsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute>
                <AuditLogs />
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