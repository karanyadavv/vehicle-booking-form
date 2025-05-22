// src/components/BookingForm.tsx
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
  // form data
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [wheels, setWheels] = useState<'2' | '4'>('2');
  const [typeId, setTypeId] = useState<string>('');
  const [vehicleId, setVehicleId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // fetched data
  const [types, setTypes] = useState<VehicleCategory[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // ui state
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    setTypeId('');
    setVehicleId('');
    setTypes([]);
    setVehicles([]);

    api.get<VehicleCategory[]>(`/vehicle-types?wheels=${wheels}`)
      .then(res => setTypes(res.data))
      .catch(() => setError('Could not load vehicle types'));
  }, [wheels]);

  useEffect(() => {
    if (!typeId) {
      setVehicles([]);
      setVehicleId('');
      return;
    }
    api.get<Vehicle[]>(`/vehicles?categoryId=${typeId}`)
      .then(res => setVehicles(res.data))
      .catch(() => setError('Could not load vehicle models'));
  }, [typeId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      await api.post('/book', {
        firstName,
        lastName,
        vehicleId,
        startDate: formatISO(startDate, { representation: 'date' }),
        endDate: formatISO(endDate, { representation: 'date' }),
      });
      setSuccess('Booking successful!');
      // clear everything except wheels for smoother UX
      setFirstName('');
      setLastName('');
      setTypeId('');
      setVehicleId('');
      setVehicles([]);
      setStartDate(null);
      setEndDate(null);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Booking failed';
      setError(typeof msg === 'string' ? msg : 'Validation error');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Book a Vehicle</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* 1. Name */}
        <FormControl fullWidth>
          <FormLabel>What is your name?</FormLabel>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              fullWidth
            />
          </Box>
        </FormControl>

        {/* 2. Wheels */}
        <FormControl>
          <FormLabel>Number of wheels</FormLabel>
          <RadioGroup
            row
            value={wheels}
            onChange={(e) => setWheels(e.target.value as '2' | '4')}
          >
            <FormControlLabel value="2" control={<Radio />} label="2" />
            <FormControlLabel value="4" control={<Radio />} label="4" />
          </RadioGroup>
        </FormControl>

        {/* 3. Vehicle type (filtered by wheels) */}
        {types.length > 0 && (
          <FormControl>
            <FormLabel>Type of vehicle</FormLabel>
            <RadioGroup
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
            >
              {types.map(t => (
                <FormControlLabel
                  key={t.id}
                  value={t.id}
                  control={<Radio />}
                  label={t.name}
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}

        {/* 4. Specific model (filtered by type) */}
        {vehicles.length > 0 && (
          <FormControl>
            <FormLabel>Specific model</FormLabel>
            <RadioGroup
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            >
              {vehicles.map(v => (
                <FormControlLabel
                  key={v.id}
                  value={v.id}
                  control={<Radio />}
                  label={v.name}
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}

        {/* 5. Date range */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <DatePicker
              enableAccessibleFieldDOMStructure={false}
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              disablePast
              slots={{ textField: TextField }}
              slotProps={{ textField: { fullWidth: true, label: 'Start Date', required: true } }}
            />
            <DatePicker
              enableAccessibleFieldDOMStructure={false}
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              disablePast
              minDate={startDate || undefined}
              slots={{ textField: TextField }}
              slotProps={{ textField: { fullWidth: true, label: 'End Date', required: true } }}
            />
          </Box>
        </LocalizationProvider>

        <Button
          type="submit"
          variant="contained"
          disabled={!vehicleId || !startDate || !endDate}
        >
          Book
        </Button>
      </Box>
    </Container>
  );
}
