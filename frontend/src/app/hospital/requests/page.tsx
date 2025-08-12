'use client';

import { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  LocalHospital,
  Refresh,
  FilterList,
  GetApp as ExportIcon,
  Bloodtype,
  Schedule,
  Person,
  ArrowBack,
} from '@mui/icons-material';
import Link from 'next/link';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface BloodRequest {
  id: number;
  bloodType: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  patientName: string;
  reason: string;
  requestedAt: string;
  patientAge?: number;
  requiredBy?: string;
  notes?: string;
}

interface NewRequestData {
  bloodType: string;
  quantity: string;
  urgency: string;
  patientName: string;
  patientAge: string;
  reason: string;
  requiredBy: string;
  notes: string;
}

export default function HospitalRequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([
    {
      id: 1,
      bloodType: 'A+',
      quantity: 3,
      urgency: 'high',
      status: 'pending',
      patientName: 'John Doe',
      reason: 'Emergency surgery',
      requestedAt: '2024-01-15T10:00:00Z',
      patientAge: 45,
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
      patientAge: 32,
    },
    {
      id: 3,
      bloodType: 'B+',
      quantity: 1,
      urgency: 'medium',
      status: 'fulfilled',
      patientName: 'Mike Johnson',
      reason: 'Scheduled surgery',
      requestedAt: '2024-01-13T14:15:00Z',
      patientAge: 58,
    },
    {
      id: 4,
      bloodType: 'AB-',
      quantity: 4,
      urgency: 'low',
      status: 'rejected',
      patientName: 'Sarah Wilson',
      reason: 'Blood transfusion',
      requestedAt: '2024-01-12T11:45:00Z',
      patientAge: 28,
    },
  ]);

  const [showNewRequest, setShowNewRequest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRequest, setNewRequest] = useState<NewRequestData>({
    bloodType: '',
    quantity: '',
    urgency: 'medium',
    patientName: '',
    patientAge: '',
    reason: '',
    requiredBy: '',
    notes: '',
  });

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add new request to the list (in real app, this would come from the API response)
      const newRequestItem: BloodRequest = {
        id: requests.length + 1,
        bloodType: newRequest.bloodType,
        quantity: parseInt(newRequest.quantity),
        urgency: newRequest.urgency as BloodRequest['urgency'],
        status: 'pending',
        patientName: newRequest.patientName,
        reason: newRequest.reason,
        requestedAt: new Date().toISOString(),
        patientAge: parseInt(newRequest.patientAge),
        requiredBy: newRequest.requiredBy,
        notes: newRequest.notes,
      };
      
      setRequests(prev => [newRequestItem, ...prev]);
      setShowNewRequest(false);
      setNewRequest({
        bloodType: '',
        quantity: '',
        urgency: 'medium',
        patientName: '',
        patientAge: '',
        reason: '',
        requiredBy: '',
        notes: '',
      });
    } catch (error) {
      console.error('Failed to submit request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: BloodRequest['status']) => {
    switch (status) {
      case 'pending':
        return { color: 'warning' as const, label: 'Pending' };
      case 'approved':
        return { color: 'info' as const, label: 'Approved' };
      case 'rejected':
        return { color: 'error' as const, label: 'Rejected' };
      case 'fulfilled':
        return { color: 'success' as const, label: 'Fulfilled' };
      default:
        return { color: 'default' as const, label: 'Unknown' };
    }
  };

  const getUrgencyColor = (urgency: BloodRequest['urgency']) => {
    switch (urgency) {
      case 'critical':
        return { color: 'error' as const, label: 'Critical' };
      case 'high':
        return { color: 'warning' as const, label: 'High' };
      case 'medium':
        return { color: 'info' as const, label: 'Medium' };
      case 'low':
        return { color: 'success' as const, label: 'Low' };
      default:
        return { color: 'default' as const, label: 'Unknown' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTotalRequests = () => requests.length;
  const getPendingRequests = () => requests.filter(r => r.status === 'pending').length;
  const getApprovedRequests = () => requests.filter(r => r.status === 'approved').length;

  return (
    <ProtectedRoute requiredRole="hospital">
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#F8F9FA',
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          
          <Box sx={{ mb: 3 }}>
            <Button
              component={Link}
              href="/hospital/dashboard"
              startIcon={<ArrowBack />}
              variant="text"
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
                textTransform: 'none',
              }}
            >
              Back to Dashboard
            </Button>
          </Box>

          
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocalHospital sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h3" component="h1" fontWeight="bold" color="text.primary">
                      Blood Requests
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Manage and track your hospital's blood requests
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Tooltip title="Refresh requests">
                    <IconButton color="primary">
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export data">
                    <IconButton color="primary">
                      <ExportIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowNewRequest(true)}
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #C62828 0%, #8e0000 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8e0000 0%, #C62828 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 20px rgba(198, 40, 40, 0.3)',
                      },
                    }}
                  >
                    New Request
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h3" component="div" color="primary.main" fontWeight="bold">
                    {getTotalRequests()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h3" component="div" color="warning.main" fontWeight="bold">
                    {getPendingRequests()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h3" component="div" color="success.main" fontWeight="bold">
                    {getApprovedRequests()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Approved
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          
          <Paper
            elevation={4}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" component="h2" fontWeight="600">
                Request History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and manage all your blood requests
              </Typography>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1, fontSize: 20 }} />
                        Patient
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Bloodtype sx={{ mr: 1, fontSize: 20 }} />
                        Blood Type
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Quantity</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Urgency</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Schedule sx={{ mr: 1, fontSize: 20 }} />
                        Requested Date
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography variant="body1" color="text.secondary">
                          No blood requests found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request, index) => (
                      <TableRow
                        key={request.id}
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: 'action.hover',
                          },
                          '&:hover': {
                            backgroundColor: 'action.selected',
                          },
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              {request.patientName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {request.reason}
                            </Typography>
                            {request.patientAge && (
                              <Typography variant="caption" color="text.secondary">
                                Age: {request.patientAge}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={request.bloodType}
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="500">
                            {request.quantity} unit{request.quantity !== 1 ? 's' : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getUrgencyColor(request.urgency).label}
                            color={getUrgencyColor(request.urgency).color}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusColor(request.status).label}
                            color={getStatusColor(request.status).color}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(request.requestedAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          
          <Dialog
            open={showNewRequest}
            onClose={() => setShowNewRequest(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 3 }
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" component="h2" fontWeight="bold">
                Create Blood Request
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill out the form below to submit a new blood request
              </Typography>
            </DialogTitle>
            
            <form onSubmit={handleSubmitRequest}>
              <DialogContent sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Patient Name"
                      value={newRequest.patientName}
                      onChange={(e) => setNewRequest({ ...newRequest, patientName: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      type="number"
                      label="Patient Age"
                      value={newRequest.patientAge}
                      onChange={(e) => setNewRequest({ ...newRequest, patientAge: e.target.value })}
                      disabled={isSubmitting}
                      inputProps={{ min: 0, max: 120 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Blood Type</InputLabel>
                      <Select
                        value={newRequest.bloodType}
                        label="Blood Type"
                        onChange={(e) => setNewRequest({ ...newRequest, bloodType: e.target.value })}
                        disabled={isSubmitting}
                      >
                        <MenuItem value="A+">A+</MenuItem>
                        <MenuItem value="A-">A-</MenuItem>
                        <MenuItem value="B+">B+</MenuItem>
                        <MenuItem value="B-">B-</MenuItem>
                        <MenuItem value="AB+">AB+</MenuItem>
                        <MenuItem value="AB-">AB-</MenuItem>
                        <MenuItem value="O+">O+</MenuItem>
                        <MenuItem value="O-">O-</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      type="number"
                      label="Quantity (units)"
                      value={newRequest.quantity}
                      onChange={(e) => setNewRequest({ ...newRequest, quantity: e.target.value })}
                      disabled={isSubmitting}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Urgency</InputLabel>
                      <Select
                        value={newRequest.urgency}
                        label="Urgency"
                        onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
                        disabled={isSubmitting}
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="critical">Critical</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="datetime-local"
                      label="Required By"
                      value={newRequest.requiredBy}
                      onChange={(e) => setNewRequest({ ...newRequest, requiredBy: e.target.value })}
                      disabled={isSubmitting}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Medical Reason"
                      value={newRequest.reason}
                      onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                      disabled={isSubmitting}
                      placeholder="e.g., Emergency surgery, Chemotherapy, Blood transfusion"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Additional Notes"
                      value={newRequest.notes}
                      onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                      disabled={isSubmitting}
                      placeholder="Any additional information or special requirements..."
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              
              <DialogActions sx={{ p: 3, pt: 2 }}>
                <Button
                  onClick={() => setShowNewRequest(false)}
                  disabled={isSubmitting}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <AddIcon />}
                  sx={{
                    px: 4,
                    background: 'linear-gradient(135deg, #C62828 0%, #8e0000 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8e0000 0%, #C62828 100%)',
                    },
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}