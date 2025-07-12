import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';
import { Result } from '../api/crawler';
import DetailsModal from './DetailsModal';
import { Spacer } from './Layout';
import InputBox from './general/InputBox';
import Button from './general/Button';

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.primary}20;
  color: ${theme.colors.navy};
  font-size: ${theme.fontSizes.sm};
  text-align: left;
  cursor: pointer;
  user-select: none;
  min-width: 100px;
  max-width: 300px;

  &:hover {
    background: ${theme.colors.primaryDark}20;
  }

  &:nth-child(3),
  &:nth-child(4),
  &:nth-child(5) {
    text-align: right;
  }
`;

const Td = styled.td`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text};

  &:nth-child(3),
  &:nth-child(4),
  &:nth-child(5) {
    text-align: right;
  }
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background: ${theme.colors.background}F5;
  }
  &:hover {
    background: ${theme.colors.primary}10;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing.md};
`;

interface BrokenLink {
  url: string;
  status: number;
}

interface ExtendedResult extends Result {
  broken_links_details?: BrokenLink[];
}

interface TableProps {
  results: ExtendedResult[];
  onSort: (column: keyof ExtendedResult) => void;
  onFilter: (query: string) => void;
  onPageChange: (page: number) => void;
  page: number;
  size: number;
  total: number;
}

const Table: React.FC<TableProps> = ({ results, onSort, onFilter, onPageChange, page, size, total }) => {
  const [sortColumn, setSortColumn] = useState<keyof ExtendedResult | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedResult, setSelectedResult] = useState<ExtendedResult | null>(null);

  const handleSort = (column: keyof ExtendedResult) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort(column);
  };

  return (
    <TableContainer>
      <InputBox
        type="text"
        placeholder="Search by title..."
        value=""
        onChange={(e) => onFilter(e.target.value)}
        size="md"
      />
      <Spacer size="md" />
      <StyledTable>
        <thead>
          <tr>
            <Th onClick={() => handleSort('title')}>Title</Th>
            <Th onClick={() => handleSort('html_version')}>HTML Version</Th>
            <Th onClick={() => handleSort('internal_links')}>Internal Links</Th>
            <Th onClick={() => handleSort('external_links')}>External Links</Th>
            <Th onClick={() => handleSort('broken_links')}>Broken Links</Th>
            <Th onClick={() => handleSort('created_at')}>Created At</Th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <Tr key={result.id} onClick={() => setSelectedResult(result)} style={{ cursor: 'pointer' }}>
              <Td>{result.title}</Td>
              <Td>{result.html_version}</Td>
              <Td>{result.internal_links}</Td>
              <Td>{result.external_links}</Td>
              <Td>{result.broken_links}</Td>
              <Td>{new Date(result.created_at).toLocaleString()}</Td>
            </Tr>
          ))}
        </tbody>
      </StyledTable>
      <Spacer size="md" />
      <Pagination>
        <Button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span>Page {page} of {Math.ceil(total / size)}</span>
        <Button
          type="button"
          disabled={page * size >= total}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </Pagination>
      {selectedResult && <DetailsModal result={selectedResult} onClose={() => setSelectedResult(null)} />}
    </TableContainer>
  );
};

export default Table;