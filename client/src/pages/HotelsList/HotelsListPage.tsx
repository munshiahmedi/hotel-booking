// src/pages/HotelsList/HotelsListPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, message, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { hotelApi } from '../../services/api';

const { Title, Text } = Typography;

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
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="mb-6">Find Your Perfect Stay</Title>
      
      {loading ? (
        <div className="text-center py-8">
          <Text>Loading hotels...</Text>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="text-center py-8">
          <Text>No hotels found matching your criteria.</Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <Card
              key={hotel.id}
              hoverable
              className="overflow-hidden"
              onClick={() => navigate(`/hotels/${hotel.id}`)}
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <Text className="text-gray-500">Hotel Image</Text>
              </div>
              <div className="p-4">
                <Title level={4} className="mb-2">{hotel.name}</Title>
                <Text className="text-gray-600 block mb-2">{hotel.city}, {hotel.country}</Text>
                <Text className="text-gray-500 text-sm block mb-3">{hotel.description}</Text>
                <div className="flex justify-between items-center">
                  <Text strong className="text-lg">${hotel.pricePerNight}/night</Text>
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <Text className="ml-1">{hotel.starRating}</Text>
                  </div>
                </div>
                <div className="mt-3">
                  <Text className="text-sm text-gray-500">{hotel.type}</Text>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelsListPage;
