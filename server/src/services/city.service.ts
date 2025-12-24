import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CityService {
  async getAllCities() {
    return await prisma.city.findMany({
      include: {
        state: {
          include: {
            country: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
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

  async getCityById(id: number) {
    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        state: {
          include: {
            country: true
          }
        },
        _count: {
          select: {
            user_addresses: true,
            hotel_addresses: true
          }
        }
      }
    });

    if (!city) {
      throw new Error('City not found');
    }

    return city;
  }

  async getCitiesByState(stateId: number) {
    return await prisma.city.findMany({
      where: { state_id: stateId },
      include: {
        state: {
          include: {
            country: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
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

  async getCitiesByCountry(countryId: number) {
    return await prisma.city.findMany({
      where: {
        state: {
          country_id: countryId
        }
      },
      include: {
        state: {
          include: {
            country: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
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

  async createCity(data: {
    state_id: number;
    name: string;
  }) {
    // Verify state exists
    const state = await prisma.state.findUnique({
      where: { id: data.state_id },
      include: {
        country: true
      }
    });

    if (!state) {
      throw new Error('State not found');
    }

    if (!data.name.trim()) {
      throw new Error('City name is required');
    }

    // Check if city already exists in this state
    const existingCity = await prisma.city.findFirst({
      where: {
        state_id: data.state_id,
        name: data.name.trim()
      }
    });

    if (existingCity) {
      throw new Error('City with this name already exists in this state');
    }

    return await prisma.city.create({
      data: {
        state_id: data.state_id,
        name: data.name.trim()
      },
      include: {
        state: {
          include: {
            country: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            user_addresses: true,
            hotel_addresses: true
          }
        }
      }
    });
  }

  async updateCity(id: number, data: {
    name?: string;
    state_id?: number;
  }) {
    // Check if city exists
    const existingCity = await prisma.city.findUnique({
      where: { id }
    });

    if (!existingCity) {
      throw new Error('City not found');
    }

    const updateData: any = {};

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        throw new Error('City name cannot be empty');
      }
      
      // Check if name already exists in the same state (or new state)
      const stateId = data.state_id || existingCity.state_id;
      const nameExists = await prisma.city.findFirst({
        where: {
          state_id: stateId,
          name: data.name.trim(),
          id: { not: id }
        }
      });

      if (nameExists) {
        throw new Error('City with this name already exists in this state');
      }

      updateData.name = data.name.trim();
    }

    if (data.state_id !== undefined) {
      // Verify new state exists
      const state = await prisma.state.findUnique({
        where: { id: data.state_id },
        include: {
          country: true
        }
      });

      if (!state) {
        throw new Error('State not found');
      }

      // Check if city name already exists in new state
      if (data.name) {
        const nameExists = await prisma.city.findFirst({
          where: {
            state_id: data.state_id,
            name: data.name.trim(),
            id: { not: id }
          }
        });

        if (nameExists) {
          throw new Error('City with this name already exists in this state');
        }
      } else {
        // Check if current city name already exists in new state
        const nameExists = await prisma.city.findFirst({
          where: {
            state_id: data.state_id,
            name: existingCity.name,
            id: { not: id }
          }
        });

        if (nameExists) {
          throw new Error('City with this name already exists in this state');
        }
      }

      updateData.state_id = data.state_id;
    }

    return await prisma.city.update({
      where: { id },
      data: updateData,
      include: {
        state: {
          include: {
            country: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            user_addresses: true,
            hotel_addresses: true
          }
        }
      }
    });
  }

  async deleteCity(id: number) {
    // Check if city exists
    const existingCity = await prisma.city.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            user_addresses: true,
            hotel_addresses: true
          }
        }
      }
    });

    if (!existingCity) {
      throw new Error('City not found');
    }

    // Check if city has addresses
    if (existingCity._count.user_addresses > 0 || existingCity._count.hotel_addresses > 0) {
      throw new Error('Cannot delete city that has associated addresses');
    }

    await prisma.city.delete({
      where: { id }
    });

    return { message: 'City deleted successfully' };
  }

  async searchCities(query: string) {
    if (!query.trim()) {
      throw new Error('Search query is required');
    }

    return await prisma.city.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query.trim()
            }
          },
          {
            state: {
              name: {
                contains: query.trim()
              }
            }
          },
          {
            state: {
              country: {
                name: {
                  contains: query.trim()
                }
              }
            }
          }
        ]
      },
      include: {
        state: {
          include: {
            country: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
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

  async getCityStats() {
    const [total, cityWithMostAddresses] = await Promise.all([
      prisma.city.count(),
      prisma.city.findMany({
        include: {
          _count: {
            select: {
              user_addresses: true,
              hotel_addresses: true
            }
          }
        },
        orderBy: {
          user_addresses: {
            _count: 'desc'
          }
        },
        take: 1
      })
    ]);

    return {
      total_cities: total,
      city_with_most_addresses: cityWithMostAddresses[0] || null
    };
  }

  async getCitiesWithAddresses() {
    return await prisma.city.findMany({
      where: {
        OR: [
          {
            user_addresses: {
              some: {}
            }
          },
          {
            hotel_addresses: {
              some: {}
            }
          }
        ]
      },
      include: {
        state: {
          include: {
            country: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
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

  async getTopCitiesByAddresses(limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    return await prisma.city.findMany({
      include: {
        state: {
          include: {
            country: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            user_addresses: true,
            hotel_addresses: true
          }
        }
      },
      orderBy: {
        user_addresses: {
          _count: 'desc'
        }
      },
      take: limit
    });
  }
}
