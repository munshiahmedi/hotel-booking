// src/pages/BookingDetails/BookingDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Descriptions, Button, Tag, message, Spin, Row, Col, Space } from 'antd';
import { 
  ArrowLeftOutlined, 
  CalendarOutlined, 
  EnvironmentOutlined
} from '@ant-design/icons';
import { bookingApi } from '../../services/api';

const { Title, Text, Paragraph } = Typography;

interface BookingDetails {
  id: string;
  hotelId: string;
  hotelName: string;
  hotelAddress: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  rooms: number;
  guests: number;
  roomType: string;
  bookingReference: string;
  specialRequests?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBookingDetails(id);
    }
  }, [id]);

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      setLoading(true);
      const response = await bookingApi.getBookingById(bookingId);
      setBooking(response.data);
    } catch (error) {
      message.error('Failed to fetch booking details. Please try again.');
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'orange';
      case 'refunded': return 'red';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Title level={3}>Booking not found</Title>
          <Button type="primary" onClick={() => navigate('/my-bookings')}>
            Back to My Bookings
          </Button>
        </div>
      </div>
    );
  }

  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/my-bookings')}
        className="mb-4"
      >
        Back to My Bookings
      </Button>

      <Card loading={loading}>
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Title level={2} className="mb-2">Booking Details</Title>
              <Text type="secondary">Reference: {booking.bookingReference}</Text>
            </div>
            <div className="text-right">
              <Tag color={getStatusColor(booking.status)} className="mb-2">
                {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Unknown'}
              </Tag>
              <br />
              <Tag color={getPaymentStatusColor(booking.paymentStatus)}>
                Payment: {booking.paymentStatus ? booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1) : 'Unknown'}
              </Tag>
            </div>
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {/* Hotel Information */}
          <Col xs={24} md={12}>
            <Card title="Hotel Information" size="small" className="mb-4">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Hotel Name">{booking.hotelName}</Descriptions.Item>
                <Descriptions.Item label="Address">
                  <div className="flex items-start">
                    <EnvironmentOutlined className="mr-2 mt-1 text-gray-400" />
                    <Text>{booking.hotelAddress}</Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Room Type">{booking.roomType}</Descriptions.Item>
                <Descriptions.Item label="Number of Rooms">{booking.rooms}</Descriptions.Item>
                <Descriptions.Item label="Number of Guests">{booking.guests}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Booking Information */}
          <Col xs={24} md={12}>
            <Card title="Booking Information" size="small" className="mb-4">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Check-in">
                  <div className="flex items-center">
                    <CalendarOutlined className="mr-2 text-gray-400" />
                    <Text>{new Date(booking.checkIn).toLocaleDateString()}</Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Check-out">
                  <div className="flex items-center">
                    <CalendarOutlined className="mr-2 text-gray-400" />
                    <Text>{new Date(booking.checkOut).toLocaleDateString()}</Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Duration">{nights} night(s)</Descriptions.Item>
                <Descriptions.Item label="Booking Date">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {/* Pricing Details */}
        <Card title="Pricing Details" size="small" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Room Rate">
                  ${(booking.totalPrice / nights).toFixed(2)} / night
                </Descriptions.Item>
                <Descriptions.Item label="Number of Nights">{nights}</Descriptions.Item>
                <Descriptions.Item label="Subtotal">
                  ${(booking.totalPrice).toFixed(2)}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} md={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Taxes & Fees">$0.00</Descriptions.Item>
                <Descriptions.Item label="Total Amount" className="font-semibold">
                  <span className="text-green-600 text-lg">${booking.totalPrice.toFixed(2)}</span>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>

        {/* Special Requests */}
        {booking.specialRequests && (
          <Card title="Special Requests" size="small" className="mb-4">
            <Paragraph>{booking.specialRequests}</Paragraph>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            <div>Booking ID: {booking.id}</div>
            <div>Last Updated: {new Date(booking.updatedAt).toLocaleDateString()}</div>
          </div>
          <Space>
            {booking.status === 'pending' && (
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate(`/bookings/${booking.id}/payment`)}
              >
                Complete Payment
              </Button>
            )}
            {booking.status === 'confirmed' && (
              <Button 
                type="default" 
                size="large"
                onClick={() => navigate(`/hotels/${booking.hotelId}`)}
              >
                View Hotel
              </Button>
            )}
            <Button 
              type="default" 
              size="large"
              onClick={() => window.print()}
            >
              Print Details
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default BookingDetailsPage;
