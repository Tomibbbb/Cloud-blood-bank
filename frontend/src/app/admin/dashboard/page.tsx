'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Divider,
  Tooltip,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  LocalHospital as HospitalIcon,
  PendingActions as PendingIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  VolunteerActivism as DonationIcon,
  Timeline as TimelineIcon,
  Bloodtype as BloodIcon,
  PersonPin as DonorIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
  SwapHoriz as ExchangeIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
} from '@mui/icons-material';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import { donationOffersApi, DonationOffer } from '../../../services/api';

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

interface BloodRequest {
  id: number;
  hospitalName: string;
  patientName: string;
  bloodType: string;
  quantity: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  requestedAt: string;
}

interface InventoryItem {
  bloodType: string;
  totalUnits: number;
  lowStock: boolean;
  expiringSoon: number;
}

interface DonationActivity {
  id: number;
  donorName: string;
  hospitalName: string;
  bloodType: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  preferredDate: string;
  appointmentDate?: string;
  location: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DonationStats {
  totalOffers: number;
  pendingOffers: number;
  confirmedOffers: number;
  rejectedOffers: number;
  completedDonations: number;
  activeDonors: number;
  participatingHospitals: number;
}

interface HospitalDonationSummary {
  id: number;
  hospitalName: string;
  location: string;
  totalOffers: number;
  confirmedDonations: number;
  pendingOffers: number;
  completionRate: number;
  mostNeededBloodTypes: string[];
}

export default function NHSBloodCoordinatorDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { token } = useAuth();

  // Donation coordination state
  const [donationActivities, setDonationActivities] = useState<DonationActivity[]>([]);
  const [donationStats, setDonationStats] = useState<DonationStats>({
    totalOffers: 0,
    pendingOffers: 0,
    confirmedOffers: 0,
    rejectedOffers: 0,
    completedDonations: 0,
    activeDonors: 0,
    participatingHospitals: 0,
  });
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [requests, setRequests] = useState<BloodRequest[]>([
    {
      id: 1,
      hospitalName: 'Royal London Hospital',
      patientName: 'Patient A',
      bloodType: 'O-',
      quantity: 4,
      urgency: 'critical',
      status: 'pending',
      requestedAt: '2025-08-12T08:30:00Z',
    },
    {
      id: 2,
      hospitalName: 'St. Bartholomew\'s Hospital',
      patientName: 'Patient B',
      bloodType: 'A+',
      quantity: 2,
      urgency: 'high',
      status: 'pending',
      requestedAt: '2025-08-12T09:15:00Z',
    },
    {
      id: 3,
      hospitalName: 'Guy\'s Hospital',
      patientName: 'Patient C',
      bloodType: 'B+',
      quantity: 3,
      urgency: 'medium',
      status: 'approved',
      requestedAt: '2025-08-12T07:45:00Z',
    },
  ]);

  const [inventory] = useState<InventoryItem[]>([
    { bloodType: 'A+', totalUnits: 45, lowStock: false, expiringSoon: 2 },
    { bloodType: 'A-', totalUnits: 8, lowStock: true, expiringSoon: 1 },
    { bloodType: 'B+', totalUnits: 32, lowStock: false, expiringSoon: 0 },
    { bloodType: 'B-', totalUnits: 12, lowStock: false, expiringSoon: 3 },
    { bloodType: 'AB+', totalUnits: 6, lowStock: true, expiringSoon: 1 },
    { bloodType: 'AB-', totalUnits: 4, lowStock: true, expiringSoon: 0 },
    { bloodType: 'O+', totalUnits: 67, lowStock: false, expiringSoon: 4 },
    { bloodType: 'O-', totalUnits: 19, lowStock: false, expiringSoon: 2 },
  ]);

  // Hospital donation summaries - will be calculated from actual donation data
  const [hospitalSummaries, setHospitalSummaries] = useState<HospitalDonationSummary[]>([]);

  useEffect(() => {
    loadDonationData();
    
    // Set up polling to refresh data every 30 seconds
    const interval = setInterval(() => {
      loadDonationData();
    }, 30000);

    return () => clearInterval(interval);
  }, [token]);

  const loadDonationData = async () => {
    if (!token) return;
    
    setLoadingDonations(true);
    try {
      const allOffers = await donationOffersApi.getAllOffers(token, {});
      
      // Transform API data to DonationActivity format
      const activities: DonationActivity[] = allOffers.map(offer => ({
        id: offer.id,
        donorName: `${offer.donor.firstName} ${offer.donor.lastName}`,
        hospitalName: offer.routedToName || 'Not Assigned',
        bloodType: offer.bloodType,
        status: offer.status,
        preferredDate: offer.preferredDate,
        appointmentDate: offer.appointmentDate,
        location: offer.location,
        notes: offer.notes,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
      }));
      
      setDonationActivities(activities);
      
      // Calculate stats
      const stats: DonationStats = {
        totalOffers: allOffers.length,
        pendingOffers: allOffers.filter(o => o.status === 'pending').length,
        confirmedOffers: allOffers.filter(o => o.status === 'confirmed').length,
        rejectedOffers: allOffers.filter(o => o.status === 'rejected').length,
        completedDonations: allOffers.filter(o => o.status === 'confirmed').length, // Assuming confirmed = completed for now
        activeDonors: new Set(allOffers.map(o => o.donorId)).size,
        participatingHospitals: new Set(allOffers.filter(o => o.routedToId).map(o => o.routedToId)).size,
      };
      
      setDonationStats(stats);
      
      // Calculate hospital summaries
      const hospitalMap = new Map<string, {
        hospitalName: string;
        location: string;
        offers: DonationOffer[];
      }>();

      // Group offers by hospital
      allOffers.forEach(offer => {
        if (offer.routedToName && offer.routedToId) {
          const key = offer.routedToId.toString();
          if (!hospitalMap.has(key)) {
            hospitalMap.set(key, {
              hospitalName: offer.routedToName,
              location: offer.location || 'Location not specified',
              offers: []
            });
          }
          hospitalMap.get(key)!.offers.push(offer);
        }
      });

      // Calculate summaries for each hospital
      const summaries: HospitalDonationSummary[] = Array.from(hospitalMap.entries()).map(([id, data]) => {
        const totalOffers = data.offers.length;
        const confirmedDonations = data.offers.filter(o => o.status === 'confirmed').length;
        const pendingOffers = data.offers.filter(o => o.status === 'pending').length;
        const completionRate = totalOffers > 0 ? Math.round((confirmedDonations / totalOffers) * 100) : 0;
        
        // Find most needed blood types based on pending offers
        const bloodTypeCounts = data.offers
          .filter(o => o.status === 'pending')
          .reduce((acc, offer) => {
            acc[offer.bloodType] = (acc[offer.bloodType] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

        const mostNeededBloodTypes = Object.entries(bloodTypeCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([type]) => type);

        return {
          id: parseInt(id),
          hospitalName: data.hospitalName,
          location: data.location,
          totalOffers,
          confirmedDonations,
          pendingOffers,
          completionRate,
          mostNeededBloodTypes
        };
      });

      setHospitalSummaries(summaries);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Failed to load donation data:', error);
    } finally {
      setLoadingDonations(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const totalUnits = inventory.reduce((sum, item) => sum + item.totalUnits, 0);
  const lowStockCount = inventory.filter(item => item.lowStock).length;
  const criticalItems = inventory.filter(item => item.lowStock || item.expiringSoon > 0);

  const handleRefresh = () => {
    loadDonationData();
    
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  const updateRequestStatus = (id: number, newStatus: 'approved' | 'rejected') => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: newStatus } : request
    ));
  };

  const getUrgencyColor = (urgency: string): 'error' | 'warning' | 'info' | 'success' => {
    switch (urgency) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'fulfilled': return 'primary';
      default: return 'default';
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <Box sx={{ bgcolor: '#F8F9FA', minHeight: '100vh', py: 3 }}>
        <Container maxWidth="xl">
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h3" component="h1" fontWeight="bold" color="primary.main">
                NHS Blood Coordinator Dashboard
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Managing blood supply across the NHS network
              </Typography>
              {lastUpdated && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <TimeIcon fontSize="small" />
                  Last updated: {lastUpdated.toLocaleTimeString('en-GB')}
                </Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              startIcon={loadingDonations ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={loadingDonations}
              size="large"
            >
              {loadingDonations ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </Box>

          {/* Alert Banner */}
          {criticalItems.length > 0 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <strong>Critical Alert:</strong> {lowStockCount} blood types have low stock and {criticalItems.reduce((sum, item) => sum + item.expiringSoon, 0)} units are expiring soon. Immediate action required.
            </Alert>
          )}

          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Total Donation Offers"
                value={loadingDonations ? "..." : donationStats.totalOffers}
                icon={<DonationIcon />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Pending Offers"
                value={loadingDonations ? "..." : donationStats.pendingOffers}
                icon={<PendingIcon />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Confirmed Donations"
                value={loadingDonations ? "..." : donationStats.confirmedOffers}
                icon={<CheckIcon />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Active Donors"
                value={loadingDonations ? "..." : donationStats.activeDonors}
                icon={<DonorIcon />}
                color="secondary"
              />
            </Grid>
          </Grid>

          {/* Donation Coordination KPI Cards */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Donation Coordination
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Overview of donation activities across the network
            </Typography>
            
            {loadingDonations ? (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card elevation={3}>
                      <CardContent>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton variant="text" sx={{ mt: 1 }} />
                        <Skeleton variant="text" width="60%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <KPICard
                    title="Total Donation Offers"
                    value={donationStats.totalOffers}
                    icon={<DonationIcon />}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <KPICard
                    title="Pending Offers"
                    value={donationStats.pendingOffers}
                    icon={<TimeIcon />}
                    color="warning"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <KPICard
                    title="Active Donors"
                    value={donationStats.activeDonors}
                    icon={<DonorIcon />}
                    color="secondary"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <KPICard
                    title="Participating Hospitals"
                    value={donationStats.participatingHospitals}
                    icon={<HospitalIcon />}
                    color="primary"
                  />
                </Grid>
              </Grid>
            )}
          </Box>

          {/* Main Content Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Donation Activities Table */}
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ExchangeIcon />
                      Donor-Hospital Interactions
                    </Typography>
                    {loadingDonations && <CircularProgress size={20} />}
                  </Box>
                  
                  {loadingDonations ? (
                    <Box>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          <Skeleton variant="circular" width={40} height={40} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="80%" />
                            <Skeleton variant="text" width="60%" />
                          </Box>
                          <Skeleton variant="rectangular" width={100} height={30} />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <TableContainer component={Paper} elevation={0}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Donor</strong></TableCell>
                            <TableCell><strong>Hospital</strong></TableCell>
                            <TableCell><strong>Blood Type</strong></TableCell>
                            <TableCell><strong>Preferred Date</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Location</strong></TableCell>
                            <TableCell><strong>Created</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {donationActivities.slice(0, 10).map((activity) => (
                            <TableRow key={activity.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                                    <DonorIcon fontSize="small" />
                                  </Avatar>
                                  {activity.donorName}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <HospitalIcon fontSize="small" color="primary" />
                                  {activity.hospitalName}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={activity.bloodType} 
                                  variant="outlined" 
                                  size="small"
                                  sx={{ bgcolor: 'error.light', color: 'white' }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <ScheduleIcon fontSize="small" />
                                  {formatDate(activity.preferredDate)}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={activity.status}
                                  color={
                                    activity.status === 'pending' ? 'warning' :
                                    activity.status === 'confirmed' ? 'success' :
                                    activity.status === 'rejected' ? 'error' :
                                    'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LocationIcon fontSize="small" />
                                  <Tooltip title={activity.location}>
                                    <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                                      {activity.location}
                                    </Typography>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(activity.createdAt)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  
                  {!loadingDonations && donationActivities.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <DonationIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No donation activities found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Donation offers will appear here once donors start submitting requests
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Hospital Donation Coordination Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HospitalIcon />
                    Hospital Donation Coordination
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Track donation progress and completion rates across participating hospitals
                  </Typography>
                  
                  {loadingDonations ? (
                    <Grid container spacing={3}>
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Grid item xs={12} md={6} lg={4} key={index}>
                          <Card elevation={2} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                            <CardContent>
                              <Skeleton variant="text" width="80%" height={32} />
                              <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
                              <Skeleton variant="text" width="70%" height={20} sx={{ mt: 1 }} />
                              <Skeleton variant="rectangular" width="100%" height={8} sx={{ mt: 2, borderRadius: 2 }} />
                              <Box sx={{ display: 'flex', gap: 0.5, mt: 2 }}>
                                <Skeleton variant="rectangular" width={40} height={24} sx={{ borderRadius: 1 }} />
                                <Skeleton variant="rectangular" width={40} height={24} sx={{ borderRadius: 1 }} />
                                <Skeleton variant="rectangular" width={40} height={24} sx={{ borderRadius: 1 }} />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : hospitalSummaries.length > 0 ? (
                    <Grid container spacing={3}>
                      {hospitalSummaries.map((hospital) => (
                        <Grid item xs={12} md={6} lg={4} key={hospital.id}>
                          <Card elevation={2} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  {hospital.hospitalName}
                                </Typography>
                                <Chip
                                  label={`${hospital.completionRate}%`}
                                  color={
                                    hospital.completionRate >= 80 ? 'success' :
                                    hospital.completionRate >= 60 ? 'warning' :
                                    'error'
                                  }
                                  size="small"
                                />
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <LocationIcon fontSize="small" color="primary" />
                                <Typography variant="body2" color="text.secondary">
                                  {hospital.location}
                                </Typography>
                              </Box>
                              
                              <Divider sx={{ my: 2 }} />
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Confirmed Donations
                                  </Typography>
                                  <Typography variant="h6" color="primary.main">
                                    {hospital.confirmedDonations}/{hospital.totalOffers}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Pending Offers
                                  </Typography>
                                  <Typography variant="h6" color="warning.main">
                                    {hospital.pendingOffers}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <LinearProgress
                                variant="determinate"
                                value={hospital.completionRate}
                                sx={{ 
                                  mb: 2, 
                                  height: 8, 
                                  borderRadius: 2,
                                  backgroundColor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: 
                                      hospital.completionRate >= 80 ? 'success.main' :
                                      hospital.completionRate >= 60 ? 'warning.main' :
                                      'error.main'
                                  }
                                }}
                              />
                              
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Most Requested Blood Types:
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {hospital.mostNeededBloodTypes.length > 0 ? hospital.mostNeededBloodTypes.map((type) => (
                                    <Chip
                                      key={type}
                                      label={type}
                                      size="small"
                                      variant="outlined"
                                      sx={{ bgcolor: 'error.light', color: 'white', fontSize: '0.75rem' }}
                                    />
                                  )) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                      No pending requests
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <HospitalIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No hospital donation data available
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Hospital coordination data will appear once donation offers are routed to hospitals
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Legacy Blood Requests Section */}
          <Grid container spacing={3}>
            {/* Blood Requests Table */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Blood Requests
                  </Typography>
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Hospital</strong></TableCell>
                          <TableCell><strong>Patient</strong></TableCell>
                          <TableCell><strong>Blood Type</strong></TableCell>
                          <TableCell><strong>Quantity</strong></TableCell>
                          <TableCell><strong>Urgency</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {requests.map((request) => (
                          <TableRow key={request.id} hover>
                            <TableCell>{request.hospitalName}</TableCell>
                            <TableCell>{request.patientName}</TableCell>
                            <TableCell>
                              <Chip label={request.bloodType} variant="outlined" />
                            </TableCell>
                            <TableCell>{request.quantity} units</TableCell>
                            <TableCell>
                              <Chip
                                label={request.urgency}
                                color={getUrgencyColor(request.urgency)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={request.status}
                                color={getStatusColor(request.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {request.status === 'pending' && (
                                <Box display="flex" gap={1}>
                                  <IconButton
                                    color="success"
                                    onClick={() => updateRequestStatus(request.id, 'approved')}
                                    size="small"
                                  >
                                    <CheckIcon />
                                  </IconButton>
                                  <IconButton
                                    color="error"
                                    onClick={() => updateRequestStatus(request.id, 'rejected')}
                                    size="small"
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Box>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Network Inventory Table */}
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Network Inventory
                  </Typography>
                  <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Blood Type</strong></TableCell>
                          <TableCell><strong>Total Units</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Expiring</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {inventory.map((item) => (
                          <TableRow key={item.bloodType} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {item.bloodType}
                              </Typography>
                            </TableCell>
                            <TableCell>{item.totalUnits}</TableCell>
                            <TableCell>
                              <Chip
                                label={item.lowStock ? 'Low' : 'Good'}
                                color={item.lowStock ? 'error' : 'success'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {item.expiringSoon > 0 ? (
                                <Chip
                                  label={`${item.expiringSoon} units`}
                                  color="warning"
                                  size="small"
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  None
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
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