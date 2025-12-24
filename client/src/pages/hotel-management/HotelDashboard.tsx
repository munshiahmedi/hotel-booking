// src/pages/hotel-management/HotelDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Row, 
  Col,
  Statistic,
  Table,
  Button,
  Space,
  Divider,
  Tag,
  Progress,
  List,
  Avatar,
  Rate,
  Spin,
  message,
  Tabs,
  Alert
} from 'antd';
import { 
  HomeOutlined,
  DollarOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  StarOutlined,
  PlusOutlined,
  EditOutlined,
  SettingOutlined,
  KeyOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useAuth } from '../../utils/AuthContext';
import { hotelManagementService, HotelStats } from '../../services/hotelManagement.service';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface BookingItem {
  id: number;
  booking_reference: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  status: string;
  room_type: string;
}

const HotelDashboard: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<HotelStats | null>(null);

  useEffect(() => {
    if (!hotelId || !token) return;

    const fetchHotelStats = async () => {
      try {
        setLoading(true);
        const hotelStats = await hotelManagementService.getHotelStats(Number(hotelId));
        setStats(hotelStats);
      } catch (error: any) {
        message.error(error.message || 'Failed to load hotel statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelStats();
  }, [hotelId, token]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'confirmed': 'green',
      'pending': 'orange',
      'cancelled': 'red',
      'completed': 'blue'
    };
    return colors[status] || 'default';
  };

  const bookingColumns = [
    {
      title: 'Reference',
      dataIndex: 'booking_reference',
      key: 'booking_reference',
      render: (text: string) => <Text code>{text}</Text>
    },
    {
      title: 'Guest',
      dataIndex: 'guest_name',
      key: 'guest_name',
      render: (text: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          {text}
        </Space>
      )
    },
    {
      title: 'Room Type',
      dataIndex: 'room_type',
      key: 'room_type'
    },
    {
      title: 'Check-in',
      dataIndex: 'check_in',
      key: 'check_in',
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Check-out',
      dataIndex: 'check_out',
      key: 'check_out',
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => <Text strong>{formatCurrency(amount)}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert
          message="Hotel Statistics Unavailable"
          description="Unable to load hotel statistics. Please try again."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={2} className="mb-2">Hotel Dashboard</Title>
            <Text type="secondary">Manage your hotel operations and monitor performance</Text>
          </div>
          <Space>
            <Button 
              icon={<EditOutlined />}
              onClick={() => navigate(`/hotels/${hotelId}/edit`)}
            >
              Edit Hotel
            </Button>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/hotels/${hotelId}/rooms`)}
            >
              Add Room
            </Button>
          </Space>
        </div>
      </div>

      {/* Key Statistics */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Bookings"
              value={stats.total_bookings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.total_revenue}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Occupancy Rate"
              value={stats.occupancy_rate}
              suffix="%"
              prefix={<TeamOutlined />}
              valueStyle={{ color: stats.occupancy_rate > 70 ? '#52c41a' : '#faad14' }}
            />
            <Progress 
              percent={stats.occupancy_rate} 
              size="small" 
              className="mt-2"
              status={stats.occupancy_rate > 70 ? 'success' : 'normal'}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Average Rating"
              value={stats.average_rating}
              prefix={<StarOutlined />}
              precision={1}
              valueStyle={{ color: '#faad14' }}
            />
            <Rate disabled defaultValue={stats.average_rating} className="mt-2" />
          </Card>
        </Col>
      </Row>

      {/* Room Status */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Room Status" extra={<Text type="secondary">{stats.active_rooms} / {stats.total_rooms} Active</Text>}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Space>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <Text>Available Rooms</Text>
                </Space>
                <Text strong>{stats.active_rooms}</Text>
              </div>
              <Progress 
                percent={(stats.active_rooms / stats.total_rooms) * 100} 
                strokeColor="#52c41a"
                showInfo={false}
              />
              <div className="flex justify-between items-center">
                <Space>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <Text>Unavailable Rooms</Text>
                </Space>
                <Text strong>{stats.total_rooms - stats.active_rooms}</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Monthly Revenue Trend">
            <div className="h-32 flex items-end justify-between">
              {stats.monthly_revenue.map((revenue, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(revenue / Math.max(...stats.monthly_revenue)) * 100}%`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <Text className="text-xs mt-1">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index] || `M${index + 1}`}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Bookings */}
      <Card 
        title="Recent Bookings" 
        extra={
          <Button 
            type="link" 
            onClick={() => navigate(`/hotels/${hotelId}/bookings`)}
          >
            View All
          </Button>
        }
      >
        <Table
          columns={bookingColumns}
          dataSource={stats.recent_bookings}
          pagination={false}
          rowKey="id"
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Quick Actions */}
      <Divider />
      <div className="mb-6">
        <Title level={4}>Quick Actions</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Button 
              block 
              size="large"
              icon={<KeyOutlined />}
              onClick={() => navigate(`/hotels/${hotelId}/rooms`)}
            >
              Manage Rooms
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button 
              block 
              size="large"
              icon={<DollarOutlined />}
              onClick={() => navigate(`/hotels/${hotelId}/pricing`)}
            >
              Pricing
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button 
              block 
              size="large"
              icon={<TrophyOutlined />}
              onClick={() => navigate(`/hotels/${hotelId}/amenities`)}
            >
              Amenities
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button 
              block 
              size="large"
              icon={<SettingOutlined />}
              onClick={() => navigate(`/hotels/${hotelId}/facilities`)}
            >
              Facilities
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default HotelDashboard;
