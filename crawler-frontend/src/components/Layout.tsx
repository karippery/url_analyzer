import styled from 'styled-components';
import { theme } from '../theme';

export const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};

  @media (max-width: 768px) {
    padding: ${theme.spacing.md};
  }
`;

export const Section = styled.section`
  margin-bottom: ${theme.spacing.lg};
`;

export const SectionTitle = styled.h2`
  font-size: ${theme.fontSizes.lg};
  color: ${theme.colors.navy};
  margin-bottom: ${theme.spacing.md};
`;

export const Spacer = styled.div<{ size?: keyof typeof theme.spacing }>`
  height: ${(props) => theme.spacing[props.size || 'md']};
`;