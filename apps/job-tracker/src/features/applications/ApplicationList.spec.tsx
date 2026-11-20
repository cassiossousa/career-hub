import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  expectErrorWithRetry,
  mockApiJson,
  renderWithProviders,
} from '../../test/TestUtils';
import { ApplicationList } from './ApplicationList';

async function expandToLoaded() {
  await screen.findByText('Applications', {}, { timeout: 8000 });
  await waitFor(() => {
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
  });
}

describe('ApplicationList', () => {
  it('renders application rows with status chips by default', async () => {
    renderWithProviders(<ApplicationList />);
    await expandToLoaded();
    expect(screen.getAllByText('Applied').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Screening').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Saved').length).toBeGreaterThan(0);
  }, 30000);

  it('switches to the kanban board view', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ApplicationList />);
    await expandToLoaded();
    await user.click(screen.getByRole('button', { name: 'Board' }));
    await waitFor(() => {
      expect(screen.getAllByText('Interview').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('Offer')).toBeInTheDocument();
  }, 30000);

  it('bulk-moves selected applications and offers undo', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ApplicationList />);
    await expandToLoaded();

    // header checkbox is index 0; second seeded row is 'screening',
    // so 'applied' is a real move
    const checkbox = screen.getAllByRole('checkbox')[2];
    if (!checkbox) throw new Error('expected selection checkbox');
    await user.click(checkbox);
    expect(await screen.findByText('1 selected')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Move selected' }));
    expect(
      await screen.findByRole('button', { name: 'Undo' }, { timeout: 8000 }),
    ).toBeInTheDocument();
  }, 60000);

  it('asks for a reason before rejecting an application', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ApplicationList />);
    await expandToLoaded();

    const selects = screen.getAllByRole('combobox');
    const statusSelect = selects[selects.length - 1];
    if (!statusSelect) throw new Error('expected status select');
    await user.click(statusSelect);
    await user.click(await screen.findByRole('option', { name: 'Rejected' }));

    const dialog = await screen.findByRole('dialog');
    const reasonField = within(dialog).getByLabelText(/reason/i);
    await user.type(reasonField, 'Not a fit');
    await user.click(within(dialog).getByRole('button', { name: 'Next' }));
    await waitFor(() => {
      expect(screen.getAllByText('Rejected').length).toBeGreaterThan(0);
    });
  }, 60000);

  it('exports applications as CSV and JSON', async () => {
    const user = userEvent.setup();
    const createUrl = jest.fn(() => 'blob:mock');
    const revokeUrl = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      value: createUrl,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeUrl,
      configurable: true,
      writable: true,
    });
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    renderWithProviders(<ApplicationList />);
    await expandToLoaded();
    await user.click(screen.getByRole('button', { name: 'Export CSV' }));
    await user.click(screen.getByRole('button', { name: 'Export JSON' }));

    expect(createUrl).toHaveBeenCalledTimes(2);
    expect(click).toHaveBeenCalledTimes(2);
    expect(revokeUrl).toHaveBeenCalledTimes(2);
    jest.restoreAllMocks();
    Reflect.deleteProperty(URL, 'createObjectURL');
    Reflect.deleteProperty(URL, 'revokeObjectURL');
  }, 30000);

  it('shows an error state when loading fails', async () => {
    mockApiJson(
      'get',
      '/api/applications',
      { error: { code: 'UPSTREAM', message: 'Applications unavailable' } },
      500,
    );
    renderWithProviders(<ApplicationList />);
    await expectErrorWithRetry('Applications unavailable');
  });
});
