// src/pages/MyBookings/MyBookingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Typography, Tag, message, Space } from 'antd';
import { EyeOutlined, CalendarOutlined, ArrowLeftOutlined, StopOutlined } from '@ant-design/icons';
import { bookingApi } from '../../services/api';

const { Title } = Typography;

interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  rooms: number;
  guests: number;
  createdAt: string;
}

const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    // Check for cancelled bookings in localStorage and update status
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
      
      // Debug: Check if token exists
      const token = localStorage.getItem('token');
      console.log('Token in localStorage:', token ? 'exists' : 'missing');
      console.log('Token value:', token);
      
      const response = await bookingApi.getMyBookings();
      console.log('Bookings API Response:', response.data);
      
      // Handle different response structures
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
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      message.error('Failed to fetch bookings. Please try again.');
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

  const columns = [
    {
      title: 'Hotel',
      dataIndex: 'hotelName',
      key: 'hotelName',
      render: (text: string, record: Booking) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">ID: {record.hotelId}</div>
        </div>
      ),
    },
    {
      title: 'Check-in / Check-out',
      key: 'dates',
      render: (_: any, record: Booking) => (
        <div>
          <div className="flex items-center text-sm">
            <CalendarOutlined className="mr-1" />
            {new Date(record.checkIn).toLocaleDateString()}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarOutlined className="mr-1" />
            {new Date(record.checkOut).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Details',
      key: 'details',
      render: (_: any, record: Booking) => (
        <div>
          <div className="text-sm">{record.rooms} Room(s)</div>
          <div className="text-sm text-gray-500">{record.guests} Guest(s)</div>
        </div>
      ),
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => (
        <span className="font-semibold text-green-600">${price}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Booking) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />} 
            type="text"
            onClick={() => navigate(`/bookings/${record.id}`)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <Button 
              type="primary" 
              size="small"
              onClick={() => navigate(`/bookings/${record.id}/payment`)}
            >
              Pay Now
            </Button>
          )}
          {(record.status === 'confirmed' || record.status === 'pending') && (
            <Button 
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={() => navigate(`/bookings/${record.id}/cancel`)}
            >
              Cancel
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            type="default" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/dashboard')}
          >
            Back
          </Button>
          <Title level={2} className="mb-0">My Bookings</Title>
        </div>
        <Button 
          type="primary" 
          onClick={() => navigate('/hotels')}
        >
          Browse Hotels
        </Button>
      </div>

      <Card>
        <Table 
          columns={columns} 
          dataSource={bookings} 
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} bookings`
          }}
        />
      </Card>
    </div>
  );
};

export default MyBookingsPage;
