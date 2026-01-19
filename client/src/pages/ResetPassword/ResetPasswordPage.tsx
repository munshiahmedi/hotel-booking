// src/pages/ResetPassword/ResetPasswordPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Progress } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  EyeInvisibleOutlined,
  EyeOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const ResetPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const passwordInputRef = useRef<any>(null);

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

  const isFormValid = (): boolean => {
    const password = form.getFieldValue('password');
    const confirmPassword = form.getFieldValue('confirmPassword');
    
    return (
      password && 
      password.length >= 8 && 
      /[A-Z]/.test(password) && 
      /[0-9]/.test(password) &&
      confirmPassword === password &&
      calculatePasswordStrength(password) >= 50
    );
  };

  const onFinish = async (values: { password: string; confirmPassword: string }) => {
    try {
      setLoading(true);
      setFormErrors({});
      
      // Final validation
      const errors: typeof formErrors = {};
      
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
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      
      console.log('Resetting password...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResetSuccess(true);
      message.success('Password reset successfully!');
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      message.error('Failed to reset password. Please try again.');
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

  // Focus password input on mount
  useEffect(() => {
    passwordInputRef.current?.focus();
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
            <h1 className="text-4xl font-bold mb-4">Reset Your Password</h1>
            <p className="text-xl text-blue-100 mb-8">
              Create a strong new password to secure your account and continue your journey with us.
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

      {/* Right Side - Reset Password Form */}
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
            <Title level={2} className="text-gray-900">Reset Password</Title>
            <Text className="text-gray-600">Create your new password</Text>
          </div>

          <Card className="shadow-xl border-0">
            {!resetSuccess ? (
              <>
                <div className="hidden lg:block text-center mb-8">
                  <Title level={2} className="text-gray-900 mb-2">Reset Password</Title>
                  <Text className="text-gray-600">Create a strong new password for your account</Text>
                </div>
                
                <Form
                  form={form}
                  name="reset-password"
                  onFinish={onFinish}
                  layout="vertical"
                  className="mt-6"
                  autoComplete="off"
                >
                  <Form.Item
                    name="password"
                    label={<span className="text-gray-700 font-medium">New Password</span>}
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
                      aria-label="New password"
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
                      placeholder="Confirm your new password" 
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

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      disabled={loading || !isFormValid()}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      size="large"
                      icon={loading ? <LoadingOutlined /> : undefined}
                    >
                      {loading ? 'Resetting...' : 'Reset Password'}
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
                  <CheckCircleOutlined className="text-3xl text-green-600" />
                </div>
                <Title level={3} className="text-gray-900 mb-4">Password Reset Successful!</Title>
                <Text className="text-gray-600 block mb-8">
                  Your password has been successfully reset. You can now log in with your new password.
                </Text>
                
                <Button 
                  type="primary"
                  onClick={() => navigate('/login')}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  size="large"
                >
                  Go to Login
                </Button>
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

export default ResetPasswordPage;
