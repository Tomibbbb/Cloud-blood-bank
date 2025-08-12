'use client';

import { useState } from 'react';
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
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  LocalHospital as HospitalIcon,
  PendingActions as PendingIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import ProtectedRoute from '../../../components/ProtectedRoute';

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

export default function NHSBloodCoordinatorDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // TODO: Replace with actual API calls
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

  // TODO: Replace with actual API calls
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

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const totalUnits = inventory.reduce((sum, item) => sum + item.totalUnits, 0);
  const lowStockCount = inventory.filter(item => item.lowStock).length;
  const criticalItems = inventory.filter(item => item.lowStock || item.expiringSoon > 0);

  const handleRefresh = () => {
    // TODO: Implement refresh logic to fetch latest data
    console.log('Refreshing dashboard data...');
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
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              size="large"
            >
              Refresh
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
                title="Total Requests"
                value={requests.length}
                icon={<HospitalIcon />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Pending Requests"
                value={pendingRequests.length}
                icon={<PendingIcon />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Total Units in Network"
                value={totalUnits}
                icon={<InventoryIcon />}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Low Stock Alerts"
                value={lowStockCount}
                icon={<WarningIcon />}
                color="error"
              />
            </Grid>
          </Grid>

          {/* Main Content Grid */}
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