// src/components/booking/PriceBreakdown.tsx
import React from 'react';
import { Card, Typography, Divider, Space, Tag } from 'antd';
import { DollarOutlined, PercentageOutlined } from '@ant-design/icons';
import { PriceBreakdown as PriceBreakdownType } from '../../services/booking.service';
import moment from 'moment';

const { Title, Text } = Typography;

interface PriceBreakdownProps {
  breakdown: PriceBreakdownType;
  checkIn: string;
  checkOut: string;
  loading?: boolean;
}

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  breakdown,
  checkIn,
  checkOut,
  loading = false
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const nights = moment(checkOut).diff(moment(checkIn), 'days');

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <DollarOutlined />
          <span>Price Breakdown</span>
        </div>
      }
      loading={loading}
      className="mb-6"
    >
      <Space direction="vertical" className="w-full" size="middle">
        {/* Base Price */}
        <div className="flex justify-between items-center">
          <div>
            <Text strong>Base Rate</Text>
            <br />
            <Text type="secondary">
              {formatCurrency(breakdown.base_price)} × {nights} nights
            </Text>
          </div>
          <Text strong>{formatCurrency(breakdown.subtotal)}</Text>
        </div>

        <Divider />

        {/* Taxes */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Text strong>Taxes</Text>
            <Text>{formatCurrency(breakdown.total_taxes)}</Text>
          </div>
          <div className="ml-4 space-y-1">
            {breakdown.taxes.map((tax, index) => (
              <div key={index} className="flex justify-between items-center">
                <Text type="secondary" className="text-sm">
                  {tax.name}
                  {tax.percentage && (
                    <Tag color="blue" className="ml-2">
                      <PercentageOutlined className="text-xs" />
                      {tax.percentage}%
                    </Tag>
                  )}
                </Text>
                <Text type="secondary" className="text-sm">
                  {formatCurrency(tax.amount)}
                </Text>
              </div>
            ))}
          </div>
        </div>

        {/* Service Fees */}
        {breakdown.service_fees.length > 0 && (
          <>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Text strong>Service Fees</Text>
                <Text>{formatCurrency(breakdown.total_fees)}</Text>
              </div>
              <div className="ml-4 space-y-1">
                {breakdown.service_fees.map((fee, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <Text type="secondary" className="text-sm">
                      {fee.name}
                      {fee.percentage && (
                        <Tag color="green" className="ml-2">
                          <PercentageOutlined className="text-xs" />
                          {fee.percentage}%
                        </Tag>
                      )}
                    </Text>
                    <Text type="secondary" className="text-sm">
                      {formatCurrency(fee.amount)}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
            <Divider />
          </>
        )}

        {/* Total */}
        <div className="flex justify-between items-center pt-2 border-t-2 border-t-gray-200">
          <Title level={4} className="mb-0">Total Amount</Title>
          <Title level={3} className="mb-0 text-green-600">
            {formatCurrency(breakdown.total_amount)}
          </Title>
        </div>

        {/* Stay Summary */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <Text type="secondary" className="text-sm">
            <strong>Stay Summary:</strong> {nights} nights from {moment(checkIn).format('MMM DD')} 
            {' '}to {moment(checkOut).format('MMM DD, YYYY')}
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default PriceBreakdown;
