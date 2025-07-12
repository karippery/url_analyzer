import React from 'react';
import styled from 'styled-components';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { theme } from '../theme';
import { Result } from '../api/crawler';
import Button from './general/Button';
import { SectionTitle, Spacer } from './Layout';

ChartJS.register(ArcElement, Tooltip, Legend);

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${theme.colors.background};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.md};
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: ${theme.spacing.md};
    width: 95%;
  }
`;

const ChartContainer = styled.div`
  max-width: 400px;
  margin: 0 auto ${theme.spacing.lg};
`;

const BrokenLinksList = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${theme.spacing.md} 0;
`;

const BrokenLinkItem = styled.li`
  padding: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text};

  &:last-child {
    border-bottom: none;
  }
`;

const NoLinksMessage = styled.p`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text};
  text-align: center;
`;

interface BrokenLink {
  url: string;
  status: number;
}

interface ExtendedResult extends Result {
  broken_links_details?: BrokenLink[]; // Hypothetical field for broken links
}

interface DetailsModalProps {
  result: ExtendedResult;
  onClose: () => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ result, onClose }) => {
  const chartData = {
    labels: ['Internal Links', 'External Links'],
    datasets: [
      {
        data: [result.internal_links, result.external_links],
        backgroundColor: [theme.colors.primary, theme.colors.secondary],
        borderColor: [theme.colors.primaryDark, theme.colors.secondaryDark],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: parseInt(theme.fontSizes.sm),
          },
          color: theme.colors.navy,
        },
      },
    },
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <SectionTitle>{result.title}</SectionTitle>
        <ChartContainer>
          <Doughnut data={chartData} options={options} />
        </ChartContainer>
        <SectionTitle>Broken Links</SectionTitle>
        {result.broken_links_details && result.broken_links_details.length > 0 ? (
          <BrokenLinksList>
            {result.broken_links_details.map((link, index) => (
              <BrokenLinkItem key={index}>
                {link.url} (Status: {link.status})
              </BrokenLinkItem>
            ))}
          </BrokenLinksList>
        ) : (
          <NoLinksMessage>No broken links found.</NoLinksMessage>
        )}
        <Spacer size="md" />
        <Button type="button" onClick={onClose}>
          Close
        </Button>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DetailsModal;