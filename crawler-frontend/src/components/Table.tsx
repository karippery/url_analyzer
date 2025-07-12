import React, { useState } from 'react';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Result } from '../api/crawler';
import Button from './general/Button';
import DetailsModal from './DetailsModal';
import { Spacer } from './Layout';

interface TableProps {
  results: Result[];
  onPageChange: (page: number) => void;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const ResultsTable: React.FC<TableProps> = ({ results, onPageChange, page, pageSize, totalItems, totalPages, hasNext, hasPrev }) => {
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Spacer size="md" />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>HTML Version</TableCell>
            <TableCell sx={{ textAlign: 'right' }}>Internal Links</TableCell>
            <TableCell sx={{ textAlign: 'right' }}>External Links</TableCell>
            <TableCell sx={{ textAlign: 'right' }}>Broken Links</TableCell>
            <TableCell>Created At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.id} onClick={() => setSelectedResult(result)} sx={{ cursor: 'pointer' }}>
              <TableCell>{result.title}</TableCell>
              <TableCell>{result.html_version}</TableCell>
              <TableCell sx={{ textAlign: 'right' }}>{result.internal_links}</TableCell>
              <TableCell sx={{ textAlign: 'right' }}>{result.external_links}</TableCell>
              <TableCell sx={{ textAlign: 'right' }}>{result.broken_links}</TableCell>
              <TableCell>{new Date(result.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Spacer size="md" />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: (theme) => theme.spacing(1),
        }}
      >
        <Button type="button" disabled={!hasPrev} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Typography variant="body1">
          Page {page} of {totalPages} ({totalItems} items)
        </Typography>
        <Button type="button" disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </Box>
      {selectedResult && <DetailsModal result={selectedResult} onClose={() => setSelectedResult(null)} />}
    </Box>
  );
};

export default ResultsTable;