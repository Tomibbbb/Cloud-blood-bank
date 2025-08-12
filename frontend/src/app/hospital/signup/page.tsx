'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LocalHospital,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useEffect } from 'react';

interface HospitalSignupData {
  hospitalName: string;
  email: string;
  password: string;
  contactNumber: string;
}

export default function HospitalSignupPage() {
  const [formData, setFormData] = useState<HospitalSignupData>({
    hospitalName: '',
    email: '',
    password: '',
    contactNumber: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/hospital/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.hospitalName || !formData.email || !formData.password || !formData.contactNumber) {
      setError('All fields are required');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Prepare hospital registration data
      const hospitalData = {
        firstName: formData.hospitalName, // Using hospitalName as firstName for backend compatibility
        lastName: 'Hospital', // Default lastName for hospitals
        email: formData.email,
        password: formData.password,
        phone: formData.contactNumber,
        role: 'hospital',
        address: '', // Optional field
      };

      await register(hospitalData);
      
      // Redirect to hospital dashboard after successful registration
      router.push('/hospital/dashboard');
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Hospital registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if already authenticated (prevents flash)
  if (isAuthenticated) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Grid container spacing={0} justifyContent="center">
          <Grid item xs={12} sm={10} md={8}>
            <Card
              elevation={8}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #1565C0 0%, #003c8f 100%)',
                  color: 'white',
                  py: 4,
                  textAlign: 'center',
                }}
              >
                <LocalHospital sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  Hospital Registration
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Join our blood bank network today
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        color: 'error.main'
                      }
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="hospitalName"
                    label="Hospital Name"
                    name="hospitalName"
                    autoComplete="organization"
                    autoFocus
                    value={formData.hospitalName}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    variant="outlined"
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(21, 101, 192, 0.15)',
                        },
                      },
                    }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    variant="outlined"
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(21, 101, 192, 0.15)',
                        },
                      },
                    }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="contactNumber"
                    label="Contact Number"
                    name="contactNumber"
                    type="tel"
                    autoComplete="tel"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    variant="outlined"
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(21, 101, 192, 0.15)',
                        },
                      },
                    }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    variant="outlined"
                    helperText="Password must be at least 6 characters"
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(21, 101, 192, 0.15)',
                        },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      mt: 2,
                      mb: 3,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #1565C0 0%, #003c8f 100%)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #003c8f 0%, #1565C0 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(21, 101, 192, 0.3)',
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                        transform: 'none',
                      },
                    }}
                  >
                    {isSubmitting ? 'Creating Hospital Account...' : 'Create Hospital Account'}
                  </Button>

                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      or
                    </Typography>
                  </Divider>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Already have a hospital account?
                    </Typography>
                    <Button
                      component={Link}
                      href="/hospital/login"
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      sx={{
                        py: 1.2,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(21, 101, 192, 0.2)',
                        },
                      }}
                    >
                      Sign In to Hospital Account
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}