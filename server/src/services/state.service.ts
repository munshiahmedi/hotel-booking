import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StateService {
  async getAllStates() {
    return await prisma.state.findMany({
      include: {
        country: {
          select: {
            id: true,
            name: true
          }
        },
        cities: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            cities: true,
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

  async getStateById(id: number) {
    const state = await prisma.state.findUnique({
      where: { id },
      include: {
        country: true,
        cities: {
          orderBy: {
            name: 'asc'
          }
        },
        _count: {
          select: {
            cities: true,
            user_addresses: true,
            hotel_addresses: true
          }
        }
      }
    });

    if (!state) {
      throw new Error('State not found');
    }

    return state;
  }

  async getStatesByCountry(countryId: number) {
    return await prisma.state.findMany({
      where: { country_id: countryId },
      include: {
        country: {
          select: {
            id: true,
            name: true
          }
        },
        cities: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            cities: true,
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

  async createState(data: {
    country_id: number;
    name: string;
  }) {
    // Verify country exists
    const country = await prisma.country.findUnique({
      where: { id: data.country_id }
    });

    if (!country) {
      throw new Error('Country not found');
    }

    if (!data.name.trim()) {
      throw new Error('State name is required');
    }

    // Check if state already exists in this country
    const existingState = await prisma.state.findFirst({
      where: {
        country_id: data.country_id,
        name: data.name.trim()
      }
    });

    if (existingState) {
      throw new Error('State with this name already exists in this country');
    }

    return await prisma.state.create({
      data: {
        country_id: data.country_id,
        name: data.name.trim()
      },
      include: {
        country: {
          select: {
            id: true,
            name: true
          }
        },
        cities: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            cities: true,
            user_addresses: true,
            hotel_addresses: true
          }
        }
      }
    });
  }

  async updateState(id: number, data: {
    name?: string;
    country_id?: number;
  }) {
    // Check if state exists
    const existingState = await prisma.state.findUnique({
      where: { id }
    });

    if (!existingState) {
      throw new Error('State not found');
    }

    const updateData: any = {};

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        throw new Error('State name cannot be empty');
      }
      
      // Check if name already exists in the same country (or new country)
      const countryId = data.country_id || existingState.country_id;
      const nameExists = await prisma.state.findFirst({
        where: {
          country_id: countryId,
          name: data.name.trim(),
          id: { not: id }
        }
      });

      if (nameExists) {
        throw new Error('State with this name already exists in this country');
      }

      updateData.name = data.name.trim();
    }

    if (data.country_id !== undefined) {
      // Verify new country exists
      const country = await prisma.country.findUnique({
        where: { id: data.country_id }
      });

      if (!country) {
        throw new Error('Country not found');
      }

      // Check if state name already exists in new country
      if (data.name) {
        const nameExists = await prisma.state.findFirst({
          where: {
            country_id: data.country_id,
            name: data.name.trim(),
            id: { not: id }
          }
        });

        if (nameExists) {
          throw new Error('State with this name already exists in this country');
        }
      } else {
        // Check if current state name already exists in new country
        const nameExists = await prisma.state.findFirst({
          where: {
            country_id: data.country_id,
            name: existingState.name,
            id: { not: id }
          }
        });

        if (nameExists) {
          throw new Error('State with this name already exists in this country');
        }
      }

      updateData.country_id = data.country_id;
    }

    return await prisma.state.update({
      where: { id },
      data: updateData,
      include: {
        country: {
          select: {
            id: true,
            name: true
          }
        },
        cities: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            cities: true,
            user_addresses: true,
            hotel_addresses: true
          }
        }
      }
    });
  }

  async deleteState(id: number) {
    // Check if state exists
    const existingState = await prisma.state.findUnique({
      where: { id },
      include: {
        cities: true
      }
    });

    if (!existingState) {
      throw new Error('State not found');
    }

    // Check if state has cities
    if (existingState.cities.length > 0) {
      throw new Error('Cannot delete state that has cities');
    }

    await prisma.state.delete({
      where: { id }
    });

    return { message: 'State deleted successfully' };
  }

  async searchStates(query: string) {
    if (!query.trim()) {
      throw new Error('Search query is required');
    }

    return await prisma.state.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query.trim()
            }
          },
          {
            country: {
              name: {
                contains: query.trim()
              }
            }
          }
        ]
      },
      include: {
        country: {
          select: {
            id: true,
            name: true
          }
        },
        cities: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            cities: true,
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

  async getStateStats() {
    const [total, stateWithMostCities] = await Promise.all([
      prisma.state.count(),
      prisma.state.findMany({
        include: {
          _count: {
            select: {
              cities: true
            }
          }
        },
        orderBy: {
          cities: {
            _count: 'desc'
          }
        },
        take: 1
      })
    ]);

    return {
      total_states: total,
      state_with_most_cities: stateWithMostCities[0] || null
    };
  }

  async getStatesWithCities() {
    return await prisma.state.findMany({
      where: {
        cities: {
          some: {}
        }
      },
      include: {
        country: {
          select: {
            id: true,
            name: true
          }
        },
        cities: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            cities: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }
}
