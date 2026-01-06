import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Checkbox, message } from 'antd';
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
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Basic Information Section */}
          <div className="bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-2">Basic Information</h2>
            <p className="text-sm text-gray-400 mb-6">Essential details about your hotel</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Hotel Name <span className="text-red-400">*</span>
                </label>
                <Input
                  size="large"
                  status={errors.name ? 'error' : ''}
                  {...register('name', { required: 'Hotel name is required' })}
                  placeholder="Enter hotel name"
                  className="rounded-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Slug <span className="text-red-400">*</span>
                </label>
                <Input
                  size="large"
                  status={errors.slug ? 'error' : ''}
                  {...register('slug', { required: 'Slug is required' })}
                  placeholder="hotel-name-url-friendly"
                  className="rounded-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                {errors.slug && (
                  <p className="text-red-400 text-sm mt-1">{errors.slug.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <TextArea
                  rows={4}
                  status={errors.description ? 'error' : ''}
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Describe your hotel, amenities, and what makes it special..."
                  className="rounded-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Star Rating <span className="text-red-400">*</span>
                </label>
                <Select
                  size="large"
                  className="w-full rounded-lg"
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
                  <p className="text-red-400 text-sm mt-1">Star rating is required</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-2">Address</h2>
            <p className="text-sm text-gray-400 mb-6">Hotel location details</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Street Address <span className="text-red-400">*</span>
                </label>
                <Input
                  size="large"
                  placeholder="Street Address"
                  status={errors.address?.line1 ? 'error' : ''}
                  {...register('address.line1', { required: 'Street address is required' })}
                  className="rounded-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                {errors.address?.line1 && (
                  <p className="text-red-400 text-sm mt-1">{errors.address.line1.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  City <span className="text-red-400">*</span>
                </label>
                <Input
                  size="large"
                  placeholder="City"
                  status={errors.address?.city ? 'error' : ''}
                  {...register('address.city', { required: 'City is required' })}
                  className="rounded-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                {errors.address?.city && (
                  <p className="text-red-400 text-sm mt-1">{errors.address.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  State/Province
                </label>
                <Input
                  size="large"
                  placeholder="State/Province"
                  status={errors.address?.state ? 'error' : ''}
                  {...register('address.state')}
                  className="rounded-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                {errors.address?.state && (
                  <p className="text-red-400 text-sm mt-1">{errors.address.state.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Country <span className="text-red-400">*</span>
                </label>
                <Input
                  size="large"
                  placeholder="Country"
                  status={errors.address?.country ? 'error' : ''}
                  {...register('address.country', { required: 'Country is required' })}
                  className="rounded-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                {errors.address?.country && (
                  <p className="text-red-400 text-sm mt-1">{errors.address.country.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Zip Code
                </label>
                <Input
                  size="large"
                  placeholder="Zip Code"
                  status={errors.address?.zipcode ? 'error' : ''}
                  {...register('address.zipcode')}
                  className="rounded-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                {errors.address?.zipcode && (
                  <p className="text-red-400 text-sm mt-1">{errors.address.zipcode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Policies Section */}
          <div className="bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-2">Policies</h2>
            <p className="text-sm text-gray-400 mb-6">Check-in/out times and cancellation policy</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Check-in Time <span className="text-red-400">*</span>
                  </label>
                  <Input
                    size="large"
                    placeholder="14:00"
                    status={errors.policy?.checkin_time ? 'error' : ''}
                    {...register('policy.checkin_time', { required: 'Check-in time is required' })}
                    className="rounded-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    suffix={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  />
                  {errors.policy?.checkin_time && (
                    <p className="text-red-400 text-sm mt-1">{errors.policy.checkin_time.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Check-out Time <span className="text-red-400">*</span>
                  </label>
                  <Input
                    size="large"
                    placeholder="11:00"
                    status={errors.policy?.checkout_time ? 'error' : ''}
                    {...register('policy.checkout_time', { required: 'Check-out time is required' })}
                    className="rounded-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    suffix={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  />
                  {errors.policy?.checkout_time && (
                    <p className="text-red-400 text-sm mt-1">{errors.policy.checkout_time.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cancellation Policy <span className="text-red-400">*</span>
                </label>
                <TextArea
                  rows={4}
                  placeholder="Enter your cancellation policy details..."
                  status={errors.policy?.cancellation_policy ? 'error' : ''}
                  {...register('policy.cancellation_policy', { required: 'Cancellation policy is required' })}
                  className="rounded-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                {errors.policy?.cancellation_policy && (
                  <p className="text-red-400 text-sm mt-1">{errors.policy.cancellation_policy.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Facilities & Amenities Section */}
          <div className="bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-2">Facilities & Amenities</h2>
            <p className="text-sm text-gray-400 mb-6">Select the facilities available at your hotel</p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="space-y-3">
                {facilities.slice(0, 3).map((facility) => (
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
                    className="text-gray-300"
                  >
                    <span className="text-gray-300">{facility}</span>
                  </Checkbox>
                ))}
              </div>
              
              <div className="space-y-3">
                {facilities.slice(3, 6).map((facility) => (
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
                    className="text-gray-300"
                  >
                    <span className="text-gray-300">{facility}</span>
                  </Checkbox>
                ))}
              </div>
              
              <div className="space-y-3">
                {facilities.slice(6).map((facility) => (
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
                    className="text-gray-300"
                  >
                    <span className="text-gray-300">{facility}</span>
                  </Checkbox>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              size="large"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
              className="bg-gray-600 text-gray-200 border-gray-600 hover:bg-gray-500 rounded-lg px-8"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 rounded-lg px-8"
            >
              {loading ? 'Creating...' : 'Create Hotel'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHotelUI;