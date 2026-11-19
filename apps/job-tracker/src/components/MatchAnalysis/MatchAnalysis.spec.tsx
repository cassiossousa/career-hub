import { screen } from '@testing-library/react';
import type { Requirement } from '../../services/types/job';
import { renderWithProviders } from '../../test/TestUtils';
import { MatchAnalysis } from './MatchAnalysis';

const requirements: Requirement[] = [
  { text: 'React', classification: 'proven', weight: 3 },
  { text: 'GraphQL', classification: 'unproven', weight: 1 },
];

describe('MatchAnalysis', () => {
  it('shows empty message when there are no requirements', () => {
    renderWithProviders(<MatchAnalysis requirements={[]} />);
    expect(screen.getByText('No requirements analyzed.')).toBeInTheDocument();
  });

  it('groups requirements by classification and computes weighted score', () => {
    renderWithProviders(<MatchAnalysis requirements={requirements} />);
    expect(screen.getByText(/React/)).toBeInTheDocument();
    expect(screen.getByText(/GraphQL/)).toBeInTheDocument();
    // proven weight 3 of total 4 => 75%
    expect(screen.getByText(/75%/)).toBeInTheDocument();
  });

  it('handles zero total weight and high scores', () => {
    renderWithProviders(
      <MatchAnalysis
        requirements={[
          { text: 'Zero', classification: 'proven', weight: 0 },
          { text: 'Top', classification: 'proven', weight: 4 },
        ]}
      />,
    );
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });
});
