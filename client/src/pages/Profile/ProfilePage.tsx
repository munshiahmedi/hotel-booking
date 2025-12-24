// src/pages/Profile/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message, Upload, Avatar } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, CameraOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { authApi } from '../../services/api';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      form.setFieldsValue({
        name: parsedUser.name,
        email: parsedUser.email,
        phone: parsedUser.phone || '',
      });
    }
  }, [form]);

  const onFinish = async (values: { name: string; phone?: string }) => {
    try {
      setLoading(true);
      // Update profile logic here
      const updatedUser = { ...user, ...values };
      await authApi.updateProfile(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      message.success('Profile updated successfully!');
    } catch (error) {
      message.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            type="default" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/dashboard')}
          >
            Back
          </Button>
          <Title level={2} className="mb-0">My Profile</Title>
        </div>
      </div>
      
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row items-center mb-6">
          <div className="relative mb-4 md:mb-0 md:mr-8">
            <Avatar 
              size={120} 
              icon={<UserOutlined />} 
              src={user.avatar} 
              className="mb-2"
            />
            <Upload 
              showUploadList={false}
              // Add your upload logic here
            >
              <Button 
                icon={<CameraOutlined />} 
                shape="circle" 
                className="absolute bottom-0 right-0"
              />
            </Upload>
          </div>
          
          <div className="text-center md:text-left">
            <Title level={4} className="mb-1">{user.name}</Title>
            <Text type="secondary" className="block mb-2">{user.email}</Text>
            {user.phone && <Text type="secondary" className="block">{user.phone}</Text>}
            <Button 
              type="link" 
              className="mt-2"
              onClick={() => document.getElementById('editProfile')?.scrollIntoView()}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="border-t pt-6" id="editProfile">
          <Title level={4} className="mb-6">Edit Profile</Title>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              name: user.name,
              email: user.email,
              phone: user.phone || '',
            }}
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please input your name!' }]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400" />} 
                size="large" 
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
            >
              <Input 
                prefix={<MailOutlined className="text-gray-400" />} 
                size="large" 
                disabled 
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ pattern: /^[0-9+\-() ]+$/, message: 'Please enter a valid phone number!' }]}
            >
              <Input 
                prefix={<PhoneOutlined className="text-gray-400" />} 
                size="large" 
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="mr-4"
              >
                Save Changes
              </Button>
              <Button 
                type="default" 
                onClick={handleLogout}
                danger
              >
                Logout
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>

      <Card title="Change Password" className="mb-6">
        <Form
          name="changePassword"
          layout="vertical"
          onFinish={async (values) => {
            try {
              setLoading(true);
              await authApi.changePassword(values);
              message.success('Password changed successfully!');
            } catch (error) {
              message.error('Failed to change password. Please try again.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please input your current password!' }]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;