// src/components/AuthCard.tsx
import styled from 'styled-components';
import { theme } from '../../theme';

const AuthCard = styled.div`
  background: ${theme.colors.background};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

export default AuthCard;