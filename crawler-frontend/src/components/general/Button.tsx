import { Button as MuiButton, CircularProgress } from '@mui/material';
import { theme } from '../../theme';


interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ type = 'button', children, isLoading, disabled, onClick }) => (
  <MuiButton
    type={type}
    variant="contained"
    disabled={disabled || isLoading}
    onClick={onClick}
    sx={{
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontSize: theme.fontSizes.sm,
      color: theme.colors.background,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      '&:hover': {
        backgroundColor: theme.colors.primaryDark,
      },
      '&.Mui-disabled': {
        backgroundColor: `${theme.colors.primary}80`,
        color: `${theme.colors.background}80`,
      },
    }}
    startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
  >
    {children}
  </MuiButton>
);

export default Button;