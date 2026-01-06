// src/pages/MyHotels/MyHotelsPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Button, Tag, Space, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SyncOutlined, HomeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { hotelApi } from '../../services/api';

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

  const totalHotels = hotels.length;
  const activeHotels = hotels.filter(h => h.status === 'active').length;
  const inactiveHotels = hotels.filter(h => h.status === 'inactive').length;

  const columns = [
    {
      title: 'Hotel Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Hotel) => (
        <div className="flex items-center">
          <HomeOutlined className="mr-2 text-blue-400" />
          <Link to={`/hotels/${record.id}`} className="text-white hover:text-blue-400">{text}</Link>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: () => 'Luxury', // Placeholder as category is not in the interface
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag 
          color={status === 'active' ? 'green' : 'red'}
          className="border-none"
        >
          {status === 'active' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Hotel) => (
        <Space size="middle">
          <Link to={`/hotels/${record.id}`}>
            <Button 
              icon={<EyeOutlined />} 
              type="text" 
              title="View"
              className="text-white hover:bg-gray-700"
            />
          </Link>
          <Link to={`/hotels/${record.id}/edit`}>
            <Button 
              icon={<EditOutlined />} 
              type="text" 
              title="Edit"
              className="text-white hover:bg-gray-700"
            />
          </Link>
          <Button 
            icon={<SyncOutlined />} 
            type="text" 
            title="Update Status"
            onClick={() => handleUpdateStatus(record.id, record.status || 'inactive')}
            className="text-white hover:bg-gray-700"
          />
          <Button 
            icon={<DeleteOutlined />} 
            type="text" 
            danger 
            title="Delete"
            onClick={() => handleDelete(record.id)}
            className="text-red-400 hover:bg-red-900/20"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#111827] text-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Hotels</h1>
            <p className="text-gray-400 text-sm">Manage your hotel listings</p>
          </div>
          <Link to="/create-hotel">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              className="bg-blue-600 hover:bg-blue-700 border-none rounded-lg"
            >
              Add Hotel
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={8}>
            <Card className="bg-[#1F2937] border-none rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Hotels</p>
                  <p className="text-3xl font-bold mt-1">{totalHotels}</p>
                </div>
                <div className="bg-blue-600/20 p-3 rounded-full">
                  <HomeOutlined className="text-blue-400 text-xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="bg-[#1F2937] border-none rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active</p>
                  <p className="text-3xl font-bold mt-1">{activeHotels}</p>
                </div>
                <div className="bg-green-600/20 p-3 rounded-full">
                  <CheckCircleOutlined className="text-green-400 text-xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="bg-[#1F2937] border-none rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Inactive</p>
                  <p className="text-3xl font-bold mt-1">{inactiveHotels}</p>
                </div>
                <div className="bg-red-600/20 p-3 rounded-full">
                  <CloseCircleOutlined className="text-red-400 text-xl" />
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Hotels Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Card className="bg-[#1F2937] border-none rounded-lg shadow-lg">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Your Hotels</h2>
          </div>
          <Table 
            columns={columns} 
            dataSource={hotels} 
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 10,
              className: "text-white",
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: (total, range) => (
                <span className="text-white">
                  {range[0]}-{range[1]} of {total} items
                </span>
              ),
            }}
            className="custom-table"
            rowClassName="hover:bg-gray-700/50"
          />
        </Card>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-table .ant-table-thead > tr > th {
            background-color: #374151;
            border-bottom: 1px solid #4B5563;
            color: white;
            font-weight: 600;
          }
          .custom-table .ant-table-tbody > tr > td {
            background-color: #1F2937;
            border-bottom: 1px solid #374151;
            color: white;
          }
          .custom-table .ant-table-tbody > tr:hover > td {
            background-color: #374151 !important;
          }
          .custom-table .ant-pagination-item {
            background-color: #374151;
            border-color: #4B5563;
          }
          .custom-table .ant-pagination-item a {
            color: white;
          }
          .custom-table .ant-pagination-item-active {
            background-color: #3B82F6;
            border-color: #3B82F6;
          }
          .custom-table .ant-pagination-item-active a {
            color: white;
          }
          .custom-table .ant-pagination-prev,
          .custom-table .ant-pagination-next {
            background-color: #374151;
            border-color: #4B5563;
          }
          .custom-table .ant-pagination-prev button,
          .custom-table .ant-pagination-next button {
            color: white;
          }
        `
      }} />
    </div>
  );
};

export default MyHotelsPage;