import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CountryService {
  async getAllCountries() {
    return await prisma.country.findMany({
      include: {
        states: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            states: true,
            user_addresses: true,
            hotel_addresses: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  async getCountryById(id: number) {
    const country = await prisma.country.findUnique({
      where: { id },
      include: {
        states: {
          include: {
            cities: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        },
        _count: {
          select: {
            states: true,
            user_addresses: true,
            hotel_addresses: true
          }
        }
      }
    });

    if (!country) {
      throw new Error('Country not found');
    }

    return country;
  }

  async createCountry(data: {
    name: string;
  }) {
    if (!data.name.trim()) {
      throw new Error('Country name is required');
    }

    // Check if country already exists
    const existingCountry = await prisma.country.findUnique({
      where: { name: data.name.trim() }
    });

    if (existingCountry) {
      throw new Error('Country with this name already exists');
    }

    return await prisma.country.create({
      data: {
        name: data.name.trim()
      },
      include: {
        states: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            states: true,
            user_addresses: true,
            hotel_addresses: true
          }
        }
      }
    });
  }

  async updateCountry(id: number, data: {
    name?: string;
  }) {
    // Check if country exists
    const existingCountry = await prisma.country.findUnique({
      where: { id }
    });

    if (!existingCountry) {
      throw new Error('Country not found');
    }

    // Check if name is being updated and if it already exists
    if (data.name && data.name !== existingCountry.name) {
      const nameExists = await prisma.country.findUnique({
        where: { name: data.name }
      });

      if (nameExists) {
        throw new Error('Country with this name already exists');
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) {
      if (!data.name.trim()) {
        throw new Error('Country name cannot be empty');
      }
      updateData.name = data.name.trim();
    }

    return await prisma.country.update({
      where: { id },
      data: updateData,
      include: {
        states: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            states: true,
            user_addresses: true,
            hotel_addresses: true
          }
        }
      }
    });
  }

  async deleteCountry(id: number) {
    // Check if country exists
    const existingCountry = await prisma.country.findUnique({
      where: { id },
      include: {
        states: true
      }
    });

    if (!existingCountry) {
      throw new Error('Country not found');
    }

    // Check if country has states
    if (existingCountry.states.length > 0) {
      throw new Error('Cannot delete country that has states');
    }

    await prisma.country.delete({
      where: { id }
    });

    return { message: 'Country deleted successfully' };
  }

  async searchCountries(query: string) {
    if (!query.trim()) {
      throw new Error('Search query is required');
    }

    return await prisma.country.findMany({
      where: {
        name: {
          contains: query.trim()
        }
      },
      include: {
        states: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            states: true,
            user_addresses: true,
            hotel_addresses: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  async getCountryStats() {
    const [total, countryWithMostStates] = await Promise.all([
      prisma.country.count(),
      prisma.country.findMany({
        include: {
          _count: {
            select: {
              states: true
            }
          }
        },
        orderBy: {
          states: {
            _count: 'desc'
          }
        },
        take: 1
      })
    ]);

    return {
      total_countries: total,
      country_with_most_states: countryWithMostStates[0] || null
    };
  }

  async getCountriesWithStates() {
    return await prisma.country.findMany({
      where: {
        states: {
          some: {}
        }
      },
      include: {
        states: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            states: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }
}
