// src/pages/hotel-management/AmenitiesFacilitiesManagement.tsx
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
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Tabs,
  Divider,
  Avatar
} from 'antd';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TrophyOutlined,
  WifiOutlined,
  CarOutlined,
  CoffeeOutlined,
  BuildOutlined,
  HomeOutlined,
  UploadOutlined,
  EyeOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../../utils/AuthContext';
import { 
  hotelManagementService, 
  HotelAmenity, 
  HotelFacility,
  CreateAmenityRequest,
  CreateFacilityRequest
} from '../../services/hotelManagement.service';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const AmenitiesFacilitiesManagement: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [amenities, setAmenities] = useState<HotelAmenity[]>([]);
  const [facilities, setFacilities] = useState<HotelFacility[]>([]);
  const [activeTab, setActiveTab] = useState('amenities');
  
  // Modal states
  const [amenityModalVisible, setAmenityModalVisible] = useState(false);
  const [facilityModalVisible, setFacilityModalVisible] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<HotelAmenity | null>(null);
  const [editingFacility, setEditingFacility] = useState<HotelFacility | null>(null);
  
  const [amenityForm] = Form.useForm();
  const [facilityForm] = Form.useForm();

  const amenityCategories = [
    'Room Features',
    'Bathroom',
    'Entertainment',
    'Food & Beverage',
    'Services',
    'Business',
    'Wellness',
    'Safety'
  ];

  const iconOptions = [
    { value: 'wifi', label: 'WiFi', icon: <WifiOutlined /> },
    { value: 'car', label: 'Parking', icon: <CarOutlined /> },
    { value: 'coffee', label: 'Coffee', icon: <CoffeeOutlined /> },
    { value: 'dumbbell', label: 'Gym', icon: <BuildOutlined /> },
    { value: 'swim', label: 'Pool', icon: <HomeOutlined /> },
    { value: 'home', label: 'Home', icon: <HomeOutlined /> },
    { value: 'tv', label: 'TV', icon: <TrophyOutlined /> },
    { value: 'food', label: 'Food', icon: <CoffeeOutlined /> },
    { value: 'spa', label: 'Spa', icon: <TrophyOutlined /> },
    { value: 'laundry', label: 'Laundry', icon: <HomeOutlined /> }
  ];

  useEffect(() => {
    if (!hotelId || !token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [amenitiesData, facilitiesData] = await Promise.all([
          hotelManagementService.getHotelAmenities(Number(hotelId)),
          hotelManagementService.getHotelFacilities(Number(hotelId))
        ]);
        setAmenities(amenitiesData);
        setFacilities(facilitiesData);
      } catch (error: any) {
        message.error(error.message || 'Failed to load amenities and facilities');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hotelId, token]);

  // Amenities handlers
  const handleCreateAmenity = () => {
    setEditingAmenity(null);
    amenityForm.resetFields();
    setAmenityModalVisible(true);
  };

  const handleEditAmenity = (amenity: HotelAmenity) => {
    setEditingAmenity(amenity);
    amenityForm.setFieldsValue({
      name: amenity.name,
      description: amenity.description,
      icon: amenity.icon,
      category: amenity.category
    });
    setAmenityModalVisible(true);
  };

  const handleDeleteAmenity = async (amenityId: number) => {
    try {
      await hotelManagementService.deleteAmenity(amenityId);
      message.success('Amenity deleted successfully');
      setAmenities(amenities.filter(a => a.id !== amenityId));
    } catch (error: any) {
      message.error(error.message || 'Failed to delete amenity');
    }
  };

  const handleSaveAmenity = async (values: any) => {
    try {
      if (editingAmenity) {
        const updatedAmenity = await hotelManagementService.updateAmenity(editingAmenity.id, values);
        message.success('Amenity updated successfully');
        setAmenities(amenities.map(a => a.id === editingAmenity.id ? updatedAmenity : a));
      } else {
        const createData: CreateAmenityRequest = {
          hotel_id: Number(hotelId),
          ...values
        };
        const newAmenity = await hotelManagementService.createAmenity(createData);
        message.success('Amenity created successfully');
        setAmenities([...amenities, newAmenity]);
      }
      setAmenityModalVisible(false);
      amenityForm.resetFields();
    } catch (error: any) {
      message.error(error.message || 'Failed to save amenity');
    }
  };

  // Facilities handlers
  const handleCreateFacility = () => {
    setEditingFacility(null);
    facilityForm.resetFields();
    setFacilityModalVisible(true);
  };

  const handleEditFacility = (facility: HotelFacility) => {
    setEditingFacility(facility);
    facilityForm.setFieldsValue({
      name: facility.name,
      description: facility.description,
      operating_hours: facility.operating_hours,
      availability: facility.availability
    });
    setFacilityModalVisible(true);
  };

  const handleDeleteFacility = async (facilityId: number) => {
    try {
      await hotelManagementService.deleteFacility(facilityId);
      message.success('Facility deleted successfully');
      setFacilities(facilities.filter(f => f.id !== facilityId));
    } catch (error: any) {
      message.error(error.message || 'Failed to delete facility');
    }
  };

  const handleToggleFacility = async (facilityId: number) => {
    try {
      const updatedFacility = await hotelManagementService.toggleFacilityAvailability(facilityId);
      message.success('Facility availability updated successfully');
      setFacilities(facilities.map(f => f.id === facilityId ? updatedFacility : f));
    } catch (error: any) {
      message.error(error.message || 'Failed to toggle facility availability');
    }
  };

  const handleSaveFacility = async (values: any) => {
    try {
      if (editingFacility) {
        const updatedFacility = await hotelManagementService.updateFacility(editingFacility.id, values);
        message.success('Facility updated successfully');
        setFacilities(facilities.map(f => f.id === editingFacility.id ? updatedFacility : f));
      } else {
        const createData: CreateFacilityRequest = {
          hotel_id: Number(hotelId),
          ...values
        };
        const newFacility = await hotelManagementService.createFacility(createData);
        message.success('Facility created successfully');
        setFacilities([...facilities, newFacility]);
      }
      setFacilityModalVisible(false);
      facilityForm.resetFields();
    } catch (error: any) {
      message.error(error.message || 'Failed to save facility');
    }
  };

  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find(opt => opt.value === iconName);
    return icon ? icon.icon : <TrophyOutlined />;
  };

  // Amenities table columns
  const amenitiesColumns = [
    {
      title: 'Icon',
      dataIndex: 'icon',
      key: 'icon',
      render: (icon: string) => (
        <Avatar icon={getIconComponent(icon)} />
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => <Text type="secondary">{text}</Text>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: HotelAmenity) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => handleEditAmenity(record)}
          />
          <Button 
            type="text" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAmenity(record.id)}
          />
        </Space>
      )
    }
  ];

  // Facilities table columns
  const facilitiesColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => <Text type="secondary">{text}</Text>
    },
    {
      title: 'Operating Hours',
      dataIndex: 'operating_hours',
      key: 'operating_hours',
      render: (hours: string) => <Text code>{hours}</Text>
    },
    {
      title: 'Availability',
      dataIndex: 'availability',
      key: 'availability',
      render: (available: boolean, record: HotelFacility) => (
        <Switch
          checked={available}
          onChange={() => handleToggleFacility(record.id)}
          checkedChildren="Open"
          unCheckedChildren="Closed"
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: HotelFacility) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => handleEditFacility(record)}
          />
          <Button 
            type="text" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteFacility(record.id)}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={2} className="mb-2">Amenities & Facilities</Title>
            <Text type="secondary">Manage hotel amenities and facilities for guest experience</Text>
          </div>
          <Button 
            icon={<EyeOutlined />}
            onClick={() => navigate(`/hotels/${hotelId}`)}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <div className="text-center">
              <TrophyOutlined className="text-4xl text-blue-500 mb-2" />
              <div className="text-2xl font-bold">{amenities.length}</div>
              <div className="text-gray-500">Total Amenities</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div className="text-center">
              <SettingOutlined className="text-4xl text-green-500 mb-2" />
              <div className="text-2xl font-bold">{facilities.length}</div>
              <div className="text-gray-500">Total Facilities</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div className="text-center">
              <EyeOutlined className="text-4xl text-orange-500 mb-2" />
              <div className="text-2xl font-bold">
                {facilities.filter(f => f.availability).length}
              </div>
              <div className="text-gray-500">Available Facilities</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <TrophyOutlined />
                Amenities ({amenities.length})
              </span>
            } 
            key="amenities"
          >
            <div className="mb-4">
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateAmenity}
              >
                Add Amenity
              </Button>
            </div>
            <Table
              columns={amenitiesColumns}
              dataSource={amenities}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true
              }}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <SettingOutlined />
                Facilities ({facilities.length})
              </span>
            } 
            key="facilities"
          >
            <div className="mb-4">
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateFacility}
              >
                Add Facility
              </Button>
            </div>
            <Table
              columns={facilitiesColumns}
              dataSource={facilities}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Amenity Modal */}
      <Modal
        title={editingAmenity ? 'Edit Amenity' : 'Add Amenity'}
        open={amenityModalVisible}
        onCancel={() => setAmenityModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={amenityForm}
          layout="vertical"
          onFinish={handleSaveAmenity}
        >
          <Form.Item
            name="name"
            label="Amenity Name"
            rules={[{ required: true, message: 'Please enter amenity name' }]}
          >
            <Input placeholder="e.g., Free WiFi, Swimming Pool" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category">
              {amenityCategories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="icon"
            label="Icon"
            rules={[{ required: true, message: 'Please select an icon' }]}
          >
            <Select placeholder="Select icon">
              {iconOptions.map(icon => (
                <Option key={icon.value} value={icon.value}>
                  <Space>
                    {icon.icon}
                    {icon.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea 
              rows={3}
              placeholder="Describe the amenity..."
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAmenity ? 'Update Amenity' : 'Create Amenity'}
              </Button>
              <Button onClick={() => setAmenityModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Facility Modal */}
      <Modal
        title={editingFacility ? 'Edit Facility' : 'Add Facility'}
        open={facilityModalVisible}
        onCancel={() => setFacilityModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={facilityForm}
          layout="vertical"
          onFinish={handleSaveFacility}
        >
          <Form.Item
            name="name"
            label="Facility Name"
            rules={[{ required: true, message: 'Please enter facility name' }]}
          >
            <Input placeholder="e.g., Gym, Restaurant, Spa" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea 
              rows={3}
              placeholder="Describe the facility..."
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="operating_hours"
            label="Operating Hours"
            rules={[{ required: true, message: 'Please enter operating hours' }]}
          >
            <Input placeholder="e.g., 6:00 AM - 10:00 PM" />
          </Form.Item>

          <Form.Item
            name="availability"
            label="Available"
            valuePropName="checked"
          >
            <Switch checkedChildren="Open" unCheckedChildren="Closed" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit">
                {editingFacility ? 'Update Facility' : 'Create Facility'}
              </Button>
              <Button onClick={() => setFacilityModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AmenitiesFacilitiesManagement;
