'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#C62828', // Deep red
      light: '#ff5f52',
      dark: '#8e0000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1565C0', // Blue
      light: '#5e92f3',
      dark: '#003c8f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8F9FA', // Light gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#212121', // Dark gray text
      secondary: '#757575', // Medium gray text
    },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.4,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        },
      },
    },
  },
});

export default theme;