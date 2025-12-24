import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Select, Checkbox, message, Card, Row, Col, Upload, Spin } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useAuth } from '../../utils/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

type EditHotelFormData = {
  name: string;
  city: string;
  country: string;
  description: string;
  type: string;
  pricePerNight: number;
  starRating: number;
  facilities: string[];
  imageUrls: string[];
};

interface EditHotelUIProps {}

const { TextArea } = Input;
const { Option } = Select;

const EditHotelUI: React.FC<EditHotelUIProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EditHotelFormData>({
    defaultValues: {
      facilities: [],
      imageUrls: [],
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

  useEffect(() => {
    const fetchHotelData = async () => {
      if (!id || !token) return;

      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/hotels/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const hotel = response.data;
        reset({
          name: hotel.name || '',
          city: hotel.address?.city || '',
          country: hotel.address?.country || '',
          description: hotel.description || '',
          type: hotel.type || '',
          pricePerNight: hotel.price_per_night || 0,
          starRating: hotel.star_rating || 1,
          facilities: hotel.facilities || [],
          imageUrls: hotel.images || [],
        });
      } catch (error) {
        console.error('Error fetching hotel data:', error);
        message.error('Failed to load hotel data');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [id, token, navigate, reset]);

  const onSubmit = async (data: EditHotelFormData) => {
    if (!id || !token) return;

    try {
      setSaving(true);
      await axios.put(`${API_BASE_URL}/hotels/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Hotel updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating hotel:', error);
      message.error('Failed to update hotel. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (info: any) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-5); // Limit to 5 images
    setFileList(fileList);
    setValue(
      'imageUrls',
      fileList.map((file) => file.response?.url || '')
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
      
      <Card title="Edit Hotel" className="max-w-4xl mx-auto">
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

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input
                    size="large"
                    status={errors.city ? 'error' : ''}
                    {...register('city', { required: 'City is required' })}
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <Input
                    size="large"
                    status={errors.country ? 'error' : ''}
                    {...register('country', { required: 'Country is required' })}
                    placeholder="Country"
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                  )}
                </div>
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
            </Col>

            <Col xs={24} md={12}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    size="large"
                    status={errors.type ? 'error' : ''}
                    className="w-full"
                    placeholder="Select type"
                    {...register('type', { required: 'Type is required' })}
                    onChange={(value) => setValue('type', value)}
                  >
                    <Option value="Budget">Budget</Option>
                    <Option value="Boutique">Boutique</Option>
                    <Option value="Luxury">Luxury</Option>
                    <Option value="Resort">Resort</Option>
                    <Option value="Business">Business</Option>
                    <Option value="Family">Family</Option>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Star Rating <span className="text-red-500">*</span>
                  </label>
                  <Select
                    size="large"
                    className="w-full"
                    placeholder="Select rating"
                    status={errors.starRating ? 'error' : ''}
                    {...register('starRating', { required: 'Rating is required' })}
                    onChange={(value) => setValue('starRating', value)}
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Option key={num} value={num}>
                        {num} Star{num > 1 ? 's' : ''}
                      </Option>
                    ))}
                  </Select>
                  {errors.starRating && (
                    <p className="text-red-500 text-sm mt-1">{errors.starRating.message}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Per Night ($) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  size="large"
                  min={1}
                  status={errors.pricePerNight ? 'error' : ''}
                  {...register('pricePerNight', {
                    required: 'Price is required',
                    min: { value: 1, message: 'Price must be greater than 0' },
                  })}
                  placeholder="Enter price per night"
                />
                {errors.pricePerNight && (
                  <p className="text-red-500 text-sm mt-1">{errors.pricePerNight.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facilities
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {facilities.map((facility) => (
                    <Checkbox
                      key={facility}
                      value={facility}
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hotel Images <span className="text-red-500">*</span>
            </label>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleImageUpload}
              multiple
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Upload (Max: 5)</Button>
            </Upload>
            {errors.imageUrls && (
              <p className="text-red-500 text-sm mt-1">At least one image is required</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="default"
              size="large"
              onClick={() => navigate('/dashboard')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={saving}
            >
              {saving ? 'Updating...' : 'Update Hotel'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditHotelUI;
