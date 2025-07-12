import { Box, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import muiTheme from '../muiTheme';

export const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={muiTheme}>
    <Box
      sx={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: (theme) => theme.spacing(2), // Maps to theme.spacing.lg
        '@media (max-width: 768px)': {
          padding: (theme) => theme.spacing(1), // Maps to theme.spacing.md
        },
      }}
    >
      {children}
    </Box>
  </ThemeProvider>
);

export const Section = ({ children }: { children: React.ReactNode }) => (
  <Box component="section" sx={{ marginBottom: (theme) => theme.spacing(2) }}>
    {children}
  </Box>
);

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography
    variant="h2"
    sx={{
      marginBottom: (theme) => theme.spacing(1),
    }}
  >
    {children}
  </Typography>
);

export const Spacer = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <Box
    sx={{
      height: (theme) => ({
        sm: theme.spacing(0.5),
        md: theme.spacing(1),
        lg: theme.spacing(2),
      })[size],
    }}
  />
);