'use client';

import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  LocalHospital,
  Bloodtype,
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    handleUserMenuClose();
  };

  const getRoleBasedLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'admin':
        return [
          { href: '/admin/dashboard', label: 'Dashboard', icon: <Dashboard /> },
          { href: '/admin/inventory', label: 'Inventory', icon: <Bloodtype /> },
          { href: '/admin/requests', label: 'Requests', icon: <LocalHospital /> },
        ];
      case 'hospital':
        return [
          { href: '/hospital/requests', label: 'My Requests', icon: <LocalHospital /> },
          { href: '/hospital/new-request', label: 'New Request', icon: <Bloodtype /> },
        ];
      case 'donor':
        return [
          { href: '/donor/dashboard', label: 'Dashboard', icon: <Dashboard /> },
          { href: '/donor/profile', label: 'My Profile', icon: <AccountCircle /> },
          { href: '/donor/request-blood', label: 'Request Blood', icon: <Bloodtype /> },
          { href: '/donor/donations', label: 'My Donations', icon: <LocalHospital /> },
        ];
      default:
        return [];
    }
  };

  const navigationLinks = getRoleBasedLinks();

  const renderMobileDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
    >
      <Box sx={{ width: 250, pt: 2 }}>
        <Typography variant="h6" sx={{ px: 2, pb: 2 }}>
          Blood Bank System
        </Typography>
        <List>
          {navigationLinks.map((link) => (
            <ListItem 
              key={link.href} 
              component={Link} 
              href={link.href}
              onClick={() => setMobileDrawerOpen(false)}
            >
              <Box sx={{ mr: 2 }}>{link.icon}</Box>
              <ListItemText primary={link.label} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          
          {isMobile && isAuthenticated && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 'bold',
              transition: 'color 0.2s ease-in-out',
              '&:hover': {
                color: 'primary.dark',
              },
            }}
          >
            🩸 Blood Bank System
          </Typography>

          
          {!isMobile && isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navigationLinks.map((link) => (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  startIcon={link.icon}
                  color="inherit"
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          )}

          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthenticated ? (
              <>
                <Chip
                  label={user?.role}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <IconButton
                  size="large"
                  aria-label="account menu"
                  aria-controls="user-menu"
                  aria-haspopup="true"
                  onClick={handleUserMenuOpen}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="user-menu"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                >
                  <MenuItem disabled>
                    <Typography variant="body2">
                      {user?.firstName} {user?.lastName}
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  href="/login"
                  color="inherit"
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  variant="contained"
                  color="primary"
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      
      {renderMobileDrawer()}
    </>
  );
}