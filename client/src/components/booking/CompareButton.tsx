// src/components/booking/CompareButton.tsx
import React from 'react';
import { Button, Badge, Tooltip, message } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { AvailableRoomType } from '../../services/roomAvailability.service';

interface CompareButtonProps {
  room: AvailableRoomType;
  isInComparison: boolean;
  onToggleComparison: (room: AvailableRoomType) => void;
  maxComparisonReached: boolean;
  comparisonCount: number;
  size?: 'small' | 'middle' | 'large';
  showText?: boolean;
}

const CompareButton: React.FC<CompareButtonProps> = ({
  room,
  isInComparison,
  onToggleComparison,
  maxComparisonReached,
  comparisonCount,
  size = 'middle',
  showText = false
}) => {
  const handleClick = () => {
    if (maxComparisonReached && !isInComparison) {
      message.warning('Maximum 4 rooms can be compared at once. Remove a room to add another.');
      return;
    }
    onToggleComparison(room);
  };

  const getTooltipText = () => {
    if (maxComparisonReached && !isInComparison) {
      return 'Maximum comparison limit reached. Remove a room first.';
    }
    if (isInComparison) {
      return 'Remove from comparison';
    }
    return 'Add to comparison';
  };

  return (
    <Tooltip title={getTooltipText()}>
      <Button
        type={isInComparison ? 'primary' : 'default'}
        icon={<SwapOutlined />}
        size={size}
        onClick={handleClick}
        className={`compare-button ${
          isInComparison 
            ? 'bg-blue-600 border-blue-600 text-white' 
            : 'border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400'
        } transition-colors duration-200`}
      >
        {showText && (
          <span className="ml-2">
            {isInComparison ? 'Comparing' : 'Compare'}
          </span>
        )}
        {isInComparison && (
          <Badge 
            count={comparisonCount} 
            size="small" 
            className="ml-2"
            style={{ backgroundColor: '#ffffff20', color: 'white' }}
          />
        )}
      </Button>
    </Tooltip>
  );
};

export default CompareButton;
