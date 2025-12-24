import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // ---------------- PHASE 1: Core Tables ----------------
  // Example: Roles
  const roles = ["ADMIN", "STAFF", "CUSTOMER"];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }

  // Example: Admin user
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      password_hash: adminPassword,
      role: { connect: { name: "ADMIN" } },
    },
  });

  // Example: Hotels
  const hotel1 = await prisma.hotel.upsert({
    where: { slug: "grand-palace" },
    update: {},
    create: {
      name: "Grand Palace",
      slug: "grand-palace",
      description: "Luxury hotel",
      owner_id: 1, // Using the admin user created above
    },
  });

  const hotel2 = await prisma.hotel.upsert({
    where: { slug: "seaside-resort" },
    update: {},
    create: {
      name: "Seaside Resort",
      slug: "seaside-resort",
      description: "Beachfront resort",
      owner_id: 1, // Using the admin user created above
    },
  });

  // Room Types (need to create these first since rooms reference them)
  const roomType1 = await prisma.roomType.upsert({
    where: { id: 1 },
    update: {},
    create: {
      hotel_id: hotel1.id,
      name: "Suite 101",
      description: "Luxury suite",
      max_guests: 2,
      base_price: 250.00,
    },
  });

  const roomType2 = await prisma.roomType.upsert({
    where: { id: 2 },
    update: {},
    create: {
      hotel_id: hotel2.id,
      name: "Deluxe 201",
      description: "Deluxe room",
      max_guests: 3,
      base_price: 180.00,
    },
  });

  // Rooms
  const room1 = await prisma.room.upsert({
    where: { id: 1 },
    update: {},
    create: { 
      room_type_id: roomType1.id, 
      room_number: "101", 
      floor: 1 
    },
  });

  const room2 = await prisma.room.upsert({
    where: { id: 2 },
    update: {},
    create: { 
      room_type_id: roomType2.id, 
      room_number: "201", 
      floor: 2 
    },
  });

  // ---------------- PHASE 2: Dependent Tables ----------------
  // Example: Customers
  const customerPassword = await bcrypt.hash("Customer123!", 10);
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "customer@example.com",
      password_hash: customerPassword,
      role: { connect: { name: "CUSTOMER" } },
    },
  });

  // Bookings
  await prisma.booking.upsert({
    where: { id: 1 },
    update: {},
    create: {
      user_id: customer.id,
      hotel_id: hotel1.id,
      room_type_id: roomType1.id,
      check_in: new Date("2025-12-20"),
      check_out: new Date("2025-12-25"),
      total_amount: 1250.00,
      status: "confirmed",
    },
  });

  // Reviews
  await prisma.review.upsert({
    where: { id: 1 },
    update: {},
    create: {
      user_id: customer.id,
      hotel_id: hotel1.id,
      rating: 5,
      comment: "Amazing stay!",
    },
  });

  // ---------------- PHASE 3: Location Data ----------------
  // Countries
  const countries = await Promise.all([
    prisma.country.upsert({
      where: { id: 1 },
      update: {},
      create: { name: "United States" }
    }),
    prisma.country.upsert({
      where: { id: 2 },
      update: {},
      create: { name: "India" }
    })
  ]);

  // States
  const states = await Promise.all([
    prisma.state.upsert({
      where: { id: 1 },
      update: {},
      create: { name: "California", country_id: countries[0].id }
    }),
    prisma.state.upsert({
      where: { id: 2 },
      update: {},
      create: { name: "New York", country_id: countries[0].id }
    }),
    prisma.state.upsert({
      where: { id: 3 },
      update: {},
      create: { name: "Maharashtra", country_id: countries[1].id }
    })
  ]);

  // Cities
  const cities = await Promise.all([
    prisma.city.upsert({
      where: { id: 1 },
      update: {},
      create: { name: "Los Angeles", state_id: states[0].id }
    }),
    prisma.city.upsert({
      where: { id: 2 },
      update: {},
      create: { name: "San Francisco", state_id: states[0].id }
    }),
    prisma.city.upsert({
      where: { id: 3 },
      update: {},
      create: { name: "New York City", state_id: states[1].id }
    }),
    prisma.city.upsert({
      where: { id: 4 },
      update: {},
      create: { name: "Mumbai", state_id: states[2].id }
    })
  ]);

  // ---------------- PHASE 4: Other Tables ----------------
  // Repeat upsert logic for remaining tables (52 total)
  // Use: await prisma.tableName.upsert({ where: {...}, update: {}, create: {...} });

  console.log("All tables seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
