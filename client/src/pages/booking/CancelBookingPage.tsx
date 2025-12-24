// src/pages/booking/CancelBookingPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Alert,
  Spin,
  message,
  Space,
  Divider,
  Tag,
  Modal
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../utils/AuthContext';

const { Title, Text, Paragraph } = Typography;

interface BookingDetails {
  id: string;
  hotel_name: string;
  hotel_address: string;
  room_type: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  payment_status: 'paid' | 'pending' | 'refunded';
  created_at: string;
  cancellation_policy: {
    free_cancellation_before: string;
    cancellation_fee_percentage: number;
    refund_percentage: number;
  };
}

const CancelBookingPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [refundStatus, setRefundStatus] = useState<'processing' | 'success' | 'failed' | null>(null);

  const bookingId = location.pathname.split('/').pop();

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, token]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await bookingApi.getBookingDetails(bookingId);
      
      // Set null for now - replace with real API call
      setBooking(null);
      message.error('Booking not found. Please check the booking ID.');
    } catch (error) {
      message.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    try {
      setCancelling(true);
      setRefundModalVisible(true);
      setRefundStatus('processing');

      // Mock API call for cancellation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate refund processing
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        setRefundStatus('success');
        setBooking({
          ...booking,
          status: 'cancelled',
          payment_status: 'refunded'
        });
        
        // Update booking status in localStorage for MyBookingsPage
        const cancelledBookings = JSON.parse(localStorage.getItem('cancelledBookings') || '[]');
        cancelledBookings.push(booking.id);
        localStorage.setItem('cancelledBookings', JSON.stringify(cancelledBookings));
        
        message.success('Booking cancelled and refund processed successfully');
        
        // Navigate back to My Bookings after successful cancellation
        setTimeout(() => {
          navigate('/my-bookings');
        }, 2000);
      } else {
        setRefundStatus('failed');
        message.error('Refund processing failed. Please contact support.');
      }
    } catch (error) {
      setRefundStatus('failed');
      message.error('Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isFreeCancellation = () => {
    if (!booking) return false;
    const now = new Date();
    const freeCancellationDate = new Date(booking.cancellation_policy.free_cancellation_before);
    return now <= freeCancellationDate;
  };

  const calculateRefundAmount = () => {
    if (!booking) return 0;
    if (isFreeCancellation()) return booking.total_amount;
    
    const refundPercentage = booking.cancellation_policy.refund_percentage;
    return booking.total_amount * (refundPercentage / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6">
        <Alert
          message="Booking Not Found"
          description="The booking you're looking for doesn't exist or you don't have permission to view it."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/my-bookings')}
          className="mb-4"
        >
          Back to My Bookings
        </Button>
        <Title level={2}>Cancel Booking</Title>
        <Text type="secondary">Review your booking details before cancellation</Text>
      </div>

      {/* Booking Details */}
      <Card className="mb-6">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <div className="space-y-4">
              <div>
                <Title level={4}>{booking.hotel_name}</Title>
                <Text type="secondary">
                  <EnvironmentOutlined /> {booking.hotel_address}
                </Text>
              </div>
              
              <Divider />
              
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-gray-500" />
                    <div>
                      <div className="font-medium">Check-in</div>
                      <Text type="secondary">{formatDate(booking.check_in)}</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-gray-500" />
                    <div>
                      <div className="font-medium">Check-out</div>
                      <Text type="secondary">{formatDate(booking.check_out)}</Text>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="flex items-center gap-2">
                    <UserOutlined className="text-gray-500" />
                    <div>
                      <div className="font-medium">Room Type</div>
                      <Text type="secondary">{booking.room_type}</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="flex items-center gap-2">
                    <UserOutlined className="text-gray-500" />
                    <div>
                      <div className="font-medium">Guests</div>
                      <Text type="secondary">{booking.guests} guests</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
          
          <Col xs={24} md={8}>
            <Card size="small">
              <div className="text-center">
                <div className="mb-2">
                  <Tag color={getStatusColor(booking.status)}>
                    {booking.status.toUpperCase()}
                  </Tag>
                </div>
                <div className="mb-4">
                  <Title level={3} className="mb-1">
                    {formatCurrency(booking.total_amount)}
                  </Title>
                  <Text type="secondary">Total Amount</Text>
                </div>
                <div>
                  <Tag color={booking.payment_status === 'paid' ? 'green' : 'orange'}>
                    {booking.payment_status.toUpperCase()}
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Cancellation Policy */}
      <Card className="mb-6" title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined />
          <span>Cancellation Policy</span>
        </div>
      }>
        <div className="space-y-3">
          <Alert
            message={
              isFreeCancellation()
                ? "Free Cancellation Available"
                : "Cancellation Fee Applies"
            }
            description={
              isFreeCancellation()
                ? `You can cancel this booking for free before ${formatDate(booking.cancellation_policy.free_cancellation_before)}`
                : `Cancellations after ${formatDate(booking.cancellation_policy.free_cancellation_before)} will incur a ${booking.cancellation_policy.cancellation_fee_percentage}% fee`
            }
            type={isFreeCancellation() ? "success" : "warning"}
            showIcon
          />
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text strong>Free Cancellation Before:</Text>
                <br />
                <Text type="secondary">{formatDate(booking.cancellation_policy.free_cancellation_before)}</Text>
              </div>
              <div>
                <Text strong>Refund Amount:</Text>
                <br />
                <Text className="text-lg font-medium text-green-600">
                  {formatCurrency(calculateRefundAmount())}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Cancellation Actions */}
      <Card>
        <div className="text-center space-y-4">
          <Title level={4}>Are you sure you want to cancel this booking?</Title>
          <Paragraph type="secondary">
            This action cannot be undone. Your refund will be processed according to the cancellation policy.
          </Paragraph>
          
          <Space size="large">
            <Button
              size="large"
              onClick={() => navigate('/my-bookings')}
            >
              Keep Booking
            </Button>
            <Button
              type="primary"
              danger
              size="large"
              loading={cancelling}
              onClick={handleCancelBooking}
              disabled={booking.status === 'cancelled'}
            >
              {booking.status === 'cancelled' ? 'Already Cancelled' : 'Cancel Booking'}
            </Button>
          </Space>
        </div>
      </Card>

      {/* Refund Processing Modal */}
      <Modal
        title="Processing Refund"
        open={refundModalVisible}
        closable={false}
        footer={null}
        width={400}
      >
        <div className="text-center py-6">
          {refundStatus === 'processing' && (
            <div>
              <Spin size="large" className="mb-4" />
              <Title level={4}>Processing Refund</Title>
              <Text type="secondary">Please wait while we process your refund...</Text>
            </div>
          )}
          
          {refundStatus === 'success' && (
            <div>
              <CheckCircleOutlined className="text-5xl text-green-500 mb-4" />
              <Title level={4}>Refund Processed Successfully</Title>
              <Text type="secondary">
                Your refund of {formatCurrency(calculateRefundAmount())} has been processed.
              </Text>
              <div className="mt-6">
                <Button
                  type="primary"
                  onClick={() => {
                    setRefundModalVisible(false);
                    navigate('/my-bookings');
                  }}
                >
                  View My Bookings
                </Button>
              </div>
            </div>
          )}
          
          {refundStatus === 'failed' && (
            <div>
              <CloseCircleOutlined className="text-5xl text-red-500 mb-4" />
              <Title level={4}>Refund Processing Failed</Title>
              <Text type="secondary">
                We couldn't process your refund automatically. Please contact our support team.
              </Text>
              <div className="mt-6">
                <Space>
                  <Button onClick={() => setRefundModalVisible(false)}>
                    Close
                  </Button>
                  <Button type="primary">
                    Contact Support
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CancelBookingPage;
