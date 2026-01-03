// src/pages/admin/UserManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Space,
  message,
  Spin,
  Input,
  Select,
  Tag,
  Modal,
  Form,
  Typography,
  Popconfirm,
  Badge,
  Row,
  Col
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useAuth } from '../../utils/AuthContext';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'hotel_owner' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_login: string;
  total_bookings: number;
  total_spent: number;
}

const UserManagement: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await userApi.getUsers();
      
      // Set empty data for now - replace with real API call
      setUsers([]);
    } catch (error) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const filterUsers = useCallback(() => {
    let filtered = users;

    if (searchText) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchText, statusFilter, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [token, fetchUsers]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleEditUser = (user: User) => {
    form.setFieldsValue(user);
    setEditModalVisible(true);
  };

  const handleUpdateUser = async (values: any) => {
    try {
      // Mock update - replace with actual API call
      message.success('User updated successfully');
      setEditModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      message.error('Failed to update user');
    }
  };

  const handleAddUser = () => {
    setAddModalVisible(true);
    form.resetFields();
  };

  const handleCreateUser = async (values: any) => {
    try {
      // Mock create - replace with actual API call
      const newUser: User = {
        id: users.length + 1,
        email: values.email,
        name: values.name,
        role: values.role,
        status: 'active',
        created_at: new Date().toISOString().split('T')[0],
        last_login: 'Never',
        total_bookings: 0,
        total_spent: 0
      };
      
      setUsers([...users, newUser]);
      message.success('User created successfully');
      setAddModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to create user');
    }
  };

  const handleSuspendUser = async (userId: number) => {
    try {
      const updatedUsers = users.map(user =>
        user.id === userId
          ? { ...user, status: 'suspended' as const }
          : user
      );
      setUsers(updatedUsers);
      message.success('User suspended successfully');
    } catch (error) {
      message.error('Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId: number) => {
    try {
      const updatedUsers = users.map(user =>
        user.id === userId
          ? { ...user, status: 'active' as const }
          : user
      );
      setUsers(updatedUsers);
      message.success('User activated successfully');
    } catch (error) {
      message.error('Failed to activate user');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'green', text: 'Active' },
      inactive: { color: 'default', text: 'Inactive' },
      suspended: { color: 'red', text: 'Suspended' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge status={config.color as any} text={config.text} />;
  };

  const getRoleTag = (role: string) => {
    const roleConfig = {
      user: { color: 'blue', text: 'User' },
      hotel_owner: { color: 'purple', text: 'Hotel Owner' },
      admin: { color: 'red', text: 'Admin' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record: User) => (
        <div>
          <div className="font-medium">{record.name}</div>
          <div className="text-gray-500 text-sm">{record.email}</div>
        </div>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => getRoleTag(role)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusBadge(status)
    },
    {
      title: 'Bookings',
      dataIndex: 'total_bookings',
      key: 'total_bookings'
    },
    {
      title: 'Total Spent',
      dataIndex: 'total_spent',
      key: 'total_spent',
      render: (amount: number) => formatCurrency(amount)
    },
    {
      title: 'Last Login',
      dataIndex: 'last_login',
      key: 'last_login'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/users/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          />
          {record.status === 'active' ? (
            <Popconfirm
              title="Are you sure you want to suspend this user?"
              onConfirm={() => handleSuspendUser(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                icon={<LockOutlined />}
                danger
              />
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Are you sure you want to activate this user?"
              onConfirm={() => handleActivateUser(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                icon={<UnlockOutlined />}
              />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>User Management</Title>
        <Text type="secondary">Manage system users and their permissions</Text>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search users..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full"
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="suspended">Suspended</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by role"
              value={roleFilter}
              onChange={setRoleFilter}
              className="w-full"
            >
              <Option value="all">All Roles</Option>
              <Option value="user">User</Option>
              <Option value="hotel_owner">Hotel Owner</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="w-full"
              onClick={handleAddUser}
            >
              Add User
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true
          }}
        />
      </Card>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateUser}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select>
              <Option value="user">User</Option>
              <Option value="hotel_owner">Hotel Owner</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="suspended">Suspended</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update User
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add User Modal */}
      <Modal
        title="Add New User"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateUser}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select>
              <Option value="user">User</Option>
              <Option value="hotel_owner">Hotel Owner</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create User
              </Button>
              <Button onClick={() => setAddModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
