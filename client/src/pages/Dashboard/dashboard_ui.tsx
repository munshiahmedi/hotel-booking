import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Descriptions, Spin, Button, Typography } from 'antd';
import { 
  HomeOutlined, 
  LaptopOutlined, 
  UserOutlined,
  ProfileOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  SearchOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  RestOutlined,
  TeamOutlined,
  BookOutlined,
  EditOutlined,
  DashboardOutlined,
  KeyOutlined,
  DollarOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

interface Hotel {
  id: number;
  name: string;
  slug: string;
  status: string;
}

interface Session {
  id: number;
  ip_address: string;
  user_agent: string;
  expires_at: string;
  created_at: string;
}

const { Title } = Typography;

const DashboardUI: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [myHotels, setMyHotels] = useState<Hotel[]>([]);
  const [mySessions, setMySessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch user profile
        const profileRes = await axios.get(`${API_BASE_URL}/users/profile`, { headers });
        setUserInfo(profileRes.data);

        // Fetch my hotels
        const hotelsRes = await axios.get(`${API_BASE_URL}/hotels/my-hotels`, { headers });
        console.log('Hotels API response:', hotelsRes.data);
        console.log('Hotels array length:', hotelsRes.data?.hotels?.length);
        setMyHotels(hotelsRes.data.hotels || []);

        // Fetch my sessions
        const sessionsRes = await axios.get(`${API_BASE_URL}/sessions/my-sessions`, { headers });
        setMySessions(sessionsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Title level={1} className="mb-6">Dashboard</Title>
      
      {/* User Info Section */}
      <Card title="Logged-in User Info" className="mb-6">
        <Descriptions column={3}>
          <Descriptions.Item label="Name">{userInfo?.name || user?.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{userInfo?.email || user?.email}</Descriptions.Item>
          <Descriptions.Item label="Role">{typeof userInfo?.role === 'string' ? userInfo?.role : (typeof user?.role === 'string' ? user?.role : 'N/A')}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Navigation Cards */}
      <Title level={3} className="mb-4">Quick Actions</Title>
      
      {/* Debug info - remove later */}
      <div style={{background: '#f0f0f0', padding: '10px', marginBottom: '20px', fontSize: '12px'}}>
        Debug: user.email = {user?.email || 'undefined'}, user.role = {user?.role || 'undefined'}
      </div>
      
      <Row gutter={[16, 16]} className="mb-6">
        {/* Admin-only cards - temporarily visible for all users for testing */}
        {true && (
          <>
            <Col xs={24} sm={12} md={6}>
              <Card 
                hoverable
                className="text-center cursor-pointer"
                onClick={() => navigate('/admin')}
              >
                <LaptopOutlined className="text-4xl text-red-500 mb-4" />
                <Title level={4}>Admin Dashboard</Title>
                <p className="text-gray-600">System administration and monitoring</p>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Card 
                hoverable
                className="text-center cursor-pointer"
                onClick={() => navigate('/admin/users')}
              >
                <UserOutlined className="text-4xl text-purple-500 mb-4" />
                <Title level={4}>User Management</Title>
                <p className="text-gray-600">Manage system users and permissions</p>
              </Card>
            </Col>
          </>
        )}
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            className="text-center cursor-pointer"
            onClick={() => navigate('/profile')}
          >
            <ProfileOutlined className="text-4xl text-blue-500 mb-4" />
            <Title level={4}>My Profile</Title>
            <p className="text-gray-600">Manage your personal information and account settings</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            className="text-center cursor-pointer"
            onClick={() => navigate('/my-addresses')}
          >
            <EnvironmentOutlined className="text-4xl text-green-500 mb-4" />
            <Title level={4}>My Addresses</Title>
            <p className="text-gray-600">Manage your shipping and billing addresses</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            className="text-center cursor-pointer"
            onClick={() => navigate('/my-bookings')}
          >
            <CalendarOutlined className="text-4xl text-orange-500 mb-4" />
            <Title level={4}>My Bookings</Title>
            <p className="text-gray-600">View your hotel bookings and reservations</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            className="text-center cursor-pointer"
            onClick={() => navigate('/my-hotels')}
          >
            <HomeOutlined className="text-4xl text-blue-500 mb-4" />
            <Title level={4}>My Hotels</Title>
            <p className="text-gray-600">Manage your hotel properties</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            className="text-center cursor-pointer"
            onClick={() => navigate('/hotels')}
          >
            <SearchOutlined className="text-4xl text-purple-500 mb-4" />
            <Title level={4}>Explore Hotels</Title>
            <p className="text-gray-600">Discover and book new hotels</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            className="text-center cursor-pointer"
            onClick={() => navigate('/create-hotel')}
          >
            <PlusOutlined className="text-4xl text-teal-500 mb-4" />
            <Title level={4}>Create Hotel</Title>
            <p className="text-gray-600">Add a new hotel property</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            className="text-center cursor-pointer"
            onClick={() => navigate('/booking-confirmation')}
          >
            <CheckCircleOutlined className="text-4xl text-green-500 mb-4" />
            <Title level={4}>Booking Confirmation</Title>
            <p className="text-gray-600">View booking confirmations</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            className="text-center cursor-pointer"
            onClick={() => navigate('/payment')}
          >
            <CreditCardOutlined className="text-4xl text-yellow-500 mb-4" />
            <Title level={4}>Payment</Title>
            <p className="text-gray-600">Manage payment methods</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            className="text-center cursor-pointer"
            onClick={() => navigate('/payment-result')}
          >
            <RestOutlined className="text-4xl text-indigo-500 mb-4" />
            <Title level={4}>Payment Result</Title>
            <p className="text-gray-600">View payment results</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            className="text-center cursor-pointer"
            onClick={() => navigate('/user-management')}
          >
            <TeamOutlined className="text-4xl text-cyan-500 mb-4" />
            <Title level={4}>User Management</Title>
            <p className="text-gray-600">Manage user accounts</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            className="text-center cursor-pointer"
            onClick={() => navigate('/hotels/:id/book')}
          >
            <BookOutlined className="text-4xl text-pink-500 mb-4" />
            <Title level={4}>Create Booking</Title>
            <p className="text-gray-600">Create new booking</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            className="text-center cursor-pointer"
            onClick={() => navigate('/hotels/:id/edit')}
          >
            <EditOutlined className="text-4xl text-orange-500 mb-4" />
            <Title level={4}>Edit Hotel</Title>
            <p className="text-gray-600">Edit hotel details</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            className="text-center cursor-pointer"
            onClick={() => navigate('/hotels/:hotelId/dashboard')}
          >
            <DashboardOutlined className="text-4xl text-purple-500 mb-4" />
            <Title level={4}>Hotel Dashboard</Title>
            <p className="text-gray-600">Hotel management dashboard</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            className="text-center cursor-pointer"
            onClick={() => navigate('/hotels/:hotelId/rooms')}
          >
            <KeyOutlined className="text-4xl text-green-500 mb-4" />
            <Title level={4}>Rooms Management</Title>
            <p className="text-gray-600">Manage hotel rooms</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            className="text-center cursor-pointer"
            onClick={() => navigate('/hotels/:hotelId/pricing')}
          >
            <DollarOutlined className="text-4xl text-yellow-600 mb-4" />
            <Title level={4}>Pricing Management</Title>
            <p className="text-gray-600">Manage room pricing</p>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            className="text-center cursor-pointer"
            onClick={() => navigate('/hotels/:hotelId/amenities')}
          >
            <StarOutlined className="text-4xl text-blue-500 mb-4" />
            <Title level={4}>Amenities & Facilities</Title>
            <p className="text-gray-600">Manage hotel amenities</p>
          </Card>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Title level={3} className="mb-4">Overview</Title>
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="My Hotels"
              value={myHotels.length}
              prefix={<HomeOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Sessions"
              value={mySessions.length}
              prefix={<LaptopOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="User Role"
              value={typeof userInfo?.role === 'string' ? userInfo?.role : (typeof user?.role === 'string' ? user?.role : 'N/A')}
              prefix={<UserOutlined />}
              styles={{ content: { color: '#722ed1' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Sessions */}
      {mySessions.length > 0 && (
        <Card title="Recent Sessions" className="mb-6">
          <div className="space-y-2">
            {mySessions.slice(0, 3).map((session) => (
              <div key={session.id} className="border-b pb-2">
                <p className="m-0 text-gray-600">IP: {session.ip_address}</p>
                <p className="m-0 text-sm text-gray-400">
                  {new Date(session.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* My Hotels */}
      <Card title="My Hotels">
        <div className="mb-2">
          <small>Debug: Hotels count = {myHotels.length}</small>
        </div>
        {myHotels.length > 0 ? (
          <div className="space-y-2">
            {myHotels.map((hotel) => (
              <div key={hotel.id} className="border-b pb-2">
                <p className="m-0">
                  <Button 
                    type="link" 
                    onClick={() => {
                      console.log('Hotel clicked:', hotel.id, hotel.name);
                      navigate('/my-hotels');
                    }}
                    className="p-0 text-gray-800 font-medium"
                    style={{ cursor: 'pointer' }}
                  >
                    {hotel.name}
                  </Button>
                </p>
                <p className="m-0 text-sm text-gray-400">Status: {hotel.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No hotels found. Create your first hotel!</p>
            <Button 
              type="primary" 
              onClick={() => {
                console.log('Create Hotel button clicked');
                navigate('/create-hotel');
              }}
              className="mt-2"
            >
              Create Hotel
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardUI;
