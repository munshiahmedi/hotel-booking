// src/pages/MyBookings/MyBookingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Tag, message, Space, Row, Col } from 'antd';
import { 
  ArrowLeftOutlined, 
  SearchOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  StopOutlined
} from '@ant-design/icons';
import { bookingApi } from '../../services/api';

const { Title, Text } = Typography;

interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  rooms: number;
  guests: number;
  createdAt: string;
  imageUrl?: string;
}

const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const cancelledBookings = JSON.parse(localStorage.getItem('cancelledBookings') || '[]');
    if (cancelledBookings.length > 0) {
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          cancelledBookings.includes(booking.id) 
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
    }
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Token in localStorage:', token ? 'exists' : 'missing');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const response = await Promise.race([
        bookingApi.getMyBookings(),
        timeoutPromise
      ]) as any;
      
      console.log('Bookings API Response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setBookings(response.data);
      } else if (response.data && response.data.bookings && Array.isArray(response.data.bookings)) {
        setBookings(response.data.bookings);
      } else {
        console.log('Unexpected response structure:', response.data);
        setBookings([]);
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      // Don't show error message for timeout, just set empty bookings
      if (error.message !== 'Request timeout') {
        message.error('Failed to fetch bookings. Please try again.');
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      case 'completed': return 'blue';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockCircleOutlined />;
      default: return null;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeFilter === 'all') return true;
    return booking.status === activeFilter;
  });

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getBookingImage = (hotelName: string) => {
    // Return placeholder images based on hotel name or use a default
    if (hotelName.toLowerCase().includes('grand') || hotelName.toLowerCase().includes('azure')) {
      return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop';
    } else if (hotelName.toLowerCase().includes('mountain')) {
      return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1564501049412-1a8b8332a478?w=800&h=400&fit=crop';
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <ArrowLeftOutlined className="text-xl cursor-pointer" onClick={() => navigate('/dashboard')} />
            <div>
              <h1 className="text-2xl font-bold">My Bookings</h1>
              <p className="text-gray-400 text-sm">Manage your reservations</p>
            </div>
          </div>
          <Button 
            type="primary" 
            icon={<SearchOutlined />}
            onClick={() => navigate('/hotels')}
            className="bg-blue-600 hover:bg-blue-700 border-none rounded-lg"
          >
            Browse Hotels
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">Loading your bookings...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Booking Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-[#1F2937] border-none rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Bookings</p>
                  <p className="text-3xl font-bold mt-1">{totalBookings}</p>
                </div>
                <div className="bg-blue-600/20 p-3 rounded-full">
                  <CalendarOutlined className="text-blue-400 text-xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-[#1F2937] border-none rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Confirmed</p>
                  <p className="text-3xl font-bold mt-1">{confirmedBookings}</p>
                </div>
                <div className="bg-green-600/20 p-3 rounded-full">
                  <CheckCircleOutlined className="text-green-400 text-xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-[#1F2937] border-none rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-3xl font-bold mt-1">{pendingBookings}</p>
                </div>
                <div className="bg-orange-600/20 p-3 rounded-full">
                  <ClockCircleOutlined className="text-orange-400 text-xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-[#1F2937] border-none rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Cancelled</p>
                  <p className="text-3xl font-bold mt-1">{cancelledBookings}</p>
                </div>
                <div className="bg-red-600/20 p-3 rounded-full">
                  <CloseCircleOutlined className="text-red-400 text-xl" />
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Space size="middle">
          <Button
            type={activeFilter === 'all' ? 'primary' : 'default'}
            onClick={() => setActiveFilter('all')}
            className={activeFilter === 'all' ? 'bg-blue-600 border-blue-600' : 'bg-[#1F2937] border-[#374151] text-white'}
          >
            All ({totalBookings})
          </Button>
          <Button
            type={activeFilter === 'confirmed' ? 'primary' : 'default'}
            onClick={() => setActiveFilter('confirmed')}
            className={activeFilter === 'confirmed' ? 'bg-blue-600 border-blue-600' : 'bg-[#1F2937] border-[#374151] text-white'}
          >
            Confirmed
          </Button>
          <Button
            type={activeFilter === 'pending' ? 'primary' : 'default'}
            onClick={() => setActiveFilter('pending')}
            className={activeFilter === 'pending' ? 'bg-blue-600 border-blue-600' : 'bg-[#1F2937] border-[#374151] text-white'}
          >
            Pending
          </Button>
          <Button
            type={activeFilter === 'cancelled' ? 'primary' : 'default'}
            onClick={() => setActiveFilter('cancelled')}
            className={activeFilter === 'cancelled' ? 'bg-blue-600 border-blue-600' : 'bg-[#1F2937] border-[#374151] text-white'}
          >
            Cancelled
          </Button>
        </Space>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredBookings.length === 0 ? (
          <div className="bg-[#1F2937] rounded-2xl p-16 text-center border border-[#374151]">
            <CalendarOutlined className="text-6xl text-blue-400 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">No bookings found</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              You haven't made any bookings yet. Start exploring hotels to create your first reservation.
            </p>
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={() => navigate('/hotels')}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white font-medium px-8 py-3 h-auto text-base"
            >
              Browse Hotels Now
            </Button>
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredBookings.map((booking) => (
              <Col xs={24} md={12} lg={8} key={booking.id}>
                <Card 
                  className="bg-[#1F2937] border-none rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200"
                  cover={
                    <div className="relative h-48">
                      <img
                        src={booking.imageUrl || getBookingImage(booking.hotelName)}
                        alt={booking.hotelName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Tag 
                          color={getStatusColor(booking.status)}
                          className="flex items-center gap-1"
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Tag>
                      </div>
                    </div>
                  }
                >
                  <div className="p-4">
                    <Title level={4} className="mb-2 text-white">{booking.hotelName}</Title>
                    <div className="flex items-center text-gray-400 mb-4">
                      <EnvironmentOutlined className="mr-2" />
                      <Text className="text-gray-400">{booking.location || 'Location not specified'}</Text>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <CalendarOutlined className="mr-3 text-gray-400" />
                        <div>
                          <Text className="text-xs text-gray-400">CHECK-IN</Text>
                          <div className="font-medium text-white">{formatDate(booking.checkIn)}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <CalendarOutlined className="mr-3 text-gray-400" />
                        <div>
                          <Text className="text-xs text-gray-400">CHECK-OUT</Text>
                          <div className="font-medium text-white">{formatDate(booking.checkOut)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#374151]">
                      <div className="flex justify-between items-center">
                        <Text strong className="text-xl text-white">
                          ${booking.totalPrice}
                        </Text>
                        <Space>
                          <Button 
                            type="text" 
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/bookings/${booking.id}`)}
                            className="text-white hover:bg-[#374151]"
                          >
                            View
                          </Button>
                          {booking.status === 'pending' && (
                            <Button 
                              type="primary" 
                              size="small"
                              onClick={() => navigate(`/bookings/${booking.id}/payment`)}
                              className="bg-blue-600 border-blue-600"
                            >
                              Pay Now
                            </Button>
                          )}
                          {(booking.status === 'confirmed' || booking.status === 'pending') && (
                            <Button 
                              danger
                              size="small"
                              icon={<StopOutlined />}
                              onClick={() => navigate(`/bookings/${booking.id}/cancel`)}
                              className="bg-red-600/20 border-red-600/30 text-red-400 hover:bg-red-600/30"
                            >
                              Cancel
                            </Button>
                          )}
                        </Space>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default MyBookingsPage;
