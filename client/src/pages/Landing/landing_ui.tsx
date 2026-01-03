// src/pages/Landing/landing_ui.tsx - Comprehensive Hotel Booking Landing Page
import React, { useState } from 'react';
import { Button, Input, DatePicker, Card, Row, Col, Typography, Rate, Avatar, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  HomeOutlined, 
  SafetyOutlined, 
  SearchOutlined,
  GlobalOutlined,
  StarOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const LandingUI: React.FC = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    destination: '',
    checkIn: null as any,
    checkOut: null as any,
    guests: 1
  });

  const handleSearch = () => {
    if (searchData.destination) {
      navigate('/hotels', { state: searchData });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-400 shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
              <HomeOutlined className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-white">HotelHub</span>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <span className="text-white hover:text-gray-100 transition-colors cursor-pointer font-medium">Home</span>
            <span className="text-white hover:text-gray-100 transition-colors cursor-pointer font-medium">Hotels</span>
            <span className="text-white hover:text-gray-100 transition-colors cursor-pointer font-medium">Destinations</span>
            <span className="text-white hover:text-gray-100 transition-colors cursor-pointer font-medium">About</span>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Button 
              type="text" 
              onClick={() => navigate('/login')}
              className="text-white hover:text-gray-100 font-medium"
            >
              Login
            </Button>
            <Button 
              type="primary" 
              onClick={() => navigate('/register')}
              className="bg-white hover:bg-gray-100 text-blue-600 px-6 py-2 font-medium"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect <span className="text-yellow-400">Stay</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12">
              Discover amazing hotels and resorts worldwide. Book with confidence and enjoy exclusive deals.
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                <Input
                  placeholder="Where to?"
                  prefix={<EnvironmentOutlined className="text-gray-400" />}
                  value={searchData.destination}
                  onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                <DatePicker
                  placeholder="Check-in"
                  className="w-full"
                  onChange={(date) => setSearchData({...searchData, checkIn: date})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                <DatePicker
                  placeholder="Check-out"
                  className="w-full"
                  onChange={(date) => setSearchData({...searchData, checkOut: date})}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium"
                >
                  Search Hotels
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Destinations</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our most sought-after destinations with thousands of hotels to choose from
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "New York", country: "USA", hotels: 1247 },
              { name: "London", country: "UK", hotels: 892 },
              { name: "Paris", country: "France", hotels: 756 },
              { name: "Tokyo", country: "Japan", hotels: 634 },
              { name: "Dubai", country: "UAE", hotels: 423 },
              { name: "Singapore", country: "Singapore", hotels: 387 }
            ].map((destination, index) => (
              <Card 
                key={index}
                hoverable
                className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow"
                cover={
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                    <GlobalOutlined className="text-6xl text-white opacity-50" />
                  </div>
                }
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{destination.name}</h3>
                  <p className="text-gray-600 mb-4">{destination.country}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{destination.hotels} hotels</span>
                    <Button type="link" className="text-blue-600 p-0">
                      Explore →
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Hotels</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked hotels offering exceptional experiences and value
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 1,
                name: "Grand Plaza Hotel",
                location: "New York, USA",
                rating: 4.8,
                price: 299,
                amenities: ["WiFi", "Pool", "Spa", "Gym"]
              },
              {
                id: 2,
                name: "Seaside Resort",
                location: "Miami Beach, FL",
                rating: 4.9,
                price: 450,
                amenities: ["Beach Access", "Restaurant", "Bar", "Tennis"]
              },
              {
                id: 3,
                name: "Mountain Lodge",
                location: "Aspen, Colorado",
                rating: 4.7,
                price: 380,
                amenities: ["Ski Access", "Fireplace", "Restaurant", "Spa"]
              }
            ].map((hotel) => (
              <Card
                key={hotel.id}
                hoverable
                className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                cover={
                  <div className="h-56 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                    <HomeOutlined className="text-6xl text-white opacity-50" />
                  </div>
                }
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{hotel.name}</h3>
                      <p className="text-gray-600 text-sm flex items-center">
                        <EnvironmentOutlined className="mr-1" />
                        {hotel.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        <StarOutlined className="text-yellow-400 mr-1" />
                        <span className="font-semibold">{hotel.rating}</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">${hotel.price}</p>
                      <p className="text-xs text-gray-500">per night</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.amenities.map((amenity, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                  
                  <Button 
                    type="primary" 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    onClick={() => navigate(`/hotels/${hotel.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Wide Selection Card */}
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center hover:shadow-xl transition-shadow">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <SearchOutlined className="text-4xl text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Wide Selection</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Choose from thousands of hotels, resorts, and unique accommodations worldwide. Find the perfect place that matches your preferences and budget.
            </p>
          </div>

          {/* Secure Booking Card */}
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center hover:shadow-xl transition-shadow">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <SafetyOutlined className="text-4xl text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Secure Booking</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Your payments and personal information are protected with industry-leading security. Book with confidence knowing your data is safe.
            </p>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <SafetyOutlined className="text-2xl text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">24/7 Support</h4>
              <p className="text-gray-600">Round-the-clock customer service</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HomeOutlined className="text-2xl text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Best Prices</h4>
              <p className="text-gray-600">Competitive rates guaranteed</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchOutlined className="text-2xl text-orange-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Easy Search</h4>
              <p className="text-gray-600">Find your perfect stay quickly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real experiences from real travelers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                avatar: "S",
                rating: 5,
                comment: "Amazing experience! The booking process was so smooth and the hotel exceeded our expectations.",
                location: "Los Angeles, CA"
              },
              {
                name: "Michael Chen",
                avatar: "M",
                rating: 5,
                comment: "Found the perfect hotel for our family vacation. Great prices and excellent customer service!",
                location: "San Francisco, CA"
              },
              {
                name: "Emma Williams",
                avatar: "E",
                rating: 5,
                comment: "I've been using HotelHub for all my business trips. Reliable and always finds the best deals.",
                location: "Chicago, IL"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="h-full shadow-lg">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="mr-3 bg-gradient-to-r from-blue-600 to-blue-700">
                      {testimonial.avatar}
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                  <Rate disabled defaultValue={testimonial.rating} className="mb-4" />
                  <p className="text-gray-600 italic">"{testimonial.comment}"</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Find Your Perfect Stay?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of travelers who trust HotelHub for their accommodation needs
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="large"
              onClick={() => navigate('/hotels')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold"
            >
              Browse Hotels
            </Button>
            <Button 
              size="large"
              onClick={() => navigate('/register')}
              className="border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 text-lg font-semibold"
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10M+</div>
              <p className="text-xl text-blue-100">Happy Customers</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <p className="text-xl text-blue-100">Hotels Worldwide</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">120+</div>
              <p className="text-xl text-blue-100">Countries</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">4.8/5</div>
              <p className="text-xl text-blue-100">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <HomeOutlined className="text-white text-lg" />
                </div>
                <span className="text-xl font-bold">HotelHub</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for finding the perfect accommodation worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer">About Us</li>
                <li className="hover:text-white cursor-pointer">Contact</li>
                <li className="hover:text-white cursor-pointer">FAQs</li>
                <li className="hover:text-white cursor-pointer">Terms of Service</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer flex items-center">
                  <PhoneOutlined className="mr-2" />
                  1-800-HOTEL-HUB
                </li>
                <li className="hover:text-white cursor-pointer flex items-center">
                  <MailOutlined className="mr-2" />
                  support@hotelhub.com
                </li>
                <li className="hover:text-white cursor-pointer">24/7 Customer Service</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 cursor-pointer">
                  <FacebookOutlined />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 cursor-pointer">
                  <TwitterOutlined />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 cursor-pointer">
                  <InstagramOutlined />
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HotelHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingUI;