'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  TextField,
} from '@mui/material';
// TODO: Install @mui/x-date-pickers dependencies
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  LocalHospital as VolunteerIcon,
  PendingActions as PendingIcon,
  CheckCircle as ConfirmedIcon,
  Cancel as RejectedIcon,
} from '@mui/icons-material';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface DonationOffer {
  id: number;
  bloodType: string;
  preferredDate: string;
  location: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  routedToName?: string;
  donor: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

interface OfferStats {
  total: number;
  pending: number;
  confirmed: number;
  rejected: number;
}

const KPICard = ({ title, value, icon, color = 'primary' }: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'warning' | 'error';
}) => (
  <Card elevation={3}>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar sx={{ bgcolor: `${color}.main` }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function AdminDonationsPage() {
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<DonationOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<DonationOffer[]>([]);
  const [stats, setStats] = useState<OfferStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
  });
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    status: 'all',
    bloodType: 'all',
    hospitalId: 'all',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const hospitals = ['Royal London Hospital', 'St. Bartholomew\'s Hospital', 'Guy\'s Hospital'];

  // Mock data - TODO: Replace with actual API call
  const mockOffers: DonationOffer[] = [
    {
      id: 1,
      bloodType: 'O-',
      preferredDate: '2025-08-15T10:00:00Z',
      location: 'London Central',
      notes: 'First time donor',
      status: 'pending',
      routedToName: 'Royal London Hospital',
      donor: {
        firstName: 'John',
        lastName: 'D.',
        email: 'j****@email.com',
      },
      createdAt: '2025-08-12T09:00:00Z',
    },
    {
      id: 2,
      bloodType: 'A+',
      preferredDate: '2025-08-16T14:00:00Z',
      location: 'London East',
      status: 'confirmed',
      routedToName: 'St. Bartholomew\'s Hospital',
      donor: {
        firstName: 'Sarah',
        lastName: 'M.',
        email: 's****@email.com',
      },
      createdAt: '2025-08-12T10:30:00Z',
    },
    {
      id: 3,
      bloodType: 'B+',
      preferredDate: '2025-08-14T11:00:00Z',
      location: 'London South',
      status: 'rejected',
      routedToName: 'Guy\'s Hospital',
      donor: {
        firstName: 'Michael',
        lastName: 'R.',
        email: 'm****@email.com',
      },
      createdAt: '2025-08-11T15:00:00Z',
    },
    {
      id: 4,
      bloodType: 'AB-',
      preferredDate: '2025-08-13T09:00:00Z',
      location: 'London West',
      status: 'confirmed',
      routedToName: 'Royal London Hospital',
      donor: {
        firstName: 'Emma',
        lastName: 'W.',
        email: 'e****@email.com',
      },
      createdAt: '2025-08-10T14:00:00Z',
    },
    {
      id: 5,
      bloodType: 'O+',
      preferredDate: '2025-08-17T16:00:00Z',
      location: 'London North',
      status: 'pending',
      routedToName: 'St. Bartholomew\'s Hospital',
      donor: {
        firstName: 'David',
        lastName: 'L.',
        email: 'd****@email.com',
      },
      createdAt: '2025-08-12T16:00:00Z',
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [offers, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/donations/offers/all', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // const data = await response.json();
      // setOffers(data.offers);
      // setStats(data.stats);

      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOffers(mockOffers);
      
      // Calculate stats from mock data
      const total = mockOffers.length;
      const pending = mockOffers.filter(o => o.status === 'pending').length;
      const confirmed = mockOffers.filter(o => o.status === 'confirmed').length;
      const rejected = mockOffers.filter(o => o.status === 'rejected').length;
      
      setStats({ total, pending, confirmed, rejected });
    } catch (err: any) {
      setError(err.message || 'Failed to load donation offers');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = offers;

    if (filters.status !== 'all') {
      filtered = filtered.filter(offer => offer.status === filters.status);
    }

    if (filters.bloodType !== 'all') {
      filtered = filtered.filter(offer => offer.bloodType === filters.bloodType);
    }

    if (filters.hospitalId !== 'all') {
      filtered = filtered.filter(offer => offer.routedToName === filters.hospitalId);
    }

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(offer => {
        const offerDate = new Date(offer.createdAt);
        return offerDate >= filters.startDate! && offerDate <= filters.endDate!;
      });
    }

    setFilteredOffers(filtered);
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <Box sx={{ bgcolor: '#F8F9FA', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="xl">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Box display="flex" alignItems="center">
                <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h3" component="h1" fontWeight="bold" color="primary.main">
                    Donations Overview
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    NHS Blood Coordinator - Read-only analytics
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadData}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Total Offers"
                  value={stats.total}
                  icon={<VolunteerIcon />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Pending Review"
                  value={stats.pending}
                  icon={<PendingIcon />}
                  color="warning"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Confirmed"
                  value={stats.confirmed}
                  icon={<ConfirmedIcon />}
                  color="secondary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Rejected"
                  value={stats.rejected}
                  icon={<RejectedIcon />}
                  color="error"
                />
              </Grid>
            </Grid>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <FilterIcon />
                  <Typography variant="h6">Filters</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        label="Status"
                      >
                        <MenuItem value="all">All Statuses</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Blood Type</InputLabel>
                      <Select
                        value={filters.bloodType}
                        onChange={(e) => setFilters(prev => ({ ...prev, bloodType: e.target.value }))}
                        label="Blood Type"
                      >
                        <MenuItem value="all">All Types</MenuItem>
                        {bloodTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Hospital</InputLabel>
                      <Select
                        value={filters.hospitalId}
                        onChange={(e) => setFilters(prev => ({ ...prev, hospitalId: e.target.value }))}
                        label="Hospital"
                      >
                        <MenuItem value="all">All Hospitals</MenuItem>
                        {hospitals.map((hospital) => (
                          <MenuItem key={hospital} value={hospital}>{hospital}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Start Date"
                      type="date"
                      value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        startDate: e.target.value ? new Date(e.target.value) : null 
                      }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="End Date"
                      type="date"
                      value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        endDate: e.target.value ? new Date(e.target.value) : null 
                      }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Offers Table */}
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  All Donation Offers ({filteredOffers.length})
                </Typography>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : filteredOffers.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No donation offers found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {offers.length === 0 ? 'No offers have been submitted yet' : 'Try adjusting your filters'}
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>ID</strong></TableCell>
                          <TableCell><strong>Donor</strong></TableCell>
                          <TableCell><strong>Blood Type</strong></TableCell>
                          <TableCell><strong>Preferred Date</strong></TableCell>
                          <TableCell><strong>Location</strong></TableCell>
                          <TableCell><strong>Hospital</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Submitted</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredOffers.map((offer) => (
                          <TableRow key={offer.id} hover>
                            <TableCell>#{offer.id}</TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {offer.donor.firstName} {offer.donor.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {offer.donor.email}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip label={offer.bloodType} variant="outlined" />
                            </TableCell>
                            <TableCell>{formatDate(offer.preferredDate)}</TableCell>
                            <TableCell>{offer.location}</TableCell>
                            <TableCell>{offer.routedToName || 'Not assigned'}</TableCell>
                            <TableCell>
                              <Chip
                                label={offer.status}
                                color={getStatusColor(offer.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{formatDate(offer.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>

            {/* Summary Card */}
            {!loading && filteredOffers.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Stats
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Most Requested Blood Type
                      </Typography>
                      <Typography variant="h6">
                        {/* Calculate most requested blood type */}
                        {bloodTypes.reduce((prev, current) => 
                          filteredOffers.filter(o => o.bloodType === current).length > 
                          filteredOffers.filter(o => o.bloodType === prev).length ? current : prev
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Busiest Hospital
                      </Typography>
                      <Typography variant="h6">
                        {hospitals.reduce((prev, current) => 
                          filteredOffers.filter(o => o.routedToName === current).length > 
                          filteredOffers.filter(o => o.routedToName === prev).length ? current : prev
                        ).split(' ')[0]}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Success Rate
                      </Typography>
                      <Typography variant="h6">
                        {filteredOffers.length > 0 ? 
                          Math.round((filteredOffers.filter(o => o.status === 'confirmed').length / filteredOffers.length) * 100)
                          : 0}%
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Avg Response Time
                      </Typography>
                      <Typography variant="h6">
                        2.4 hours
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Container>
        </Box>
    </ProtectedRoute>
  );
}