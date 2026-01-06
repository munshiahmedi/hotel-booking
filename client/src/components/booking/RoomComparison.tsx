// src/components/booking/RoomComparison.tsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Row, 
  Col, 
  Tag, 
  Rate, 
  Typography, 
  Badge, 
  Tooltip,
  Modal,
  Divider,
  Space,
  Checkbox,
  Switch
} from 'antd';
import {
  CloseOutlined,
  CheckOutlined,
  CrownOutlined,
  WifiOutlined,
  CarOutlined,
  TeamOutlined,
  BathOutlined,
  ExpandOutlined,
  HeartOutlined,
  StarOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { AvailableRoomType } from '../../services/roomAvailability.service';

const { Title, Text, Paragraph } = Typography;

interface RoomComparisonProps {
  rooms: AvailableRoomType[];
  selectedDates: [any, any] | null;
  guests: number;
  onClose: () => void;
  onRoomSelect: (room: AvailableRoomType) => void;
  isVisible: boolean;
}

interface ComparisonFeature {
  key: string;
  label: string;
  icon: React.ReactNode;
  important?: boolean;
}

const RoomComparison: React.FC<RoomComparisonProps> = ({
  rooms,
  selectedDates,
  guests,
  onClose,
  onRoomSelect,
  isVisible
}) => {
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  const comparisonFeatures: ComparisonFeature[] = [
    { key: 'price', label: 'Price per Night', icon: <CrownOutlined />, important: true },
    { key: 'size', label: 'Room Size', icon: <ExpandOutlined />, important: true },
    { key: 'guests', label: 'Max Guests', icon: <TeamOutlined />, important: true },
    { key: 'bedType', label: 'Bed Type', icon: <ExpandOutlined />, important: true },
    { key: 'bathroom', label: 'Bathroom', icon: <BathOutlined />, important: true },
    { key: 'wifi', label: 'Free WiFi', icon: <WifiOutlined /> },
    { key: 'parking', label: 'Parking', icon: <CarOutlined /> },
    { key: 'cancellation', label: 'Cancellation Policy', icon: <SafetyOutlined />, important: true },
    { key: 'rating', label: 'Guest Rating', icon: <StarOutlined />, important: true },
    { key: 'breakfast', label: 'Breakfast Included', icon: <ThunderboltOutlined /> },
    { key: 'view', label: 'Room View', icon: <EnvironmentOutlined /> }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getFeatureValue = (room: AvailableRoomType, feature: string) => {
    switch (feature) {
      case 'price':
        return {
          value: formatPrice(room.base_price),
          display: 'price',
          highlight: room.base_price <= Math.min(...rooms.map(r => r.base_price))
        };
      case 'size':
        return {
          value: `${room.room_size || '25'} m²`,
          display: 'text',
          highlight: (room.room_size || 25) >= Math.max(...rooms.map(r => r.room_size || 25))
        };
      case 'guests':
        return {
          value: room.max_guests,
          display: 'number',
          highlight: room.max_guests >= Math.max(...rooms.map(r => r.max_guests))
        };
      case 'bedType':
        return {
          value: room.bed_type || 'Queen Bed',
          display: 'text',
          highlight: room.bed_type === 'King Bed'
        };
      case 'bathroom':
        return {
          value: room.private_bathroom ? 'Private' : 'Shared',
          display: 'badge',
          highlight: room.private_bathroom
        };
      case 'wifi':
        return {
          value: room.free_wifi ? 'Included' : 'Not Available',
          display: 'badge',
          highlight: room.free_wifi
        };
      case 'parking':
        return {
          value: room.parking ? 'Available' : 'Not Available',
          display: 'badge',
          highlight: room.parking
        };
      case 'cancellation':
        return {
          value: room.cancellation_policy || 'Free Cancellation',
          display: 'text',
          highlight: room.cancellation_policy?.includes('Free')
        };
      case 'rating':
        return {
          value: room.guest_rating || 4.5,
          display: 'rating',
          highlight: (room.guest_rating || 4.5) >= Math.max(...rooms.map(r => r.guest_rating || 4.5))
        };
      case 'breakfast':
        return {
          value: room.breakfast_included ? 'Included' : 'Not Included',
          display: 'badge',
          highlight: room.breakfast_included
        };
      case 'view':
        return {
          value: room.room_view || 'City View',
          display: 'text',
          highlight: room.room_view?.includes('Ocean')
        };
      default:
        return { value: 'N/A', display: 'text', highlight: false };
    }
  };

  const renderFeatureValue = (feature: any, room: AvailableRoomType) => {
    const { value, display, highlight } = feature;

    switch (display) {
      case 'price':
        return (
          <div className={`text-2xl font-bold ${highlight ? 'text-green-500' : 'text-gray-900'}`}>
            {value}
          </div>
        );
      case 'number':
        return (
          <div className={`text-xl font-semibold ${highlight ? 'text-green-500' : 'text-gray-900'}`}>
            {value}
          </div>
        );
      case 'rating':
        return (
          <div className="flex items-center space-x-2">
            <Rate disabled defaultValue={value} className="text-sm" />
            <span className={`text-lg font-semibold ${highlight ? 'text-green-500' : 'text-gray-900'}`}>
              {value}
            </span>
          </div>
        );
      case 'badge':
        return (
          <Tag 
            color={highlight ? 'green' : 'default'}
            className="text-sm font-medium"
          >
            {value}
          </Tag>
        );
      case 'text':
      default:
        return (
          <div className={`text-base font-medium ${highlight ? 'text-green-500' : 'text-gray-900'}`}>
            {value}
          </div>
        );
    }
  };

  const getBestValueBadge = (feature: any, room: AvailableRoomType) => {
    if (feature.highlight) {
      return (
        <div className="absolute -top-2 -right-2">
          <Badge 
            count={<CheckOutlined />} 
            style={{ backgroundColor: '#52c41a', color: 'white' }}
          />
        </div>
      );
    }
    return null;
  };

  const filteredFeatures = showOnlyDifferences 
    ? comparisonFeatures.filter(feature => {
        const values = rooms.map(room => getFeatureValue(room, feature.key));
        const uniqueValues = new Set(values.map(v => v.value));
        return uniqueValues.size > 1;
      })
    : comparisonFeatures;

  if (!isVisible || rooms.length < 2) {
    return null;
  }

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Title level={3} className="mb-0 text-white">
              Compare Rooms
            </Title>
            <Badge count={rooms.length} style={{ backgroundColor: '#1890ff' }} />
          </div>
          <Button 
            type="text" 
            icon={<CloseOutlined />} 
            onClick={onClose}
            className="text-white hover:text-gray-300"
          />
        </div>
      }
      open={isVisible}
      width="95%"
      style={{ maxWidth: '1400px' }}
      className="room-comparison-modal"
      bodyStyle={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        padding: '0',
        maxHeight: '80vh',
        overflow: 'auto'
      }}
    >
        {/* Controls */}
        <div className="bg-gray-800/50 backdrop-blur-lg p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Text className="text-gray-300">Compare {rooms.length} rooms</Text>
              <Switch
                checked={showOnlyDifferences}
                onChange={setShowOnlyDifferences}
                checkedChildren="Differences Only"
                unCheckedChildren="All Features"
                className="bg-gray-700"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Text className="text-sm text-gray-400">For</Text>
              <Text className="font-semibold text-white">{guests} guests</Text>
              {selectedDates && (
                <>
                  <Text className="text-sm text-gray-400">•</Text>
                  <Text className="text-sm text-gray-400">
                    {selectedDates[0].format('MMM D')} - {selectedDates[1].format('MMM D')}
                  </Text>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="p-6">
          <Row gutter={[16, 16]}>
            {rooms.map((room, index) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={room.id}>
                <Card 
                  className={`h-full relative ${
                    index === 0 ? 'border-2 border-blue-500 bg-blue-50/10' : 'border-gray-700 bg-gray-800/50'
                  } backdrop-blur-lg hover:shadow-2xl transition-all duration-300`}
                  bodyStyle={{ padding: '20px' }}
                >
                  {/* Room Header */}
                  <div className="text-center mb-6">
                    <Title level={4} className="text-white mb-2">
                      {room.room_type}
                    </Title>
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <Rate disabled defaultValue={room.guest_rating || 4.5} className="text-sm" />
                      <Text className="text-gray-400">({room.reviews_count || 0} reviews)</Text>
                    </div>
                    {room.available_rooms > 0 ? (
                      <Badge 
                        status="success" 
                        text={`${room.available_rooms} rooms available`}
                        className="mb-4"
                      />
                    ) : (
                      <Badge 
                        status="error" 
                        text="Sold Out"
                        className="mb-4"
                      />
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6 p-4 bg-gray-900/50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-400 mb-1">
                      {formatPrice(room.base_price)}
                    </div>
                    <Text className="text-gray-400 text-sm">per night</Text>
                    {selectedDates && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <Text className="text-white text-sm">
                          Total: {formatPrice(room.base_price * selectedDates[1].diff(selectedDates[0], 'days'))}
                        </Text>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    {filteredFeatures.map((feature) => {
                      const featureValue = getFeatureValue(room, feature.key);
                      const isImportant = feature.important;
                      
                      return (
                        <div key={feature.key} className="relative">
                          <div className={`flex items-center justify-between p-3 rounded-lg ${
                            isImportant ? 'bg-gray-700/50' : 'bg-gray-800/30'
                          }`}>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400">{feature.icon}</span>
                              <Text className="text-sm text-gray-300">{feature.label}</Text>
                            </div>
                            <div className="flex items-center">
                              {renderFeatureValue(featureValue, room)}
                            </div>
                          </div>
                          {getBestValueBadge(featureValue, room)}
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    <Button
                      type="primary"
                      size="large"
                      block
                      disabled={room.available_rooms === 0}
                      onClick={() => onRoomSelect(room)}
                      className="bg-blue-600 hover:bg-blue-700 border-blue-600 h-12"
                    >
                      {room.available_rooms > 0 ? 'Select This Room' : 'Sold Out'}
                    </Button>
                    <Button
                      type="default"
                      size="large"
                      block
                      icon={<HeartOutlined />}
                      className="h-10"
                    >
                      Add to Wishlist
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Trust Indicators */}
        <div className="bg-gray-800/50 backdrop-blur-lg p-6 border-t border-gray-700">
          <div className="text-center">
            <Title level={5} className="text-white mb-4">
              Why Book With Confidence?
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={8}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <SafetyOutlined className="text-green-400 text-xl" />
                  </div>
                  <Title level={5} className="text-white mb-2">Secure Booking</Title>
                  <Text className="text-gray-400 text-sm">
                    Your payment and personal information are protected with industry-standard encryption
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckOutlined className="text-blue-400 text-xl" />
                  </div>
                  <Title level={5} className="text-white mb-2">Best Price Guarantee</Title>
                  <Text className="text-gray-400 text-sm">
                    Find a lower price? We'll match it and give you an additional 10% off
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ThunderboltOutlined className="text-purple-400 text-xl" />
                  </div>
                  <Title level={5} className="text-white mb-2">Instant Confirmation</Title>
                  <Text className="text-gray-400 text-sm">
                    Receive your booking confirmation immediately after payment
                  </Text>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Modal>
  );
};

export default RoomComparison;
