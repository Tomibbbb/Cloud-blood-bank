'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Avatar,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person,
  Bloodtype,
  Schedule,
  Edit,
  CalendarToday,
  LocalHospital,
  Warning,
  CheckCircle,
  Pending,
  Cancel,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Link from 'next/link';

interface DonationRecord {
  id: number;
  date: string;
  units: number;
  hospital: string;
  status: 'completed' | 'pending' | 'cancelled';
  bloodType: string;
}

interface UrgentRequest {
  id: number;
  bloodType: string;
  hospital: string;
  unitsNeeded: number;
  priority: 'urgent' | 'critical';
  postedAt: string;
}

interface DashboardStats {
  totalDonations: number;
  totalUnits: number;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  donorSince: string;
}

export default function DonorDashboard() {
  const { user, token } = useAuth();
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [urgentRequests, setUrgentRequests] = useState<UrgentRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock data for demo purposes
  const mockDonations: DonationRecord[] = [
    {
      id: 1,
      date: '2024-07-15',
      units: 1,
      hospital: 'City General Hospital',
      status: 'completed',
      bloodType: user?.bloodType || 'O+',
    },
    {
      id: 2,
      date: '2024-05-20',
      units: 1,
      hospital: 'Memorial Medical Center',
      status: 'completed',
      bloodType: user?.bloodType || 'O+',
    },
    {
      id: 3,
      date: '2024-03-10',
      units: 1,
      hospital: 'St. Mary\'s Hospital',
      status: 'completed',
      bloodType: user?.bloodType || 'O+',
    },
    {
      id: 4,
      date: '2024-08-05',
      units: 1,
      hospital: 'Regional Blood Center',
      status: 'pending',
      bloodType: user?.bloodType || 'O+',
    },
  ];

  const mockUrgentRequests: UrgentRequest[] = [
    {
      id: 1,
      bloodType: 'O-',
      hospital: 'Emergency Medical Center',
      unitsNeeded: 5,
      priority: 'critical',
      postedAt: '2024-08-03T10:30:00Z',
    },
    {
      id: 2,
      bloodType: user?.bloodType || 'O+',
      hospital: 'Children\'s Hospital',
      unitsNeeded: 3,
      priority: 'urgent',
      postedAt: '2024-08-03T08:15:00Z',
    },
  ];

  const mockStats: DashboardStats = {
    totalDonations: 3,
    totalUnits: 3,
    lastDonationDate: '2024-07-15',
    nextEligibleDate: '2024-10-15',
    donorSince: '2023-01-15',
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || !token) return;

      setIsLoading(true);
      try {
        // In a real app, these would be actual API calls:
        // const [donationsRes, requestsRes, statsRes] = await Promise.all([
        //   fetch(`${API_URL}/donors/donations`, { headers: authHeaders }),
        //   fetch(`${API_URL}/blood-requests/urgent`, { headers: authHeaders }),
        //   fetch(`${API_URL}/donors/stats`, { headers: authHeaders })
        // ]);

        // For demo, simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setDonations(mockDonations);
        setUrgentRequests(mockUrgentRequests);
        setStats(mockStats);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user, token]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" fontSize="small" />;
      case 'pending':
        return <Pending color="warning" fontSize="small" />;
      case 'cancelled':
        return <Cancel color="error" fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'critical' ? 'error' : 'warning';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="donor">
        <Box
          sx={{
            minHeight: '100vh',
            backgroundColor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={60} color="primary" />
        </Box>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="donor">
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            
            <Grid item xs={12} md={8}>
              <Card
                elevation={4}
                sx={{
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #C62828 0%, #8e0000 100%)',
                  color: 'white',
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        mr: 3,
                        fontSize: '2rem',
                      }}
                    >
                      <Person fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                        Welcome, {user?.firstName}!
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<Bloodtype />}
                          label={`Blood Type: ${user?.bloodType || 'Not specified'}`}
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                        <Chip
                          icon={<CalendarToday />}
                          label={`Donor since ${stats ? formatDate(stats.donorSince) : 'N/A'}`}
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" component="div" fontWeight="bold">
                          {stats?.totalDonations || 0}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Total Donations
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" component="div" fontWeight="bold">
                          {stats?.totalUnits || 0}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Units Donated
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                          Last Donation
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {stats?.lastDonationDate ? formatDate(stats.lastDonationDate) : 'Never'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                          Next Eligible
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {stats?.nextEligibleDate ? formatDate(stats.nextEligibleDate) : 'Now'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            
            <Grid item xs={12} md={4}>
              <Card elevation={4} sx={{ borderRadius: 3, height: 'fit-content' }}>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom fontWeight="600">
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      component={Link}
                      href="/donor/profile"
                      variant="outlined"
                      startIcon={<Edit />}
                      fullWidth
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                      }}
                    >
                      Update Profile
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Schedule />}
                      fullWidth
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #C62828 0%, #8e0000 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8e0000 0%, #C62828 100%)',
                        },
                      }}
                    >
                      Schedule Donation
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            
            {urgentRequests.length > 0 && (
              <Grid item xs={12}>
                <Alert
                  severity="warning"
                  icon={<Warning />}
                  sx={{
                    borderRadius: 2,
                    mb: 2,
                    '& .MuiAlert-message': {
                      width: '100%',
                    },
                  }}
                >
                  <Typography variant="h6" component="div" gutterBottom>
                    Urgent Blood Requests
                  </Typography>
                  <Grid container spacing={2}>
                    {urgentRequests.map((request) => (
                      <Grid item xs={12} sm={6} md={4} key={request.id}>
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Chip
                                label={request.bloodType}
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                              <Chip
                                label={request.priority.toUpperCase()}
                                color={getPriorityColor(request.priority)}
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" color="text.primary" gutterBottom>
                              <LocalHospital fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                              {request.hospital}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {request.unitsNeeded} units needed • {getTimeAgo(request.postedAt)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Alert>
              </Grid>
            )}

            
            <Grid item xs={12}>
              <Card elevation={4} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" component="h2" fontWeight="600">
                      Donation History
                    </Typography>
                    <Tooltip title="Refresh">
                      <IconButton color="primary">
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Units</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Hospital</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Blood Type</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {donations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Typography variant="body2" color="text.secondary">
                                No donation records found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          donations.map((donation) => (
                            <TableRow 
                              key={donation.id}
                              sx={{ 
                                '&:hover': { 
                                  backgroundColor: 'action.hover' 
                                },
                                '&:nth-of-type(odd)': {
                                  backgroundColor: 'action.selected',
                                },
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight="500">
                                  {formatDate(donation.date)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {donation.units} unit{donation.units !== 1 ? 's' : ''}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {donation.hospital}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={donation.bloodType}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {getStatusIcon(donation.status)}
                                  <Chip
                                    label={donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                    size="small"
                                    color={getStatusColor(donation.status) as any}
                                    variant="outlined"
                                  />
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}