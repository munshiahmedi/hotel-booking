import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const AnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <Title level={2} className="text-white">Analytics Dashboard</Title>
          <p className="text-gray-400">Hotel analytics coming soon...</p>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
