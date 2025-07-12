// src/components/AuthLink.tsx
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';

const AuthLink = styled.div`
  text-align: center;
  margin-top: ${theme.spacing.md};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textLight};

  a {
    color: ${theme.colors.primary};
    font-weight: 500;

    &:hover {
      color: ${theme.colors.primaryDark};
    }
  }
`;

interface AuthLinkProps {
  text: string;
  linkText: string;
  to: string;
}

const AuthLinkComponent: React.FC<AuthLinkProps> = ({ text, linkText, to }) => {
  return (
    <AuthLink>
      {text} <Link to={to}>{linkText}</Link>
    </AuthLink>
  );
};

export default AuthLinkComponent;