// src/pages/hotel-management/RoomsManagement.tsx
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
  InputNumber,
  Select,
  Switch,
  message,
  Popconfirm,
  Tooltip,
  Badge,
  Statistic
} from 'antd';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  KeyOutlined,
  TeamOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../utils/AuthContext';
import { hotelManagementService, Room, CreateRoomRequest, UpdateRoomRequest } from '../../services/hotelManagement.service';

const { Title, Text } = Typography;
const { Option } = Select;

const RoomsManagement: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();

  const roomTypes = [
    'Standard Single',
    'Standard Double', 
    'Deluxe Single',
    'Deluxe Double',
    'Suite',
    'Presidential Suite',
    'Family Room',
    'Twin Room'
  ];

  const amenityOptions = [
    'WiFi',
    'Air Conditioning',
    'TV',
    'Mini Bar',
    'Safe',
    'Coffee Maker',
    'Hair Dryer',
    'Bathrobe',
    'Slippers',
    'Work Desk',
    'Balcony',
    'Ocean View',
    'City View',
    'Mountain View'
  ];

  useEffect(() => {
    if (!hotelId || !token) return;

    const fetchRooms = async () => {
      try {
        setLoading(true);
        const roomsData = await hotelManagementService.getRooms(Number(hotelId));
        setRooms(roomsData);
      } catch (error: any) {
        message.error(error.message || 'Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [hotelId, token]);

  const handleCreateRoom = () => {
    setEditingRoom(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    form.setFieldsValue({
      room_number: room.room_number,
      room_type: room.room_type,
      capacity: room.capacity,
      base_price: room.base_price,
      status: room.status,
      amenities: room.amenities
    });
    setModalVisible(true);
  };

  const handleDeleteRoom = async (roomId: number) => {
    try {
      await hotelManagementService.deleteRoom(roomId);
      message.success('Room deleted successfully');
      setRooms(rooms.filter(room => room.id !== roomId));
    } catch (error: any) {
      message.error(error.message || 'Failed to delete room');
    }
  };

  const handleToggleRoomStatus = async (roomId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'blocked' : 'available';
    try {
      const updatedRoom = await hotelManagementService.updateRoomStatus(roomId, newStatus as 'available' | 'blocked');
      message.success(`Room ${newStatus === 'available' ? 'activated' : 'blocked'} successfully`);
      setRooms(rooms.map(room => room.id === roomId ? updatedRoom : room));
    } catch (error: any) {
      message.error(error.message || 'Failed to update room status');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRoom) {
        // Update existing room
        const updateData: UpdateRoomRequest = {
          room_number: values.room_number,
          room_type: values.room_type,
          capacity: values.capacity,
          base_price: values.base_price,
          status: values.status,
          amenities: values.amenities
        };
        const updatedRoom = await hotelManagementService.updateRoom(editingRoom.id, updateData);
        message.success('Room updated successfully');
        setRooms(rooms.map(room => room.id === editingRoom.id ? updatedRoom : room));
      } else {
        // Create new room
        const createData: CreateRoomRequest = {
          hotel_id: Number(hotelId),
          room_number: values.room_number,
          room_type: values.room_type,
          capacity: values.capacity,
          base_price: values.base_price,
          amenities: values.amenities
        };
        const newRoom = await hotelManagementService.createRoom(createData);
        message.success('Room created successfully');
        setRooms([...rooms, newRoom]);
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || 'Failed to save room');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'available': 'green',
      'blocked': 'red',
      'maintenance': 'orange'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'available': <CheckCircleOutlined />,
      'blocked': <CloseCircleOutlined />,
      'maintenance': <ExclamationCircleOutlined />
    };
    return icons[status] || <KeyOutlined />;
  };

  const columns = [
    {
      title: 'Room Number',
      dataIndex: 'room_number',
      key: 'room_number',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Type',
      dataIndex: 'room_type',
      key: 'room_type'
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number) => (
        <Space>
          <TeamOutlined />
          {capacity} guests
        </Space>
      )
    },
    {
      title: 'Base Price',
      dataIndex: 'base_price',
      key: 'base_price',
      render: (price: number) => (
        <Text strong>${price}/night</Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Amenities',
      dataIndex: 'amenities',
      key: 'amenities',
      render: (amenities: string[]) => (
        <div className="flex flex-wrap gap-1">
          {amenities.slice(0, 3).map(amenity => (
            <Tag key={amenity}>{amenity}</Tag>
          ))}
          {amenities.length > 3 && (
            <Tag>+{amenities.length - 3}</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Room) => (
        <Space>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => handleEditRoom(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'available' ? 'Block' : 'Activate'}>
            <Button 
              type="text" 
              icon={record.status === 'available' ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
              onClick={() => handleToggleRoomStatus(record.id, record.status)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this room?"
              onConfirm={() => handleDeleteRoom(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                type="text" 
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  const availableRooms = rooms.filter(room => room.status === 'available').length;
  const blockedRooms = rooms.filter(room => room.status === 'blocked').length;
  const maintenanceRooms = rooms.filter(room => room.status === 'maintenance').length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={2} className="mb-2">Rooms Management</Title>
            <Text type="secondary">Manage your hotel rooms and their availability</Text>
          </div>
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateRoom}
          >
            Add New Room
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Available Rooms"
              value={availableRooms}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Blocked Rooms"
              value={blockedRooms}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Maintenance"
              value={maintenanceRooms}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Rooms Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={rooms}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true
          }}
        />
      </Card>

      {/* Add/Edit Room Modal */}
      <Modal
        title={editingRoom ? 'Edit Room' : 'Add New Room'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="room_number"
                label="Room Number"
                rules={[{ required: true, message: 'Please enter room number' }]}
              >
                <Input placeholder="e.g., 101, A201" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="room_type"
                label="Room Type"
                rules={[{ required: true, message: 'Please select room type' }]}
              >
                <Select placeholder="Select room type">
                  {roomTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="capacity"
                label="Capacity"
                rules={[
                  { required: true, message: 'Please enter capacity' },
                  { type: 'number', min: 1, max: 10, message: 'Capacity must be between 1 and 10' }
                ]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  placeholder="Number of guests"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="base_price"
                label="Base Price ($/night)"
                rules={[
                  { required: true, message: 'Please enter base price' },
                  { type: 'number', min: 0, message: 'Price must be positive' }
                ]}
              >
                <InputNumber
                  min={0}
                  step={10}
                  placeholder="Base price"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="available">Available</Option>
              <Option value="blocked">Blocked</Option>
              <Option value="maintenance">Maintenance</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="amenities"
            label="Amenities"
          >
            <Select
              mode="multiple"
              placeholder="Select amenities"
              style={{ width: '100%' }}
            >
              {amenityOptions.map(amenity => (
                <Option key={amenity} value={amenity}>{amenity}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRoom ? 'Update Room' : 'Create Room'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomsManagement;
