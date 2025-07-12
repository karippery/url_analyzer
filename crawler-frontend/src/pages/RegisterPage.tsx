// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import AuthContainer from '../components/AuthContainer';
import AuthCard from '../components/AuthCard';
import AuthForm from '../components/AuthForm';
import AuthLink from '../components/AuthLink';

interface RegisterResponse {
  message: string;
}

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed. Username may already exist.');
      }

      const data: RegisterResponse = await response.json();
      setSuccess(data.message || 'Registration successful! Please log in.');
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthForm
          title="Register"
          onSubmit={handleSubmit}
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          isLoading={isLoading}
          error={error}
          success={success}
          buttonText="Register"
        />
        <AuthLink text="Already have an account?" linkText="Login here" to="/login" />
      </AuthCard>
    </AuthContainer>
  );
};

export default RegisterPage;