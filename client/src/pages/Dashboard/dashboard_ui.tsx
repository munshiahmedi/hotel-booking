import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Spin, Button, Typography, Avatar, Dropdown, Menu, Badge, Progress, Input, Descriptions, Divider, Form, DatePicker, InputNumber, Select } from 'antd';
import { 
  HomeOutlined, 
  UserOutlined,
  CalendarOutlined,
  SearchOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  DollarOutlined,
  TeamOutlined,
  RiseOutlined,
  FallOutlined,
  PlusOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  StarOutlined,
  EnvironmentOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

const DashboardUI: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    navigate('/login');
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout }
  ];

  const sidebarMenuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: 'Dashboard',
      active: true
    },
    {
      key: 'bookings',
      icon: <CalendarOutlined />,
      label: 'My Bookings',
      badge: 3
    },
    {
      key: 'hotels',
      icon: <HomeOutlined />,
      label: 'My Hotels',
      badge: 2
    },
    {
      key: 'messages',
      icon: <FileTextOutlined />,
      label: 'Messages',
      badge: 5
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics'
    },
    {
      key: 'support',
      icon: <CustomerServiceOutlined />,
      label: 'Support'
    }
  ];

  const recentActivity = [
    { user: 'John Doe', action: 'booked a hotel', time: '2 hours ago', avatar: 'JD' },
    { user: 'Sarah Smith', action: 'left a review', time: '4 hours ago', avatar: 'SS' },
    { user: 'Mike Johnson', action: 'canceled booking', time: '6 hours ago', avatar: 'MJ' },
    { user: 'Emma Wilson', action: 'made a payment', time: '8 hours ago', avatar: 'EW' },
    { user: 'Tom Brown', action: 'updated profile', time: '1 day ago', avatar: 'TB' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${collapsed ? 'w-20' : 'w-64'} bg-gray-900 flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <HomeOutlined className="text-white text-lg" />
            </div>
            {!collapsed && <span className="text-xl font-bold text-white">HotelHub</span>}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6">
          {sidebarMenuItems.map((item) => (
            <div
              key={item.key}
              className={`px-6 py-3 flex items-center space-x-3 cursor-pointer transition-colors ${
                item.active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => {
                if (item.key === 'bookings') navigate('/my-bookings');
                else if (item.key === 'hotels') navigate('/my-hotels');
                else if (item.key === 'explore') navigate('/hotels');
                else if (item.key === 'profile') navigate('/profile');
              }}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge count={item.badge} size="small" />
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Collapse Button */}
        <div className="p-4 border-t border-gray-800">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="w-full text-gray-300 hover:text-white"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
          <div className="flex-1 max-w-xl">
            <Search
              placeholder="Search..."
              allowClear
              className="w-full"
              prefix={<SearchOutlined />}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined />} className="flex items-center justify-center w-10 h-10" />
            </Badge>
            
            {/* User Profile */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg">
                <Avatar 
                  src="https://picsum.photos/seed/user/40/40" 
                  size="large"
                  className="bg-blue-600"
                >
                  {(user?.name && typeof user.name === 'string' ? user.name[0] : 'U')}
                </Avatar>
                <div>
                  <div className="font-semibold text-gray-900">
                    {(user?.name && typeof user.name === 'string' ? user.name : 'User')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(user?.role && typeof user.role === 'string' ? user.role : 'User')}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <Title level={2} className="mb-2">Welcome back, {(user?.name && typeof user.name === 'string' ? user.name : 'User')}!</Title>
            <Text type="secondary">Here's what's happening with your hotel bookings today.</Text>
          </div>

          {/* Stats Cards */}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} sm={12} lg={6}>
              <Card className="h-32 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">$8,282</div>
                    <div className="text-gray-500 text-sm mt-1">Total Revenue</div>
                    <div className="flex items-center mt-2 text-green-600 text-xs">
                      <RiseOutlined className="mr-1" />
                      +12.5% from last month
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarOutlined className="text-blue-600 text-xl" />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="h-32 hover:shadow-lg transition-shadow border-l-4 border-green-500">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">1,293</div>
                    <div className="text-gray-500 text-sm mt-1">Total Bookings</div>
                    <div className="flex items-center mt-2 text-green-600 text-xs">
                      <RiseOutlined className="mr-1" />
                      +8.2% from last month
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CalendarOutlined className="text-green-600 text-xl" />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="h-32 hover:shadow-lg transition-shadow border-l-4 border-purple-500">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">2</div>
                    <div className="text-gray-500 text-sm mt-1">My Hotels</div>
                    <div className="flex items-center mt-2 text-red-600 text-xs">
                      <FallOutlined className="mr-1" />
                      -3.1% from last month
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <HomeOutlined className="text-purple-600 text-xl" />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="h-32 hover:shadow-lg transition-shadow border-l-4 border-orange-500">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">892</div>
                    <div className="text-gray-500 text-sm mt-1">Total Users</div>
                    <div className="flex items-center mt-2 text-green-600 text-xs">
                      <RiseOutlined className="mr-1" />
                      +18.7% from last month
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TeamOutlined className="text-orange-600 text-xl" />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Additional Cards Section */}
          <Row gutter={[24, 24]} className="mb-8">
            {/* Hotel Information Card */}
            <Col xs={24} lg={12}>
              <Card title="Featured Hotel" className="h-64">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Hotel Name" span={2}>
                    <Title level={5} className="m-0">Grand Plaza Hotel</Title>
                  </Descriptions.Item>
                  <Descriptions.Item label="Rating">
                    <div className="flex items-center">
                      <StarOutlined className="mr-1 text-yellow-500" />
                      <span>4.5 Stars</span>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800">
                      Active
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Address" span={2}>
                    <div className="flex items-start">
                      <EnvironmentOutlined className="mr-2 mt-1 text-gray-400" />
                      <Text>123 Main Street, New York, NY 10001</Text>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Description" span={2}>
                    <Text className="text-gray-600">Luxury hotel with premium amenities and excellent service in the heart of the city.</Text>
                  </Descriptions.Item>
                </Descriptions>
                <div className="mt-4">
                  <Button type="primary" size="small" onClick={() => navigate('/hotels/1')}>
                    View Details <ArrowRightOutlined />
                  </Button>
                </div>
              </Card>
            </Col>

            {/* Quick Booking Card */}
            <Col xs={24} lg={12}>
              <Card title="Quick Booking" className="h-64">
                <Form layout="vertical" size="small">
                  <Form.Item label="Check-in Date">
                    <DatePicker 
                      style={{ width: '100%' }} 
                      placeholder="Select check-in date"
                      defaultValue={dayjs()}
                    />
                  </Form.Item>
                  <Form.Item label="Check-out Date">
                    <DatePicker 
                      style={{ width: '100%' }} 
                      placeholder="Select check-out date"
                      defaultValue={dayjs().add(1, 'day')}
                    />
                  </Form.Item>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Form.Item label="Guests">
                        <InputNumber min={1} max={10} placeholder="Guests" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Rooms">
                        <InputNumber min={1} max={5} placeholder="Rooms" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item>
                    <Button type="primary" block onClick={() => navigate('/hotels')}>
                      Search Hotels
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>

          {/* More Statistics Cards */}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <div className="py-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ExclamationCircleOutlined className="text-red-600 text-2xl" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-gray-500 text-sm">Pending Bookings</div>
                  <div className="text-xs text-orange-600 mt-2">Requires attention</div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <div className="py-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ClockCircleOutlined className="text-blue-600 text-2xl" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">45</div>
                  <div className="text-gray-500 text-sm">Upcoming Check-ins</div>
                  <div className="text-xs text-blue-600 mt-2">Next 24 hours</div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <div className="py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircleOutlined className="text-green-600 text-2xl" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">856</div>
                  <div className="text-gray-500 text-sm">Completed Bookings</div>
                  <div className="text-xs text-green-600 mt-2">+15% this month</div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <div className="py-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <StarOutlined className="text-purple-600 text-2xl" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">4.8</div>
                  <div className="text-gray-500 text-sm">Average Rating</div>
                  <div className="text-xs text-purple-600 mt-2">Excellent service</div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Price Breakdown Card */}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} lg={12}>
              <Card title="Revenue Breakdown" className="h-64">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <Text strong>Room Revenue</Text>
                      <div className="text-xs text-gray-500">Main income source</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">$6,450</div>
                      <div className="text-xs text-green-600">+12%</div>
                    </div>
                  </div>
                  <Progress percent={78} strokeColor="#1890ff" />
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <Text strong>Additional Services</Text>
                      <div className="text-xs text-gray-500">SPA, dining, etc.</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">$1,832</div>
                      <div className="text-xs text-green-600">+8%</div>
                    </div>
                  </div>
                  <Progress percent={22} strokeColor="#52c41a" />
                  
                  <Divider />
                  <div className="flex justify-between">
                    <Title level={5} className="m-0">Total Revenue</Title>
                    <Title level={5} className="m-0 text-green-600">$8,282</Title>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Recent Bookings Summary */}
            <Col xs={24} lg={12}>
              <Card title="Booking Summary" className="h-64">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">24</div>
                      <div className="text-xs text-gray-600">Today</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">156</div>
                      <div className="text-xs text-gray-600">This Week</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">623</div>
                      <div className="text-xs text-gray-600">This Month</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-xl font-bold text-orange-600">1,293</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                  </div>
                  
                  <Divider />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Occupancy Rate</span>
                      <span className="font-semibold">78%</span>
                    </div>
                    <Progress percent={78} size="small" strokeColor="#1890ff" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Average Stay</span>
                      <span className="font-semibold">3.2 nights</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Revenue per Night</span>
                      <span className="font-semibold">$268</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Charts and Activity */}
          <Row gutter={[24, 24]}>
            {/* Revenue Chart */}
            <Col xs={24} lg={16}>
              <Card title="Revenue Overview" className="h-96">
                <div className="h-64 flex flex-col justify-center">
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">January</span>
                      <span className="font-semibold">$12,450</span>
                    </div>
                    <Progress percent={75} size="small" className="mb-4" strokeColor="#1890ff" />
                  </div>
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">February</span>
                      <span className="font-semibold">$15,230</span>
                    </div>
                    <Progress percent={85} size="small" className="mb-4" strokeColor="#52c41a" />
                  </div>
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">March</span>
                      <span className="font-semibold">$8,920</span>
                    </div>
                    <Progress percent={65} size="small" className="mb-4" strokeColor="#faad14" />
                  </div>
                  <div className="text-center mt-4">
                    <Text type="secondary">Revenue trends over the last 3 months</Text>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Recent Activity */}
            <Col xs={24} lg={8}>
              <Card title="Recent Activity" className="h-96">
                <div className="space-y-4 overflow-y-auto max-h-80">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                      <Avatar size="small" className="bg-blue-600">
                        {activity.avatar}
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-semibold">{activity.user}</span>
                          <span className="text-gray-500"> {activity.action}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Card title="Quick Actions" className="mt-8">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="w-full h-12"
                  onClick={() => navigate('/create-hotel')}
                >
                  Add New Hotel
                </Button>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button
                  icon={<SearchOutlined />}
                  className="w-full h-12"
                  onClick={() => navigate('/hotels')}
                >
                  Explore Hotels
                </Button>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button
                  icon={<CalendarOutlined />}
                  className="w-full h-12"
                  onClick={() => navigate('/my-bookings')}
                >
                  View Bookings
                </Button>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button
                  icon={<BarChartOutlined />}
                  className="w-full h-12"
                >
                  View Analytics
                </Button>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardUI;
