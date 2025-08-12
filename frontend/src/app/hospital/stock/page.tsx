'use client';

import { useState, useEffect } from 'react';
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
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Refresh,
  Bloodtype,
  CalendarToday,
  Info,
  Dashboard as DashboardIcon,
  ArrowBack,
} from '@mui/icons-material';
import Link from 'next/link';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface HospitalStock {
  id: number;
  bloodType: string;
  unitsAvailable: number;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface StockFormData {
  bloodType: string;
  unitsAvailable: string;
  expiryDate: string;
}

export default function HospitalStockPage() {
  const [stocks, setStocks] = useState<HospitalStock[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingStock, setEditingStock] = useState<HospitalStock | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<StockFormData>({
    bloodType: '',
    unitsAvailable: '',
    expiryDate: '',
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/hospital-stock', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStocks(data.stocks || []);
      } else {
        throw new Error('Failed to fetch stocks');
      }
    } catch (err) {
      setError('Failed to load hospital stocks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bloodType || !formData.unitsAvailable) {
      setError('Blood type and units available are required');
      return;
    }

    if (parseInt(formData.unitsAvailable) < 1) {
      setError('Units available must be at least 1');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = editingStock 
        ? `http://localhost:3000/api/hospital-stock/${editingStock.id}`
        : 'http://localhost:3000/api/hospital-stock';
      
      const method = editingStock ? 'PUT' : 'POST';
      
      const payload = {
        bloodType: formData.bloodType,
        unitsAvailable: parseInt(formData.unitsAvailable),
        ...(formData.expiryDate && { expiryDate: formData.expiryDate }),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchStocks();
        setShowDialog(false);
        setEditingStock(null);
        setFormData({
          bloodType: '',
          unitsAvailable: '',
          expiryDate: '',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save stock');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (stock: HospitalStock) => {
    setEditingStock(stock);
    setFormData({
      bloodType: stock.bloodType,
      unitsAvailable: stock.unitsAvailable.toString(),
      expiryDate: stock.expiryDate ? stock.expiryDate.split('T')[0] : '',
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this stock record?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/hospital-stock/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchStocks();
      } else {
        throw new Error('Failed to delete stock');
      }
    } catch (err) {
      setError('Failed to delete stock record');
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingStock(null);
    setFormData({
      bloodType: '',
      unitsAvailable: '',
      expiryDate: '',
    });
    setError('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  const getTotalUnits = () => stocks.reduce((sum, stock) => sum + stock.unitsAvailable, 0);
  const getBloodTypeCount = () => new Set(stocks.map(stock => stock.bloodType)).size;
  const getExpiringSoonCount = () => stocks.filter(stock => stock.expiryDate && isExpiringSoon(stock.expiryDate)).length;

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
                  <InventoryIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h3" component="h1" fontWeight="bold" color="text.primary">
                      Blood Stock Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Manage your hospital's blood type availability and inventory
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Tooltip title="Refresh stocks">
                    <IconButton color="primary" onClick={fetchStocks}>
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowDialog(true)}
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
                    Add Stock
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
                    {getTotalUnits()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Units Available
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h3" component="div" color="info.main" fontWeight="bold">
                    {getBloodTypeCount()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Blood Types Available
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h3" component="div" color="warning.main" fontWeight="bold">
                    {getExpiringSoonCount()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Expiring Soon
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
                Current Stock Inventory
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and manage your hospital's blood stock availability
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ m: 3, borderRadius: 2 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Bloodtype sx={{ mr: 1, fontSize: 20 }} />
                        Blood Type
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Units Available</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday sx={{ mr: 1, fontSize: 20 }} />
                        Expiry Date
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Last Updated</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : stocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <Typography variant="body1" color="text.secondary">
                          No blood stock records found. Add your first stock record above.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    stocks.map((stock, index) => (
                      <TableRow
                        key={stock.id}
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
                          <Chip
                            label={stock.bloodType}
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="500">
                            {stock.unitsAvailable} unit{stock.unitsAvailable !== 1 ? 's' : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {stock.expiryDate ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(stock.expiryDate)}
                              </Typography>
                              {isExpired(stock.expiryDate) && (
                                <Chip label="Expired" color="error" size="small" />
                              )}
                              {!isExpired(stock.expiryDate) && isExpiringSoon(stock.expiryDate) && (
                                <Chip label="Expiring Soon" color="warning" size="small" />
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No expiry date
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(stock.updatedAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit stock">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(stock)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete stock">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(stock.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          
          <Dialog
            open={showDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 3 }
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" component="h2" fontWeight="bold">
                {editingStock ? 'Edit Stock Record' : 'Add Blood Stock'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingStock ? 'Update the stock information' : 'Add new blood type availability to your inventory'}
              </Typography>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
              <DialogContent sx={{ pt: 2 }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Blood Type</InputLabel>
                      <Select
                        value={formData.bloodType}
                        label="Blood Type"
                        onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                        disabled={isSubmitting}
                      >
                        {bloodTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      type="number"
                      label="Units Available"
                      value={formData.unitsAvailable}
                      onChange={(e) => setFormData({ ...formData, unitsAvailable: e.target.value })}
                      disabled={isSubmitting}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Expiry Date (Optional)"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      disabled={isSubmitting}
                      InputLabelProps={{ shrink: true }}
                      helperText="Leave empty if no specific expiry date"
                    />
                  </Grid>
                </Grid>
              </DialogContent>

              <DialogActions sx={{ p: 3, pt: 2 }}>
                <Button
                  onClick={handleCloseDialog}
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
                  {isSubmitting ? 'Saving...' : (editingStock ? 'Update Stock' : 'Add Stock')}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}