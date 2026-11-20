import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { seedApplications } from '../../mocks/data';
import type { ApplicationStatus } from '../../services/types/application';
import { renderWithProviders } from '../../test/TestUtils';
import { ApplicationTable } from './ApplicationTable';

function renderTable(selected = new Set<number>()) {
  const onToggleSelect = jest.fn();
  const onRequestAdvance = jest.fn();
  renderWithProviders(
    <ApplicationTable
      applications={seedApplications}
      selected={selected}
      titleFor={(app) => `Job ${app.jobId}`}
      onToggleSelect={onToggleSelect}
      onRequestAdvance={onRequestAdvance}
    />,
  );
  return { onToggleSelect, onRequestAdvance };
}

describe('ApplicationTable', () => {
  it('renders a row per application with status chips', () => {
    renderTable();
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(seedApplications.length + 1);
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    expect(screen.getAllByText('Applied').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Screening').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Saved').length).toBeGreaterThan(0);
  });

  it('select-all toggles every application id', async () => {
    const user = userEvent.setup();
    const { onToggleSelect } = renderTable();
    await user.click(screen.getByRole('checkbox', { name: 'Select all' }));
    expect(onToggleSelect).toHaveBeenCalledTimes(seedApplications.length);
    for (const app of seedApplications) {
      expect(onToggleSelect).toHaveBeenCalledWith(app.id);
    }
  });

  it('requests an advance when the status select changes', async () => {
    const user = userEvent.setup();
    const { onRequestAdvance } = renderTable();
    const firstRow = screen.getAllByRole('row')[1];
    if (!firstRow) throw new Error('expected a data row');
    const statusSelect = within(firstRow).getByRole('combobox');
    await user.click(statusSelect);
    await user.click(await screen.findByRole('option', { name: 'Interview' }));
    expect(onRequestAdvance).toHaveBeenCalledWith(
      seedApplications[0],
      'interview' satisfies ApplicationStatus,
    );
  });
});
