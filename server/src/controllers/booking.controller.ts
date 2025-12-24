import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PriceCalculationService } from '../services/priceCalculation.service';
import { TaxCalculationService } from '../services/taxCalculation.service';
import { handleIdempotentResponse } from '../services/idempotency.service';

const prisma = new PrismaClient();
const priceService = new PriceCalculationService();
const taxService = new TaxCalculationService();

// Extend Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

const bookingController = {
  // Get all bookings for the authenticated user
  getMyBookings: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const bookings = await prisma.booking.findMany({
        where: {
          user_id: userId
        },
        include: {
          hotel: {
            select: {
              id: true,
              name: true
            }
          },
          room_type: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      const formattedBookings = bookings.map(booking => ({
        id: booking.id.toString(),
        hotelName: booking.hotel?.name || 'Unknown Hotel',
        status: booking.status,
        totalPrice: Number(booking.total_amount),
        rooms: 1,
        guests: 1,
        createdAt: booking.created_at,
        userId: booking.user_id.toString()
      }));

      return res.json(formattedBookings);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  },

  // Get a specific booking by ID
  getBookingById: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const booking = await prisma.booking.findFirst({
        where: {
          id: parseInt(id?.toString() || '0'),
          user_id: userId
        },
        include: {
          hotel: true,
          room_type: true
        }
      });
      
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      return res.json(booking);
    } catch (error) {
      console.error('Error fetching booking:', error);
      return res.status(500).json({ error: 'Failed to fetch booking' });
    }
  },

  // Create a new booking
  createBooking: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { hotel_id, room_type_id, check_in, check_out, guests = 1 } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        const error = { error: 'User not authenticated' };
        await handleIdempotentResponse(req, res, error, 'failed');
        return res.status(401).json(error);
      }

      // Calculate price using backend service
      const priceBreakdown = await priceService.calculatePrice({
        hotel_id,
        room_type_id,
        check_in: new Date(check_in),
        check_out: new Date(check_out),
        guests,
        user_id: userId
      });

      // Calculate taxes and fees
      const taxBreakdown = await taxService.calculateTaxesAndFees({
        base_amount: priceBreakdown.total_amount,
        hotel_id,
        booking_date: new Date(),
        check_in_date: new Date(check_in),
        check_out_date: new Date(check_out),
        room_type_id,
        guests
      });

      // Atomic transaction - ensure all operations succeed or none
      const result = await prisma.$transaction(async (tx) => {
        // 1. Check room availability
        const existingBooking = await tx.booking.findFirst({
          where: {
            room_type_id,
            status: { not: 'cancelled' },
            OR: [
              {
                check_in: { lte: new Date(check_in) },
                check_out: { gte: new Date(check_in) }
              },
              {
                check_in: { lte: new Date(check_out) },
                check_out: { gte: new Date(check_out) }
              },
              {
                check_in: { gte: new Date(check_in) },
                check_out: { lte: new Date(check_out) }
              }
            ]
          }
        });

        if (existingBooking) {
          throw new Error('Room is not available for the selected dates');
        }

        // 2. Create room lock to prevent double booking
        const roomLock = await tx.roomLock.create({
          data: {
            hotel_id,
            room_id: 1, // TODO: Get actual room_id from room_type_id
            locked_by_user_id: userId,
            lock_type: 'BOOKING',
            locked_until: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            status: 'ACTIVE'
          }
        });

        // 3. Create the booking with calculated price
        const newBooking = await tx.booking.create({
          data: {
            user_id: userId,
            hotel_id,
            room_type_id,
            check_in: new Date(check_in),
            check_out: new Date(check_out),
            total_amount: taxBreakdown.total_with_taxes,
            status: 'confirmed'
          },
          include: {
            hotel: true,
            room_type: true
          }
        });

        // 4. Create tax records
        if (taxBreakdown.taxes.length > 0) {
          await tx.bookingTax.createMany({
            data: taxBreakdown.taxes.map((tax: any, index: number) => ({
              booking_id: newBooking.id,
              tax_id: index + 1, // Use index + 1 as tax_id
              name: tax.name,
              type: tax.type,
              amount: tax.amount,
              rate: tax.rate || 0,
              jurisdiction: tax.jurisdiction
            }))
          });
        }

        // 5. Create fee records (simplified - just store in booking_taxes for now)
        if (taxBreakdown.service_fees.length > 0) {
          await tx.bookingTax.createMany({
            data: taxBreakdown.service_fees.map((fee: any, index: number) => ({
              booking_id: newBooking.id,
              tax_id: 100 + index, // Use different IDs for fees
              name: fee.name,
              type: fee.type,
              amount: fee.amount,
              rate: fee.rate || 0,
              jurisdiction: 'FEE'
            }))
          });
        }

        // 6. Release the room lock
        await tx.roomLock.update({
          where: { id: roomLock.id },
          data: { status: 'RELEASED' }
        });

        return {
          booking: newBooking,
          price_breakdown: priceBreakdown,
          tax_breakdown: taxBreakdown
        };
      });

      const response = {
        success: true,
        booking: result.booking,
        pricing: result.price_breakdown,
        taxes: result.tax_breakdown,
        total_paid: result.tax_breakdown.total_with_taxes
      };

      await handleIdempotentResponse(req, res, response, 'completed');
      return res.status(201).json(response);
    } catch (error) {
      const errorResponse = error instanceof Error && error.message.includes('Room is not available') 
        ? { error: error.message }
        : { error: 'Failed to create booking' };
      
      await handleIdempotentResponse(req, res, errorResponse, 'failed');
      
      if (error instanceof Error && error.message.includes('Room is not available')) {
        return res.status(409).json(errorResponse);
      }
      return res.status(500).json(errorResponse);
    }
  },

  // Cancel a booking
  cancelBooking: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (!id) {
        return res.status(400).json({ error: 'Booking ID is required' });
      }

      const booking = await prisma.booking.findFirst({
        where: {
          id: parseInt(id),
          user_id: userId
        }
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: parseInt(id) },
        data: { status: 'cancelled' }
      });
      
      return res.json(updatedBooking);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to cancel booking' });
    }
  }
};

export default bookingController;
