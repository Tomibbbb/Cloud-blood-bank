'use client';

import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Bloodtype,
  LocalHospital,
  AdminPanelSettings,
  Login as LoginIcon,
} from '@mui/icons-material';
import Link from 'next/link';

interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'primary' | 'secondary' | 'success';
  buttonText: string;
}

const RoleCard = ({ title, description, icon, href, color, buttonText }: RoleCardProps) => {
  const theme = useTheme();
  
  const getGradient = (color: string) => {
    switch (color) {
      case 'primary':
        return 'linear-gradient(135deg, #C62828 0%, #8e0000 100%)';
      case 'secondary':
        return 'linear-gradient(135deg, #1565C0 0%, #003c8f 100%)';
      case 'success':
        return 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)';
      default:
        return 'linear-gradient(135deg, #C62828 0%, #8e0000 100%)';
    }
  };

  return (
    <Card
      elevation={6}
      sx={{
        height: '100%',
        borderRadius: 4,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          '& .role-icon': {
            transform: 'scale(1.1) rotate(5deg)',
          },
          '& .cta-button': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
          },
        },
      }}
    >
      <Box
        sx={{
          background: getGradient(color),
          color: 'white',
          py: 4,
          textAlign: 'center',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '20px',
            background: 'white',
            clipPath: 'polygon(0 20px, 100% 0, 100% 100%, 0% 100%)',
          },
        }}
      >
        <Box
          className="role-icon"
          sx={{
            fontSize: 64,
            transition: 'transform 0.3s ease-in-out',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
          }}
        >
          {icon}
        </Box>
      </Box>

      <CardContent sx={{ p: 4, textAlign: 'center', pb: 5 }}>
        <Typography
          variant="h4"
          component="h2"
          fontWeight="bold"
          gutterBottom
          color="text.primary"
          sx={{ mb: 2 }}
        >
          {title}
        </Typography>
        
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, lineHeight: 1.6 }}
        >
          {description}
        </Typography>

        <Button
          component={Link}
          href={href}
          variant="contained"
          size="large"
          className="cta-button"
          startIcon={<LoginIcon />}
          sx={{
            mt: 2,
            py: 1.5,
            px: 4,
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: 3,
            textTransform: 'none',
            background: getGradient(color),
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              background: getGradient(color),
              filter: 'brightness(1.1)',
            },
          }}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const roles = [
    {
      title: 'Donor',
      description: 'Register as a blood donor and help save lives. Manage your donation history and schedule appointments.',
      icon: <Bloodtype />,
      href: '/login', // Using general login for donors
      color: 'primary' as const,
      buttonText: 'Login as Donor',
    },
    {
      title: 'Hospital',
      description: 'Hospital staff can request blood units, manage inventory, and track patient requirements efficiently.',
      icon: <LocalHospital />,
      href: '/hospital/login',
      color: 'secondary' as const,
      buttonText: 'Hospital Login',
    },
    {
      title: 'NHS Blood Manager',
      description: 'NHS Blood Managers can oversee operations, manage users, and maintain the blood bank system.',
      icon: <AdminPanelSettings />,
      href: '/login', // Using general login for NHS Blood Managers
      color: 'success' as const,
      buttonText: 'NHS Manager Login',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F8F9FA',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar 
        position="static" 
        elevation={2}
        sx={{
          background: 'linear-gradient(135deg, #C62828 0%, #8e0000 100%)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Bloodtype sx={{ fontSize: 32, mr: 2 }} />
            <Typography
              variant="h5"
              component="h1"
              fontWeight="bold"
              sx={{
                flexGrow: 1,
                fontSize: isMobile ? '1.25rem' : '1.5rem',
              }}
            >
              Online Blood Bank Management System
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              component="h1"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: isMobile ? '2.5rem' : '3.5rem',
                background: 'linear-gradient(135deg, #C62828 0%, #1565C0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
              }}
            >
              Welcome to Our Blood Bank
            </Typography>
            
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.6,
                fontSize: isMobile ? '1.1rem' : '1.25rem',
                mb: 2,
              }}
            >
              Connecting donors, hospitals, and NHS Blood Managers for life-saving blood donations
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 600,
                mx: 'auto',
                fontSize: '1.1rem',
                opacity: 0.8,
              }}
            >
              Choose your role below to access your personalized dashboard and features
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            {roles.map((role, index) => (
              <Grid item xs={12} md={4} key={index}>
                <RoleCard {...role} />
              </Grid>
            ))}
          </Grid>

          <Paper
            elevation={4}
            sx={{
              p: 6,
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              fontWeight="bold"
              gutterBottom
              color="primary.main"
              sx={{ mb: 4 }}
            >
              System Features
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    🩸 Donor Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete donor registration and profile management system
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    🏥 Hospital Requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Streamlined blood request and allocation system for hospitals
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    📊 Real-time Tracking
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Live inventory tracking and donation history management
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    🔒 Secure Access
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Role-based authentication and data security protocols
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 4,
          backgroundColor: '#212121',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {new Date().getFullYear()} Online Blood Bank Management System. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.6, mt: 1 }}>
            Saving lives through technology and compassion
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}