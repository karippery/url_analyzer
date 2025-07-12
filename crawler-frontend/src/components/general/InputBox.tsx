import styled from 'styled-components';
import { theme } from '../../theme';

interface InputBoxProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full'; // New size prop
  disabled?: boolean;
}

const Input = styled.input<InputBoxProps>`
  padding: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  outline: none;
  transition: border-color 0.2s;
  width: ${({ size }) => {
    switch (size) {
      case 'sm':
        return '200px';
      case 'md':
        return '300px';
      case 'lg':
        return '500px';
      case 'full':
        return '100%';
      default:
        return '100%'; // Default to full width for backward compatibility
    }
  }};

  &:focus {
    border-color: ${theme.colors.primary};
  }

  @media (max-width: 768px) {
    width: 100%; /* Full width on mobile for all sizes */
  }
`;

const InputBox: React.FC<InputBoxProps> = ({ type, placeholder, value, onChange, required, size }) => {
  return (
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      size={size}
    />
  );
};

export default InputBox;