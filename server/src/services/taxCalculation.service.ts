import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TaxCalculationRequest {
  base_amount: number;
  hotel_id: number;
  booking_date: Date;
  check_in_date: Date;
  check_out_date: Date;
  room_type_id: number;
  guests: number;
}

export interface TaxBreakdown {
  base_amount: number;
  taxes: Array<{
    name: string;
    type: 'percentage' | 'fixed' | 'per_night' | 'per_guest';
    amount: number;
    rate?: number;
    description: string;
    jurisdiction: string;
  }>;
  service_fees: Array<{
    name: string;
    type: 'percentage' | 'fixed' | 'per_night';
    amount: number;
    rate?: number;
    description: string;
  }>;
  total_taxes: number;
  total_fees: number;
  total_with_taxes: number;
  currency: string;
}

export class TaxCalculationService {
  async calculateTaxesAndFees(request: TaxCalculationRequest): Promise<TaxBreakdown> {
    const { base_amount, hotel_id, booking_date, check_in_date, check_out_date, room_type_id, guests } = request;
    
    // Get applicable taxes for the hotel
    const taxes = await this.getApplicableTaxes(hotel_id, booking_date);
    const fees = await this.getApplicableFees(hotel_id, booking_date);
    
    const nights = Math.ceil((check_out_date.getTime() - check_in_date.getTime()) / (1000 * 60 * 60 * 24));
    
    const taxBreakdown = taxes.map(tax => {
      let amount = 0;
      
      // Simplified - only percentage taxes supported based on schema
      amount = base_amount * (Number(tax.percentage) / 100);
      
      return {
        name: tax.name,
        type: 'percentage' as const,
        amount,
        rate: Number(tax.percentage),
        description: `${tax.name} - ${Number(tax.percentage)}%`,
        jurisdiction: 'US'
      };
    });
    
    const feeBreakdown = fees.map(fee => {
      let amount = 0;
      
      // Simplified fee calculation based on schema
      if (fee.amount_type === 'PERCENTAGE') {
        amount = base_amount * (Number(fee.amount) / 100);
      } else {
        amount = Number(fee.amount);
      }
      
      return {
        name: fee.fee_type,
        type: fee.amount_type.toLowerCase() as 'percentage' | 'fixed' | 'per_night',
        amount,
        rate: fee.amount_type === 'PERCENTAGE' ? Number(fee.amount) : undefined,
        description: `${fee.fee_type} fee`
      } as {
        name: string;
        type: 'percentage' | 'fixed' | 'per_night';
        amount: number;
        rate?: number;
        description: string;
      };
    });
    
    const totalTaxes = taxBreakdown.reduce((sum, tax) => sum + tax.amount, 0);
    const totalFees = feeBreakdown.reduce((sum, fee) => sum + fee.amount, 0);
    
    return {
      base_amount,
      taxes: taxBreakdown,
      service_fees: feeBreakdown,
      total_taxes: totalTaxes,
      total_fees: totalFees,
      total_with_taxes: base_amount + totalTaxes + totalFees,
      currency: 'USD'
    };
  }
  
  private async getApplicableTaxes(hotel_id: number, booking_date: Date) {
    return await prisma.tax.findMany({
      where: {
        is_active: true
      }
    });
  }
  
  private async getApplicableFees(hotel_id: number, booking_date: Date) {
    return await prisma.fee.findMany({
      where: {
        is_active: true
      }
    });
  }
  
  async createDefaultTaxesAndFees(hotel_id: number) {
    // Create default taxes
    const defaultTaxes = [
      {
        country_id: 1, // Assuming US country ID
        name: 'Room Tax',
        percentage: 10.00,
        is_inclusive: false,
        is_active: true
      },
      {
        country_id: 1,
        name: 'Service Tax',
        percentage: 5.00,
        is_inclusive: false,
        is_active: true
      }
    ];
    
    // Create default fees
    const defaultFees = [
      {
        fee_type: 'SERVICE',
        amount_type: 'PERCENTAGE',
        amount: 5.00,
        is_active: true
      },
      {
        fee_type: 'CLEANING',
        amount_type: 'FIXED',
        amount: 25.00,
        is_active: true
      },
      {
        fee_type: 'RESORT',
        amount_type: 'PER_NIGHT',
        amount: 15.00,
        is_active: true
      }
    ];
    
    await prisma.tax.createMany({ data: defaultTaxes });
    await prisma.fee.createMany({ data: defaultFees });
  }
  
  async generateTaxInvoice(booking_id: number): Promise<any> {
    const booking = await prisma.booking.findUnique({
      where: { id: booking_id },
      include: {
        hotel: true,
        room_type: true,
        booking_taxes: true
      }
    });
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    return {
      invoice_number: `INV-${booking.id}-${Date.now()}`,
      booking_id: booking.id,
      hotel_name: booking.hotel?.name,
      guest_name: 'Guest',
      issue_date: new Date(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      base_amount: Number(booking.total_amount),
      taxes: booking.booking_taxes.map((tax: any) => ({
        name: tax.name,
        amount: Number(tax.amount),
        rate: tax.rate
      })),
      total_amount: Number(booking.total_amount),
      currency: 'USD'
    };
  }
}
