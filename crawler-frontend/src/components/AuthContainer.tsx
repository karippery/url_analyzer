// src/components/AuthContainer.tsx
import styled from 'styled-components';
import { theme } from '../theme';

const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${theme.colors.primary}20,
    ${theme.colors.secondary}20
  );
  padding: ${theme.spacing.md};
`;

export default AuthContainer;