import { createTheme } from '@mui/material/styles';
import { deepPurple, teal, orange, red } from '@mui/material/colors';

// Tema personalizado con colores modernos y minimalistas
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: deepPurple[600],
      light: deepPurple[400],
      dark: deepPurple[800],
      contrastText: '#ffffff',
    },
    secondary: {
      main: teal[500],
      light: teal[300],
      dark: teal[700],
      contrastText: '#ffffff',
    },
    error: {
      main: red[500],
      light: red[300],
      dark: red[700],
    },
    warning: {
      main: orange[500],
      light: orange[300],
      dark: orange[700],
    },
    success: {
      main: teal[600],
      light: teal[400],
      dark: teal[800],
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.95rem',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease-in-out',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: deepPurple[400],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: deepPurple[600],
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#ffffff',
          color: '#1a202c',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Tema oscuro
export const darkTheme = createTheme({
  ...theme,
  palette: {
    mode: 'dark',
    primary: {
      main: deepPurple[400],
      light: deepPurple[300],
      dark: deepPurple[600],
      contrastText: '#000000',
    },
    secondary: {
      main: teal[400],
      light: teal[300],
      dark: teal[600],
      contrastText: '#000000',
    },
    error: {
      main: red[400],
      light: red[300],
      dark: red[600],
    },
    warning: {
      main: orange[400],
      light: orange[300],
      dark: orange[600],
    },
    success: {
      main: teal[400],
      light: teal[300],
      dark: teal[600],
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
  },
  components: {
    ...theme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          backgroundColor: '#1e293b',
          color: '#f1f5f9',
        },
      },
    },
  },
});
