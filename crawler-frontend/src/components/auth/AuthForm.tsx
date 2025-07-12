// src/components/AuthForm.tsx
import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import InputBox from '../general/InputBox';
import Button from '../general/Button';
import Message from '../general/Message';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const Title = styled.h2`
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.navy};
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
`;

interface AuthFormProps {
  title: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isLoading: boolean;
  error?: string;
  success?: string;
  buttonText: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  onSubmit,
  username,
  setUsername,
  password,
  setPassword,
  isLoading,
  error,
  success,
  buttonText,
}) => {
  return (
    <>
      <Title>{title}</Title>
      <Form onSubmit={onSubmit}>
        <InputBox
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <InputBox
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" isLoading={isLoading}>
          {isLoading ? `${buttonText}ing...` : buttonText}
        </Button>
        {error && <Message text={error} isError />}
        {success && <Message text={success} />}
      </Form>
    </>
  );
};

export default AuthForm;