'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container, Grid, Paper, Card, CardContent, Typography, Button, Box,
  IconButton, Tooltip, Alert, CircularProgress, Chip, Avatar, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, TextField, InputAdornment, Skeleton, useTheme,
  useMediaQuery, AppBar, Toolbar
} from '@mui/material';
import {
  LocalHospital, Inventory as InventoryIcon, RequestQuote as RequestIcon,
  Add as AddIcon, Refresh, TrendingUp, Warning, CheckCircle, Schedule,
  Bloodtype, NavigateNext, Search, FilterList, ShowChart, Notifications, Assignment
} from '@mui/icons-material';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { hospitalApi, StockDetail } from '../../../services/hospitalApi';

const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value);
const formatPercentage = (value: number): string => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};
const generateSparklineData = (count: number = 12): number[] => 
  Array.from({ length: count }, () => Math.floor(Math.random() * 100) + 20);
const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const statusMap = {
    pending: 'warning', approved: 'success', completed: 'success', rejected: 'error', failed: 'error', critical: 'error'
  };
  return statusMap[status.toLowerCase()] || 'default';
};

interface BloodRequest {
  id: number; bloodType: string; quantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  patientName: string; reason: string; requestedAt: string;
}

interface InventoryItem {
  id: number; bloodType: string; unitsAvailable: number; location: string;
  expiryDate: string; lastUpdated: string; status: 'good' | 'warning' | 'critical';
}
const StatsCard = ({ title, value, delta, icon, color = 'primary', sparklineData = [], loading = false }: {
  title: string; value: number | string; delta?: number; icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  sparklineData?: number[]; loading?: boolean;
}) => (
  <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{title}</Typography>
          {loading ? <Skeleton width={80} height={32} /> : (
            <Typography variant="h4" component="div" color={`${color}.main`} fontWeight="bold">
              {typeof value === 'number' ? formatNumber(value) : value}
            </Typography>
          )}
          {delta !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUp sx={{ fontSize: 16, mr: 0.5, color: delta >= 0 ? 'success.main' : 'error.main',
                transform: delta < 0 ? 'rotate(180deg)' : 'none' }} />
              <Typography variant="caption" color={delta >= 0 ? 'success.main' : 'error.main'} fontWeight="500">
                {formatPercentage(delta)}
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>{icon}</Avatar>
      </Box>
      {sparklineData.length > 0 && (
        <Box sx={{ height: 40, display: 'flex', alignItems: 'end', gap: 0.5 }}>
          {sparklineData.map((point, index) => (
            <Box key={index} sx={{ flex: 1, height: `${(point / Math.max(...sparklineData)) * 100}%`,
              bgcolor: `${color}.main`, opacity: 0.7, borderRadius: '2px 2px 0 0', minHeight: 2 }} />
          ))}
        </Box>
      )}
    </CardContent>
  </Card>
);

const AlertBanner = ({ message, severity = 'error', onClose }: {
  message: string; severity?: 'error' | 'warning' | 'info'; onClose?: () => void;
}) => (
  <Alert severity={severity} onClose={onClose}
    sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-icon': { fontSize: 24 } }}>
    {message}
  </Alert>
);

const InventoryTable = ({ data, loading = false }: { data: InventoryItem[]; loading?: boolean; }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    setFilteredData(data.filter(item => 
      item.bloodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
    ));
  }, [data, searchTerm]);

  if (loading) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {['Blood Type', 'Units', 'Location', 'Expiry', 'Status'].map((header) => (
                <TableCell key={header}><Skeleton /></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 5 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}><Skeleton /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Box>
      <TextField size="small" placeholder="Search inventory..." value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} sx={{ mb: 2, minWidth: 200 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Blood Type</TableCell>
              <TableCell align="right">Units</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Expiry</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Bloodtype sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" fontWeight="500">{item.bloodType}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="500">{item.unitsAvailable}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{item.location}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{formatDate(item.expiryDate)}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={item.status} color={getStatusColor(item.status)} size="small" variant="outlined" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const RequestsTable = ({ data, loading = false }: { data: BloodRequest[]; loading?: boolean; }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  if (loading) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {['Patient', 'Blood Type', 'Quantity', 'Urgency', 'Status', 'Date'].map((header) => (
                <TableCell key={header}><Skeleton /></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 6 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}><Skeleton /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Blood Type</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Urgency</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((request) => (
              <TableRow key={request.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="500">{request.patientName}</Typography>
                  <Typography variant="caption" color="text.secondary">{request.reason}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="500">{request.bloodType}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{request.quantity}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={request.urgency} color={getStatusColor(request.urgency)} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip label={request.status} color={getStatusColor(request.status)} size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{formatDate(request.requestedAt)}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination component="div" count={data.length} page={page}
        onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25]} />
    </Box>
  );
};

export default function HospitalDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: dashboardData, isLoading, error, refetch } = useDashboardData();
  const [user, setUser] = useState<any>(null);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [showCriticalAlert, setShowCriticalAlert] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (dashboardData) {
      setLastSync(new Date());
    }
  }, [dashboardData]);

  const getTotalUnits = () => dashboardData?.totalBloodUnits || 0;
  const getBloodTypeCount = () => dashboardData?.bloodTypesAvailable || 0;
  const getExpiringSoonCount = () => dashboardData?.expiringSoon || 0;
  const getCriticalStock = () => dashboardData?.criticalStock || 0;
  const getPendingRequests = () => dashboardData?.pendingRequests || 0;
  const getMockRequests = (): BloodRequest[] => [
    {
      id: 1,
      bloodType: 'A+',
      quantity: 3,
      urgency: 'high',
      status: 'pending',
      patientName: 'John Doe',
      reason: 'Emergency surgery',
      requestedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      bloodType: 'O-',
      quantity: 2,
      urgency: 'critical',
      status: 'approved',
      patientName: 'Jane Smith',
      reason: 'Trauma case',
      requestedAt: '2024-01-14T08:30:00Z',
    },
    {
      id: 3,
      bloodType: 'B+',
      quantity: 1,
      urgency: 'medium',
      status: 'fulfilled',
      patientName: 'Mike Johnson',
      reason: 'Scheduled surgery',
      requestedAt: '2024-01-13T14:20:00Z',
    },
    {
      id: 4,
      bloodType: 'AB-',
      quantity: 4,
      urgency: 'low',
      status: 'rejected',
      patientName: 'Sarah Wilson',
      reason: 'Elective procedure',
      requestedAt: '2024-01-12T09:15:00Z',
    },
  ];

  const getMockInventory = (): InventoryItem[] => [
    {
      id: 1,
      bloodType: 'A+',
      unitsAvailable: 25,
      location: 'Main Storage',
      expiryDate: '2024-02-15',
      lastUpdated: '2024-01-15T10:00:00Z',
      status: 'good',
    },
    {
      id: 2,
      bloodType: 'O-',
      unitsAvailable: 8,
      location: 'Emergency Unit',
      expiryDate: '2024-01-20',
      lastUpdated: '2024-01-14T08:30:00Z',
      status: 'warning',
    },
    {
      id: 3,
      bloodType: 'B+',
      unitsAvailable: 3,
      location: 'ICU Storage',
      expiryDate: '2024-01-18',
      lastUpdated: '2024-01-13T14:20:00Z',
      status: 'critical',
    },
    {
      id: 4,
      bloodType: 'AB+',
      unitsAvailable: 15,
      location: 'Main Storage',
      expiryDate: '2024-02-28',
      lastUpdated: '2024-01-12T09:15:00Z',
      status: 'good',
    },
  ];

  const handleRefresh = () => {
    refetch();
    setLastSync(new Date());
  };

  return (
    <ProtectedRoute requiredRole="hospital">
      <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
        
        <AppBar 
          position="static" 
          elevation={1} 
          sx={{ 
            bgcolor: 'background.paper', 
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocalHospital sx={{ color: 'primary.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h6" component="div" fontWeight="bold">
                  {getGreeting()}, {user?.firstName || 'Hospital'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.hospitalName || 'Medical Center'} • Last sync: {formatDate(lastSync)}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                startIcon={<Refresh />}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                {isMobile ? '' : 'Refresh'}
              </Button>
              <Button
                component={Link}
                href="/hospital/stock"
                variant="contained"
                startIcon={<AddIcon />}
                size="small"
                sx={{ 
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #C62828 0%, #8e0000 100%)',
                }}
              >
                {isMobile ? '' : 'Add Stock'}
              </Button>
              <Button
                component={Link}
                href="/hospital/requests"
                variant="outlined"
                startIcon={<Assignment />}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                {isMobile ? '' : 'New Request'}
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          
          {getCriticalStock() > 0 && showCriticalAlert && (
            <AlertBanner 
              message={`Critical Alert: ${getCriticalStock()} blood type(s) have critically low stock levels.`}
              severity="error"
              onClose={() => setShowCriticalAlert(false)}
            />
          )}
          
          {error && (
            <AlertBanner 
              message={`Error loading dashboard data: ${error}`}
              severity="error"
            />
          )}

          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3} xl={3}>
              <StatsCard
                title="Total Blood Units"
                value={getTotalUnits()}
                delta={5.2}
                icon={<InventoryIcon />}
                color="primary"
                sparklineData={generateSparklineData(12)}
                loading={isLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} xl={3}>
              <StatsCard
                title="Blood Types Available"
                value={getBloodTypeCount()}
                delta={-2.1}
                icon={<Bloodtype />}
                color="info"
                sparklineData={generateSparklineData(12)}
                loading={isLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} xl={3}>
              <StatsCard
                title="Pending Requests"
                value={getPendingRequests()}
                delta={12.5}
                icon={<RequestIcon />}
                color="warning"
                sparklineData={generateSparklineData(12)}
                loading={isLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} xl={3}>
              <StatsCard
                title="Critical Stock Items"
                value={getCriticalStock()}
                delta={-8.3}
                icon={<Warning />}
                color="error"
                sparklineData={generateSparklineData(12)}
                loading={isLoading}
              />
            </Grid>
          </Grid>

          
          <Grid container spacing={4}>
            
            <Grid item xs={12} lg={8}>
              <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        Blood Inventory
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Current blood stock levels and status
                      </Typography>
                    </Box>
                    <Button
                      component={Link}
                      href="/hospital/stock"
                      variant="outlined"
                      size="small"
                      endIcon={<NavigateNext />}
                    >
                      Manage All
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ p: 3 }}>
                  <InventoryTable data={getMockInventory()} loading={isLoading} />
                </Box>
              </Paper>
            </Grid>

            
            <Grid item xs={12} lg={4}>
              <Paper elevation={3} sx={{ borderRadius: 3, height: 'fit-content' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight="600">
                    Request Trends
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last 30 days activity
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  
                  <Box sx={{ display: 'flex', alignItems: 'end', gap: 1, height: 120, mb: 3 }}>
                    {generateSparklineData(30).map((value, index) => (
                      <Box
                        key={index}
                        sx={{
                          flex: 1,
                          height: `${(value / 120) * 100}%`,
                          bgcolor: index % 3 === 0 ? 'error.main' : index % 3 === 1 ? 'warning.main' : 'success.main',
                          opacity: 0.8,
                          borderRadius: '2px 2px 0 0',
                          minHeight: 4,
                        }}
                      />
                    ))}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="error.main" fontWeight="600">
                          {Math.floor(Math.random() * 20) + 5}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Critical
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="warning.main" fontWeight="600">
                          {Math.floor(Math.random() * 30) + 10}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Urgent
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="success.main" fontWeight="600">
                          {Math.floor(Math.random() * 40) + 20}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Regular
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>

            
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        Recent Blood Requests
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Patient blood requests and status updates
                      </Typography>
                    </Box>
                    <Button
                      component={Link}
                      href="/hospital/requests"
                      variant="contained"
                      startIcon={<AddIcon />}
                      size="small"
                      sx={{
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #1565C0 0%, #003c8f 100%)',
                      }}
                    >
                      New Request
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ p: 3 }}>
                  <RequestsTable data={getMockRequests()} loading={isLoading} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}