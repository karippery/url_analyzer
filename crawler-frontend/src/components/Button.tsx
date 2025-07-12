// src/components/Button.tsx
import styled from 'styled-components';
import { theme } from '../theme';

const StyledButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.background};
  background: ${theme.colors.primary};
  border: none;
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${theme.colors.primaryDark};
  }

  &:disabled {
    background: ${theme.colors.border};
    cursor: not-allowed;
  }
`;

interface ButtonProps {
  type: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ type, disabled, isLoading, children }) => {
  return (
    <StyledButton type={type} disabled={disabled || isLoading}>
      {children}
    </StyledButton>
  );
};

export default Button;