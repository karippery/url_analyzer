// src/components/Message.tsx
import styled from 'styled-components';
import { theme } from '../theme';

const StyledMessage = styled.p<{ $isError?: boolean }>`
  color: ${({ $isError }) => ($isError ? theme.colors.error : theme.colors.secondary)};
  font-size: ${theme.fontSizes.sm};
  text-align: center;
  margin: 0;
`;

interface MessageProps {
  text: string;
  isError?: boolean;
}

const Message: React.FC<MessageProps> = ({ text, isError }) => {
  return <StyledMessage $isError={isError}>{text}</StyledMessage>;
};

export default Message;