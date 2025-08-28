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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Snackbar,
} from '@mui/material';
// TODO: Install @mui/x-date-pickers dependencies
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Inbox as InboxIcon,
  CheckCircle as ConfirmIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import { donationOffersApi, DonationOffer } from '../../../services/api';


interface ConfirmData {
  appointmentDate: Date | null;
  hospitalNotes: string;
}

interface RejectData {
  rejectionReason: string;
}

export default function HospitalDonationsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<DonationOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<DonationOffer[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<DonationOffer | null>(null);
  const [processing, setProcessing] = useState(false);
  
  const [confirmData, setConfirmData] = useState<ConfirmData>({
    appointmentDate: null,
    hospitalNotes: '',
  });
  
  const [rejectData, setRejectData] = useState<RejectData>({
    rejectionReason: '',
  });

  const [filters, setFilters] = useState({
    status: 'all',
    bloodType: 'all',
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    loadOffers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [offers, filters]);

  const loadOffers = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const queryParams = {
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.bloodType !== 'all' && { bloodType: filters.bloodType })
      };
      
      const offersData = await donationOffersApi.getHospitalOffers(token, queryParams);
      setOffers(offersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load offers');
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

    setFilteredOffers(filtered);
  };

  const handleConfirmOffer = (offer: DonationOffer) => {
    setSelectedOffer(offer);
    setConfirmData({
      appointmentDate: new Date(offer.preferredDate),
      hospitalNotes: '',
    });
    setConfirmDialogOpen(true);
  };

  const handleRejectOffer = (offer: DonationOffer) => {
    setSelectedOffer(offer);
    setRejectData({ rejectionReason: '' });
    setRejectDialogOpen(true);
  };

  const confirmOffer = async () => {
    if (!selectedOffer || !confirmData.appointmentDate || !token) return;
    
    setProcessing(true);
    try {
      const updatedOffer = await donationOffersApi.confirmOffer(
        token,
        selectedOffer.id,
        {
          appointmentDate: confirmData.appointmentDate.toISOString(),
          hospitalNotes: confirmData.hospitalNotes,
        }
      );

      // Update local state
      setOffers(prev => prev.map(offer => 
        offer.id === selectedOffer.id ? updatedOffer : offer
      ));

      setSuccess('Donation offer confirmed successfully');
      setConfirmDialogOpen(false);
      setSelectedOffer(null);
    } catch (err: any) {
      setError(err.message || 'Failed to confirm offer');
    } finally {
      setProcessing(false);
    }
  };

  const rejectOffer = async () => {
    if (!selectedOffer || !rejectData.rejectionReason.trim() || !token) return;
    
    setProcessing(true);
    try {
      const updatedOffer = await donationOffersApi.rejectOffer(
        token,
        selectedOffer.id,
        {
          rejectionReason: rejectData.rejectionReason,
        }
      );

      // Update local state
      setOffers(prev => prev.map(offer => 
        offer.id === selectedOffer.id ? updatedOffer : offer
      ));

      setSuccess('Donation offer rejected');
      setRejectDialogOpen(false);
      setSelectedOffer(null);
    } catch (err: any) {
      setError(err.message || 'Failed to reject offer');
    } finally {
      setProcessing(false);
    }
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
    <ProtectedRoute requiredRole="hospital">
      <Box sx={{ bgcolor: '#F8F9FA', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="xl">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Box display="flex" alignItems="center">
                <InboxIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h3" component="h1" fontWeight="bold" color="primary.main">
                    Donation Offers Inbox
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Review and manage incoming blood donation offers
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadOffers}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <FilterIcon />
                  <Typography variant="h6">Filters</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
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
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
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
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
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
                      {offers.length === 0 ? 'No offers have been routed to your hospital yet' : 'Try adjusting your filters'}
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Donor</strong></TableCell>
                          <TableCell><strong>Blood Type</strong></TableCell>
                          <TableCell><strong>Preferred Date</strong></TableCell>
                          <TableCell><strong>Location</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Notes</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredOffers.map((offer) => (
                          <TableRow key={offer.id} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {offer.donor.firstName} {offer.donor.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {offer.donor.email}
                                </Typography>
                                {offer.donor.phone && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {offer.donor.phone}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip label={offer.bloodType} variant="outlined" />
                            </TableCell>
                            <TableCell>{formatDate(offer.preferredDate)}</TableCell>
                            <TableCell>{offer.location}</TableCell>
                            <TableCell>
                              <Chip
                                label={offer.status}
                                color={getStatusColor(offer.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                {offer.notes || 'No notes'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {offer.status === 'pending' && (
                                <Box display="flex" gap={1}>
                                  <IconButton
                                    color="success"
                                    onClick={() => handleConfirmOffer(offer)}
                                    size="small"
                                  >
                                    <ConfirmIcon />
                                  </IconButton>
                                  <IconButton
                                    color="error"
                                    onClick={() => handleRejectOffer(offer)}
                                    size="small"
                                  >
                                    <RejectIcon />
                                  </IconButton>
                                </Box>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Container>
        </Box>

        {/* Confirm Dialog */}
        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Confirm Donation Offer</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                required
                label="Appointment Date & Time"
                type="datetime-local"
                value={confirmData.appointmentDate ? confirmData.appointmentDate.toISOString().slice(0, 16) : ''}
                onChange={(e) => setConfirmData(prev => ({ 
                  ...prev, 
                  appointmentDate: e.target.value ? new Date(e.target.value) : null 
                }))}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date().toISOString().slice(0, 16),
                }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Hospital Notes"
                value={confirmData.hospitalNotes}
                onChange={(e) => setConfirmData(prev => ({ ...prev, hospitalNotes: e.target.value }))}
                placeholder="e.g., Please arrive 15 minutes early..."
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmOffer} 
              variant="contained" 
              color="success"
              disabled={processing || !confirmData.appointmentDate}
              startIcon={processing ? <CircularProgress size={16} /> : <ConfirmIcon />}
            >
              {processing ? 'Confirming...' : 'Confirm Offer'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Reject Donation Offer</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Rejection Reason *"
              value={rejectData.rejectionReason}
              onChange={(e) => setRejectData(prev => ({ ...prev, rejectionReason: e.target.value }))}
              placeholder="Please provide a reason for rejecting this offer..."
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={rejectOffer} 
              variant="contained" 
              color="error"
              disabled={processing || !rejectData.rejectionReason.trim()}
              startIcon={processing ? <CircularProgress size={16} /> : <RejectIcon />}
            >
              {processing ? 'Rejecting...' : 'Reject Offer'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
        >
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>
    </ProtectedRoute>
  );
}