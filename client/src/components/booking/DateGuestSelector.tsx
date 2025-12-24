// src/components/booking/DateGuestSelector.tsx
import React from 'react';
import { Card, DatePicker, InputNumber, Typography, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface DateGuestSelectorProps {
  selectedDates: [Dayjs, Dayjs] | null;
  onDatesChange: (dates: [Dayjs, Dayjs] | null) => void;
  guests: number;
  onGuestsChange: (guests: number) => void;
  loading?: boolean;
}

const DateGuestSelector: React.FC<DateGuestSelectorProps> = ({
  selectedDates,
  onDatesChange,
  guests,
  onGuestsChange,
  loading = false
}) => {
  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>Select Dates & Guests</span>
        </div>
      } 
      className="mb-6 sticky top-4"
      loading={loading}
    >
      <Space direction="vertical" className="w-full" size="large">
        <div>
          <Title level={5} className="mb-3">Check-in & Check-out</Title>
          <RangePicker
            size="large"
            className="w-full"
            value={selectedDates}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                onDatesChange([dates[0] as Dayjs, dates[1] as Dayjs]);
              } else {
                onDatesChange(null);
              }
            }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            placeholder={['Check-in Date', 'Check-out Date']}
            format="MMMM DD, YYYY"
          />
        </div>
        
        <div>
          <Title level={5} className="mb-3">Number of Guests</Title>
          <InputNumber
            size="large"
            min={1}
            max={10}
            value={guests}
            onChange={(value) => onGuestsChange(value || 1)}
            className="w-full"
            placeholder="Select number of guests"
            addonBefore={<UserOutlined />}
          />
        </div>
      </Space>
    </Card>
  );
};

export default DateGuestSelector;
