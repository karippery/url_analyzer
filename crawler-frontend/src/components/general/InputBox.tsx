import { TextField } from '@mui/material';
import { theme } from '../../theme';

interface InputBoxProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

const InputBox: React.FC<InputBoxProps> = ({
  type,
  placeholder,
  value,
  onChange,
  required,
  size,
}) => {
  const getWidth = () => {
    switch (size) {
      case 'sm':
        return '200px';
      case 'md':
        return '300px';
      case 'lg':
        return '500px';
      case 'full':
      default:
        return '100%';
    }
  };

  return (
    <TextField
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      fullWidth={size === 'full'}
      variant="outlined"
      sx={{
        width: getWidth(),
        '& .MuiInputBase-root': {
          height: '36px',
          padding: '0 12px',
          fontSize: theme.fontSizes.md,
          borderRadius: theme.borderRadius.sm,
        },
        '& input': {
          padding: 0,
          height: '100%',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.colors.border,
        },
        '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.colors.primary,
        },
        '@media (max-width: 768px)': {
          width: '100%',
        },
      }}
    />
  );
};

export default InputBox;
