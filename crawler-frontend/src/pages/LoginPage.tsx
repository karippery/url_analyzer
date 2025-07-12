import React, { useState } from 'react';
import AuthContainer from '../components/auth/AuthContainer';
import AuthCard from '../components/auth/AuthCard';
import AuthForm from '../components/auth/AuthForm';
import AuthLink from '../components/auth/AuthLink';
import { login } from '../api/auth';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data: LoginResponse = await login({ username, password });
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      window.location.href = '/dashboard';
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
          title="Login"
          onSubmit={handleSubmit}
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          isLoading={isLoading}
          error={error}
          buttonText="Login"
        />
        <AuthLink text="Don't have an account?" linkText="Register here" to="/register" />
      </AuthCard>
    </AuthContainer>
  );
};

export default LoginPage;