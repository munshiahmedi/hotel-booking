// src/pages/MyAddresses/MyAddressesPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Modal, Form, Input, message, Tag } from 'antd';
import { 
  EnvironmentOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { userApi } from '../../services/api';

const { Title } = Typography;

interface Address {
  id: number;
  user_id: number;
  country_id: number;
  state_id: number;
  city_id: number;
  line1: string;
  zipcode: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  country?: {
    id: number;
    name: string;
    code: string;
  };
  state?: {
    id: number;
    name: string;
    country_id: number;
  };
  city?: {
    id: number;
    name: string;
    state_id: number;
  };
}

const MyAddressesPage: React.FC = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    console.log('Modal visibility changed:', isModalVisible);
  }, [isModalVisible]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      
      // Debug: Check if token exists
      const token = localStorage.getItem('token');
      console.log('Token in localStorage:', token ? 'exists' : 'missing');
      console.log('Token value:', token);
      
      const response = await userApi.getAddresses();
      console.log('Addresses API Response:', response.data);
      
      // Handle backend response structure: { addresses: [...], pagination: {...} }
      if (response.data && Array.isArray(response.data.addresses)) {
        setAddresses(response.data.addresses);
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback if response is directly an array
        setAddresses(response.data);
      } else {
        setAddresses([]);
      }
    } catch (error: any) {
      console.error('Error fetching addresses:', error);
      if (error.response?.status === 401) {
        message.error('Please login to view addresses');
      } else if (error.response?.status === 404) {
        message.info('No addresses found. Add your first address below!');
        setAddresses([]);
      } else if (error.response?.status === 500) {
        message.error('Server error. Please try again later.');
      } else {
        message.error('Failed to fetch addresses. Please try again.');
      }
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      console.log('Form values being submitted:', values);
      
      // Transform form data to match backend API requirements
      const transformedValues = {
        line1: values.line1,
        zipcode: values.zipcode,
        // For now, use dummy IDs since we don't have country/state/city selection
        country_id: 1,
        state_id: 1,
        city_id: 1,
      };
      
      console.log('Transformed values for API:', transformedValues);
      
      if (editingAddress) {
        console.log('Updating address ID:', editingAddress.id);
        await userApi.updateAddress(String(editingAddress.id), transformedValues);
        message.success('Address updated successfully!');
      } else {
        console.log('Creating new address with values:', transformedValues);
        const response = await userApi.addAddress(transformedValues);
        console.log('Add address API response:', response);
        message.success('Address added successfully!');
      }
      form.resetFields();
      setIsModalVisible(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      message.error(`Failed to ${editingAddress ? 'update' : 'add'} address. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await userApi.deleteAddress(id.toString());
      message.success('Address deleted successfully!');
      fetchAddresses();
    } catch (error) {
      message.error('Failed to delete address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      setLoading(true);
      await userApi.setDefaultAddress(id.toString());
      message.success('Default address updated successfully!');
      fetchAddresses();
    } catch (error) {
      message.error('Failed to update default address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    console.log('showAddModal called');
    setEditingAddress(null);
    form.resetFields();
    setIsModalVisible(true);
    console.log('isModalVisible set to true');
  };

  const showEditModal = (address: Address) => {
    setEditingAddress(address);
    form.setFieldsValue(address);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingAddress(null);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            type="default" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/dashboard')}
          >
            Back
          </Button>
          <Title level={2} className="mb-0">My Addresses</Title>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showAddModal}
        >
          Add Address
        </Button>
      </div>

      <Card loading={loading}>
        <div className="space-y-4">
          {Array.isArray(addresses) && addresses.length > 0 ? (
            addresses.map((address) => (
              <div key={address.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <EnvironmentOutlined className="text-2xl mr-3" />
                      <div className="flex items-center">
                        <span className="font-medium">{address.line1}</span>
                        {address.is_default && (
                          <Tag color="blue" className="ml-2">Default</Tag>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-600 ml-8">
                      {address.city?.name || ''}, {address.state?.name || ''}, {address.country?.name || ''}, {address.zipcode || ''}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="link" 
                      icon={<EditOutlined />} 
                      onClick={() => showEditModal(address)}
                    >
                      Edit
                    </Button>
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleDelete(address.id)}
                    >
                      Delete
                    </Button>
                    {!address.is_default && (
                      <Button 
                        type="link" 
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No addresses found. Click "Add Address" to create your first address.
            </div>
          )}
        </div>
      </Card>

      <Modal
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading} 
            onClick={() => form.submit()}
          >
            {editingAddress ? 'Update' : 'Add'} Address
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            line1: '',
            city: '',
            state: '',
            country: '',
            zipcode: '',
          }}
        >
          <Form.Item
            name="line1"
            label="Street Address"
            rules={[{ required: true, message: 'Please input your street address!' }]}
          >
            <Input placeholder="123 Main St" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: 'Please input your city!' }]}
            >
              <Input placeholder="New York" />
            </Form.Item>

            <Form.Item
              name="state"
              label="State/Province"
              rules={[{ required: true, message: 'Please input your state/province!' }]}
            >
              <Input placeholder="NY" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="country"
              label="Country"
              rules={[{ required: true, message: 'Please input your country!' }]}
            >
              <Input placeholder="United States" />
            </Form.Item>

            <Form.Item
              name="zipcode"
              label="Postal Code"
              rules={[{ required: true, message: 'Please input your postal code!' }]}
            >
              <Input placeholder="10001" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MyAddressesPage;