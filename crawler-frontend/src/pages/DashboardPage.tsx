import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';
import InputBox from '../components/general/InputBox';
import Button from '../components/general/Button';
import Message from '../components/general/Message';
import Table from '../components/Table';
import { crawl, getResults, refreshToken, Result } from '../api/crawler';
import { PageWrapper, Section, SectionTitle, Spacer } from '../components/Layout';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.primary}20;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AppName = styled.h1`
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.navy};
  margin: 0;
`;

const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const SignOutButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.background};
  background: ${theme.colors.primary};
  border: none;
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

const FormContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: stretch;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CenteredSectionTitle = styled(SectionTitle)`
  text-align: center;
`;

const DashboardPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [latestCrawlId, setLatestCrawlId] = useState<number | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [token, setToken] = useState<string>(localStorage.getItem('access_token') || '');

  const fetchResults = async (newPage: number = page): Promise<Result[]> => {
    try {
      const data = await getResults(newPage, pageSize, token);
      setResults(data.data);
      setPage(data.pagination.currentPage);
      setTotalItems(data.pagination.totalItems);
      setTotalPages(data.pagination.totalPages);
      setHasNext(data.pagination.hasNext);
      setHasPrev(data.pagination.hasPrev);
      return data.data; // Return results for polling
    } catch (err: any) {
      if (err.cause?.status === 401) {
        try {
          const refreshTokenStr = localStorage.getItem('refresh_token') || '';
          const newTokens = await refreshToken(refreshTokenStr);
          localStorage.setItem('access_token', newTokens.access_token);
          localStorage.setItem('refresh_token', newTokens.refresh_token);
          setToken(newTokens.access_token);
          return await fetchResults(newPage); // Retry with new token
        } catch (refreshErr) {
          setError('Session expired. Please log in again.');
          setTimeout(() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }, 5000);
          stopPolling();
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch results');
        setTimeout(() => setError(''), 5000);
      }
      return [];
    }
  };

  const pollResults = (crawlId: number) => {
    setLatestCrawlId(crawlId);
    let pollCount = 0;
    const maxPolls = 8; // 16 seconds max (8 * 2s), covering 3–10s crawl time
    pollIntervalRef.current = setInterval(async () => {
      pollCount++;
      try {
        const results = await fetchResults(1);
        if (results.some((result: Result) => result.crawl_request_id === crawlId)) {
          setSuccess('Crawl completed successfully');
          setTimeout(() => setSuccess(''), 5000);
          stopPolling();
        } else if (pollCount >= maxPolls) {
          setError('Crawl result not found within expected time');
          setTimeout(() => setError(''), 5000);
          stopPolling();
        }
      } catch (err) {
        stopPolling();
      }
    }, 2000); // Poll every 2 seconds
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
      setLatestCrawlId(null);
    }
  };

  useEffect(() => {
    fetchResults();
    return () => stopPolling(); // Cleanup on unmount
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    stopPolling(); // Stop any existing polling

    try {
      const response = await crawl({ url }, token);
      setSuccess(response.message);
      setUrl('');
      pollResults(response.data.id); // Start polling for results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit crawl request';
      setError(errorMessage.includes('Invalid') ? errorMessage : 'Failed to submit crawl request');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
    }
  };

  const handleSignOut = () => {
    stopPolling();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  return (
    <DashboardContainer>
      <Header>
        <AppName>URL Analyzer</AppName>
        <Profile>
          <span>Profile</span>
          <SignOutButton onClick={handleSignOut}>Sign Out</SignOutButton>
        </Profile>
      </Header>
      <PageWrapper>
        <Section>
          <CenteredSectionTitle>Submit a URL</CenteredSectionTitle>
          <FormContainer>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'stretch' }}>
              <InputBox
                type="url"
                placeholder="Enter URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                size="lg"
              />
              <Button type="submit" isLoading={isLoading}>
                Send
              </Button>
            </form>
          </FormContainer>
          <Spacer size="sm" />
          {error && <Message text={error} isError />}
          {success && <Message text={success} />}
        </Section>
        <Section>
          <SectionTitle>Results Dashboard</SectionTitle>
          <Table
            results={results}
            onPageChange={fetchResults}
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrev={hasPrev}
          />
        </Section>
      </PageWrapper>
    </DashboardContainer>
  );
};

export default DashboardPage;