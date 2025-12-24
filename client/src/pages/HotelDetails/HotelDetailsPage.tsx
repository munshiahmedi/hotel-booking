// src/pages/HotelDetails/HotelDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Button, 
  Row, 
  Col, 
  Descriptions,
  message,
  Spin,
  Carousel,
  Rate,
  Divider,
  List,
  Avatar,
  Modal,
  Badge
} from 'antd';
import { 
  EnvironmentOutlined, 
  ArrowLeftOutlined, 
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../utils/AuthContext';
import axios from 'axios';
import { roomAvailabilityService, AvailableRoomType } from '../../services/roomAvailability.service';
import DateGuestSelector from '../../components/booking/DateGuestSelector';
import RoomList from '../../components/booking/RoomList';
import dayjs, { Dayjs } from 'dayjs';

const API_BASE_URL = 'http://localhost:3000/api';

const { Title, Text, Paragraph } = Typography;

interface HotelDetails {
  id: number;
  name: string;
  slug: string;
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
  policy?: {
    checkin_time: string;
    checkout_time: string;
    cancellation_policy: string;
  };
  facilities?: string[];
  images?: string[];
  created_at: string;
  updated_at: string;
}

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface HotelImage {
  id: number;
  image_url: string;
  alt_text?: string;
}

interface HotelAmenity {
  id: number;
  name: string;
  icon?: string;
}

interface HotelFacility {
  id: number;
  name: string;
  description: string;
}

const HotelDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [hotel, setHotel] = useState<HotelDetails | null>(null);
  const [availableRooms, setAvailableRooms] = useState<AvailableRoomType[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hotelImages, setHotelImages] = useState<HotelImage[]>([]);
  const [hotelAmenities, setHotelAmenities] = useState<HotelAmenity[]>([]);
  const [hotelFacilities, setHotelFacilities] = useState<HotelFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedDates, setSelectedDates] = useState<[Dayjs, Dayjs] | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoomType | null>(null);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      if (!id || !token) return;

      try {
        setLoading(true);
        
        // Fetch hotel details
        const hotelResponse = await axios.get(`${API_BASE_URL}/hotels/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHotel(hotelResponse.data);

        // Fetch hotel images
        try {
          const imagesResponse = await axios.get(`${API_BASE_URL}/hotel-images/hotel/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setHotelImages(imagesResponse.data);
        } catch (error) {
          console.log('No hotel images found');
        }

        // Fetch hotel amenities
        try {
          const amenitiesResponse = await axios.get(`${API_BASE_URL}/hotel-amenities/hotel/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setHotelAmenities(amenitiesResponse.data);
        } catch (error) {
          console.log('No hotel amenities found');
        }

        // Fetch hotel facilities
        try {
          const facilitiesResponse = await axios.get(`${API_BASE_URL}/hotel-facilities/hotel/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setHotelFacilities(facilitiesResponse.data);
        } catch (error) {
          console.log('No hotel facilities found');
        }

        // Fetch reviews
        try {
          const reviewsResponse = await axios.get(`${API_BASE_URL}/reviews/hotel/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setReviews(reviewsResponse.data);
        } catch (error) {
          console.log('No reviews found');
        }

      } catch (error: any) {
        console.error('Error fetching hotel details:', error);
        if (error.response?.status === 404) {
          message.error('Hotel not found. It may have been deleted or doesn\'t exist.');
        } else if (error.response?.status === 400) {
          message.error('Invalid hotel ID. Please navigate from the hotels list.');
        } else {
          message.error('Failed to load hotel details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [id, token]);

  // Fetch available rooms when dates change
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      if (!hotel || !selectedDates || !token) {
        setAvailableRooms([]);
        return;
      }

      try {
        setRoomsLoading(true);
        
        const availability = await roomAvailabilityService.getAvailableRooms({
          hotelId: hotel.id,
          checkIn: selectedDates[0].format('YYYY-MM-DD'),
          checkOut: selectedDates[1].format('YYYY-MM-DD'),
          guests
        });
        
        setAvailableRooms(availability.room_types);
      } catch (error: any) {
        console.error('Error fetching available rooms:', error);
        message.error(error.message || 'Failed to fetch available rooms');
        setAvailableRooms([]);
      } finally {
        setRoomsLoading(false);
      }
    };

    fetchAvailableRooms();
  }, [hotel, selectedDates, guests, token]);

  const handleRoomSelect = (room: AvailableRoomType) => {
    if (!selectedDates) {
      message.error('Please select check-in and check-out dates');
      return;
    }
    setSelectedRoom(room);
    setBookingModalVisible(true);
  };

  const handleProceedToBooking = () => {
    if (!selectedRoom || !selectedDates) {
      message.error('Please select a room and dates');
      return;
    }

    // Navigate to booking confirmation with all details
    navigate(`/booking/confirm`, {
      state: {
        hotel,
        room: selectedRoom,
        checkIn: selectedDates[0].format('YYYY-MM-DD'),
        checkOut: selectedDates[1].format('YYYY-MM-DD'),
        guests
      }
    });
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
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const displayImages = hotelImages.length > 0 
    ? hotelImages.map(img => img.image_url)
    : hotel.images || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/dashboard')}
        className="mb-4"
      >
        Back to Dashboard
      </Button>

      <Card loading={loading}>
        {/* Hotel Images Section */}
        <Card title="Hotel Images" className="mb-6">
          {displayImages.length > 0 ? (
            <Carousel autoplay className="mb-4">
              {displayImages.map((image, index) => (
                <div key={index}>
                  <img 
                    src={image} 
                    alt={`${hotel.name} - ${index + 1}`}
                    className="w-full h-96 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Hotel+Image';
                    }}
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <Text type="secondary">No images available</Text>
            </div>
          )}
        </Card>

        <div className="flex justify-between items-start mb-6">
          <div>
            <Title level={2} className="mb-2">{hotel.name}</Title>
            <div className="flex items-center gap-4 mb-4">
              <Rate disabled defaultValue={hotel.star_rating} />
              <Badge status={hotel.status === 'active' ? 'success' : 'error'} text={hotel.status} />
            </div>
            {hotel.address && (
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <EnvironmentOutlined />
                <Text>
                  {hotel.address.line1}, {hotel.address.city}, {hotel.address.state}, {hotel.address.country}
                </Text>
              </div>
            )}
          </div>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            
            {/* Description */}
            <Card title="About this Hotel" className="mb-6">
              <Paragraph>{hotel.description}</Paragraph>
            </Card>

            {/* Hotel Policies */}
            {hotel.policy && (
              <Card title="Hotel Policies" className="mb-6">
                <Descriptions column={2}>
                  <Descriptions.Item label="Check-in Time">
                    <ClockCircleOutlined className="mr-2" />
                    {hotel.policy.checkin_time}
                  </Descriptions.Item>
                  <Descriptions.Item label="Check-out Time">
                    <CheckCircleOutlined className="mr-2" />
                    {hotel.policy.checkout_time}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cancellation Policy" span={2}>
                    <ExclamationCircleOutlined className="mr-2" />
                    {hotel.policy.cancellation_policy}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Amenities */}
            {hotelAmenities.length > 0 && (
              <Card title="Amenities" className="mb-6">
                <div className="flex flex-wrap gap-4">
                  {hotelAmenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-2">
                      <CheckCircleOutlined />
                      <Text>{amenity.name}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Facilities */}
            {hotelFacilities.length > 0 && (
              <Card title="Facilities" className="mb-6">
                <List
                  dataSource={hotelFacilities}
                  renderItem={(facility) => (
                    <List.Item>
                      <List.Item.Meta
                        title={facility.name}
                        description={facility.description}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {/* Reviews */}
            <Card title="Guest Reviews" className="mb-6">
              {reviews.length > 0 ? (
                <List
                  dataSource={reviews}
                  renderItem={(review) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={
                          <div className="flex items-center gap-2">
                            <Text strong>{review.user_name}</Text>
                            <Rate disabled defaultValue={review.rating} size="small" />
                          </div>
                        }
                        description={
                          <div>
                            <Paragraph>{review.comment}</Paragraph>
                            <Text type="secondary">
                              {dayjs(review.created_at).format('MMM DD, YYYY')}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">No reviews yet</Text>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            {/* Date & Guest Selector */}
            <DateGuestSelector
              selectedDates={selectedDates}
              onDatesChange={setSelectedDates}
              guests={guests}
              onGuestsChange={setGuests}
              loading={loading}
            />

            {/* Available Rooms */}
            <RoomList
              rooms={availableRooms}
              selectedDates={selectedDates}
              guests={guests}
              onRoomSelect={handleRoomSelect}
              loading={roomsLoading}
              selectedRoomId={selectedRoom?.id}
            />
          </Col>
        </Row>
      </Card>

      {/* Booking Confirmation Modal */}
      <Modal
        title="Booking Summary"
        open={bookingModalVisible}
        onCancel={() => setBookingModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setBookingModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="book" type="primary" onClick={handleProceedToBooking}>
            Proceed to Booking
          </Button>
        ]}
        width={600}
      >
        {selectedRoom && selectedDates && (
          <div>
            <Descriptions column={1}>
              <Descriptions.Item label="Hotel">{hotel.name}</Descriptions.Item>
              <Descriptions.Item label="Room">{selectedRoom.name}</Descriptions.Item>
              <Descriptions.Item label="Check-in">
                {selectedDates[0].format('MMMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Check-out">
                {selectedDates[1].format('MMMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Guests">{guests}</Descriptions.Item>
              <Descriptions.Item label="Price per Night">
                ${selectedRoom.base_price}
              </Descriptions.Item>
              <Descriptions.Item label="Total Nights">
                {selectedDates[1].diff(selectedDates[0], 'days')} nights
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <div className="text-right">
              <Text strong className="text-xl">
                Total: ${selectedRoom.base_price * selectedDates[1].diff(selectedDates[0], 'days')}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HotelDetailsPage;
