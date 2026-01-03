// src/pages/CreateBooking/CreateBookingPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Form, 
  DatePicker, 
  InputNumber, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Descriptions,
  message,
  Spin,
  Select,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  ArrowLeftOutlined,
  EnvironmentOutlined,
  StarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { hotelApi, bookingApi } from '../../services/api';
import { useAuth } from '../../utils/AuthContext';

const { Title, Text } = Typography;

interface HotelDetails {
  id: number;
  name: string;
  description: string;
  star_rating: number;
  status: string;
  address?: {
    line1: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
  };
  pricePerNight?: number;
}

interface BookingFormData {
  checkIn: dayjs.Dayjs;
  checkOut: dayjs.Dayjs;
  guests: number;
  rooms: number;
  roomType: string;
}

const CreateBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [hotel, setHotel] = useState<HotelDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [priceCalculation, setPriceCalculation] = useState({
    nights: 0,
    totalPrice: 0,
    roomRate: 0
  });

  const roomTypes = [
    { value: 'standard', label: 'Standard Room', price: 99 },
    { value: 'deluxe', label: 'Deluxe Room', price: 149 },
    { value: 'suite', label: 'Suite', price: 249 },
    { value: 'executive', label: 'Executive Suite', price: 349 }
  ];

  const fetchHotelDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await hotelApi.getHotelById(id!);
      setHotel(response.data);
      
      // Set default room type and calculate initial price
      const defaultRoomType = roomTypes[0];
      setPriceCalculation(prev => ({
        ...prev,
        roomRate: defaultRoomType.price
      }));
    } catch (error) {
      message.error('Failed to load hotel details');
      navigate('/hotels');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const calculatePrice = (checkIn: dayjs.Dayjs, checkOut: dayjs.Dayjs, rooms: number, roomType: string) => {
    if (!checkIn || !checkOut) return;

    const nights = checkOut.diff(checkIn, 'day');
    const selectedRoomType = roomTypes.find(type => type.value === roomType);
    const roomRate = selectedRoomType?.price || 99;
    const totalPrice = nights * rooms * roomRate;

    setPriceCalculation({
      nights,
      totalPrice,
      roomRate
    });
  };

  const onFormChange = (changedFields: any, allFields: any) => {
    const { checkIn, checkOut, rooms, roomType } = allFields;
    
    if (checkIn && checkOut && rooms && roomType) {
      calculatePrice(checkIn, checkOut, rooms, roomType);
    }
  };

  const onFinish = async (values: BookingFormData) => {
    if (!hotel) return;

    try {
      setSubmitting(true);
      
      const bookingData = {
        hotel_id: hotel.id,
        check_in: values.checkIn.format('YYYY-MM-DD'),
        check_out: values.checkOut.format('YYYY-MM-DD'),
        guests: values.guests,
        rooms: values.rooms,
        room_type: values.roomType,
        total_price: priceCalculation.totalPrice
      };

      const response = await bookingApi.createBooking(bookingData);
      message.success('Booking created successfully!');
      
      // Navigate to booking details
      navigate(`/bookings/${response.data.id}`);
    } catch (error: any) {
      console.error('Booking creation error:', error);
      message.error(error.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const disabledDate = (current: dayjs.Dayjs) => {
    // Can't select dates before today
    return current && current < dayjs().startOf('day');
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Title level={3}>Hotel not found</Title>
          <Button type="primary" onClick={() => navigate('/hotels')}>
            Back to Hotels
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(`/hotels/${id}`)}
        className="mb-4"
      >
        Back to Hotel Details
      </Button>

      <Row gutter={[24, 24]}>
        {/* Hotel Information */}
        <Col xs={24} lg={14}>
          <Card title="Hotel Information" className="mb-4">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Hotel Name" span={2}>
                <Title level={5} className="m-0">{hotel.name}</Title>
              </Descriptions.Item>
              <Descriptions.Item label="Rating">
                <div className="flex items-center">
                  <StarOutlined className="mr-1 text-yellow-500" />
                  <span>{hotel.star_rating} Stars</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <span className={`px-2 py-1 rounded text-sm ${
                  hotel.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {hotel.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                <div className="flex items-start">
                  <EnvironmentOutlined className="mr-2 mt-1 text-gray-400" />
                  <Text>
                    {hotel.address ? 
                      `${hotel.address.line1}, ${hotel.address.city}, ${hotel.address.state}, ${hotel.address.country}` : 
                      'Address not available'
                    }
                  </Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                <Text>{hotel.description}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Booking Form */}
          <Card title="Booking Details">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onValuesChange={onFormChange}
              initialValues={{
                guests: 1,
                rooms: 1,
                roomType: 'standard',
                checkIn: dayjs(),
                checkOut: dayjs().add(1, 'day')
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="roomType"
                    label="Room Type"
                    rules={[{ required: true, message: 'Please select a room type!' }]}
                  >
                    <Select
                      placeholder="Select room type"
                      options={roomTypes.map(type => ({
                        ...type,
                        label: `${type.label} - $${type.price}/night`
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="guests"
                    label="Number of Guests"
                    rules={[{ required: true, message: 'Please select number of guests!' }]}
                  >
                    <InputNumber
                      min={1}
                      max={10}
                      placeholder="Guests"
                      style={{ width: '100%' }}
                      addonBefore={<UserOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="rooms"
                    label="Number of Rooms"
                    rules={[{ required: true, message: 'Please select number of rooms!' }]}
                  >
                    <InputNumber
                      min={1}
                      max={5}
                      placeholder="Rooms"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="checkIn"
                label="Check-in Date"
                rules={[{ required: true, message: 'Please select check-in date!' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={disabledDate}
                  placeholder="Select check-in date"
                />
              </Form.Item>

              <Form.Item
                name="checkOut"
                label="Check-out Date"
                rules={[{ required: true, message: 'Please select check-out date!' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(current) => {
                    if (!form.getFieldValue('checkIn')) return disabledDate(current);
                    return current && current <= form.getFieldValue('checkIn').startOf('day');
                  }}
                  placeholder="Select check-out date"
                />
              </Form.Item>

              <Divider />

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting}
                  size="large"
                  disabled={priceCalculation.totalPrice === 0}
                >
                  {submitting ? 'Creating Booking...' : `Book Now - $${priceCalculation.totalPrice}`}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Price Calculation */}
        <Col xs={24} lg={10}>
          <Card title="Price Breakdown" className="sticky top-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text>Room Rate:</Text>
                <Text strong>${priceCalculation.roomRate}/night</Text>
              </div>
              <div className="flex justify-between">
                <Text>Number of Nights:</Text>
                <Text strong>{priceCalculation.nights}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Number of Rooms:</Text>
                <Text strong>{form.getFieldValue('rooms') || 1}</Text>
              </div>
              <Divider />
              <div className="flex justify-between">
                <Title level={5} className="m-0">Total Amount:</Title>
                <Title level={5} className="m-0 text-green-600">
                  ${priceCalculation.totalPrice}
                </Title>
              </div>
              
              {priceCalculation.nights > 0 && (
                <div className="text-sm text-gray-500">
                  <div>Subtotal: ${priceCalculation.roomRate * priceCalculation.nights * (form.getFieldValue('rooms') || 1)}</div>
                  <div>Taxes & Fees: $0.00</div>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateBookingPage;
