// src/pages/booking/PaymentResultPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Row, 
  Col,
  Button, 
  Alert, 
  Spin,
  message,
  Space,
  Divider,
  Tag,
  Steps
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
  HomeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useAuth } from '../../utils/AuthContext';
import { paymentService, PaymentStatus } from '../../services/payment.service';
import { BookingResponse } from '../../services/booking.service';
import PriceBreakdown from '../../components/booking/PriceBreakdown';

const { Title, Text, Paragraph } = Typography;

interface PaymentResultState {
  booking: BookingResponse;
  payment: any;
  bookingDetails: any;
  idempotencyKey: string;
}

const PaymentResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResultState | null>(null);

  useEffect(() => {
    const resultData = location.state;
    if (!resultData || !resultData.booking || !resultData.payment) {
      message.error('Missing payment information. Please try again.');
      navigate('/dashboard');
      return;
    }

    setPaymentResult(resultData);
    
    // Check payment status
    const checkPaymentStatus = async () => {
      try {
        setLoading(true);
        const status = await paymentService.getPaymentStatus(resultData.booking.id);
        setPaymentStatus(status);
      } catch (error: any) {
        message.error(error.message || 'Failed to check payment status');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();

    // Set up polling for pending payments
    const interval = setInterval(() => {
      if (paymentStatus?.status === 'pending') {
        checkPaymentStatus();
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [location.state, navigate, token, paymentStatus?.status]);

  const handleRetryPayment = async () => {
    if (!paymentResult) return;

    try {
      setRetrying(true);
      const retryPayment = await paymentService.retryPayment(
        paymentResult.booking.id,
        paymentResult.idempotencyKey
      );
      
      setPaymentStatus({
        status: 'pending',
        transaction_id: retryPayment.transaction_id
      });
      
      message.info('Payment retry initiated. Please wait...');
    } catch (error: any) {
      message.error(error.message || 'Payment retry failed');
    } finally {
      setRetrying(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!paymentResult) return;

    try {
      await paymentService.cancelPayment(paymentResult.booking.id);
      message.info('Payment cancelled');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.message || 'Failed to cancel payment');
    }
  };

  const handleViewBooking = () => {
    navigate(`/bookings/${paymentResult?.booking.id}`);
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4">
            <Text>Processing payment...</Text>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentResult || !paymentStatus) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert
          message="Payment Information Unavailable"
          description="Unable to load payment details. Please try again."
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          }
        />
      </div>
    );
  }

  const isSuccess = paymentStatus.status === 'completed';
  const isFailed = paymentStatus.status === 'failed';
  const isPending = paymentStatus.status === 'pending';
  const isCancelled = paymentStatus.status === 'cancelled';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-4">
          {isSuccess ? (
            <CheckCircleOutlined className="text-6xl text-green-500" />
          ) : isFailed ? (
            <CloseCircleOutlined className="text-6xl text-red-500" />
          ) : isPending ? (
            <LoadingOutlined className="text-6xl text-blue-500" />
          ) : (
            <CloseCircleOutlined className="text-6xl text-gray-500" />
          )}
        </div>
        
        <Title level={2}>
          {isSuccess ? 'Payment Successful!' : 
           isFailed ? 'Payment Failed' : 
           isPending ? 'Processing Payment...' : 
           'Payment Cancelled'}
        </Title>
        
        <Paragraph type="secondary">
          {isSuccess ? 'Your booking has been confirmed successfully.' :
           isFailed ? 'We were unable to process your payment. Please try again.' :
           isPending ? 'Please wait while we process your payment.' :
           'The payment has been cancelled.'}
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column - Status and Actions */}
        <Col xs={24} lg={16}>
          {/* Payment Status Card */}
          <Card className="mb-6">
            <Title level={4}>Payment Status</Title>
            
            <Steps 
              current={isSuccess ? 2 : isPending ? 1 : 0} 
              className="mb-6"
              items={[
                { title: 'Initiated' },
                { title: 'Processing' },
                { title: 'Completed' }
              ]}
            />

            <Space direction="vertical" className="w-full" size="middle">
              <div className="flex justify-between items-center">
                <Text strong>Payment Status:</Text>
                <Tag color={isSuccess ? 'green' : isFailed ? 'red' : isPending ? 'blue' : 'default'}>
                  {paymentStatus.status.toUpperCase()}
                </Tag>
              </div>

              {paymentStatus.transaction_id && (
                <div className="flex justify-between">
                  <Text strong>Transaction ID:</Text>
                  <Text code>{paymentStatus.transaction_id}</Text>
                </div>
              )}

              <div className="flex justify-between">
                <Text strong>Amount:</Text>
                <Text strong>${paymentResult.payment.amount.toFixed(2)}</Text>
              </div>

              <div className="flex justify-between">
                <Text strong>Payment Method:</Text>
                <Text>{paymentResult.payment.payment_method}</Text>
              </div>

              {paymentStatus.error_message && (
                <Alert
                  message="Payment Error"
                  description={paymentStatus.error_message}
                  type="error"
                  showIcon
                />
              )}
            </Space>

            <Divider />

            {/* Action Buttons */}
            <Space wrap>
              {isSuccess && (
                <>
                  <Button 
                    type="primary" 
                    icon={<FileTextOutlined />}
                    onClick={handleViewBooking}
                  >
                    View Booking
                  </Button>
                  <Button 
                    icon={<HomeOutlined />}
                    onClick={handleGoHome}
                  >
                    Go to Dashboard
                  </Button>
                </>
              )}

              {isFailed && (
                <>
                  <Button 
                    type="primary" 
                    icon={<ReloadOutlined />}
                    onClick={handleRetryPayment}
                    loading={retrying}
                  >
                    Retry Payment
                  </Button>
                  <Button 
                    icon={<CloseCircleOutlined />}
                    onClick={handleCancelPayment}
                  >
                    Cancel
                  </Button>
                </>
              )}

              {isPending && (
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={handleCancelPayment}
                >
                  Cancel Payment
                </Button>
              )}

              {isCancelled && (
                <Button 
                  icon={<HomeOutlined />}
                  onClick={handleGoHome}
                >
                  Go to Dashboard
                </Button>
              )}
            </Space>
          </Card>

          {/* Booking Details */}
          <Card>
            <Title level={4}>Booking Details</Title>
            
            <Space direction="vertical" className="w-full" size="middle">
              <div className="flex justify-between">
                <Text strong>Booking Reference:</Text>
                <Text code>{paymentResult.booking.booking_reference}</Text>
              </div>

              <div className="flex justify-between">
                <Text strong>Hotel:</Text>
                <Text>{paymentResult.bookingDetails.bookingData.hotel.name}</Text>
              </div>

              <div className="flex justify-between">
                <Text strong>Room:</Text>
                <Text>{paymentResult.bookingDetails.bookingData.room.name}</Text>
              </div>

              <div className="flex justify-between">
                <Text strong>Check-in:</Text>
                <Text>{paymentResult.bookingDetails.bookingData.checkIn}</Text>
              </div>

              <div className="flex justify-between">
                <Text strong>Check-out:</Text>
                <Text>{paymentResult.bookingDetails.bookingData.checkOut}</Text>
              </div>

              <div className="flex justify-between">
                <Text strong>Guests:</Text>
                <Text>{paymentResult.bookingDetails.bookingData.guests}</Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Right Column - Price Breakdown */}
        <Col xs={24} lg={8}>
          <Card 
            title="Price Breakdown"
            className="sticky top-4"
          >
            <PriceBreakdown
              breakdown={paymentResult.bookingDetails.priceBreakdown}
              checkIn={paymentResult.bookingDetails.bookingData.checkIn}
              checkOut={paymentResult.bookingDetails.bookingData.checkOut}
            />

            {/* Guest Information */}
            <Divider />
            <div className="mb-4">
              <Title level={5} className="mb-2">Guest Information</Title>
              <Space direction="vertical" size="small">
                <div>
                  <Text type="secondary">Name:</Text>
                  <Text strong className="ml-2">
                    {paymentResult.bookingDetails.guestDetails.first_name} {paymentResult.bookingDetails.guestDetails.last_name}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Email:</Text>
                  <Text className="ml-2">{paymentResult.bookingDetails.guestDetails.email}</Text>
                </div>
                <div>
                  <Text type="secondary">Phone:</Text>
                  <Text className="ml-2">{paymentResult.bookingDetails.guestDetails.phone}</Text>
                </div>
              </Space>
            </div>

            {/* Security Notice */}
            <Alert
              message="Secure Transaction"
              description="Your payment information is processed securely with industry-standard encryption."
              type="success"
              showIcon
              className="mt-4"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentResultPage;
