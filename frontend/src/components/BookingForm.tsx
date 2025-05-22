import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import api from '../api/api';
import {
  Container, Typography, Box, TextField, Radio, RadioGroup, FormControlLabel,
  FormControl, FormLabel, Button, Alert
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { formatISO } from 'date-fns';

// Define vehicle category and vehicle interfaces
interface VehicleCategory {
  id: string;
  name: string;
  wheels: number;
}

interface Vehicle {
  id: string;
  name: string;
  categoryId: string;
}

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [wheels, setWheels] = useState<'2' | '4' | ''>('');
  const [typeId, setTypeId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [types, setTypes] = useState<VehicleCategory[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch vehicle types when wheels selection changes
  useEffect(() => {
    if (wheels) {
      api.get<VehicleCategory[]>(`/vehicle-types?wheels=${wheels}`)
        .then(res => setTypes(res.data))
        .catch(() => setError('Could not load vehicle types'));
    }
  }, [wheels]);

  // Fetch specific vehicle models when a vehicle type is selected
  useEffect(() => {
    if (typeId) {
      api.get<Vehicle[]>(`/vehicles?categoryId=${typeId}`)
        .then(res => setVehicles(res.data))
        .catch(() => setError('Could not load vehicle models'));
    }
  }, [typeId]);

  // Go to next step
  const next = () => setStep(s => s + 1);
  // Go to previous step
  const prev = () => setStep(s => s - 1);

  // Final form submission
  const handleSubmit = async () => {
    try {
      await api.post('/book', {
        firstName,
        lastName,
        vehicleId,
        startDate: formatISO(startDate!, { representation: 'date' }),
        endDate: formatISO(endDate!, { representation: 'date' })
      });
      setSuccess('Booking successful!');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Booking failed';
      setError(typeof msg === 'string' ? msg : 'Validation error');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Book a Vehicle</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      {/* Step 1: First name and Last name */}
      {step === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required fullWidth />
          <TextField label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required fullWidth />
          <Button variant="contained" onClick={() => firstName && lastName ? next() : setError('Please fill both names')}>Next</Button>
        </Box>
      )}

      {/* Step 2: Select number of wheels */}
      {step === 2 && (
        <Box>
          <FormLabel>Number of wheels</FormLabel>
          <RadioGroup value={wheels} onChange={e => setWheels(e.target.value as '2' | '4')}>
            <FormControlLabel value="2" control={<Radio />} label="2-wheeler" />
            <FormControlLabel value="4" control={<Radio />} label="4-wheeler" />
          </RadioGroup>
          <Button variant="contained" onClick={() => wheels ? next() : setError('Please select wheels')}>Next</Button>
          <Button onClick={prev}>Back</Button>
        </Box>
      )}

      {/* Step 3: Select vehicle type */}
      {step === 3 && (
        <Box>
          <FormLabel>Type of vehicle</FormLabel>
          <RadioGroup value={typeId} onChange={e => setTypeId(e.target.value)}>
            {types.map(t => <FormControlLabel key={t.id} value={t.id} control={<Radio />} label={t.name} />)}
          </RadioGroup>
          <Button variant="contained" onClick={() => typeId ? next() : setError('Select a vehicle type')}>Next</Button>
          <Button onClick={prev}>Back</Button>
        </Box>
      )}

      {/* Step 4: Select specific vehicle model */}
      {step === 4 && (
        <Box>
          <FormLabel>Specific model</FormLabel>
          <RadioGroup value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
            {vehicles.map(v => <FormControlLabel key={v.id} value={v.id} control={<Radio />} label={v.name} />)}
          </RadioGroup>
          <Button variant="contained" onClick={() => vehicleId ? next() : setError('Select a vehicle model')}>Next</Button>
          <Button onClick={prev}>Back</Button>
        </Box>
      )}

      {/* Step 5: Select booking start and end dates */}
      {step === 5 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newDate) => setStartDate(newDate)}
              disablePast
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newDate) => setEndDate(newDate)}
              disablePast
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
          <Button variant="contained" onClick={() => (startDate && endDate) ? handleSubmit() : setError('Select both start and end date')}>Submit</Button>
          <Button onClick={prev}>Back</Button>
        </Box>
      )}
    </Container>
  );
}