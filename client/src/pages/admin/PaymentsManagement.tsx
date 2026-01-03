// src/pages/admin/PaymentsManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
  Input,
  Select,
  DatePicker,
  Modal,
  Statistic,
  Row,
  Col
} from 'antd';
import {
  EyeOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Payment {
  id: string;
  bookingId: string;
  user: string;
  userEmail: string;
  hotel: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  completedAt?: string;
}

const PaymentsManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<any>(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    failedPayments: 0
  });

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllPayments({
        status: statusFilter,
        search: searchText,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD')
      });
      
      // Transform API response to match our interface
      const transformedPayments = response.data.transactions?.map((transaction: any) => ({
        id: transaction.id.toString(),
        bookingId: transaction.booking_id?.toString() || 'N/A',
        user: transaction.user?.name || 'Unknown',
        userEmail: transaction.user?.email || 'unknown@example.com',
        hotel: transaction.hotel?.name || 'Unknown Hotel',
        amount: transaction.amount || 0,
        status: transaction.status || 'pending',
        paymentMethod: transaction.payment_method || 'Unknown',
        transactionId: transaction.transaction_id || 'N/A',
        createdAt: new Date(transaction.created_at).toLocaleDateString(),
        completedAt: transaction.completed_at ? new Date(transaction.completed_at).toLocaleDateString() : undefined
      })) || [];
      
      setPayments(transformedPayments);
      
      // Calculate stats
      const totalRevenue = transformedPayments
        .filter((p: Payment) => p.status === 'completed')
        .reduce((sum: number, p: Payment) => sum + p.amount, 0);
      
      setStats({
        totalRevenue,
        pendingPayments: transformedPayments.filter((p: Payment) => p.status === 'pending').length,
        completedPayments: transformedPayments.filter((p: Payment) => p.status === 'completed').length,
        failedPayments: transformedPayments.filter((p: Payment) => p.status === 'failed').length
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      message.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchText, dateRange]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const viewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailModalVisible(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      case 'refunded': return 'purple';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleOutlined />;
      case 'pending': return <ClockCircleOutlined />;
      case 'failed': return <CloseCircleOutlined />;
      case 'refunded': return <DollarOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchText || 
      payment.user.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.userEmail.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.hotel.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || payment.status === statusFilter;
    
    // TODO: Add date range filtering logic
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 150
    },
    {
      title: 'Booking ID',
      dataIndex: 'bookingId',
      key: 'bookingId',
      width: 120
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (text: string, record: Payment) => (
        <Space direction="vertical" size="small">
          <Space>
            <UserOutlined />
            <span>{text}</span>
          </Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.userEmail}
          </Text>
        </Space>
      )
    },
    {
      title: 'Hotel',
      dataIndex: 'hotel',
      key: 'hotel'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong>{formatCurrency(amount)}</Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod'
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Payment) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => viewDetails(record)}
        >
          View
        </Button>
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
        <Title level={2}>Payments Management</Title>
        <Text type="secondary">View and manage all payment transactions</Text>
      </div>

      {/* Statistics */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completedPayments}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending"
              value={stats.pendingPayments}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Failed"
              value={stats.failedPayments}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Space wrap size="middle">
          <Search
            placeholder="Search by user, email, hotel, or transaction ID"
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => !e.target.value && setSearchText('')}
          />
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150 }}
            onChange={setStatusFilter}
          >
            <Option value="pending">Pending</Option>
            <Option value="completed">Completed</Option>
            <Option value="failed">Failed</Option>
            <Option value="refunded">Refunded</Option>
          </Select>
          <RangePicker
            placeholder={['Start date', 'End date']}
            onChange={setDateRange}
          />
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredPayments}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} transactions`
          }}
        />
      </Card>

      <Modal
        title="Payment Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedPayment && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>Transaction ID:</Text> {selectedPayment.transactionId}
              </div>
              <div>
                <Text strong>Booking ID:</Text> {selectedPayment.bookingId}
              </div>
              <div>
                <Text strong>User:</Text> {selectedPayment.user} ({selectedPayment.userEmail})
              </div>
              <div>
                <Text strong>Hotel:</Text> {selectedPayment.hotel}
              </div>
              <div>
                <Text strong>Amount:</Text> {formatCurrency(selectedPayment.amount)}
              </div>
              <div>
                <Text strong>Status:</Text>{' '}
                <Tag color={getStatusColor(selectedPayment.status)} icon={getStatusIcon(selectedPayment.status)}>
                  {selectedPayment.status.toUpperCase()}
                </Tag>
              </div>
              <div>
                <Text strong>Payment Method:</Text> {selectedPayment.paymentMethod}
              </div>
              <div>
                <Text strong>Created At:</Text> {selectedPayment.createdAt}
              </div>
              {selectedPayment.completedAt && (
                <div>
                  <Text strong>Completed At:</Text> {selectedPayment.completedAt}
                </div>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentsManagement;
