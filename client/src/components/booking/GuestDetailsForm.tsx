// src/components/booking/GuestDetailsForm.tsx
import React from 'react';
import { Card, Form, Input, Button, Typography, Divider } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { GuestDetails } from '../../services/booking.service';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface GuestDetailsFormProps {
  onSubmit: (guestDetails: GuestDetails) => void;
  loading?: boolean;
  initialValues?: Partial<GuestDetails>;
}

const GuestDetailsForm: React.FC<GuestDetailsFormProps> = ({
  onSubmit,
  loading = false,
  initialValues
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    const guestDetails: GuestDetails = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.replace(/\D/g, ''), // Keep only digits
      special_requests: values.special_requests?.trim() || undefined
    };
    onSubmit(guestDetails);
  };

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>Guest Details</span>
        </div>
      }
      className="mb-6"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
        requiredMark={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[
              { required: true, message: 'Please enter your first name' },
              { min: 2, message: 'First name must be at least 2 characters' },
              { max: 50, message: 'First name cannot exceed 50 characters' },
              { pattern: /^[a-zA-Z\s'-]+$/, message: 'First name can only contain letters, spaces, hyphens, and apostrophes' }
            ]}
          >
            <Input
              size="large"
              placeholder="John"
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[
              { required: true, message: 'Please enter your last name' },
              { min: 2, message: 'Last name must be at least 2 characters' },
              { max: 50, message: 'Last name cannot exceed 50 characters' },
              { pattern: /^[a-zA-Z\s'-]+$/, message: 'Last name can only contain letters, spaces, hyphens, and apostrophes' }
            ]}
          >
            <Input
              size="large"
              placeholder="Doe"
              prefix={<UserOutlined />}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: 'Please enter your email address' },
            { type: 'email', message: 'Please enter a valid email address' }
          ]}
        >
          <Input
            size="large"
            placeholder="john.doe@example.com"
            prefix={<MailOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { required: true, message: 'Please enter your phone number' },
            { 
              validator: (_, value) => {
                if (!value) return Promise.reject('Please enter your phone number');
                const digits = value.replace(/\D/g, '');
                if (digits.length < 10) {
                  return Promise.reject('Phone number must be at least 10 digits');
                }
                if (digits.length > 15) {
                  return Promise.reject('Phone number cannot exceed 15 digits');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input
            size="large"
            placeholder="(123) 456-7890"
            prefix={<PhoneOutlined />}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              form.setFieldsValue({ phone: formatted });
            }}
          />
        </Form.Item>

        <Form.Item
          name="special_requests"
          label="Special Requests (Optional)"
          rules={[
            { max: 500, message: 'Special requests cannot exceed 500 characters' }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Any special requests or preferences for your stay..."
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Divider />

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <Title level={5} className="mb-2 text-blue-800">
            Booking Information
          </Title>
          <Text type="secondary" className="text-sm">
            By submitting this form, you confirm that the information provided is accurate. 
            You will receive a confirmation email with your booking details.
          </Text>
        </div>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            block
          >
            Continue to Payment
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default GuestDetailsForm;
