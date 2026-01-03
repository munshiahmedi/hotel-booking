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
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>Admin Dashboard</Title>
        <Text type="secondary">Overview of system performance and activities</Text>
      </div>

      {/* Key Metrics */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Hotels"
              value={stats.totalHotels}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Bookings"
              value={stats.totalBookings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Hotels"
              value={stats.pendingHotels}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix={
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => navigate('/admin/hotel-approval')}
                >
                  Review
                </Button>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Bookings"
              value={stats.activeBookings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card title="Monthly Growth">
            <Progress
              percent={stats.monthlyGrowth}
              status="active"
              format={(percent) => `${percent?.toFixed(1)}%`}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card title="Occupancy Rate">
            <Progress
              percent={stats.occupancyRate}
              status="active"
              format={(percent) => `${percent?.toFixed(1)}%`}
              strokeColor={{
                '0%': '#ff7a45',
                '100%': '#ffa940',
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24}>
          <Card title="Quick Actions">
            <Space wrap>
              <Button 
                type="primary" 
                icon={<UserOutlined />}
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </Button>
              <Button 
                icon={<HomeOutlined />}
                onClick={() => navigate('/admin/hotel-approval')}
              >
                Review Hotels
              </Button>
              <Button 
                icon={<CalendarOutlined />}
                onClick={() => navigate('/admin/bookings')}
              >
                Monitor Bookings
              </Button>
              <Button 
                icon={<DollarOutlined />}
                onClick={() => navigate('/admin/payments')}
              >
                View Transactions
              </Button>
              <Button 
                icon={<EyeOutlined />}
                onClick={() => navigate('/admin/audit')}
              >
                Audit Logs
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card title="Recent Activity">
            <Table
              columns={activityColumns}
              dataSource={recentActivity}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
