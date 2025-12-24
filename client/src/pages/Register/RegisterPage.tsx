// src/pages/Register/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { authApi } from '../../services/api';
import { useAuth } from '../../utils/AuthContext';

const { Title } = Typography;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: { 
    name: string; 
    email: string; 
    password: string; 
    confirmPassword: string;
    phone?: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match!');
      return;
    }

    try {
      setLoading(true);
      const { confirmPassword, ...userData } = values;
      
      // Register the user and get token
      await authApi.register(userData);
      
      // Automatically log in the user using AuthContext
      await login(userData);
      
      message.success('Registration successful! Welcome to your dashboard!');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <Title level={3} className="mb-0">Create an Account</Title>
          <p className="text-gray-500">Join us today</p>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          scrollToFirstError
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your name!', whitespace: true }]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="Full Name" 
              size="large" 
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { type: 'email', message: 'Please enter a valid email!' },
              { required: true, message: 'Please input your email!' },
            ]}
          >
            <Input 
              prefix={<MailOutlined className="text-gray-400" />} 
              placeholder="Email" 
              size="large" 
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[{ pattern: /^[0-9+\-() ]+$/, message: 'Please enter a valid phone number!' }]}
          >
            <Input 
              prefix={<PhoneOutlined className="text-gray-400" />} 
              placeholder="Phone (optional)" 
              size="large" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
            hasFeedback
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Password" 
              size="large" 
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Confirm Password" 
              size="large" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full" 
              size="large"
              loading={loading}
            >
              Register
            </Button>
          </Form.Item>

          <div className="text-center">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;