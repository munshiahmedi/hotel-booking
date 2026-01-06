// src/pages/HotelsList/HotelsListPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, message, Input, Select, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { hotelApi } from '../../services/api';
import WishlistButton from '../../components/wishlist/WishlistButton';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Hotel {
  id: string;
  name: string;
  description: string;
  city: string;
  country: string;
  pricePerNight: number;
  starRating: number;
  type: string;
  facilities: string[];
  imageUrls: string[];
  isBooked: boolean;
}

const HotelsListPage: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    type: '',
    rating: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await hotelApi.getAllHotels();
        console.log('API Response:', response);
        
        // Handle different possible response structures
        let hotelsData = [];
        if (response && response.data) {
          if (Array.isArray(response.data.hotels)) {
            hotelsData = response.data.hotels;
          } else if (Array.isArray(response.data)) {
            hotelsData = response.data;
          }
        }
        
        console.log('Final hotels data:', hotelsData);
        setHotels(hotelsData);
      } catch (error) {
        console.error('Error fetching hotels:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error details:', errorMessage);
        message.error('Failed to load hotels');
        setHotels([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);


  const filteredHotels = Array.isArray(hotels) ? hotels.filter(hotel => {
    // Add safety checks for hotel properties
    if (!hotel || typeof hotel !== 'object') return false;
    
    const name = hotel.name || '';
    const city = hotel.city || '';
    const country = hotel.country || '';
    
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         country.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPrice = (!filters.minPrice || (hotel.pricePerNight || 0) >= Number(filters.minPrice)) &&
                        (!filters.maxPrice || (hotel.pricePerNight || 0) <= Number(filters.maxPrice));
    
    const matchesType = !filters.type || hotel.type === filters.type;
    const matchesRating = !filters.rating || (hotel.starRating || 0) >= filters.rating;

    return matchesSearch && matchesPrice && matchesType && matchesRating;
  }) : [];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Title level={1} className="text-white text-4xl font-bold mb-4">Find Your Perfect Stay</Title>
          <Text className="text-white text-lg opacity-90">Discover amazing hotels around the world</Text>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <Search
                placeholder="Search hotels, cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-700 border-gray-600"
                style={{ backgroundColor: '#374151', borderColor: '#4B5563' }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hotel Type</label>
              <Select
                placeholder="All types"
                value={filters.type || undefined}
                onChange={(value) => setFilters({ ...filters, type: value })}
                className="w-full"
                style={{ backgroundColor: '#374151', borderColor: '#4B5563' }}
              >
                <Option value="">All types</Option>
                <Option value="luxury">Luxury</Option>
                <Option value="budget">Budget</Option>
                <Option value="boutique">Boutique</Option>
                <Option value="resort">Resort</Option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Min Rating</label>
              <Select
                placeholder="Any rating"
                value={filters.rating || undefined}
                onChange={(value) => setFilters({ ...filters, rating: value })}
                className="w-full"
                style={{ backgroundColor: '#374151', borderColor: '#4B5563' }}
              >
                <Option value={0}>Any rating</Option>
                <Option value={3}>3+ Stars</Option>
                <Option value={4}>4+ Stars</Option>
                <Option value={5}>5 Stars</Option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Price</label>
              <Input
                type="number"
                placeholder="Max price/night"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="bg-gray-700 border-gray-600"
                style={{ backgroundColor: '#374151', borderColor: '#4B5563' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <Text className="text-gray-400 block mt-4">Loading amazing hotels...</Text>
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="text-center py-16">
            <Text className="text-gray-400 text-lg">No hotels found matching your criteria.</Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => navigate(`/hotels/${hotel.id}`)}
              >
                {/* Hotel Image */}
                <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-800 relative overflow-hidden">
                  {hotel.imageUrls && hotel.imageUrls.length > 0 ? (
                    <img 
                      src={hotel.imageUrls[0]} 
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%234B5563"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-family="Arial" font-size="16"%3EHotel Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <WishlistButton 
                      hotelId={parseInt(hotel.id)} 
                      hotelName={hotel.name}
                      size="small"
                    />
                  </div>
                  {hotel.isBooked && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Booked
                    </div>
                  )}
                </div>
                
                {/* Hotel Info */}
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">{hotel.name}</h3>
                    <div className="flex items-center text-gray-400 text-sm mb-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {hotel.city}, {hotel.country}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{hotel.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(hotel.starRating || 0) ? 'text-yellow-400' : 'text-gray-600'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-300 text-sm ml-2">{hotel.starRating || 0}</span>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-blue-400 font-bold text-xl">${hotel.pricePerNight || 0}</div>
                      <div className="text-gray-500 text-xs">per night</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                      {hotel.type || 'Hotel'}
                    </span>
                    <Button
                      type="primary"
                      size="small"
                      className="bg-blue-600 hover:bg-blue-700 border-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/hotels/${hotel.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelsListPage;
