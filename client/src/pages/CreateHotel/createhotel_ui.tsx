import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Checkbox, message, Card, Row, Col } from 'antd';
import { useAuth } from '../../utils/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

type CreateHotelFormData = {
  name: string;
  slug: string;
  description: string;
  address: {
    line1: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
  };
  policy: {
    checkin_time: string;
    checkout_time: string;
    cancellation_policy: string;
  };
  facilities: string[];
};

const { TextArea } = Input;
const { Option } = Select;

const CreateHotelUI: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [starRating, setStarRating] = useState<number | undefined>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateHotelFormData>({
    defaultValues: {
      facilities: [],
      address: {
        line1: '',
        city: '',
        state: '',
        country: '',
        zipcode: ''
      },
      policy: {
        checkin_time: '14:00',
        checkout_time: '11:00',
        cancellation_policy: 'Free cancellation up to 24 hours before check-in'
      }
    },
  });

  const facilities = [
    'Free WiFi',
    'Parking',
    'Airport Shuttle',
    'Family Rooms',
    'Non-Smoking Rooms',
    'Outdoor Pool',
    'Spa',
    'Fitness Center',
  ];

  const onSubmit = async (data: CreateHotelFormData) => {
    if (!token) return;

    // Ensure starRating is set
    if (!starRating) {
      message.error('Please select a star rating');
      return;
    }

    try {
      setLoading(true);
      const finalData = { ...data, starRating };
      await axios.post(`${API_BASE_URL}/hotels`, finalData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Hotel created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating hotel:', error);
      message.error('Failed to create hotel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card title="Create New Hotel" className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hotel Name <span className="text-red-500">*</span>
                </label>
                <Input
                  size="large"
                  status={errors.name ? 'error' : ''}
                  {...register('name', { required: 'Hotel name is required' })}
                  placeholder="Enter hotel name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <Input
                  size="large"
                  status={errors.slug ? 'error' : ''}
                  {...register('slug', { required: 'Slug is required' })}
                  placeholder="hotel-name-url-friendly"
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <TextArea
                  rows={4}
                  status={errors.description ? 'error' : ''}
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Describe your hotel..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Star Rating <span className="text-red-500">*</span>
                </label>
                <Select
                  size="large"
                  className="w-full"
                  placeholder="Select rating"
                  value={starRating}
                  onChange={(value) => {
                    setStarRating(value);
                  }}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Option key={num} value={num}>
                      {num} Star{num > 1 ? 's' : ''}
                    </Option>
                  ))}
                </Select>
                {!starRating && (
                  <p className="text-red-500 text-sm mt-1">Star rating is required</p>
                )}
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <Input
                    size="large"
                    placeholder="Street Address"
                    status={errors.address?.line1 ? 'error' : ''}
                    {...register('address.line1', { required: 'Street address is required' })}
                  />
                  {errors.address?.line1 && (
                    <p className="text-red-500 text-sm">{errors.address.line1.message}</p>
                  )}
                  <Input
                    size="large"
                    placeholder="City"
                    status={errors.address?.city ? 'error' : ''}
                    {...register('address.city', { required: 'City is required' })}
                  />
                  {errors.address?.city && (
                    <p className="text-red-500 text-sm">{errors.address.city.message}</p>
                  )}
                  <Input
                    size="large"
                    placeholder="State"
                    status={errors.address?.state ? 'error' : ''}
                    {...register('address.state', { required: 'State is required' })}
                  />
                  {errors.address?.state && (
                    <p className="text-red-500 text-sm">{errors.address.state.message}</p>
                  )}
                  <Input
                    size="large"
                    placeholder="Country"
                    status={errors.address?.country ? 'error' : ''}
                    {...register('address.country', { required: 'Country is required' })}
                  />
                  {errors.address?.country && (
                    <p className="text-red-500 text-sm">{errors.address.country.message}</p>
                  )}
                  <Input
                    size="large"
                    placeholder="Zip Code"
                    status={errors.address?.zipcode ? 'error' : ''}
                    {...register('address.zipcode', { required: 'Zip code is required' })}
                  />
                  {errors.address?.zipcode && (
                    <p className="text-red-500 text-sm">{errors.address.zipcode.message}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Policy <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-600">Check-in Time</label>
                    <Input
                      size="large"
                      placeholder="14:00"
                      status={errors.policy?.checkin_time ? 'error' : ''}
                      {...register('policy.checkin_time', { required: 'Check-in time is required' })}
                    />
                    {errors.policy?.checkin_time && (
                      <p className="text-red-500 text-sm">{errors.policy.checkin_time.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Check-out Time</label>
                    <Input
                      size="large"
                      placeholder="11:00"
                      status={errors.policy?.checkout_time ? 'error' : ''}
                      {...register('policy.checkout_time', { required: 'Check-out time is required' })}
                    />
                    {errors.policy?.checkout_time && (
                      <p className="text-red-500 text-sm">{errors.policy.checkout_time.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Cancellation Policy</label>
                    <TextArea
                      rows={2}
                      placeholder="Free cancellation up to 24 hours before check-in"
                      status={errors.policy?.cancellation_policy ? 'error' : ''}
                      {...register('policy.cancellation_policy', { required: 'Cancellation policy is required' })}
                    />
                    {errors.policy?.cancellation_policy && (
                      <p className="text-red-500 text-sm">{errors.policy.cancellation_policy.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facilities
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {facilities.map((facility) => (
                    <Checkbox
                      key={facility}
                      checked={(watch('facilities') || []).includes(facility)}
                      onChange={(e) => {
                        const currentFacilities = watch('facilities') || [];
                        if (e.target.checked) {
                          setValue('facilities', [...currentFacilities, facility]);
                        } else {
                          setValue(
                            'facilities',
                            currentFacilities.filter((f) => f !== facility)
                          );
                        }
                      }}
                    >
                      {facility}
                    </Checkbox>
                  ))}
                </div>
              </div>
            </Col>
          </Row>

          <div className="flex justify-end space-x-4">
            <Button
              type="default"
              size="large"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
            >
              {loading ? 'Creating...' : 'Create Hotel'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateHotelUI;