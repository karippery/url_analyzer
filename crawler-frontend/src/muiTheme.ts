import { createTheme } from '@mui/material/styles';
import { theme } from './theme';

const muiTheme = createTheme({
  palette: {
    primary: {
      main: theme.colors.primary,
      dark: theme.colors.primaryDark,
    },
    background: {
      default: theme.colors.background,
      paper: `${theme.colors.background}F5`,
    },
    text: {
      primary: theme.colors.navy,
      secondary: theme.colors.text,
    },
    divider: theme.colors.border,
  },
  spacing: (factor: number) => theme.spacing.md, // MUI uses a factor-based spacing system
  typography: {
    h2: {
      fontSize: theme.fontSizes.lg,
      color: theme.colors.navy,
    },
    body1: {
      fontSize: theme.fontSizes.sm,
    },
    body2: {
      fontSize: theme.fontSizes.md,
    },
  },
  components: {
    MuiTable: {
      styleOverrides: {
        root: {
          borderRadius: theme.borderRadius.md,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          backgroundColor: `${theme.colors.primary}20`,
          color: theme.colors.navy,
          fontSize: theme.fontSizes.sm,
          textAlign: 'left',
          cursor: 'pointer',
          userSelect: 'none',
          minWidth: '100px',
          maxWidth: '300px',
          '&:hover': {
            backgroundColor: `${theme.colors.primaryDark}20`,
          },
        },
        body: {
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          borderTop: `1px solid ${theme.colors.border}`,
          fontSize: theme.fontSizes.sm,
          color: theme.colors.text,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: `${theme.colors.background}F5`,
          },
          '&:hover': {
            backgroundColor: `${theme.colors.primary}10`,
          },
        },
      },
    },
  },
});

export default muiTheme;