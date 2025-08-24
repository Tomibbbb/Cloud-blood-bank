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
} from '@mui/material';
import {
  Assignment as OffersIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
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
  appointmentDate?: string;
  hospitalNotes?: string;
  rejectionReason?: string;
  createdAt: string;
}

export default function DonorOffersPage() {
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<DonationOffer[]>([]);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<DonationOffer | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Mock data - TODO: Replace with actual API call
  const mockOffers: DonationOffer[] = [
    {
      id: 1,
      bloodType: 'A+',
      preferredDate: '2025-08-15T10:00:00Z',
      location: 'London',
      notes: 'First time donor',
      status: 'pending',
      routedToName: 'Royal London Hospital',
      createdAt: '2025-08-12T09:00:00Z',
    },
    {
      id: 2,
      bloodType: 'A+',
      preferredDate: '2025-08-10T14:00:00Z',
      location: 'London',
      status: 'confirmed',
      routedToName: 'St. Bartholomew\'s Hospital',
      appointmentDate: '2025-08-10T14:30:00Z',
      hospitalNotes: 'Please arrive 15 minutes early',
      createdAt: '2025-08-08T11:00:00Z',
    },
    {
      id: 3,
      bloodType: 'A+',
      preferredDate: '2025-08-05T09:00:00Z',
      location: 'London',
      status: 'rejected',
      routedToName: 'Guy\'s Hospital',
      rejectionReason: 'Currently have sufficient A+ stock',
      createdAt: '2025-08-03T16:00:00Z',
    },
  ];

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/donations/offers/mine', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // const data = await response.json();
      // setOffers(data.offers);

      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOffers(mockOffers);
    } catch (err: any) {
      setError(err.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOffer = async (offer: DonationOffer) => {
    setSelectedOffer(offer);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedOffer) return;
    
    setCancelling(true);
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/donations/offers/${selectedOffer.id}/cancel`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });

      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update local state
      setOffers(prev => prev.map(offer => 
        offer.id === selectedOffer.id 
          ? { ...offer, status: 'cancelled' as const }
          : offer
      ));

      setCancelDialogOpen(false);
      setSelectedOffer(null);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel offer');
    } finally {
      setCancelling(false);
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
    <ProtectedRoute requiredRole="donor">
      <Box sx={{ bgcolor: '#F8F9FA', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box display="flex" alignItems="center">
              <OffersIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h3" component="h1" fontWeight="bold" color="primary.main">
                  My Donation Offers
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Track your blood donation offers and appointments
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

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Card>
            <CardContent>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : offers.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No donation offers found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Submit your first donation offer to get started
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Blood Type</strong></TableCell>
                        <TableCell><strong>Preferred Date</strong></TableCell>
                        <TableCell><strong>Location</strong></TableCell>
                        <TableCell><strong>Hospital</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Appointment</strong></TableCell>
                        <TableCell><strong>Notes</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {offers.map((offer) => (
                        <TableRow key={offer.id} hover>
                          <TableCell>
                            <Chip label={offer.bloodType} variant="outlined" />
                          </TableCell>
                          <TableCell>{formatDate(offer.preferredDate)}</TableCell>
                          <TableCell>{offer.location}</TableCell>
                          <TableCell>{offer.routedToName || 'Routing...'}</TableCell>
                          <TableCell>
                            <Chip
                              label={offer.status}
                              color={getStatusColor(offer.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {offer.appointmentDate ? (
                              <Typography variant="body2">
                                {formatDate(offer.appointmentDate)}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Not scheduled
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {offer.status === 'confirmed' && offer.hospitalNotes && (
                              <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                {offer.hospitalNotes}
                              </Typography>
                            )}
                            {offer.status === 'rejected' && offer.rejectionReason && (
                              <Typography variant="body2" color="error.main" sx={{ maxWidth: 200 }}>
                                {offer.rejectionReason}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {offer.status === 'pending' && (
                              <IconButton
                                color="error"
                                onClick={() => handleCancelOffer(offer)}
                                size="small"
                              >
                                <CancelIcon />
                              </IconButton>
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

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Donation Offer</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel your donation offer for {selectedOffer?.bloodType} blood
            scheduled for {selectedOffer && formatDate(selectedOffer.preferredDate)}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Keep Offer
          </Button>
          <Button 
            onClick={confirmCancel} 
            color="error" 
            disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={16} /> : null}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Offer'}
          </Button>
        </DialogActions>
      </Dialog>
    </ProtectedRoute>
  );
}