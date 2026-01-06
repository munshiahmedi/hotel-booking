// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Table,
  Button,
  Space,
  message,
  Spin,
  Tag,
  Progress
} from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  DollarOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../utils/AuthContext';

const { Title, Text } = Typography;

interface AdminStats {
  totalUsers: number;
  totalHotels: number;
  totalBookings: number;
  totalRevenue: number;
  pendingHotels: number;
  activeBookings: number;
  monthlyGrowth: number;
  occupancyRate: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'hotel' | 'user' | 'payment';
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalHotels: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingHotels: 0,
    activeBookings: 0,
    monthlyGrowth: 0,
    occupancyRate: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls
      // const statsResponse = await adminApi.getStats();
      // const activityResponse = await adminApi.getRecentActivity();
      
      // Set empty data for now - replace with real API calls
      setStats({
        totalUsers: 0,
        totalHotels: 0,
        totalBookings: 0,
        totalRevenue: 0,
        pendingHotels: 0,
        activeBookings: 0,
        monthlyGrowth: 0,
        occupancyRate: 0
      });
      
      setRecentActivity([]);
    } catch (error) {
      message.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return <CalendarOutlined />;
      case 'hotel': return <HomeOutlined />;
      case 'user': return <UserOutlined />;
      case 'payment': return <DollarOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      default: return 'default';
    }
  };

  const activityColumns = [
    {
      title: 'Activity',
      dataIndex: 'description',
      key: 'description',
      render: (text: string, record: RecentActivity) => (
        <Space>
          {getActivityIcon(record.type)}
          <span>{text}</span>
        </Space>
      )
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
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-400">Overview of system performance and activities</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Last updated</p>
                <p className="text-white font-medium">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-700/30 backdrop-blur-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-sm font-medium mb-2">Total Users</p>
                  <p className="text-3xl font-bold text-white mb-1">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-green-400 text-sm">+12.5% from last month</p>
                </div>
                <div className="bg-blue-600/30 p-4 rounded-2xl">
                  <UserOutlined className="text-blue-400 text-2xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-700/30 backdrop-blur-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium mb-2">Total Hotels</p>
                  <p className="text-3xl font-bold text-white mb-1">{stats.totalHotels.toLocaleString()}</p>
                  <p className="text-green-400 text-sm">+8.3% from last month</p>
                </div>
                <div className="bg-green-600/30 p-4 rounded-2xl">
                  <HomeOutlined className="text-green-400 text-2xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-700/30 backdrop-blur-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm font-medium mb-2">Total Bookings</p>
                  <p className="text-3xl font-bold text-white mb-1">{stats.totalBookings.toLocaleString()}</p>
                  <p className="text-green-400 text-sm">+15.2% from last month</p>
                </div>
                <div className="bg-purple-600/30 p-4 rounded-2xl">
                  <CalendarOutlined className="text-purple-400 text-2xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-700/30 backdrop-blur-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-400 text-sm font-medium mb-2">Total Revenue</p>
                  <p className="text-3xl font-bold text-white mb-1">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-green-400 text-sm">+18.7% from last month</p>
                </div>
                <div className="bg-orange-600/30 p-4 rounded-2xl">
                  <DollarOutlined className="text-orange-400 text-2xl" />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Performance Metrics */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border-yellow-700/30 backdrop-blur-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-yellow-400 text-sm font-medium">Pending Hotels</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingHotels}</p>
                </div>
                <div className="bg-yellow-600/30 p-3 rounded-xl">
                  <ClockCircleOutlined className="text-yellow-400 text-xl" />
                </div>
              </div>
              <Button 
                type="primary" 
                size="small"
                className="bg-yellow-600 border-yellow-600 hover:bg-yellow-700"
                onClick={() => navigate('/admin/hotel-approval')}
              >
                Review Now
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-700/30 backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium">Active Bookings</p>
                  <p className="text-2xl font-bold text-white">{stats.activeBookings}</p>
                </div>
                <div className="bg-green-600/30 p-3 rounded-xl">
                  <CheckCircleOutlined className="text-green-400 text-xl" />
                </div>
              </div>
              <div className="mt-4">
                <Progress 
                  percent={75} 
                  strokeColor="#52c41a"
                  trailColor="#1f2937"
                  size="small"
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 border-cyan-700/30 backdrop-blur-lg">
              <div className="mb-4">
                <p className="text-cyan-400 text-sm font-medium">Monthly Growth</p>
                <p className="text-2xl font-bold text-white">{stats.monthlyGrowth.toFixed(1)}%</p>
              </div>
              <Progress
                percent={stats.monthlyGrowth}
                strokeColor={{
                  '0%': '#06b6d4',
                  '100%': '#0891b2',
                }}
                trailColor="#1f2937"
                format={(percent) => `${percent?.toFixed(1)}%`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 border-pink-700/30 backdrop-blur-lg">
              <div className="mb-4">
                <p className="text-pink-400 text-sm font-medium">Occupancy Rate</p>
                <p className="text-2xl font-bold text-white">{stats.occupancyRate.toFixed(1)}%</p>
              </div>
              <Progress
                percent={stats.occupancyRate}
                strokeColor={{
                  '0%': '#ec4899',
                  '100%': '#db2777',
                }}
                trailColor="#1f2937"
                format={(percent) => `${percent?.toFixed(1)}%`}
              />
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24}>
            <Card className="bg-gray-800/50 border-gray-700/30 backdrop-blur-lg">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Quick Actions</h3>
                <p className="text-gray-400">Manage your system efficiently</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Button 
                  className="h-16 bg-blue-600/20 border-blue-700/30 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 flex flex-col items-center justify-center"
                  onClick={() => navigate('/admin/users')}
                >
                  <UserOutlined className="text-xl mb-1" />
                  <span className="text-xs">Users</span>
                </Button>
                <Button 
                  className="h-16 bg-green-600/20 border-green-700/30 text-green-400 hover:bg-green-600/30 hover:text-green-300 flex flex-col items-center justify-center"
                  onClick={() => navigate('/admin/hotel-approval')}
                >
                  <HomeOutlined className="text-xl mb-1" />
                  <span className="text-xs">Hotels</span>
                </Button>
                <Button 
                  className="h-16 bg-purple-600/20 border-purple-700/30 text-purple-400 hover:bg-purple-600/30 hover:text-purple-300 flex flex-col items-center justify-center"
                  onClick={() => navigate('/admin/bookings')}
                >
                  <CalendarOutlined className="text-xl mb-1" />
                  <span className="text-xs">Bookings</span>
                </Button>
                <Button 
                  className="h-16 bg-orange-600/20 border-orange-700/30 text-orange-400 hover:bg-orange-600/30 hover:text-orange-300 flex flex-col items-center justify-center"
                  onClick={() => navigate('/admin/payments')}
                >
                  <DollarOutlined className="text-xl mb-1" />
                  <span className="text-xs">Payments</span>
                </Button>
                <Button 
                  className="h-16 bg-cyan-600/20 border-cyan-700/30 text-cyan-400 hover:bg-cyan-600/30 hover:text-cyan-300 flex flex-col items-center justify-center"
                  onClick={() => navigate('/admin/audit')}
                >
                  <EyeOutlined className="text-xl mb-1" />
                  <span className="text-xs">Audit</span>
                </Button>
                <Button 
                  className="h-16 bg-pink-600/20 border-pink-700/30 text-pink-400 hover:bg-pink-600/30 hover:text-pink-300 flex flex-col items-center justify-center"
                >
                  <CheckCircleOutlined className="text-xl mb-1" />
                  <span className="text-xs">Reports</span>
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity */}
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card className="bg-gray-800/50 border-gray-700/30 backdrop-blur-lg">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Recent Activity</h3>
                <p className="text-gray-400">Latest system events and updates</p>
              </div>
              <Table
                columns={[
                  {
                    title: 'Activity',
                    dataIndex: 'description',
                    key: 'description',
                    render: (text: string, record: RecentActivity) => (
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          record.type === 'booking' ? 'bg-purple-600/20 text-purple-400' :
                          record.type === 'hotel' ? 'bg-green-600/20 text-green-400' :
                          record.type === 'user' ? 'bg-blue-600/20 text-blue-400' :
                          'bg-orange-600/20 text-orange-400'
                        }`}>
                          {getActivityIcon(record.type)}
                        </div>
                        <span className="text-white">{text}</span>
                      </div>
                    )
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status: string) => (
                      <Tag className={`${
                        status === 'success' ? 'bg-green-600/20 text-green-400 border-green-700/30' :
                        status === 'pending' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-700/30' :
                        'bg-red-600/20 text-red-400 border-red-700/30'
                      } border-none`}>
                        {status.toUpperCase()}
                      </Tag>
                    )
                  },
                  {
                    title: 'Time',
                    dataIndex: 'timestamp',
                    key: 'timestamp',
                    render: (time: string) => (
                      <span className="text-gray-400">{time}</span>
                    )
                  }
                ]}
                dataSource={recentActivity}
                pagination={false}
                className="bg-transparent"
                rowClassName="border-gray-700/30 hover:bg-gray-700/20"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AdminDashboard;
