import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserAddressService {
  async getUserAddresses(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [addresses, total] = await Promise.all([
      prisma.userAddress.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        include: {
          country: true,
          state: true,
          city: true
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.userAddress.count({
        where: { user_id: userId }
      })
    ]);

    return {
      addresses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getAddressById(id: number) {
    const address = await prisma.userAddress.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        country: true,
        state: true,
        city: true
      }
    });

    if (!address) {
      throw new Error('Address not found');
    }

    return address;
  }

  async createAddress(addressData: {
    user_id: number;
    country_id: number;
    state_id: number;
    city_id: number;
    line1: string;
    zipcode: string;
  }) {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: addressData.user_id }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify location data exists
    const [country, state, city] = await Promise.all([
      prisma.country.findUnique({ where: { id: addressData.country_id } }),
      prisma.state.findUnique({ where: { id: addressData.state_id } }),
      prisma.city.findUnique({ where: { id: addressData.city_id } })
    ]);

    if (!country || !state || !city) {
      throw new Error('Invalid location data provided');
    }

    const address = await prisma.userAddress.create({
      data: addressData,
      include: {
        country: true,
        state: true,
        city: true
      }
    });

    return address;
  }

  async updateAddress(id: number, updateData: {
    country_id?: number;
    state_id?: number;
    city_id?: number;
    line1?: string;
    zipcode?: string;
  }) {
    // If updating location, verify new location data exists
    if (updateData.country_id || updateData.state_id || updateData.city_id) {
      const currentAddress = await prisma.userAddress.findUnique({
        where: { id }
      });

      if (!currentAddress) {
        throw new Error('Address not found');
      }

      const countryId = updateData.country_id || currentAddress.country_id;
      const stateId = updateData.state_id || currentAddress.state_id;
      const cityId = updateData.city_id || currentAddress.city_id;

      const [country, state, city] = await Promise.all([
        prisma.country.findUnique({ where: { id: countryId } }),
        prisma.state.findUnique({ where: { id: stateId } }),
        prisma.city.findUnique({ where: { id: cityId } })
      ]);

      if (!country || !state || !city) {
        throw new Error('Invalid location data provided');
      }
    }

    const address = await prisma.userAddress.update({
      where: { id },
      data: updateData,
      include: {
        country: true,
        state: true,
        city: true
      }
    });

    return address;
  }

  async deleteAddress(id: number) {
    await prisma.userAddress.delete({
      where: { id }
    });

    return { message: 'Address deleted successfully' };
  }

  async getAllAddresses(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [addresses, total] = await Promise.all([
      prisma.userAddress.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          country: true,
          state: true,
          city: true
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.userAddress.count()
    ]);

    return {
      addresses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}
