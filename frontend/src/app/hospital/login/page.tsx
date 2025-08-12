'use client';

import { useState, useEffect } from 'react';
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
  LocalHospital as HospitalIcon 
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

export default function HospitalLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();

  // Handle authentication state and redirect logic
  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated && user) {
      // If authenticated as hospital, go to hospital dashboard
      if (user.role === 'hospital') {
        router.push('/hospital/dashboard');
      } else {
        // If authenticated with a different role, clear auth to allow hospital login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Reload the page to reset auth state
        window.location.reload();
      }
    }
  }, [isAuthenticated, user, router]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await login(email, password);
      
      // Get user from localStorage to verify role
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        
        // Verify user is a hospital
        if (user.role === 'hospital') {
          router.push('/hospital/dashboard');
        } else {
          // If not a hospital user, show error and logout
          setError('This login page is for hospital users only. Please use the correct login page for your account type.');
          // Clear authentication
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Hospital login failed. Please try again.';
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
                <HospitalIcon sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  Hospital Login
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Access your hospital blood bank portal
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

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Hospital Email Address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    variant="outlined"
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
                    {isSubmitting ? 'Signing in...' : 'Sign In to Hospital Portal'}
                  </Button>

                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      or
                    </Typography>
                  </Divider>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Don&apos;t have a hospital account?
                    </Typography>
                    <Button
                      component={Link}
                      href="/hospital/signup"
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
                      Register Hospital Account
                    </Button>
                  </Box>

                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Are you a donor or NHS Blood Manager?{' '}
                      <Typography
                        component={Link}
                        href="/login"
                        variant="body2"
                        color="primary"
                        sx={{ 
                          textDecoration: 'none',
                          fontWeight: 500,
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        Use General Login
                      </Typography>
                    </Typography>
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