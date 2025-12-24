// src/components/booking/RoomList.tsx
import React from 'react';
import { Card, List, Button, Typography, Tag, Avatar, Space } from 'antd';
import { HomeOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Dayjs } from 'dayjs';
import { AvailableRoomType } from '../../services/roomAvailability.service';

const { Title, Text, Paragraph } = Typography;

interface RoomListProps {
  rooms: AvailableRoomType[];
  selectedDates: [Dayjs, Dayjs] | null;
  guests: number;
  onRoomSelect: (room: AvailableRoomType) => void;
  loading?: boolean;
  selectedRoomId?: number;
}

const RoomList: React.FC<RoomListProps> = ({
  rooms,
  selectedDates,
  guests,
  onRoomSelect,
  loading = false,
  selectedRoomId
}) => {
  const calculateTotalPrice = (basePrice: number, checkIn: Dayjs, checkOut: Dayjs) => {
    const nights = checkOut.diff(checkIn, 'days');
    return basePrice * nights;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  
  const getAvailabilityStatus = (room: AvailableRoomType) => {
    if (room.available_rooms === 0) {
      return { status: 'Sold Out', color: 'red', disabled: true };
    }
    if (!selectedDates) {
      return { status: 'Select Dates', color: 'default', disabled: true };
    }
    if (guests > room.max_guests) {
      return { status: 'Too Many Guests', color: 'orange', disabled: true };
    }
    return { status: 'Book Now', color: 'green', disabled: false };
  };

  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <HomeOutlined />
          <span>Available Rooms</span>
          <Tag color="blue">{rooms.length} room types</Tag>
        </div>
      } 
      loading={loading}
    >
      {rooms.length === 0 ? (
        <div className="text-center py-8">
          <Avatar icon={<HomeOutlined />} size={64} className="mb-4" />
          <Title level={4} type="secondary">No rooms available</Title>
          <Text type="secondary">
            Try selecting different dates or check back later.
          </Text>
        </div>
      ) : (
        <List
          dataSource={rooms}
          renderItem={(room) => {
            const availability = getAvailabilityStatus(room);
            const isSelected = selectedRoomId === room.id;
            const totalPrice = selectedDates 
              ? calculateTotalPrice(room.base_price, selectedDates[0], selectedDates[1])
              : room.base_price;

            return (
              <List.Item
                className={`border-b transition-all ${isSelected ? 'bg-blue-50 border-blue-300' : ''}`}
                actions={[
                  <Button
                    key="book"
                    type={isSelected ? 'default' : 'primary'}
                    size="large"
                    disabled={availability.disabled}
                    onClick={() => onRoomSelect(room)}
                    className={isSelected ? 'border-blue-500' : ''}
                  >
                    {availability.status}
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={<HomeOutlined />} 
                      size={48}
                      className={isSelected ? 'bg-blue-500' : 'bg-gray-200'}
                    />
                  }
                  title={
                    <div className="flex justify-between items-start">
                      <div>
                        <Title level={4} className="mb-1">{room.name}</Title>
                        <Space size="small">
                          <Tag color="blue">
                            <UserOutlined /> Max {room.max_guests} guests
                          </Tag>
                          <Tag color={availability.color}>
                            {room.available_rooms} available
                          </Tag>
                          {isSelected && (
                            <Tag color="green">
                              <CheckCircleOutlined /> Selected
                            </Tag>
                          )}
                        </Space>
                      </div>
                      <div className="text-right">
                        <Title level={3} className="mb-1 text-green-600">
                          {formatPrice(room.base_price)}
                        </Title>
                        <Text type="secondary">per night</Text>
                      </div>
                    </div>
                  }
                  description={
                    <div className="space-y-3">
                      <Paragraph className="mb-2">
                        {room.description}
                      </Paragraph>
                      
                      {selectedDates && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <Text strong>Stay Duration:</Text>
                              <br />
                              <Text type="secondary">
                                {selectedDates[0].format('MMM DD')} - {selectedDates[1].format('MMM DD, YYYY')}
                              </Text>
                              <br />
                              <Text type="secondary">
                                {selectedDates[1].diff(selectedDates[0], 'days')} nights
                              </Text>
                            </div>
                            <div className="text-right">
                              <Text strong className="text-lg">
                                Total: {formatPrice(totalPrice)}
                              </Text>
                            </div>
                          </div>
                        </div>
                      )}

                      {room.amenities && room.amenities.length > 0 && (
                        <div>
                          <Text strong className="mb-2 block">Amenities:</Text>
                          <div className="flex flex-wrap gap-2">
                            {room.amenities.slice(0, 6).map((amenity, index) => (
                              <Tag key={index} color="default" className="text-xs">
                                {amenity}
                              </Tag>
                            ))}
                            {room.amenities.length > 6 && (
                              <Tag color="default" className="text-xs">
                                +{room.amenities.length - 6} more
                              </Tag>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};

export default RoomList;
