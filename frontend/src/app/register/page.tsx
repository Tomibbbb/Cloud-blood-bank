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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon,
  Person,
  LocalHospital,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'donor',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      
      // Redirect based on role after registration
      switch (formData.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'hospital':
          router.push('/hospital/requests');
          break;
        case 'donor':
          router.push('/donor/profile');
          break;
        default:
          router.push('/');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'donor':
        return <Person />;
      case 'hospital':
        return <LocalHospital />;
      case 'admin':
        return <AdminPanelSettings />;
      default:
        return <Person />;
    }
  };

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
      <Container maxWidth="md">
        <Grid container spacing={0} justifyContent="center">
          <Grid item xs={12} sm={10} md={8} lg={6}>
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
                  background: 'linear-gradient(135deg, #C62828 0%, #8e0000 100%)',
                  color: 'white',
                  py: 4,
                  textAlign: 'center',
                }}
              >
                <PersonAddIcon sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  Join Our Community
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Create your blood bank account today
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
                        color: 'primary.main'
                      }
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id="firstName"
                        label="First Name"
                        name="firstName"
                        autoComplete="given-name"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                            },
                            '&.Mui-focused': {
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(198, 40, 40, 0.15)',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id="lastName"
                        label="Last Name"
                        name="lastName"
                        autoComplete="family-name"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                            },
                            '&.Mui-focused': {
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(198, 40, 40, 0.15)',
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

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
                          boxShadow: '0 4px 12px rgba(198, 40, 40, 0.15)',
                        },
                      },
                    }}
                  />

                  <FormControl
                    fullWidth
                    margin="normal"
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
                          boxShadow: '0 4px 12px rgba(198, 40, 40, 0.15)',
                        },
                      },
                    }}
                  >
                    <InputLabel>Register as</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={(e) => handleChange(e as any)}
                      disabled={isSubmitting}
                      label="Register as"
                      startAdornment={getRoleIcon(formData.role)}
                    >
                      <MenuItem value="donor">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" />
                          Donor
                        </Box>
                      </MenuItem>
                      <MenuItem value="hospital">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalHospital fontSize="small" />
                          Hospital
                        </Box>
                      </MenuItem>
                      <MenuItem value="admin">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AdminPanelSettings fontSize="small" />
                          NHS Blood Manager
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="phone"
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                            },
                            '&.Mui-focused': {
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(198, 40, 40, 0.15)',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="address"
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                            },
                            '&.Mui-focused': {
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(198, 40, 40, 0.15)',
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

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
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(198, 40, 40, 0.15)',
                        },
                      },
                    }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                          sx={{ color: 'text.secondary' }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                          boxShadow: '0 4px 12px rgba(198, 40, 40, 0.15)',
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
                      background: 'linear-gradient(135deg, #C62828 0%, #8e0000 100%)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8e0000 0%, #C62828 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(198, 40, 40, 0.3)',
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                        transform: 'none',
                      },
                    }}
                  >
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                  </Button>

                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      or
                    </Typography>
                  </Divider>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Already have an account?
                    </Typography>
                    <Button
                      component={Link}
                      href="/login"
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
                      Sign In Instead
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