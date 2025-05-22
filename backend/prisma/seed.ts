import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const hatchback = await prisma.vehicleCategory.create({
    data: {
      name: "Hatchback",
      wheels: 4,
      vehicles: {
        create: [
          { model: "Swift" },
          { model: "i20" }
        ]
      }
    }
  });

  const cruiser = await prisma.vehicleCategory.create({
    data: {
      name: 'Cruiser',
      wheels: 2,
      vehicles: {
        create: [
          { model: 'Royal Enfield' },
          { model: 'Avenger' }
        ]
      }
    }
  });
}

seed()
  .then(async () => {
    console.log('✅ Seeding completed!');
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })