// src/pages/Register/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  PhoneOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  SafetyOutlined,
  HomeOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { authApi } from '../../services/api';
import { useAuth } from '../../utils/AuthContext';

const { Title, Text } = Typography;

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <UserOutlined className="text-2xl" />
              </div>
              <span className="text-3xl font-bold">HotelHub</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Join Our Community!</h1>
            <p className="text-xl text-blue-100 mb-8">
              Create your account and start your journey to amazing travel experiences with exclusive benefits.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <HomeOutlined className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold">Exclusive Deals</h3>
                <p className="text-blue-100 text-sm">Get member-only discounts and special offers</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <GlobalOutlined className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold">Global Access</h3>
                <p className="text-blue-100 text-sm">Book hotels and experiences worldwide</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <SafetyOutlined className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold">Secure & Protected</h3>
                <p className="text-blue-100 text-sm">Your data and payments are always secure</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white bg-opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-white bg-opacity-10 rounded-full blur-xl"></div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <UserOutlined className="text-white text-lg" />
              </div>
              <span className="text-2xl font-bold text-gray-900">HotelHub</span>
            </div>
            <Title level={2} className="text-gray-900">Join Our Community</Title>
            <Text className="text-gray-600">Create your account today</Text>
          </div>

          <Card className="shadow-xl border-0">
            <div className="hidden lg:block text-center mb-8">
              <Title level={2} className="text-gray-900 mb-2">Join Our Community</Title>
              <Text className="text-gray-600">Create your account and start your journey</Text>
            </div>
            
            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              layout="vertical"
              scrollToFirstError
              className="mt-6"
            >
              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Please input your name!', whitespace: true }]}
              >
                <Input 
                  prefix={<UserOutlined className="text-gray-400" />} 
                  placeholder="Enter your full name" 
                  size="large"
                  className="h-12"
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
                  placeholder="Enter your email" 
                  size="large"
                  className="h-12"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                rules={[{ pattern: /^[0-9+\-() ]+$/, message: 'Please enter a valid phone number!' }]}
              >
                <Input 
                  prefix={<PhoneOutlined className="text-gray-400" />} 
                  placeholder="Phone number (optional)" 
                  size="large"
                  className="h-12"
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
                  placeholder="Create a password" 
                  size="large"
                  className="h-12"
                  iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
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
                  placeholder="Confirm your password" 
                  size="large"
                  className="h-12"
                  iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <div className="mb-6">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-600 text-sm">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-700">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 text-lg font-semibold"
                  size="large"
                  loading={loading}
                >
                  Create Account
                </Button>
              </Form.Item>

              <div className="text-center">
                <Text className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Sign in
                  </Link>
                </Text>
              </div>
            </Form>
          </Card>

          {/* Footer Links */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <div className="space-x-4">
              <Link to="/terms" className="hover:text-gray-700">Terms of Service</Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
              <span>•</span>
              <Link to="/help" className="hover:text-gray-700">Help Center</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;