import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';
import InputBox from '../components/general/InputBox';
import Button from '../components/general/Button';
import Message from '../components/general/Message';
import Table from '../components/Table';
import { crawl, getResults } from '../api/crawler';
import { PageWrapper, Section, SectionTitle, Spacer } from '../components/Layout';

interface BrokenLink {
  url: string;
  status: number;
}

interface ExtendedResult {
  id: number;
  crawl_request_id: number;
  html_version: string;
  title: string;
  h1_count: number;
  h2_count: number;
  h3_count: number;
  h4_count: number;
  h5_count: number;
  h6_count: number;
  internal_links: number;
  external_links: number;
  broken_links: number;
  broken_links_details?: BrokenLink[];
  has_login_form: boolean;
  processing_time: number;
  created_at: string;
}

interface ResultsResponse {
  data: ExtendedResult[];
  page: number;
  size: number;
  total?: number; // Made optional to match possible missing property
}

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
  const [results, setResults] = useState<ExtendedResult[]>([]);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchResults = async (newPage: number = page) => {
    try {
      const token = localStorage.getItem('access_token') || '';
      const data: ResultsResponse = await getResults(newPage, size, token);
      setResults(data.data);
      setTotal(data.total ?? 0);
      setPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('access_token') || '';
      await crawl({ url }, token);
      setSuccess('Crawl request submitted successfully!');
      setUrl('');
      fetchResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit crawl request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: keyof ExtendedResult) => {
    const sorted = [...results].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];
      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue as string);
      }
      return (aValue as number) - (bValue as number);
    });
    setResults(sorted);
  };

  const handleFilter = (query: string) => {
    setResults((prev) =>
      prev.filter((result) => result.title.toLowerCase().startsWith(query.toLowerCase()))
    );
  };

  const handleSignOut = () => {
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
                placeholder="Enter URL (e.g., https://en.wikipedia.org/wiki/Go_(programming_language))"
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
            onSort={handleSort}
            onFilter={handleFilter}
            onPageChange={fetchResults}
            page={page}
            size={size}
            total={total}
          />
        </Section>
      </PageWrapper>
    </DashboardContainer>
  );
};

export default DashboardPage;