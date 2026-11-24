import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApiJson, renderWithProviders } from '../../test/TestUtils';
import { SettingsEditor } from './SettingsEditor';

type TestUser = ReturnType<typeof userEvent.setup>;

async function saveAndExpectSuccess(user: TestUser) {
  await user.click(screen.getByRole('button', { name: /^save$/i }));
  await waitFor(() => {
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });
}

describe('SettingsEditor', () => {
  it('renders the profile filters form from the portfolio', async () => {
    renderWithProviders(<SettingsEditor />);
    expect(await screen.findByText('Profile job filters')).toBeInTheDocument();
    expect(screen.getByLabelText(/remote only/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/locations/i)).toBeInTheDocument();
  });

  it('saves edited filters and shows success feedback', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsEditor />);
    const remoteSwitch = await screen.findByLabelText(/remote only/i);
    await user.click(remoteSwitch);
    await saveAndExpectSuccess(user);
  }, 30000);

  it('parses comma-separated locations on save', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsEditor />);
    const locations = await screen.findByLabelText(/locations/i);
    await user.type(locations, 'São Paulo, Rio');
    await saveAndExpectSuccess(user);
  }, 30000);

  it('shows an empty state when the portfolio is missing', async () => {
    mockApiJson(
      'get',
      '/api/portfolio',
      { error: { code: 'not_found', message: 'Portfolio not found' } },
      404,
    );
    renderWithProviders(<SettingsEditor />);
    expect(
      await screen.findByText(/create your portfolio document first/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /open portfolio/i }),
    ).toBeInTheDocument();
  });
});
