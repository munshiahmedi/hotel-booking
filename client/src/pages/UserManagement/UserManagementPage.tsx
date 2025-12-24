// src/pages/UserManagement/UserManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Typography, Space, Tag, Popconfirm } from 'antd';
import { EditOutlined, UserOutlined, StopOutlined } from '@ant-design/icons';
import { authApi } from '../../services/api';
import { useAuth } from '../../utils/AuthContext';

const { Title } = Typography;

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: { name: string };
  is_active: boolean;
  created_at: string;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authApi.getAllUsers();
      const usersData = response.data?.users;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values: { name: string; email: string; phone: string }) => {
    if (!selectedUser) return;

    try {
      await authApi.updateUserProfile(selectedUser.id, values);
      message.success('User profile updated successfully');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('Failed to update user profile');
    }
  };

  const handleDeactivate = async (userId: number) => {
    try {
      await authApi.deactivateUser(userId);
      message.success('User deactivated successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to deactivate user');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Role',
      dataIndex: ['role', 'name'],
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'red' : role === 'SUPERVISOR' ? 'orange' : 'blue'}>
          {role}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            disabled={record.id === currentUser?.id}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to deactivate this user?"
            onConfirm={() => handleDeactivate(record.id)}
            disabled={record.id === currentUser?.id}
          >
            <Button
              danger
              icon={<StopOutlined />}
              size="small"
              disabled={record.id === currentUser?.id}
            >
              Deactivate
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="mb-6">
        <UserOutlined className="mr-2" />
        User Management
      </Title>

      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      <Modal
        title="Edit User Profile"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input user name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit">
                Update Profile
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
