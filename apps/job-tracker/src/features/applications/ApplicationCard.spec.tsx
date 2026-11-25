import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Application } from '../../services/types/application';
import { renderWithProviders } from '../../test/TestUtils';
import { ApplicationCard } from './ApplicationCard';

const appliedApp: Application = {
  id: 1,
  jobId: 1,
  portfolioId: 1,
  status: 'applied',
  notes: 'Tailor resume before the interview.',
  appliedAt: '2025-01-10',
  followUpAt: null,
  tags: [],
  statusChangedAt: '2025-01-10T10:00:00.000Z',
  createdAt: '2025-01-09T10:00:00.000Z',
};

const screeningApp: Application = {
  ...appliedApp,
  id: 2,
  status: 'screening',
  notes: null,
};

function renderCard(
  application: Application,
  overrides?: {
    onToggleSelect?: jest.Mock;
    onRequestAdvance?: jest.Mock;
  },
) {
  const onToggleSelect = overrides?.onToggleSelect ?? jest.fn();
  const onRequestAdvance = overrides?.onRequestAdvance ?? jest.fn();
  renderWithProviders(
    <ApplicationCard
      application={application}
      title="Frontend Engineer"
      company="Acme Corp"
      selected={false}
      onToggleSelect={onToggleSelect}
      onRequestAdvance={onRequestAdvance}
    />,
  );
  return { onToggleSelect, onRequestAdvance };
}

describe('ApplicationCard', () => {
  it('toggles selection via the checkbox', async () => {
    const user = userEvent.setup();
    const { onToggleSelect } = renderCard(appliedApp);
    await user.click(
      screen.getByRole('checkbox', { name: 'Select Frontend Engineer' }),
    );
    expect(onToggleSelect).toHaveBeenCalledWith(1);
  }, 30000);

  it('advances to the next status via the quick-action button', async () => {
    const user = userEvent.setup();
    const { onRequestAdvance } = renderCard(screeningApp);
    await user.click(screen.getByRole('button', { name: /Interview/ }));
    expect(onRequestAdvance).toHaveBeenCalledWith(screeningApp, 'interview');
  }, 30000);

  it('edits and saves notes', async () => {
    const user = userEvent.setup();
    renderCard(appliedApp);
    expect(
      screen.getByText('Tailor resume before the interview.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const field = screen.getByLabelText(/notes/i);
    await user.clear(field);
    await user.type(field, 'Updated note');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Save' }),
      ).not.toBeInTheDocument();
    });
  }, 30000);

  it('cancels notes editing and restores the draft', async () => {
    const user = userEvent.setup();
    renderCard(appliedApp);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const field = screen.getByLabelText(/notes/i);
    fireEvent.change(field, { target: { value: 'Discarded' } });
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(
      screen.getByText('Tailor resume before the interview.'),
    ).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Discarded')).not.toBeInTheDocument();
  }, 30000);

  it('shows Add for applications without notes', () => {
    renderCard(screeningApp);
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /View application/ }),
    ).toBeInTheDocument();
  }, 30000);
});
