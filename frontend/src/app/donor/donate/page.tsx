'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  CircularProgress,
} from '@mui/material';
// TODO: Install @mui/x-date-pickers dependencies for date picker
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { VolunteerActivism as DonateIcon } from '@mui/icons-material';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface DonationOfferForm {
  bloodType: string;
  preferredDate: string;
  location: string;
  notes: string;
}

export default function DonatePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<DonationOfferForm>({
    bloodType: 'A+', // TODO: Get from user profile
    preferredDate: '',
    location: '',
    notes: '',
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/donations/offers', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({
      //     bloodType: formData.bloodType,
      //     preferredDate: formData.preferredDate?.toISOString(),
      //     location: formData.location,
      //     notes: formData.notes,
      //   }),
      // });

      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock success response
      
      setSuccess(true);

      // Reset form
      setFormData({
        bloodType: 'A+',
        preferredDate: '',
        location: '',
        notes: '',
      });

    } catch (err: any) {
      setError(err.message || 'Failed to submit donation offer');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <ProtectedRoute requiredRole="donor">
      <Box sx={{ bgcolor: '#F8F9FA', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="md">
            <Box display="flex" alignItems="center" mb={4}>
              <DonateIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h3" component="h1" fontWeight="bold" color="primary.main">
                  Donate Blood
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Schedule your blood donation and help save lives
                </Typography>
              </Box>
            </Box>

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Your donation offer has been submitted successfully! A nearby hospital will be in touch soon.
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Card>
              <CardContent sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Blood Type</InputLabel>
                        <Select
                          name="bloodType"
                          value={formData.bloodType}
                          onChange={(e) => handleChange(e as any)}
                          label="Blood Type"
                        >
                          {bloodTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="Preferred Date & Time"
                        name="preferredDate"
                        type="datetime-local"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                          min: new Date().toISOString().slice(0, 16),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        name="location"
                        label="Preferred Location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., London, Manchester, Birmingham"
                        helperText="Enter your city or area preference"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        name="notes"
                        label="Additional Notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Any special requirements or medical information..."
                        helperText="Optional: Include any relevant medical history or special requirements"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ mt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={loading || !formData.preferredDate || !formData.location}
                          startIcon={loading ? <CircularProgress size={20} /> : <DonateIcon />}
                          sx={{ px: 4, py: 1.5 }}
                        >
                          {loading ? 'Submitting...' : 'Submit Donation Offer'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  What happens next?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  1. Your offer will be routed to a nearby hospital based on your location and their blood needs
                  <br />
                  2. The hospital will review your offer and may contact you to confirm an appointment
                  <br />
                  3. You'll receive a confirmation with the final appointment details
                  <br />
                  4. Visit the hospital at your scheduled time to donate
                </Typography>
              </CardContent>
            </Card>
          </Container>
        </Box>
    </ProtectedRoute>
  );
}