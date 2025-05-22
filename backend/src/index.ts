import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { bookingSchema } from "./utils/validation";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Get vehicle types by wheels
app.get('/api/vehicle-types', async (req, res) => {
  const wheels = parseInt(req.query.wheels as string);
  const types = await prisma.vehicleCategory.findMany({ where: { wheels } });
  res.json(types);
});

// Get vehicles by category
app.get('/api/vehicles', async (req, res) => {
  const categoryId = req.query.categoryId as string;
  const vehicles = await prisma.vehicle.findMany({ where: { categoryId } });
  res.json(vehicles);
});

// Booking endpoint
app.post('/api/book', async (req, res): Promise<any> => {
  const result = bookingSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.format() });
  }

  const { vehicleId, startDate, endDate, firstName, lastName } = req.body;

  const overlapping = await prisma.booking.findFirst({
    where: {
      vehicleId,
      OR: [
        {
          startDate: { lte: new Date(endDate) },
          endDate: { gte: new Date(startDate) }
        }
      ]
    }
  });

  if (overlapping) {
    return res.status(409).json({ error: 'Vehicle already booked for this range' });
  }

  const booking = await prisma.booking.create({
    data: { 
      vehicleId, 
      startDate: new Date(startDate), 
      endDate: new Date(endDate), 
      firstName, 
      lastName 
    }
  });

  res.status(201).json(booking);
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
