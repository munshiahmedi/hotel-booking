// client/src/pages/Login/LoginPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message, Typography, Card, Divider } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  GoogleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useAuth } from '../../utils/AuthContext';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formErrors, setFormErrors] = useState<{email?: string; password?: string}>({});
  const navigate = useNavigate();
  const { login } = useAuth();
  const emailInputRef = useRef<any>(null);
  const passwordInputRef = useRef<any>(null);
  const [form] = Form.useForm();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleFieldChange = (field: string, value: string) => {
    // Clear previous errors for this field
    setFormErrors(prev => ({ ...prev, [field]: undefined }));
    
    // Real-time validation
    if (field === 'email' && value) {
      if (!validateEmail(value)) {
        setFormErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      }
    }
  };

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      setFormErrors({});
      
      // Final validation
      const errors: {email?: string; password?: string} = {};
      
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!validateEmail(values.email)) {
        errors.email = 'Please enter a valid email address';
      }
      
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      
      console.log('Attempting login with:', values.email);
      
      const response = await login(values);
      console.log('Login response:', response);
      
      message.success('Login successful!');
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error messages
      if (error.message?.includes('Invalid credentials') || error.message?.includes('wrong password')) {
        setFormErrors({ password: 'Invalid email or password' });
      } else if (error.message?.includes('user not found')) {
        setFormErrors({ email: 'No account found with this email' });
      } else {
        message.error(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // For production, you'll need to set up Google OAuth 2.0
      // This is a basic implementation that redirects to Google OAuth
      const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      
      if (!googleClientId) {
        message.warning('Google OAuth is not configured. Please add REACT_APP_GOOGLE_CLIENT_ID to your environment variables.');
        return;
      }
      
      // Construct Google OAuth URL
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${googleClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=email%20profile&` +
        `access_type=offline`;
      
      // Redirect to Google for authentication
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Google login error:', error);
      message.error('Failed to initiate Google login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        form.submit();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [form]);

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
            <h1 className="text-4xl font-bold mb-4">Sign In to Your Account</h1>
            <p className="text-xl text-blue-100 mb-8">
              Access your personalized travel experience and continue your journey with us.
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
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              className="mt-6"
              autoComplete="off"
            >
              <Form.Item
                name="email"
                label={<span className="text-gray-700 font-medium">Email Address</span>}
                validateStatus={formErrors.email ? 'error' : ''}
                help={formErrors.email}
              >
                <Input 
                  ref={emailInputRef}
                  prefix={<MailOutlined className="text-gray-400" />} 
                  placeholder="Enter your email address" 
                  size="large" 
                  className="h-12"
                  aria-label="Email address"
                  aria-describedby={formErrors.email ? 'email-error' : undefined}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={(e) => handleFieldChange('email', e.target.value)}
                  autoComplete="email"
                />
                {formErrors.email && (
                  <div id="email-error" className="text-red-500 text-sm mt-1" role="alert">
                    {formErrors.email}
                  </div>
                )}
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="text-gray-700 font-medium">Password</span>}
                validateStatus={formErrors.password ? 'error' : ''}
                help={formErrors.password}
              >
                <Input.Password 
                  ref={passwordInputRef}
                  prefix={<LockOutlined className="text-gray-400" />} 
                  placeholder="Enter your password" 
                  size="large"
                  className="h-12"
                  iconRender={(visible) => (
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!visible)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-blue-600"
                      aria-label={visible ? 'Hide password' : 'Show password'}
                    >
                      {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </button>
                  )}
                  aria-label="Password"
                  aria-describedby={formErrors.password ? 'password-error' : undefined}
                  onChange={() => handleFieldChange('password', '')}
                  autoComplete="current-password"
                />
                {formErrors.password && (
                  <div id="password-error" className="text-red-500 text-sm mt-1" role="alert">
                    {formErrors.password}
                  </div>
                )}
              </Form.Item>

              <div className="flex justify-between items-center mb-6">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                  />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  size="large"
                  icon={loading ? <LoadingOutlined /> : undefined}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Form.Item>
            </Form>

            {/* Social Login Divider */}
            <Divider className="my-6">
              <span className="text-gray-500 text-sm">Or continue with</span>
            </Divider>

            {/* Google Login Button */}
            <Button
              onClick={handleGoogleLogin}
              className="w-full h-11 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              size="large"
              icon={<GoogleOutlined className="text-red-500" />}
            >
              <span className="text-gray-700 font-medium">Continue with Google</span>
            </Button>

            <div className="text-center mt-6">
              <Text className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Sign up
                </Link>
              </Text>
            </div>
          </Card>

          {/* Footer Links - Simplified */}
          <div className="text-center mt-6 text-gray-400 text-xs">
            <div className="space-x-3">
              <Link to="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
              <span>•</span>
              <Link to="/help" className="hover:text-gray-600 transition-colors">Help</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;