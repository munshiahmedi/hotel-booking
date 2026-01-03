// client/src/pages/Login/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message, Typography, Card } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  EyeInvisibleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useAuth } from '../../utils/AuthContext';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      console.log('Attempting login with:', values.email);
      
      const response = await login(values);
      console.log('Login response:', response);
      
      message.success('Login successful!');
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Login error:', error);
      message.error(error.message || 'Login failed. Please try again.');
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
            <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
            <p className="text-xl text-blue-100 mb-8">
              Sign in to access your personalized travel experience and continue your journey with us.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <UserOutlined className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold">Personalized Experience</h3>
                <p className="text-blue-100 text-sm">Get tailored recommendations based on your preferences</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <LockOutlined className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Booking</h3>
                <p className="text-blue-100 text-sm">Your information is always protected with industry-leading security</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MailOutlined className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold">24/7 Support</h3>
                <p className="text-blue-100 text-sm">Get help whenever you need it from our dedicated team</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white bg-opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-white bg-opacity-10 rounded-full blur-xl"></div>
      </div>

      {/* Right Side - Login Form */}
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
            <Title level={2} className="text-gray-900">Welcome Back</Title>
            <Text className="text-gray-600">Sign in to your account</Text>
          </div>

          <Card className="shadow-xl border-0">
            <div className="hidden lg:block text-center mb-8">
              <Title level={2} className="text-gray-900 mb-2">Welcome Back</Title>
              <Text className="text-gray-600">Sign in to continue your journey</Text>
            </div>
            
            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              className="mt-6"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
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
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined className="text-gray-400" />} 
                  placeholder="Enter your password" 
                  size="large"
                  className="h-12"
                  iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <div className="flex justify-between items-center mb-6">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-600">Remember me</span>
                </Form.Item>
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 text-lg font-semibold"
                  size="large"
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center mt-6">
              <Text className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Sign up
                </Link>
              </Text>
            </div>
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

export default LoginPage;