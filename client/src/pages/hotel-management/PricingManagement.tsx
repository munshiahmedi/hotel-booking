// src/pages/hotel-management/PricingManagement.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Row, 
  Col,
  Table,
  Button,
  Space,
  InputNumber,
  Form,
  DatePicker,
  Switch,
  message,
  Statistic,
  Divider,
  Alert,
  Tooltip,
  Modal
} from 'antd';
import { 
  DollarOutlined,
  CalendarOutlined,
  EditOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  PercentageOutlined
} from '@ant-design/icons';
import { useAuth } from '../../utils/AuthContext';
import { hotelManagementService, RoomPricing, UpdatePricingRequest } from '../../services/hotelManagement.service';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const PricingManagement: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [pricingData, setPricingData] = useState<RoomPricing[]>([]);
  const [editingPricing, setEditingPricing] = useState<RoomPricing | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!hotelId || !token) return;

    const fetchPricing = async () => {
      try {
        setLoading(true);
        const pricing = await hotelManagementService.getHotelPricing(Number(hotelId));
        setPricingData(pricing);
      } catch (error: any) {
        message.error(error.message || 'Failed to load pricing data');
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [hotelId, token]);

  const handleEditPricing = (pricing: RoomPricing) => {
    setEditingPricing(pricing);
    form.setFieldsValue({
      weekday_price: pricing.weekday_price,
      weekend_price: pricing.weekend_price,
      seasonal_price: pricing.seasonal_price,
      seasonal_start: pricing.seasonal_start ? dayjs(pricing.seasonal_start) : null,
      seasonal_end: pricing.seasonal_end ? dayjs(pricing.seasonal_end) : null
    });
  };

  const handleSavePricing = async (values: any) => {
    if (!editingPricing) return;

    try {
      const updateData: UpdatePricingRequest = {
        weekday_price: values.weekday_price,
        weekend_price: values.weekend_price,
        seasonal_price: values.seasonal_price,
        seasonal_start: values.seasonal_start ? values.seasonal_start.format('YYYY-MM-DD') : undefined,
        seasonal_end: values.seasonal_end ? values.seasonal_end.format('YYYY-MM-DD') : undefined
      };

      const updatedPricing = await hotelManagementService.updateRoomPricing(editingPricing.room_id, updateData);
      message.success('Pricing updated successfully');
      
      setPricingData(pricingData.map(pricing => 
        pricing.room_id === editingPricing.room_id ? updatedPricing : pricing
      ));
      
      setEditingPricing(null);
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || 'Failed to update pricing');
    }
  };

  const handleCancelEdit = () => {
    setEditingPricing(null);
    form.resetFields();
  };

  const calculateWeekendPremium = (pricing: RoomPricing) => {
    if (pricing.weekday_price === 0) return 0;
    return ((pricing.weekend_price - pricing.weekday_price) / pricing.weekday_price * 100).toFixed(1);
  };

  const calculateSeasonalPremium = (pricing: RoomPricing) => {
    if (!pricing.seasonal_price || pricing.weekday_price === 0) return 0;
    return ((pricing.seasonal_price - pricing.weekday_price) / pricing.weekday_price * 100).toFixed(1);
  };

  const columns = [
    {
      title: 'Room Type',
      dataIndex: 'room_type',
      key: 'room_type',
      render: (_: any, record: RoomPricing) => (
        <div>
          <Text strong>Room #{record.room_id}</Text>
          <br />
          <Text type="secondary" className="text-sm">ID: {record.room_id}</Text>
        </div>
      )
    },
    {
      title: 'Weekday Price',
      dataIndex: 'weekday_price',
      key: 'weekday_price',
      render: (price: number) => (
        <Text strong className="text-green-600">${price}/night</Text>
      ),
      sorter: (a: RoomPricing, b: RoomPricing) => a.weekday_price - b.weekday_price
    },
    {
      title: 'Weekend Price',
      dataIndex: 'weekend_price',
      key: 'weekend_price',
      render: (price: number, record: RoomPricing) => (
        <div>
          <Text strong className="text-blue-600">${price}/night</Text>
          <br />
          <Text type="secondary" className="text-xs">
            +{calculateWeekendPremium(record)}%
          </Text>
        </div>
      ),
      sorter: (a: RoomPricing, b: RoomPricing) => a.weekend_price - b.weekend_price
    },
    {
      title: 'Seasonal Price',
      dataIndex: 'seasonal_price',
      key: 'seasonal_price',
      render: (price: number | undefined, record: RoomPricing) => {
        if (!price) return <Text type="secondary">Not set</Text>;
        return (
          <div>
            <Text strong className="text-orange-600">${price}/night</Text>
            <br />
            <Text type="secondary" className="text-xs">
              +{calculateSeasonalPremium(record)}%
            </Text>
          </div>
        );
      }
    },
    {
      title: 'Seasonal Period',
      key: 'seasonal_period',
      render: (_: any, record: RoomPricing) => {
        if (!record.seasonal_start || !record.seasonal_end) {
          return <Text type="secondary">Not set</Text>;
        }
        return (
          <div>
            <Text>{dayjs(record.seasonal_start).format('MMM DD')} - {dayjs(record.seasonal_end).format('MMM DD')}</Text>
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: RoomPricing) => (
        <Space>
          <Tooltip title="Edit Pricing">
            <Button 
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEditPricing(record)}
            >
              Edit
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  const totalWeekdayRevenue = pricingData.reduce((sum, pricing) => sum + pricing.weekday_price, 0);
  const totalWeekendRevenue = pricingData.reduce((sum, pricing) => sum + pricing.weekend_price, 0);
  const avgWeekdayPrice = pricingData.length > 0 ? (totalWeekdayRevenue / pricingData.length).toFixed(2) : 0;
  const avgWeekendPrice = pricingData.length > 0 ? (totalWeekendRevenue / pricingData.length).toFixed(2) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={2} className="mb-2">Pricing Management</Title>
            <Text type="secondary">Set and manage room pricing for different periods</Text>
          </div>
          <Button 
            icon={<CalendarOutlined />}
            onClick={() => navigate(`/hotels/${hotelId}`)}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Pricing Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Avg Weekday Price"
              value={avgWeekdayPrice}
              prefix={<DollarOutlined />}
              suffix="/night"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Avg Weekend Price"
              value={avgWeekendPrice}
              prefix={<DollarOutlined />}
              suffix="/night"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Weekend Premium"
              value={parseFloat(avgWeekdayPrice as string) > 0 ? parseFloat((((parseFloat(avgWeekendPrice as string) - parseFloat(avgWeekdayPrice as string)) / parseFloat(avgWeekdayPrice as string) * 100).toFixed(1))) : 0}
              prefix={<PercentageOutlined />}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Rooms"
              value={pricingData.length}
              prefix={<InfoCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Pricing Guidelines */}
      <Alert
        message="Pricing Guidelines"
        description={
          <div>
            <Paragraph className="mb-2">
              <Text strong>Weekday Pricing:</Text> Monday-Thursday rates
            </Paragraph>
            <Paragraph className="mb-2">
              <Text strong>Weekend Pricing:</Text> Friday-Sunday rates (typically 20-40% higher)
            </Paragraph>
            <Paragraph className="mb-0">
              <Text strong>Seasonal Pricing:</Text> Special rates for peak seasons or holidays
            </Paragraph>
          </div>
        }
        type="info"
        showIcon
        className="mb-6"
      />

      {/* Pricing Table */}
      <Card title="Room Pricing">
        <Table
          columns={columns}
          dataSource={pricingData}
          loading={loading}
          rowKey="room_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true
          }}
        />
      </Card>

      {/* Edit Pricing Modal */}
      <Modal
        title={`Edit Pricing - Room #${editingPricing?.room_id}`}
        open={!!editingPricing}
        onCancel={handleCancelEdit}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSavePricing}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="weekday_price"
                label="Weekday Price ($/night)"
                rules={[
                  { required: true, message: 'Please enter weekday price' },
                  { type: 'number', min: 0, message: 'Price must be positive' }
                ]}
              >
                <InputNumber
                  min={0}
                  step={10}
                  placeholder="Weekday price"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="weekend_price"
                label="Weekend Price ($/night)"
                rules={[
                  { required: true, message: 'Please enter weekend price' },
                  { type: 'number', min: 0, message: 'Price must be positive' }
                ]}
              >
                <InputNumber
                  min={0}
                  step={10}
                  placeholder="Weekend price"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Seasonal Pricing (Optional)</Divider>

          <Form.Item
            name="seasonal_price"
            label="Seasonal Price ($/night)"
            rules={[
              { type: 'number', min: 0, message: 'Price must be positive' }
            ]}
          >
            <InputNumber
              min={0}
              step={10}
              placeholder="Seasonal price"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="seasonal_start"
                label="Season Start Date"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Start date"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="seasonal_end"
                label="Season End Date"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="End date"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Save Pricing
              </Button>
              <Button onClick={handleCancelEdit}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PricingManagement;
