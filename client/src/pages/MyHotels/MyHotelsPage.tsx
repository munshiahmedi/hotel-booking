// src/pages/MyHotels/MyHotelsPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Button, Tag, Space, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SyncOutlined } from '@ant-design/icons';
import { hotelApi } from '../../services/api';

const { Title } = Typography;

interface Hotel {
  id: number;
  owner_id: number;
  name: string;
  slug: string;
  description: string;
  star_rating: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const MyHotelsPage: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelApi.getMyHotels();
      console.log('API Response:', response.data);
      const hotelsData = response.data.hotels;
      setHotels(Array.isArray(hotelsData) ? hotelsData : []);
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
      message.error('Failed to fetch hotels. Please try again.');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await hotelApi.deleteHotel(id.toString());
      message.success('Hotel deleted successfully!');
      fetchHotels();
    } catch (error) {
      message.error('Failed to delete hotel. Please try again.');
    }
  };

  const handleUpdateStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await hotelApi.updateHotelStatus(id.toString(), newStatus);
      message.success(`Hotel status updated to ${newStatus}!`);
      fetchHotels();
    } catch (error) {
      message.error('Failed to update hotel status. Please try again.');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Hotel) => (
        <Link to={`/hotels/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: 'Rating',
      dataIndex: 'star_rating',
      key: 'star_rating',
      render: (rating: number) => `${rating || 0} Star${rating > 1 ? 's' : ''}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status || 'Unknown'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Hotel) => (
        <Space size="middle">
          <Link to={`/hotels/${record.id}`}>
            <Button icon={<EyeOutlined />} type="text" title="View" />
          </Link>
          <Link to={`/hotels/${record.id}/edit`}>
            <Button icon={<EditOutlined />} type="text" title="Edit" />
          </Link>
          <Button 
            icon={<SyncOutlined />} 
            type="text" 
            title="Update Status"
            onClick={() => handleUpdateStatus(record.id, record.status || 'inactive')}
          />
          <Button 
            icon={<DeleteOutlined />} 
            type="text" 
            danger 
            title="Delete"
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>My Hotels</Title>
        <Link to="/create-hotel">
          <Button type="primary" icon={<PlusOutlined />}>
            Add Hotel
          </Button>
        </Link>
      </div>

      <Card>
        <Table 
          columns={columns} 
          dataSource={hotels} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default MyHotelsPage;