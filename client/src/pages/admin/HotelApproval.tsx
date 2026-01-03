// src/pages/admin/HotelApproval.tsx
import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminService';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Spin,
  Typography,
  Modal,
  Descriptions
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  HomeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Hotel {
  id: string;
  name: string;
  owner: string;
  email: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  description: string;
  amenities: string[];
}

const HotelApproval: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    fetchPendingHotels();
  }, []);

  const fetchPendingHotels = async () => {
    try {
      setLoading(true);
      
      // First try the real API
      const response = await adminApi.getAllHotelsForApproval({ status: 'pending' });
      
      // Handle different API response structures
      let hotelsData = [];
      if (response.data?.hotels) {
        hotelsData = response.data.hotels;
      } else if (response.data?.data?.hotels) {
        hotelsData = response.data.data.hotels;
      } else if (Array.isArray(response.data)) {
        hotelsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        hotelsData = response.data.data;
      }
      
      // Transform API response to match our interface
      const transformedHotels = hotelsData.map((hotel: any) => ({
        id: hotel.id?.toString() || 'N/A',
        name: hotel.name || 'Unknown Hotel',
        owner: hotel.owner?.name || hotel.owner_name || 'Unknown',
        email: hotel.owner?.email || hotel.owner_email || 'unknown@example.com',
        address: hotel.address || hotel.full_address || 'N/A',
        status: hotel.status || 'pending',
        submittedAt: hotel.created_at ? new Date(hotel.created_at).toLocaleDateString() : 'N/A',
        description: hotel.description || 'No description available',
        amenities: hotel.amenities || []
      }));
      
      setHotels(transformedHotels);
    } catch (error) {
      console.error('Error fetching pending hotels:', error);
      
      // Set empty array to prevent infinite loading
      setHotels([]);
      
      // Only show error message if it's not a network/backend issue
      if (error instanceof Error && 
          !error.message.includes('Network Error') && 
          !error.message.includes('ERR_CONNECTION_REFUSED') &&
          !error.message.includes('ERR_CONNECTION_REFUSED')) {
        // Prevent duplicate error messages
        if (!document.querySelector('.ant-message-error')) {
          message.error('Unable to connect to server. Please check if backend is running.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (hotelId: string) => {
    try {
      await adminApi.approveHotel(hotelId);
      message.success('Hotel approved successfully');
      fetchPendingHotels();
    } catch (error) {
      console.error('Error approving hotel:', error);
      message.error('Failed to approve hotel');
    }
  };

  const handleReject = async (hotelId: string) => {
    try {
      await adminApi.rejectHotel(hotelId);
      message.success('Hotel rejected successfully');
      fetchPendingHotels();
    } catch (error) {
      console.error('Error rejecting hotel:', error);
      message.error('Failed to reject hotel');
    }
  };

  const viewDetails = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Hotel Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <HomeOutlined />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'pending' ? 'orange' : status === 'approved' ? 'green' : 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      key: 'submittedAt'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Hotel) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => viewDetails(record)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                style={{ color: '#52c41a' }}
                onClick={() => handleApprove(record.id)}
              >
                Approve
              </Button>
              <Button
                type="link"
                icon={<CloseOutlined />}
                danger
                onClick={() => handleReject(record.id)}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>Hotel Approval</Title>
        <Text type="secondary">Review and approve hotel submissions</Text>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={hotels}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true
          }}
        />
      </Card>

      <Modal
        title="Hotel Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedHotel && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Hotel Name" span={2}>
              {selectedHotel.name}
            </Descriptions.Item>
            <Descriptions.Item label="Owner">
              {selectedHotel.owner}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedHotel.email}
            </Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>
              {selectedHotel.address}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {selectedHotel.description}
            </Descriptions.Item>
            <Descriptions.Item label="Amenities" span={2}>
              <Space wrap>
                {selectedHotel.amenities.map((amenity, index) => (
                  <Tag key={index}>{amenity}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedHotel.status === 'pending' ? 'orange' : 
                         selectedHotel.status === 'approved' ? 'green' : 'red'}>
                {selectedHotel.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Submitted At">
              {selectedHotel.submittedAt}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default HotelApproval;
