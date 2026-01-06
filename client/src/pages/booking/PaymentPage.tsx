// src/pages/booking/PaymentPage.tsx
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
  Form,
  Input,
  Select,
  Checkbox,
  Radio
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CreditCardOutlined, 
  BankOutlined,
  CheckCircleOutlined,
  LockOutlined
} from '@ant-design/icons';
import { 
  bookingService, 
  BookingResponse,
  PriceBreakdown as PriceBreakdownType
} from '../../services/booking.service';
import { paymentService, PaymentRequest } from '../../services/payment.service';
import PriceBreakdown from '../../components/booking/PriceBreakdown';

const { Title, Text, Paragraph } = Typography;

interface PaymentState {
  bookingData: any;
  guestDetails: any;
  priceBreakdown: PriceBreakdownType;
}

interface PaymentFormData {
  paymentMethod: 'card' | 'bank';
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  accountHolderName: string;
  savePaymentMethod: boolean;
  agreeToTerms: boolean;
}

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');

  const loadPriceBreakdown = useCallback(async (bookingData: any) => {
    try {
      setLoading(true);
      const breakdown = await bookingService.calculatePrice({
        hotel_id: bookingData.bookingData.hotel.id,
        room_type_id: bookingData.bookingData.room.id,
        check_in: bookingData.bookingData.checkIn,
        check_out: bookingData.bookingData.checkOut,
        guests: bookingData.bookingData.guests
      });

      setPaymentState({
        bookingData: bookingData.bookingData,
        guestDetails: bookingData.guestDetails,
        priceBreakdown: breakdown
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load payment details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const bookingData = location.state;
    if (!bookingData || !bookingData.bookingData || !bookingData.guestDetails) {
      message.error('Missing booking information. Please start over.');
      navigate('/dashboard');
      return;
    }

    // Load price breakdown
    loadPriceBreakdown(bookingData);
  }, [location.state, navigate, loadPriceBreakdown]);

  const handlePaymentSubmit = async (values: PaymentFormData) => {
    if (!paymentState) return;

    try {
      setProcessing(true);
      
      // First create the booking
      const bookingResponse: BookingResponse = await bookingService.createBooking({
        hotel_id: paymentState.bookingData.hotel.id,
        room_type_id: paymentState.bookingData.room.id,
        check_in: paymentState.bookingData.checkIn,
        check_out: paymentState.bookingData.checkOut,
        guests: paymentState.bookingData.guests,
        guest_details: paymentState.guestDetails
      });

      // Generate idempotency key for payment
      const idempotencyKey = paymentService.generateIdempotencyKey();

      // Create payment request
      const paymentRequest: PaymentRequest = {
        booking_id: bookingResponse.id,
        amount: paymentState.priceBreakdown.total_amount,
        payment_method: values.paymentMethod,
        payment_details: values.paymentMethod === 'card' ? {
          card_number: values.cardNumber.slice(-4),
          card_holder: values.cardHolder,
          expiry_date: values.expiryDate,
          cvv: values.cvv
        } : {
          account_number: values.bankAccountNumber.slice(-4),
          account_holder: values.accountHolderName,
          routing_number: values.bankRoutingNumber
        },
        idempotency_key: idempotencyKey
      };

      // Process payment
      const paymentResponse = await paymentService.createPayment(paymentRequest);

      // Navigate to payment result page
      navigate('/payment-result', { 
        state: { 
          booking: bookingResponse,
          payment: paymentResponse,
          bookingDetails: paymentState,
          idempotencyKey: idempotencyKey
        } 
      });
      
    } catch (error: any) {
      message.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 3) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!paymentState) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert
          message="Payment Information Unavailable"
          description="Unable to load payment details. Please try again."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            className="mb-4 text-gray-400 hover:text-white"
          >
            Back to Guest Details
          </Button>
          <Title level={2} className="text-white">Complete Your Booking</Title>
          <Paragraph className="text-gray-400">
            Please provide your payment information to complete the reservation.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {/* Left Column - Payment Form */}
          <Col xs={24} lg={16}>
            <Card 
              className="bg-gray-800 border-gray-700"
              title={
                <div className="flex items-center gap-2">
                  <CreditCardOutlined className="text-blue-400" />
                  <span className="text-white">Payment Information</span>
                </div>
              }
            extra={
              <div className="flex items-center gap-1">
                <LockOutlined className="text-green-600" />
                <Text type="secondary" className="text-sm">Secure Payment</Text>
              </div>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handlePaymentSubmit}
              initialValues={{
                paymentMethod: 'card',
                savePaymentMethod: false,
                agreeToTerms: false
              }}
            >
              {/* Payment Method Selection */}
              <Form.Item label={<span className="text-white">Payment Method</span>} name="paymentMethod">
                <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)}>
                  <Radio value="card" className="text-white">
                    <Space>
                      <CreditCardOutlined className="text-blue-400" />
                      <span>Credit/Debit Card</span>
                    </Space>
                  </Radio>
                  <Radio value="bank" className="text-white">
                    <Space>
                      <BankOutlined className="text-green-400" />
                      <span>Bank Transfer</span>
                    </Space>
                  </Radio>
                </Radio.Group>
              </Form.Item>

              <Divider className="border-gray-700" />

              {paymentMethod === 'card' ? (
                // Card Payment Form
                <Space direction="vertical" className="w-full" size="large">
                  <Form.Item
                    label={<span className="text-white">Card Number</span>}
                    name="cardNumber"
                    rules={[
                      { required: true, message: 'Please enter card number' },
                      { pattern: /^\d{16}$/, message: 'Please enter a valid 16-digit card number' }
                    ]}
                  >
                    <Input
                      placeholder="1234 5678 9012 3456"
                      size="large"
                      maxLength={19}
                      className="bg-gray-700 border-gray-600 text-white"
                      onChange={(e) => {
                        const value = formatCardNumber(e.target.value);
                        form.setFieldsValue({ cardNumber: value });
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Cardholder Name"
                    name="cardHolder"
                    rules={[{ required: true, message: 'Please enter cardholder name' }]}
                  >
                    <Input
                      placeholder="John Doe"
                      size="large"
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Expiry Date"
                        name="expiryDate"
                        rules={[
                          { required: true, message: 'Please enter expiry date' },
                          { pattern: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'Format: MM/YY' }
                        ]}
                      >
                        <Input
                          placeholder="MM/YY"
                          size="large"
                          maxLength={5}
                          onChange={(e) => {
                            const value = formatExpiryDate(e.target.value);
                            form.setFieldsValue({ expiryDate: value });
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="CVV"
                        name="cvv"
                        rules={[
                          { required: true, message: 'Please enter CVV' },
                          { pattern: /^\d{3,4}$/, message: 'Please enter a valid CVV' }
                        ]}
                      >
                        <Input
                          placeholder="123"
                          size="large"
                          maxLength={4}
                          type="password"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Space>
              ) : (
                // Bank Transfer Form
                <Space direction="vertical" className="w-full" size="large">
                  <Form.Item
                    label="Account Holder Name"
                    name="accountHolderName"
                    rules={[{ required: true, message: 'Please enter account holder name' }]}
                  >
                    <Input
                      placeholder="John Doe"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Bank Account Number"
                    name="bankAccountNumber"
                    rules={[
                      { required: true, message: 'Please enter account number' },
                      { pattern: /^\d{8,17}$/, message: 'Please enter a valid account number' }
                    ]}
                  >
                    <Input
                      placeholder="1234567890"
                      size="large"
                      type="password"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Routing Number"
                    name="bankRoutingNumber"
                    rules={[
                      { required: true, message: 'Please enter routing number' },
                      { pattern: /^\d{9}$/, message: 'Please enter a valid 9-digit routing number' }
                    ]}
                  >
                    <Input
                      placeholder="123456789"
                      size="large"
                    />
                  </Form.Item>
                </Space>
              )}

              <Divider />

              {/* Additional Options */}
              <Space direction="vertical" className="w-full">
                <Form.Item name="savePaymentMethod" valuePropName="checked">
                  <Checkbox>
                    Save payment method for future bookings
                  </Checkbox>
                </Form.Item>

                <Form.Item
                  name="agreeToTerms"
                  valuePropName="checked"
                  rules={[{ required: true, message: 'You must agree to the terms and conditions' }]}
                >
                  <Checkbox>
                    I agree to the <button type="button" onClick={(e) => e.preventDefault()}>Terms and Conditions</button> and <button type="button" onClick={(e) => e.preventDefault()}>Cancellation Policy</button>
                  </Checkbox>
                </Form.Item>
              </Space>

              {/* Submit Button */}
              <Form.Item className="mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={processing}
                  block
                  icon={<CheckCircleOutlined />}
                >
                  {processing ? 'Processing Payment...' : `Complete Payment • $${paymentState.priceBreakdown.total_amount.toFixed(2)}`}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Column - Booking Summary */}
        <Col xs={24} lg={8}>
          <Card 
            title={<span className="text-white">Booking Summary</span>}
            className="bg-gray-800 border-gray-700 sticky top-4"
          >
            {/* Hotel Information */}
            <div className="mb-4">
              <Title level={5} className="text-white mb-2">{paymentState.bookingData.hotel.name}</Title>
              <Text className="text-gray-400">{paymentState.bookingData.room.name}</Text>
            </div>

            <Divider className="border-gray-700 my-4" />

            {/* Booking Details */}
            <Space direction="vertical" className="w-full mb-4" size="small">
              <div className="flex justify-between">
                <Text className="text-gray-400">Check-in:</Text>
                <Text strong className="text-white">{paymentState.bookingData.checkIn}</Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-400">Check-out:</Text>
                <Text strong>{paymentState.bookingData.checkOut}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Guests:</Text>
                <Text strong>{paymentState.bookingData.guests}</Text>
              </div>
            </Space>

            <Divider className="my-4" />

            {/* Guest Details Summary */}
            <div className="mb-4">
              <Title level={5} className="mb-2">Guest Details</Title>
              <Space direction="vertical" size="small">
                <div>
                  <Text type="secondary">Name:</Text>
                  <Text strong className="ml-2">
                    {paymentState.guestDetails.first_name} {paymentState.guestDetails.last_name}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Email:</Text>
                  <Text className="ml-2">{paymentState.guestDetails.email}</Text>
                </div>
                <div>
                  <Text type="secondary">Phone:</Text>
                  <Text className="ml-2">{paymentState.guestDetails.phone}</Text>
                </div>
              </Space>
            </div>

            <Divider className="my-4" />

            {/* Price Breakdown */}
            <PriceBreakdown
              breakdown={paymentState.priceBreakdown}
              checkIn={paymentState.bookingData.checkIn}
              checkOut={paymentState.bookingData.checkOut}
            />

            {/* Security Notice */}
            <Alert
              message="Secure Payment Processing"
              description="Your payment information is encrypted and secure. We never store your complete card details."
              type="info"
              showIcon
              icon={<LockOutlined />}
              className="mt-4"
            />
          </Card>
        </Col>
      </Row>
      </div>
    </div>
  );
};

export default PaymentPage;
