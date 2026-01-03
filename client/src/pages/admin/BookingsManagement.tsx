// src/pages/admin/BookingsManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/adminService';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Spin,
  Typography,
  Input,
  Select,
  DatePicker,
  Modal
} from 'antd';
import {
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  HomeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Booking {
  id: string;
  user: string;
  userEmail: string;
  hotel: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  rooms: number;
  createdAt: string;
}

const BookingsManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<any>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllBookings({
        status: statusFilter,
        search: searchText,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD')
      });
      
      // Transform API response to match our interface
      const transformedBookings = response.data.bookings?.map((booking: any) => ({
        id: booking.id.toString(),
        user: booking.user?.name || 'Unknown',
        userEmail: booking.user?.email || 'unknown@example.com',
        hotel: booking.hotel?.name || 'Unknown Hotel',
        checkIn: new Date(booking.check_in_date).toLocaleDateString(),
        checkOut: new Date(booking.check_out_date).toLocaleDateString(),
        status: booking.status || 'pending',
        totalAmount: booking.total_amount || 0,
        rooms: booking.number_of_rooms || 1,
        createdAt: new Date(booking.created_at).toLocaleDateString()
      })) || [];
      
      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      message.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchText, dateRange]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const viewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchText || 
      booking.user.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.userEmail.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.hotel.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    
    // TODO: Add date range filtering logic
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Booking ID',
      dataIndex: 'id',
      key: 'id',
      width: 120
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (text: string, record: Booking) => (
        <Space direction="vertical" size="small">
          <Space>
            <UserOutlined />
            <span>{text}</span>
          </Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.userEmail}
          </Text>
        </Space>
      )
    },
    {
      title: 'Hotel',
      dataIndex: 'hotel',
      key: 'hotel',
      render: (text: string) => (
        <Space>
          <HomeOutlined />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Check-in / Check-out',
      key: 'dates',
      render: (_: any, record: Booking) => (
        <Space direction="vertical" size="small">
          <Space>
            <CalendarOutlined />
            <span>{record.checkIn}</span>
          </Space>
          <Text type="secondary">{record.checkOut}</Text>
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
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        <Text strong>{formatCurrency(amount)}</Text>
      )
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Booking) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => viewDetails(record)}
        >
          View
        </Button>
      )
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
        <Title level={2}>Bookings Management</Title>
        <Text type="secondary">Monitor and manage all hotel bookings</Text>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Space wrap size="middle">
          <Search
            placeholder="Search by user, email, hotel, or booking ID"
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => !e.target.value && setSearchText('')}
          />
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150 }}
            onChange={setStatusFilter}
          >
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="cancelled">Cancelled</Option>
            <Option value="completed">Completed</Option>
          </Select>
          <RangePicker
            placeholder={['Check-in date', 'Check-out date']}
            onChange={setDateRange}
          />
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} bookings`
          }}
        />
      </Card>

      <Modal
        title="Booking Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedBooking && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>Booking ID:</Text> {selectedBooking.id}
              </div>
              <div>
                <Text strong>User:</Text> {selectedBooking.user} ({selectedBooking.userEmail})
              </div>
              <div>
                <Text strong>Hotel:</Text> {selectedBooking.hotel}
              </div>
              <div>
                <Text strong>Check-in:</Text> {selectedBooking.checkIn}
              </div>
              <div>
                <Text strong>Check-out:</Text> {selectedBooking.checkOut}
              </div>
              <div>
                <Text strong>Number of Rooms:</Text> {selectedBooking.rooms}
              </div>
              <div>
                <Text strong>Total Amount:</Text> {formatCurrency(selectedBooking.totalAmount)}
              </div>
              <div>
                <Text strong>Status:</Text>{' '}
                <Tag color={getStatusColor(selectedBooking.status)}>
                  {selectedBooking.status.toUpperCase()}
                </Tag>
              </div>
              <div>
                <Text strong>Created At:</Text> {selectedBooking.createdAt}
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingsManagement;
