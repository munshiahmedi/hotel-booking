// src/pages/admin/AuditLogs.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
  Modal
} from 'antd';
import {
  EyeOutlined,
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  DollarOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { adminApi } from '../../services/adminService';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
  timestamp: string;
  details?: string;
}

const AuditLogs: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<any>(null);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAuditLogs({
        action: actionFilter,
        status: statusFilter,
        search: searchText,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD')
      });
      
      // Transform API response to match our interface
      const transformedLogs = response.data?.map((log: any) => ({
        id: log.id.toString(),
        userId: log.user_id?.toString() || 'N/A',
        userName: log.user?.name || 'Unknown',
        userEmail: log.user?.email || 'unknown@example.com',
        action: log.action || 'Unknown',
        resource: log.resource || 'Unknown',
        resourceId: log.resource_id?.toString() || 'N/A',
        ipAddress: log.ip_address || 'N/A',
        userAgent: log.user_agent || 'N/A',
        status: log.status || 'unknown',
        timestamp: new Date(log.created_at).toLocaleString(),
        details: log.details || ''
      })) || [];
      
      setLogs(transformedLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      message.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [actionFilter, statusFilter, searchText, dateRange]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const viewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailModalVisible(true);
  };

  const exportLogs = async () => {
    try {
      const response = await adminApi.exportAuditLogs({
        action: actionFilter,
        status: statusFilter,
        search: searchText,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD')
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      message.error('Failed to export audit logs');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'failure': return 'red';
      case 'warning': return 'orange';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <UserOutlined />;
      case 'failure': return <SecurityScanOutlined />;
      case 'warning': return <SettingOutlined />;
      default: return <SettingOutlined />;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('booking') || action.includes('reservation')) return <CalendarOutlined />;
    if (action.includes('hotel')) return <HomeOutlined />;
    if (action.includes('payment') || action.includes('transaction')) return <DollarOutlined />;
    if (action.includes('user') || action.includes('login') || action.includes('register')) return <UserOutlined />;
    return <SettingOutlined />;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchText || 
      log.userName.toLowerCase().includes(searchText.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchText.toLowerCase()) ||
      log.action.toLowerCase().includes(searchText.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchText.toLowerCase()) ||
      log.ipAddress.includes(searchText);
    
    const matchesAction = !actionFilter || log.action.includes(actionFilter);
    const matchesStatus = !statusFilter || log.status === statusFilter;
    
    // TODO: Add date range filtering logic
    
    return matchesSearch && matchesAction && matchesStatus;
  });

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => (
        <Text style={{ fontSize: '12px' }}>{timestamp}</Text>
      )
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'user',
      render: (text: string, record: AuditLog) => (
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
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Space>
          {getActionIcon(action)}
          <span>{action}</span>
        </Space>
      )
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource: string, record: AuditLog) => (
        <Space direction="vertical" size="small">
          <span>{resource}</span>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ID: {record.resourceId}
          </Text>
        </Space>
      )
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 140
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
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: AuditLog) => (
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
        <Title level={2}>Audit Logs</Title>
        <Text type="secondary">Monitor system activities and security events</Text>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Space wrap size="middle">
          <Search
            placeholder="Search by user, action, resource, or IP"
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => !e.target.value && setSearchText('')}
          />
          <Select
            placeholder="Filter by action"
            allowClear
            style={{ width: 150 }}
            onChange={setActionFilter}
          >
            <Option value="login">Login</Option>
            <Option value="register">Register</Option>
            <Option value="booking">Booking</Option>
            <Option value="payment">Payment</Option>
            <Option value="hotel">Hotel</Option>
            <Option value="admin">Admin</Option>
          </Select>
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 120 }}
            onChange={setStatusFilter}
          >
            <Option value="success">Success</Option>
            <Option value="failure">Failure</Option>
            <Option value="warning">Warning</Option>
          </Select>
          <RangePicker
            placeholder={['Start date', 'End date']}
            onChange={setDateRange}
          />
          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={exportLogs}
          >
            Export
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} logs`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title="Audit Log Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedLog && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>Log ID:</Text> {selectedLog.id}
              </div>
              <div>
                <Text strong>Timestamp:</Text> {selectedLog.timestamp}
              </div>
              <div>
                <Text strong>User:</Text> {selectedLog.userName} ({selectedLog.userEmail})
              </div>
              <div>
                <Text strong>User ID:</Text> {selectedLog.userId}
              </div>
              <div>
                <Text strong>Action:</Text> {selectedLog.action}
              </div>
              <div>
                <Text strong>Resource:</Text> {selectedLog.resource} (ID: {selectedLog.resourceId})
              </div>
              <div>
                <Text strong>IP Address:</Text> {selectedLog.ipAddress}
              </div>
              <div>
                <Text strong>User Agent:</Text> 
                <Text style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                  {selectedLog.userAgent}
                </Text>
              </div>
              <div>
                <Text strong>Status:</Text>{' '}
                <Tag color={getStatusColor(selectedLog.status)} icon={getStatusIcon(selectedLog.status)}>
                  {selectedLog.status.toUpperCase()}
                </Tag>
              </div>
              {selectedLog.details && (
                <div>
                  <Text strong>Details:</Text>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: '10px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'auto'
                  }}>
                    {selectedLog.details}
                  </pre>
                </div>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;
