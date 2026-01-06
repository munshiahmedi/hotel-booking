// src/components/wishlist/WishlistButton.tsx
import React, { useState, useEffect } from 'react';
import { Button, message, Tooltip } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { wishlistService } from '../../services/wishlist.service';

interface WishlistButtonProps {
  hotelId: number;
  hotelName?: string;
  size?: 'small' | 'middle' | 'large';
  showText?: boolean;
  className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  hotelId,
  hotelName,
  size = 'middle',
  showText = false,
  className = ''
}) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if hotel is in wishlist on component mount
  useEffect(() => {
    checkWishlistStatus();
  }, [hotelId]);

  const checkWishlistStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // Only check for logged-in users
      
      const inWishlist = await wishlistService.isInWishlist(hotelId);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('Please login to add hotels to your wishlist');
      return;
    }

    setLoading(true);
    try {
      const response = await wishlistService.toggleWishlist(hotelId);
      
      if (response.success) {
        setIsInWishlist(!isInWishlist);
        
        if (isInWishlist) {
          message.success(`${hotelName || 'Hotel'} removed from wishlist`);
        } else {
          message.success(`${hotelName || 'Hotel'} added to wishlist`);
        }
      } else {
        message.error(response.message || 'Failed to update wishlist');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
      <Button
        type={isInWishlist ? 'primary' : 'default'}
        danger={isInWishlist}
        icon={isInWishlist ? <HeartFilled /> : <HeartOutlined />}
        size={size}
        loading={loading}
        onClick={handleToggleWishlist}
        className={`wishlist-button ${className}`}
        style={{
          borderColor: isInWishlist ? '#ff4d4f' : undefined,
          backgroundColor: isInWishlist ? '#fff1f0' : undefined,
          color: isInWishlist ? '#ff4d4f' : undefined
        }}
      >
        {showText && (isInWishlist ? 'Saved' : 'Save')}
      </Button>
    </Tooltip>
  );
};

export default WishlistButton;
