import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  expectErrorWithRetry,
  mockApiJson,
  renderWithProviders,
} from '../../test/TestUtils';
import { PortfolioEditor } from './PortfolioEditor';

describe('PortfolioEditor', () => {
  it('renders the portfolio basics form', async () => {
    renderWithProviders(<PortfolioEditor />);
    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/headline/i)).toBeInTheDocument();
  });

  it('renders the languages section with per-locale label fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PortfolioEditor />);
    await screen.findByLabelText(/full name/i);
    await user.click(screen.getByRole('button', { name: /^languages$/i }));
    // Seeded en document carries two languages; each exposes label fields
    // for every UI locale.
    expect(
      (await screen.findAllByLabelText(/english name/i)).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/português name/i).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByLabelText(/english proficiency/i).length,
    ).toBeGreaterThan(0);
  });

  it('shows the PDF preview in a Preview tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PortfolioEditor />);
    await screen.findByLabelText(/full name/i);
    await user.click(screen.getByRole('tab', { name: /preview/i }));
    expect(
      await screen.findByRole('heading', { name: 'Cassio Sousa' }),
    ).toBeInTheDocument();
  });

  it('saves edited basics and shows success feedback', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PortfolioEditor />);
    const nameInput = await screen.findByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');
    await user.click(screen.getByRole('button', { name: /save portfolio/i }));
    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
  });

  it('edits all basics fields before saving', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PortfolioEditor />);
    const headline = await screen.findByLabelText(/headline/i);
    await user.clear(headline);
    await user.type(headline, 'Senior Engineer');
    fireEvent.change(screen.getByLabelText(/subtitle/i), {
      target: { value: 'Subtitle text' },
    });
    fireEvent.change(screen.getByLabelText(/location/i), {
      target: { value: 'São Paulo' },
    });
    await user.click(screen.getByRole('button', { name: /save portfolio/i }));
    expect(await screen.findByText('Saved')).toBeInTheDocument();
  }, 30000);

  it('shows a save error when the update fails', async () => {
    mockApiJson(
      'put',
      '/api/portfolio',
      { error: { code: 'UPSTREAM', message: 'Save failed' } },
      500,
    );
    renderWithProviders(<PortfolioEditor />);
    await screen.findByLabelText(/full name/i);
    const form = document.querySelector('form');
    if (!form) throw new Error('expected portfolio form element');
    fireEvent.submit(form);
    expect(await screen.findByText('Save failed')).toBeInTheDocument();
  }, 30000);

  it('shows an error state when loading fails', async () => {
    mockApiJson(
      'get',
      '/api/portfolio',
      { error: { code: 'UPSTREAM', message: 'Portfolio unavailable' } },
      500,
    );
    renderWithProviders(<PortfolioEditor />);
    await expectErrorWithRetry('Portfolio unavailable');
  });
});
