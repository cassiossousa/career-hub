import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/TestUtils';
import { PipelineInsights } from './PipelineInsights';

describe('PipelineInsights', () => {
  it('renders funnel metrics for seeded applications', async () => {
    renderWithProviders(<PipelineInsights />);
    expect(
      await screen.findByText('Pipeline insights', {}, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Response rate')).toBeInTheDocument();
    expect(screen.getByText('Reached interview')).toBeInTheDocument();
    expect(screen.getByText('Applied this week')).toBeInTheDocument();
    expect(screen.getByText('Top source')).toBeInTheDocument();
  }, 30000);
});
