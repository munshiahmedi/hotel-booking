// src/pages/Register/RegisterPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Divider, Progress } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  PhoneOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  SafetyOutlined,
  HomeOutlined,
  GlobalOutlined,
  GoogleOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { authApi } from '../../services/api';
import { useAuth } from '../../utils/AuthContext';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
    terms?: string;
  }>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();
  const emailInputRef = useRef<any>(null);
  const passwordInputRef = useRef<any>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 25) return '#ff4d4f';
    if (strength < 50) return '#faad14';
    if (strength < 75) return '#1890ff';
    return '#52c41a';
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
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
    
    if (field === 'password' && value) {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
      
      if (value.length < 8) {
        setFormErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
      }
    }
    
    if (field === 'confirmPassword' && value) {
      const password = form.getFieldValue('password');
      if (password && value !== password) {
        setFormErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      }
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      
      const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      
      if (!googleClientId) {
        message.warning('Google OAuth is not configured. Please add REACT_APP_GOOGLE_CLIENT_ID to your environment variables.');
        return;
      }
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${googleClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=email%20profile&` +
        `access_type=offline`;
      
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Google signup error:', error);
      message.error('Failed to initiate Google signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: { 
    name: string; 
    email: string; 
    password: string; 
    confirmPassword: string;
    phone?: string;
  }) => {
    try {
      setLoading(true);
      setFormErrors({});
      
      // Final validation
      const errors: typeof formErrors = {};
      
      if (!values.name || values.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      }
      
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!validateEmail(values.email)) {
        errors.email = 'Please enter a valid email address';
      }
      
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (calculatePasswordStrength(values.password) < 50) {
        errors.password = 'Password is too weak. Add uppercase letters and numbers.';
      }
      
      if (!values.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      if (values.phone && !/^[0-9+\-() ]+$/.test(values.phone)) {
        errors.phone = 'Please enter a valid phone number';
      }
      
      if (!termsAccepted) {
        errors.terms = 'You must accept the terms and conditions';
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      
      const { confirmPassword, ...userData } = values;
      
      // Register the user and get token
      await authApi.register(userData);
      
      // Automatically log in the user using AuthContext
      await login(userData);
      
      message.success('Registration successful! Welcome to your dashboard!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response?.data?.error?.includes('Email already exists')) {
        setFormErrors({ email: 'An account with this email already exists' });
      } else {
        message.error(error.response?.data?.error || 'Registration failed. Please try again.');
      }
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
                label={<span className="text-gray-700 font-medium">Full Name</span>}
                validateStatus={formErrors.name ? 'error' : ''}
                help={formErrors.name}
              >
                <Input 
                  ref={emailInputRef}
                  prefix={<UserOutlined className="text-gray-400" />} 
                  placeholder="Enter your full name" 
                  size="large"
                  className="h-12"
                  aria-label="Full name"
                  aria-describedby={formErrors.name ? 'name-error' : undefined}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={(e) => handleFieldChange('name', e.target.value)}
                  autoComplete="name"
                />
                {formErrors.name && (
                  <div id="name-error" className="text-red-500 text-sm mt-1" role="alert">
                    {formErrors.name}
                  </div>
                )}
              </Form.Item>

              <Form.Item
                name="email"
                label={<span className="text-gray-700 font-medium">Email Address</span>}
                validateStatus={formErrors.email ? 'error' : ''}
                help={formErrors.email}
              >
                <Input 
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
                name="phone"
                label={<span className="text-gray-700 font-medium">Phone Number (Optional)</span>}
                validateStatus={formErrors.phone ? 'error' : ''}
                help={formErrors.phone}
              >
                <Input 
                  prefix={<PhoneOutlined className="text-gray-400" />} 
                  placeholder="Enter your phone number" 
                  size="large"
                  className="h-12"
                  aria-label="Phone number"
                  aria-describedby={formErrors.phone ? 'phone-error' : undefined}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  onBlur={(e) => handleFieldChange('phone', e.target.value)}
                  autoComplete="tel"
                />
                {formErrors.phone && (
                  <div id="phone-error" className="text-red-500 text-sm mt-1" role="alert">
                    {formErrors.phone}
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
                  placeholder="Create a strong password" 
                  size="large"
                  className="h-12"
                  iconRender={(visible) => (
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-blue-600"
                      aria-label={visible ? 'Hide password' : 'Show password'}
                    >
                      {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </button>
                  )}
                  aria-label="Password"
                  aria-describedby={formErrors.password ? 'password-error' : undefined}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={(e) => handleFieldChange('password', e.target.value)}
                  autoComplete="new-password"
                />
                {formErrors.password && (
                  <div id="password-error" className="text-red-500 text-sm mt-1" role="alert">
                    {formErrors.password}
                  </div>
                )}
                
                {/* Password Requirements */}
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">Password requirements:</p>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      {form.getFieldValue('password')?.length >= 8 ? 
                        <CheckCircleOutlined className="text-green-500 mr-1" /> : 
                        <CloseCircleOutlined className="text-gray-400 mr-1" />
                      }
                      <span className={form.getFieldValue('password')?.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {/[A-Z]/.test(form.getFieldValue('password') || '') ? 
                        <CheckCircleOutlined className="text-green-500 mr-1" /> : 
                        <CloseCircleOutlined className="text-gray-400 mr-1" />
                      }
                      <span className={/[A-Z]/.test(form.getFieldValue('password') || '') ? 'text-green-600' : 'text-gray-500'}>
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {/[0-9]/.test(form.getFieldValue('password') || '') ? 
                        <CheckCircleOutlined className="text-green-500 mr-1" /> : 
                        <CloseCircleOutlined className="text-gray-400 mr-1" />
                      }
                      <span className={/[0-9]/.test(form.getFieldValue('password') || '') ? 'text-green-600' : 'text-gray-500'}>
                        One number
                      </span>
                    </div>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {form.getFieldValue('password') && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Password strength:</span>
                        <span 
                          className="text-xs font-medium" 
                          style={{ color: getPasswordStrengthColor(passwordStrength) }}
                        >
                          {getPasswordStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <Progress 
                        percent={passwordStrength} 
                        showInfo={false}
                        strokeColor={getPasswordStrengthColor(passwordStrength)}
                        size="small"
                      />
                    </div>
                  )}
                </div>
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={<span className="text-gray-700 font-medium">Confirm Password</span>}
                validateStatus={formErrors.confirmPassword ? 'error' : ''}
                help={formErrors.confirmPassword}
              >
                <Input.Password 
                  prefix={<LockOutlined className="text-gray-400" />} 
                  placeholder="Confirm your password" 
                  size="large"
                  className="h-12"
                  iconRender={(visible) => (
                    <button
                      type="button"
                      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-blue-600"
                      aria-label={visible ? 'Hide password' : 'Show password'}
                    >
                      {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </button>
                  )}
                  aria-label="Confirm password"
                  aria-describedby={formErrors.confirmPassword ? 'confirm-password-error' : undefined}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  onBlur={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                />
                {formErrors.confirmPassword && (
                  <div id="confirm-password-error" className="text-red-500 text-sm mt-1" role="alert">
                    {formErrors.confirmPassword}
                  </div>
                )}
              </Form.Item>

              <div className="mb-6">
                <label className="flex items-start cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mr-2 mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      setFormErrors(prev => ({ ...prev, terms: undefined }));
                    }}
                  />
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
                {formErrors.terms && (
                  <div className="text-red-500 text-sm mt-1" role="alert">
                    {formErrors.terms}
                  </div>
                )}
              </div>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  size="large"
                  loading={loading}
                  disabled={loading}
                  icon={loading ? <LoadingOutlined /> : undefined}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Form.Item>
              
              {/* Trust Micro-Copy */}
              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  <SafetyOutlined className="mr-1" />
                  We'll never share your data with anyone.
                </p>
              </div>

              {/* Social Signup Divider */}
              <Divider className="my-6">
                <span className="text-gray-500 text-sm">Or sign up with</span>
              </Divider>

              {/* Google Signup Button */}
              <Button
                onClick={handleGoogleSignup}
                className="w-full h-11 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                size="large"
                icon={<GoogleOutlined className="text-red-500" />}
              >
                <span className="text-gray-700 font-medium">Continue with Google</span>
              </Button>

              <div className="text-center mt-6">
                <Text className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                    Sign in
                  </Link>
                </Text>
              </div>
            </Form>
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

export default RegisterPage;