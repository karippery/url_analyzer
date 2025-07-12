interface CrawlRequest {
  url: string;
}

interface CrawlResponse {
  message: string; // Adjust based on your API response
}

export interface Result {
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
  has_login_form: boolean;
  processing_time: number;
  created_at: string;
}

interface ResultsResponse {
  data: Result[];
  page: number;
  size: number;
}

const API_BASE_URL = 'http://localhost:8080/api';

export const crawl = async (data: CrawlRequest, token: string): Promise<CrawlResponse> => {
  const response = await fetch(`${API_BASE_URL}/crawl`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit crawl request');
  }

  return response.json();
};

export const getResults = async (page: number = 1, size: number = 10, token: string): Promise<ResultsResponse> => {
  const response = await fetch(`${API_BASE_URL}/results?page=${page}&size=${size}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch results');
  }

  return response.json();
};