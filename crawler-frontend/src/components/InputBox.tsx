// src/components/InputBox.tsx
import styled from 'styled-components';
import { theme } from '../theme';

const Input = styled.input`
  padding: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

interface InputBoxProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const InputBox: React.FC<InputBoxProps> = ({ type, placeholder, value, onChange, required }) => {
  return (
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  );
};

export default InputBox;