import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PriceCalculationRequest {
  hotel_id: number;
  room_type_id: number;
  check_in: Date;
  check_out: Date;
  guests?: number;
  user_id?: number;
}

export interface PriceBreakdown {
  base_price: number;
  total_nights: number;
  room_rate: number;
  taxes: number;
  service_fees: number;
  total_amount: number;
  currency: string;
  pricing_rules: Array<{
    name: string;
    type: string;
    amount: number;
    is_percentage: boolean;
  }>;
}

export class PriceCalculationService {
  async calculatePrice(request: PriceCalculationRequest): Promise<PriceBreakdown> {
    const { hotel_id, room_type_id, check_in, check_out, guests = 1 } = request;

    // Get room base price
    const roomType = await prisma.roomType.findUnique({
      where: { id: room_type_id },
      include: { room_pricing: true }
    });

    if (!roomType) {
      throw new Error('Room type not found');
    }

    // Calculate nights
    const nights = Math.ceil((check_out.getTime() - check_in.getTime()) / (1000 * 60 * 60 * 24));
    if (nights <= 0) {
      throw new Error('Invalid date range');
    }

    // Get base room rate
    let baseRate = Number(roomType.base_price);
    
    // Apply dynamic pricing rules
    const applicableRules = await this.getApplicablePricingRules(
      hotel_id,
      room_type_id,
      check_in,
      check_out
    );

    let adjustedRate = baseRate;
    const appliedRules: PriceBreakdown['pricing_rules'] = [];

    for (const rule of applicableRules) {
      if (rule.rule_type === 'SURGE') {
        const multiplier = Number(rule.percentage_change) / 100;
        adjustedRate = adjustedRate * (1 + multiplier);
        appliedRules.push({
          name: rule.rule_name,
          type: 'surge_pricing',
          amount: multiplier * 100,
          is_percentage: true
        });
      } else if (rule.rule_type === 'DISCOUNT') {
        const discount = Number(rule.percentage_change) / 100;
        adjustedRate = adjustedRate * (1 - discount);
        appliedRules.push({
          name: rule.rule_name,
          type: 'discount',
          amount: discount * 100,
          is_percentage: true
        });
      }
    }

    // Calculate room total
    const roomTotal = adjustedRate * nights;

    // Calculate taxes (10% room tax + 5% service tax)
    const roomTax = roomTotal * 0.10;
    const serviceTax = roomTotal * 0.05;
    const totalTaxes = roomTax + serviceTax;

    // Calculate service fees (5% of room total)
    const serviceFees = roomTotal * 0.05;

    // Total amount
    const totalAmount = roomTotal + totalTaxes + serviceFees;

    return {
      base_price: baseRate,
      total_nights: nights,
      room_rate: adjustedRate,
      taxes: totalTaxes,
      service_fees: serviceFees,
      total_amount: totalAmount,
      currency: 'USD',
      pricing_rules: appliedRules
    };
  }

  private async getApplicablePricingRules(
    hotel_id: number,
    room_type_id: number,
    check_in: Date,
    check_out: Date
  ) {
    return await prisma.pricingRule.findMany({
      where: {
        hotel_id,
        room_type_id,
        is_active: true,
        OR: [
          {
            // Date range rules
            start_date: { lte: check_in },
            end_date: { gte: check_out }
          },
          {
            // Day of week rules
            rule_type: 'SEASONAL'
          }
        ]
      },
      orderBy: { priority: 'desc' }
    });
  }

  async validatePriceIntegrity(booking_id: number): Promise<boolean> {
    const booking = await prisma.booking.findUnique({
      where: { id: booking_id },
      include: {
        hotel: true,
        room_type: true
      }
    });

    if (!booking) {
      return false;
    }

    // Recalculate price
    const calculatedPrice = await this.calculatePrice({
      hotel_id: booking.hotel_id,
      room_type_id: booking.room_type_id,
      check_in: booking.check_in,
      check_out: booking.check_out,
      user_id: booking.user_id
    });

    // Compare with stored amount (allowing small rounding differences)
    const difference = Math.abs(
      Number(calculatedPrice.total_amount) - Number(booking.total_amount)
    );
    
    return difference < 0.01; // Allow 1 cent difference
  }
}
