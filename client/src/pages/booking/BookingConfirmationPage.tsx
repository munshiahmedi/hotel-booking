// src/pages/booking/BookingConfirmationPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
  Tag
} from 'antd';
import { 
  ArrowLeftOutlined, 
  HomeOutlined, 
  CalendarOutlined, 
  UserOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { 
  bookingService, 
  GuestDetails, 
  BookingPreview,
  PriceBreakdown as PriceBreakdownType
} from '../../services/booking.service';
import PriceBreakdown from '../../components/booking/PriceBreakdown';
import GuestDetailsForm from '../../components/booking/GuestDetailsForm';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;

interface BookingState {
  hotel: any;
  room: any;
  checkIn: string;
  checkOut: string;
  guests: number;
}

const BookingConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingState, setBookingState] = useState<BookingState | null>(null);
  const [bookingPreview, setBookingPreview] = useState<BookingPreview | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdownType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting] = useState(false);
  const [step, setStep] = useState<'preview' | 'details' | 'payment'>('preview');
  const [guestDetails, setGuestDetails] = useState<GuestDetails | null>(null);

  const fetchBookingPreview = useCallback(async (state: BookingState) => {
    try {
      setLoading(true);
      
      const preview = await bookingService.getBookingPreview({
        hotel_id: state.hotel.id,
        room_type_id: state.room.id,
        check_in: state.checkIn,
        check_out: state.checkOut,
        guests: state.guests
      });

      setBookingPreview(preview);
      setPriceBreakdown(preview.price_breakdown);
    } catch (error: any) {
      console.error('Error fetching booking preview:', error);
      message.error(error.message || 'Failed to load booking details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Get booking data from navigation state
    const state = location.state as BookingState;
    if (!state || !state.hotel || !state.room || !state.checkIn || !state.checkOut) {
      message.error('Invalid booking information. Please start over.');
      navigate('/dashboard');
      return;
    }

    setBookingState(state);
    fetchBookingPreview(state);
  }, [location.state, navigate, fetchBookingPreview]);

  const handleGuestDetailsSubmit = (details: GuestDetails) => {
    const validation = bookingService.validateGuestDetails(details);
    if (!validation.isValid) {
      validation.errors.forEach((error: string) => message.error(error));
      return;
    }

    setGuestDetails(details);
    setStep('payment');
  };

  const handleProceedToPayment = () => {
    if (!bookingState || !guestDetails) {
      message.error('Missing booking information');
      return;
    }

    // Navigate to payment page with booking data
    navigate('/payment', { 
      state: { 
        bookingData: bookingState,
        guestDetails: guestDetails
      } 
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!bookingState || !bookingPreview) {
    return (
      <div className="p-6">
        <Alert
          message="Booking Information Missing"
          description="Unable to load booking details. Please start your booking again."
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/dashboard')}>
              Back to Hotels
            </Button>
          }
        />
      </div>
    );
  }

  const nights = moment(bookingState.checkOut).diff(moment(bookingState.checkIn), 'days');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          Back
        </Button>
        <Title level={2}>Booking Confirmation</Title>
        <Text type="secondary">
          Review your booking details and provide guest information
        </Text>
      </div>

      {/* Progress Steps */}
      <div className="mb-6">
        <Space size="large">
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className={step === 'preview' ? 'text-blue-500' : 'text-green-500'} />
            <Text strong={step === 'preview'}>Review Details</Text>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className={step === 'details' ? 'text-blue-500' : step === 'payment' ? 'text-green-500' : 'text-gray-300'} />
            <Text strong={step === 'details'}>Guest Information</Text>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className={step === 'payment' ? 'text-blue-500' : 'text-gray-300'} />
            <Text strong={step === 'payment'}>Payment</Text>
          </div>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column - Hotel & Room Details */}
        <Col xs={24} lg={16}>
          {/* Hotel Information */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <HomeOutlined />
                <span>{bookingPreview.hotel.name}</span>
              </div>
            } 
            className="mb-6"
          >
            <Space direction="vertical" className="w-full" size="middle">
              <div className="flex items-start gap-2">
                <EnvironmentOutlined className="text-gray-400 mt-1" />
                <div>
                  <Text strong>Address</Text>
                  <br />
                  <Text type="secondary">
                    {bookingPreview.hotel.address ? 
                      `${bookingPreview.hotel.address.line1}, ${bookingPreview.hotel.address.city}, ${bookingPreview.hotel.address.state}` 
                      : 'Address not available'
                    }
                  </Text>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CalendarOutlined className="text-gray-400 mt-1" />
                <div>
                  <Text strong>Stay Duration</Text>
                  <br />
                  <Text type="secondary">
                    {moment(bookingState.checkIn).format('MMMM DD, YYYY')} - {moment(bookingState.checkOut).format('MMMM DD, YYYY')}
                    <br />
                    {nights} nights
                  </Text>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <UserOutlined className="text-gray-400 mt-1" />
                <div>
                  <Text strong>Guests</Text>
                  <br />
                  <Text type="secondary">{bookingState.guests} guests</Text>
                </div>
              </div>

              {bookingPreview.policies && (
                <>
                  <Divider />
                  <div>
                    <Text strong className="mb-2 block">Hotel Policies</Text>
                    <Space direction="vertical" className="w-full" size="small">
                      {bookingPreview.policies.checkin_time && (
                        <div>
                          <Text type="secondary">Check-in: {bookingPreview.policies.checkin_time}</Text>
                        </div>
                      )}
                      {bookingPreview.policies.checkout_time && (
                        <div>
                          <Text type="secondary">Check-out: {bookingPreview.policies.checkout_time}</Text>
                        </div>
                      )}
                      {bookingPreview.policies.cancellation_policy && (
                        <div>
                          <Text type="secondary">Cancellation: {bookingPreview.policies.cancellation_policy}</Text>
                        </div>
                      )}
                    </Space>
                  </div>
                </>
              )}
            </Space>
          </Card>

          {/* Room Information */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <HomeOutlined />
                <span>Room Details</span>
              </div>
            } 
            className="mb-6"
          >
            <Space direction="vertical" className="w-full" size="middle">
              <div>
                <Title level={4} className="mb-1">{bookingPreview.room_type.name}</Title>
                <Paragraph type="secondary">{bookingPreview.room_type.description}</Paragraph>
                <Space>
                  <Tag color="blue">
                    <UserOutlined /> Max {bookingPreview.room_type.max_guests} guests
                  </Tag>
                  <Tag color="green">
                    ${bookingPreview.room_type.base_price}/night
                  </Tag>
                </Space>
              </div>
            </Space>
          </Card>

          {/* Guest Details Form */}
          {step === 'details' && (
            <GuestDetailsForm
              onSubmit={handleGuestDetailsSubmit}
              loading={submitting}
            />
          )}

          {/* Payment Step */}
          {step === 'payment' && guestDetails && (
            <Card title="Guest Information" className="mb-6">
              <Space direction="vertical" className="w-full" size="middle">
                <div>
                  <Text strong>Name:</Text> {guestDetails.first_name} {guestDetails.last_name}
                </div>
                <div>
                  <Text strong>Email:</Text> {guestDetails.email}
                </div>
                <div>
                  <Text strong>Phone:</Text> {guestDetails.phone}
                </div>
                {guestDetails.special_requests && (
                  <div>
                    <Text strong>Special Requests:</Text> {guestDetails.special_requests}
                  </div>
                )}
              </Space>
              
              <Divider />
              
              <Alert
                message="Ready to Proceed"
                description="Your booking details are confirmed. Click below to proceed to payment and complete your reservation."
                type="success"
                showIcon
                className="mb-4"
              />
              
              <Button
                type="primary"
                size="large"
                onClick={handleProceedToPayment}
                loading={submitting}
                block
              >
                Proceed to Payment
              </Button>
            </Card>
          )}
        </Col>

        {/* Right Column - Price Breakdown */}
        <Col xs={24} lg={8}>
          {priceBreakdown && (
            <PriceBreakdown
              breakdown={priceBreakdown}
              checkIn={bookingState.checkIn}
              checkOut={bookingState.checkOut}
            />
          )}

          {step === 'preview' && (
            <Button
              type="primary"
              size="large"
              onClick={() => setStep('details')}
              block
              className="mt-4"
            >
              Continue to Guest Details
            </Button>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default BookingConfirmationPage;
