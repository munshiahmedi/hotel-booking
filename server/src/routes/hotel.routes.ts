import { Router } from 'express';
import hotelService from '../services/hotel.service';

const router = Router();

// Mock hotel data
// const mockHotels = [
//   {
//     id: '1',
//     name: 'Grand Plaza Hotel',
//     description: 'Luxury hotel in the heart of downtown with stunning city views',
//     city: 'New York',
//     country: 'USA',
//     pricePerNight: 250,
//     starRating: 5,
//     type: 'Luxury',
//     facilities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
//     imageUrls: [],
//     isBooked: false
//   },
//   {
//     id: '2',
//     name: 'Seaside Resort',
//     description: 'Beautiful beachfront resort with crystal clear ocean views',
//     city: 'Miami',
//     country: 'USA',
//     pricePerNight: 180,
//     starRating: 4,
//     type: 'Resort',
//     facilities: ['WiFi', 'Pool', 'Beach Access', 'Restaurant', 'Bar'],
//     imageUrls: [],
//     isBooked: false
//   },
//   {
//     id: '3',
//     name: 'Mountain Lodge',
//     description: 'Cozy mountain retreat perfect for skiing and hiking adventures',
//     city: 'Aspen',
//     country: 'USA',
//     pricePerNight: 320,
//     starRating: 4,
//     type: 'Lodge',
//     facilities: ['WiFi', 'Fireplace', 'Ski Access', 'Restaurant', 'Spa'],
//     imageUrls: [],
//     isBooked: false
//   },
//   {
//     id: '4',
//     name: 'Business Inn',
//     description: 'Modern hotel designed for business travelers with excellent amenities',
//     city: 'Chicago',
//     country: 'USA',
//     pricePerNight: 120,
//     starRating: 3,
//     type: 'Business',
//     facilities: ['WiFi', 'Business Center', 'Gym', 'Meeting Rooms', 'Restaurant'],
//     imageUrls: [],
//     isBooked: false
//   },
//   {
//     id: '5',
//     name: 'Historic Boutique Hotel',
//     description: 'Charming historic hotel with unique architecture and personalized service',
//     city: 'Boston',
//     country: 'USA',
//     pricePerNight: 200,
//     starRating: 4,
//     type: 'Boutique',
//     facilities: ['WiFi', 'Restaurant', 'Bar', 'Concierge', 'Library'],
//     imageUrls: [],
//     isBooked: false
//   }
// ];

// GET /api/hotels - Get all hotels
router.get('/', async (req, res) => {
  try {
    const { hotels, total, page, limit } = await hotelService.getAllHotels(req.query);
    return res.json({
      success: true,
      hotels,
      total,
      page,
      limit
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch hotels',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/hotels/my-hotels - Get current user's hotels
router.get('/my-hotels', async (req, res) => {
  try {
    // For now, assume user ID 1 (in a real app, get from JWT token)
    const ownerId = 1;
    const hotels = await hotelService.getHotelsByOwner(ownerId);
    return res.json({
      success: true,
      hotels
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your hotels',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/hotels/:id - Get hotel by ID
router.get('/:id', async (req, res) => {
  try {
    const hotel = await hotelService.getHotelById(parseInt(req.params.id));
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }
    return res.json({
      success: true,
      hotel
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch hotel',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/hotels - Create new hotel
router.post('/', async (req, res) => {
  try {
    // For now, assume owner_id 1 (in a real app, get from JWT token)
    const hotelData = {
      ...req.body,
      owner_id: 1
    };
    const hotel = await hotelService.createHotel(hotelData);
    return res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      hotel
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create hotel',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/hotels/:id - Update hotel
router.put('/:id', async (req, res) => {
  try {
    const hotel = await hotelService.updateHotel(parseInt(req.params.id), req.body);
    return res.json({
      success: true,
      message: 'Hotel updated successfully',
      hotel
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update hotel',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/hotels/:id - Delete hotel
router.delete('/:id', async (req, res) => {
  try {
    await hotelService.deleteHotel(parseInt(req.params.id));
    return res.json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete hotel',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
