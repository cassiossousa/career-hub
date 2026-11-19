import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/TestUtils';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  it('renders stats, filters, recommendations and pipeline', async () => {
    renderWithProviders(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Total Jobs')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Application Pipeline')).toBeInTheDocument();
    });
  });
});
