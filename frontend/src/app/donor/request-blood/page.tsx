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
import { BloodtypeOutlined as BloodIcon } from '@mui/icons-material';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface BloodRequestForm {
  bloodType: string;
  units: number;
  reason: string;
  preferredHospitalId?: number;
}

export default function RequestBloodPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<BloodRequestForm>({
    bloodType: 'A+',
    units: 1,
    reason: '',
    preferredHospitalId: undefined,
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Mock hospitals - in real app, fetch from API
  const hospitals = [
    { id: 1, name: 'Royal London Hospital' },
    { id: 2, name: 'St Bartholomew\'s Hospital' },
    { id: 3, name: 'King\'s College Hospital' },
    { id: 4, name: 'University College Hospital' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/requests/donor/request-blood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bloodType: formData.bloodType,
          units: formData.units,
          reason: formData.reason,
          preferredHospitalId: formData.preferredHospitalId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Only donors with at least one prior donation may request blood.');
        }
        throw new Error(data.message || 'Failed to submit blood request');
      }

      setSuccess(true);

      // Reset form
      setFormData({
        bloodType: 'A+',
        units: 1,
        reason: '',
        preferredHospitalId: undefined,
      });

    } catch (err: any) {
      setError(err.message || 'Failed to submit blood request');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'units' || name === 'preferredHospitalId' ? Number(value) : value
    }));
  };

  return (
    <ProtectedRoute requiredRole="donor">
      <Box sx={{ bgcolor: '#F8F9FA', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="md">
            <Box display="flex" alignItems="center" mb={4}>
              <BloodIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h3" component="h1" fontWeight="bold" color="primary.main">
                  Request Blood
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Submit a blood request for medical needs
                </Typography>
              </Box>
            </Box>

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Your blood request has been submitted successfully! We will prioritize your request and notify you once blood becomes available.
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
                        type="number"
                        label="Units Needed"
                        name="units"
                        value={formData.units}
                        onChange={handleChange}
                        inputProps={{ min: 1, max: 10 }}
                        helperText="Number of blood units needed"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Preferred Hospital (Optional)</InputLabel>
                        <Select
                          name="preferredHospitalId"
                          value={formData.preferredHospitalId || ''}
                          onChange={(e) => handleChange(e as any)}
                          label="Preferred Hospital (Optional)"
                        >
                          <MenuItem value="">
                            <em>No preference</em>
                          </MenuItem>
                          {hospitals.map((hospital) => (
                            <MenuItem key={hospital.id} value={hospital.id}>
                              {hospital.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        name="reason"
                        label="Reason for Request (Optional)"
                        value={formData.reason}
                        onChange={handleChange}
                        placeholder="Brief description of medical condition or urgency..."
                        helperText="Optional: Provide context for your blood request"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ mt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} /> : <BloodIcon />}
                          sx={{ px: 4, py: 1.5 }}
                        >
                          {loading ? 'Submitting...' : 'Submit Blood Request'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary.main">
                  Important Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Eligibility:</strong> Only donors with at least one completed donation can request blood through this system.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Priority:</strong> Requests from donors are given high priority in our allocation system as a benefit for your contributions to the blood bank.
                </Typography>
              </CardContent>
            </Card>
          </Container>
        </Box>
    </ProtectedRoute>
  );
}