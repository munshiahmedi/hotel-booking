// src/pages/wishlist/WishlistPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  message,
  Spin,
  Empty,
  Image,
  Rate,
  Tag,
  Space,
  Tooltip
} from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  ArrowLeftOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { wishlistService, WishlistItem } from '../../services/wishlist.service';
import WishlistButton from '../../components/wishlist/WishlistButton';
import { useAuth } from '../../utils/AuthContext';

const { Title, Text, Paragraph } = Typography;

const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();
      
      if (response.success) {
        setWishlistItems(response.data);
      } else {
        message.error(response.message || 'Failed to fetch wishlist');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (hotelId: number, hotelName: string) => {
    try {
      const response = await wishlistService.removeFromWishlist(hotelId);
      
      if (response.success) {
        setWishlistItems(prev => prev.filter(item => item.hotel_id !== hotelId));
        message.success(`${hotelName} removed from wishlist`);
      } else {
        message.error(response.message || 'Failed to remove from wishlist');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to remove from wishlist');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800/50 border-gray-700/30 backdrop-blur-lg max-w-md">
          <div className="text-center">
            <HeartOutlined className="text-6xl text-gray-400 mb-4" />
            <Title level={3} className="text-white mb-2">Login Required</Title>
            <Paragraph className="text-gray-400 mb-6">
              Please login to view and manage your wishlist
            </Paragraph>
            <Button type="primary" onClick={() => navigate('/login')}>
              Login to Continue
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-gray-400 mt-4">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-white"
              >
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <HeartFilled className="text-red-500" />
                  My Wishlist
                </h1>
                <p className="text-gray-400">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'hotel' : 'hotels'} saved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {wishlistItems.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700/30 backdrop-blur-lg">
            <Empty
              image={<HeartOutlined className="text-6xl text-gray-400" />}
              description={
                <div className="text-center">
                  <Title level={4} className="text-white">Your wishlist is empty</Title>
                  <Paragraph className="text-gray-400 mb-6">
                    Start adding hotels you love to your wishlist for easy access later
                  </Paragraph>
                  <Button type="primary" onClick={() => navigate('/hotels')}>
                    Browse Hotels
                  </Button>
                </div>
              }
            />
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {wishlistItems.map((item) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                <Card
                  className="bg-gray-800/50 border-gray-700/30 backdrop-blur-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  cover={
                    <div className="relative">
                      <Image
                        src={item.hotel_image || 'https://via.placeholder.com/300x200'}
                        alt={item.hotel_name}
                        height={200}
                        className="object-cover"
                        fallback="https://via.placeholder.com/300x200?text=No+Image"
                      />
                      <div className="absolute top-2 right-2">
                        <WishlistButton 
                          hotelId={item.hotel_id} 
                          hotelName={item.hotel_name}
                          size="small"
                        />
                      </div>
                    </div>
                  }
                  actions={[
                    <Button 
                      type="primary" 
                      onClick={() => navigate(`/hotels/${item.hotel_id}`)}
                      block
                    >
                      View Details
                    </Button>,
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveFromWishlist(item.hotel_id, item.hotel_name)}
                    >
                      Remove
                    </Button>
                  ]}
                >
                  <div className="mb-3">
                    <Title level={5} className="text-white mb-2 truncate">
                      {item.hotel_name}
                    </Title>
                    <div className="flex items-center gap-2 mb-2">
                      <EnvironmentOutlined className="text-gray-400 text-sm" />
                      <Text className="text-gray-400 text-sm">{item.hotel_location}</Text>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <Rate disabled defaultValue={item.hotel_rating} className="text-sm" />
                      <Text className="text-gray-400 text-sm">{item.hotel_rating}</Text>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                    <div>
                      <Text className="text-2xl font-bold text-white">
                        {formatPrice(item.hotel_price)}
                      </Text>
                      <Text className="text-gray-400 text-sm block">per night</Text>
                    </div>
                    <div className="text-right">
                      <Tooltip title="Added to wishlist">
                        <CalendarOutlined className="text-gray-400" />
                      </Tooltip>
                      <Text className="text-gray-400 text-xs block">
                        {formatDate(item.created_at)}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
