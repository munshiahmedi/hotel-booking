// src/pages/Landing/landing_ui.tsx
import React from 'react';
import { Button, Typography, Row, Col, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, UserOutlined, SafetyOutlined, StarOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const LandingUI: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <HomeOutlined className="text-2xl text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">HotelHub</span>
            </div>
            <div className="flex space-x-4">
              <Button 
                type="default" 
                onClick={() => navigate('/login')}
                size="large"
              >
                Login
              </Button>
              <Button 
                type="primary" 
                onClick={() => navigate('/register')}
                size="large"
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} md={12}>
            <div className="text-left">
              <Title level={1} className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Find Your Perfect
                <span className="text-blue-600"> Stay</span>
              </Title>
              <Paragraph className="text-xl text-gray-600 mb-8">
                Discover amazing hotels, resorts, and accommodations worldwide. 
                Book with confidence and enjoy your perfect getaway.
              </Paragraph>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={() => navigate('/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                >
                  Get Started
                </Button>
                <Button 
                  type="default" 
                  size="large" 
                  onClick={() => navigate('/hotels')}
                  className="border-gray-300 text-gray-700 px-8 py-4 text-lg"
                >
                  Browse Hotels
                </Button>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="text-center">
              <HomeOutlined className="text-8xl text-blue-600" />
            </div>
          </Col>
        </Row>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Title level={2} className="text-3xl font-bold text-gray-900">
              Why Choose HotelHub?
            </Title>
            <Paragraph className="text-lg text-gray-600 mt-4">
              We make hotel booking simple, secure, and enjoyable
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card className="text-center h-full border-0 shadow-lg">
                <HomeOutlined className="text-4xl text-blue-600 mb-4" />
                <Title level={4} className="text-gray-900 mb-3">
                  Wide Selection
                </Title>
                <Paragraph className="text-gray-600">
                  Choose from thousands of hotels, resorts, and unique accommodations worldwide
                </Paragraph>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card className="text-center h-full border-0 shadow-lg">
                <SafetyOutlined className="text-4xl text-blue-600 mb-4" />
                <Title level={4} className="text-gray-900 mb-3">
                  Secure Booking
                </Title>
                <Paragraph className="text-gray-600">
                  Your payments and personal information are protected with industry-leading security
                </Paragraph>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card className="text-center h-full border-0 shadow-lg">
                <StarOutlined className="text-4xl text-blue-600 mb-4" />
                <Title level={4} className="text-gray-900 mb-3">
                  Best Prices
                </Title>
                <Paragraph className="text-gray-600">
                  Get competitive rates and exclusive deals on hotels worldwide
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Title level={2} className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </Title>
          <Paragraph className="text-xl text-blue-100 mb-8">
            Join thousands of travelers who trust HotelHub for their accommodation needs
          </Paragraph>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              type="primary" 
              size="large" 
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Create Account
            </Button>
            <Button 
              type="default" 
              size="large" 
              onClick={() => navigate('/register')}
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <HomeOutlined className="text-2xl mr-2" />
              <span className="text-xl font-bold">HotelHub</span>
            </div>
            <Paragraph className="text-gray-400">
              2024 HotelHub. All rights reserved.
            </Paragraph>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingUI;