import { z } from 'zod';

export const bookingSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  vehicleId: z.string().uuid(),
  startDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid start date"
  }),
  endDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid end date"
  }),
});
