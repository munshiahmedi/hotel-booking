// src/pages/ForgotPassword/ForgotPasswordPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  LoadingOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formErrors, setFormErrors] = useState<{email?: string}>({});
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const emailInputRef = useRef<any>(null);

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

  const onFinish = async (values: { email: string }) => {
    try {
      setLoading(true);
      setFormErrors({});
      
      // Final validation
      const errors: typeof formErrors = {};
      
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!validateEmail(values.email)) {
        errors.email = 'Please enter a valid email address';
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      
      console.log('Sending password reset to:', values.email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Always show success message (for security)
      setEmailSent(true);
      message.success('If this email exists, we\'ve sent a password reset link.');
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      message.error('Failed to send reset link. Please try again.');
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

  // Focus email input on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

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
            <h1 className="text-4xl font-bold mb-4">Forgot your password?</h1>
            <p className="text-xl text-blue-100 mb-8">
              No worries! We'll help you recover your account securely and quickly.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <SafetyOutlined className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Access</h3>
                <p className="text-blue-100 text-sm">Your account security is our top priority</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <ClockCircleOutlined className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold">Quick Recovery</h3>
                <p className="text-blue-100 text-sm">Get back into your account within minutes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <CustomerServiceOutlined className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold">24/7 Support</h3>
                <p className="text-blue-100 text-sm">Our team is always here to help you</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white bg-opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-white bg-opacity-10 rounded-full blur-xl"></div>
      </div>

      {/* Right Side - Forgot Password Form */}
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
            <Title level={2} className="text-gray-900">Forgot Password?</Title>
            <Text className="text-gray-600">We'll help you recover your account</Text>
          </div>

          <Card className="shadow-xl border-0">
            {!emailSent ? (
              <>
                <div className="hidden lg:block text-center mb-8">
                  <Title level={2} className="text-gray-900 mb-2">Forgot Password</Title>
                  <Text className="text-gray-600">Enter your email to receive a password reset link</Text>
                </div>
                
                <Form
                  form={form}
                  name="forgot-password"
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
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </Form.Item>
                </Form>

                <div className="text-center mt-6">
                  <Text className="text-gray-600">
                    Remember your password?{' '}
                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                      Back to Login
                    </Link>
                  </Text>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MailOutlined className="text-3xl text-green-600" />
                </div>
                <Title level={3} className="text-gray-900 mb-4">Check Your Email</Title>
                <Text className="text-gray-600 block mb-6">
                  If this email exists, we've sent a password reset link to your inbox.
                </Text>
                <Text className="text-gray-500 text-sm block mb-8">
                  Please check your spam folder if you don't see it in your inbox.
                </Text>
                
                <Button 
                  type="primary"
                  onClick={() => navigate('/login')}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  size="large"
                >
                  Go to Login
                </Button>
                
                <div className="mt-6">
                  <Button 
                    type="link"
                    onClick={() => {
                      setEmailSent(false);
                      form.resetFields();
                      setFormErrors({});
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Try another email
                  </Button>
                </div>
              </div>
            )}
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

export default ForgotPasswordPage;
