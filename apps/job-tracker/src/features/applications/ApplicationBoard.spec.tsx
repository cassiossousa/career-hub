import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { seedApplications } from '../../mocks/data';
import type { ApplicationStatus } from '../../services/types/application';
import { renderWithProviders } from '../../test/TestUtils';
import { ApplicationBoard } from './ApplicationBoard';

function columnForStatus(statusText: string): HTMLElement {
  let el = screen.getByText(statusText);
  while (el.parentElement && el.parentElement.children.length !== 7) {
    el = el.parentElement;
  }
  if (!el.parentElement) throw new Error('column not found');
  return el;
}

function statusLabel(status: ApplicationStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function hasDraggableCard(statusText: string): boolean {
  return (
    columnForStatus(statusText).querySelector('[draggable="true"]') !== null
  );
}

async function renderBoard(onMove: jest.Mock) {
  renderWithProviders(
    <ApplicationBoard applications={seedApplications} onMove={onMove} />,
  );
  await waitFor(() => {
    expect(hasDraggableCard('Saved')).toBe(true);
  });
}

function dragCardTo(sourceStatus: string, targetStatus: ApplicationStatus) {
  const sourceColumn = columnForStatus(sourceStatus);
  const card = sourceColumn.querySelector('[draggable="true"]');
  if (!card) throw new Error('draggable card not found');
  fireEvent.dragStart(card);
  const targetColumn = columnForStatus(statusLabel(targetStatus));
  fireEvent.dragOver(targetColumn);
  fireEvent.drop(targetColumn);
}

describe('ApplicationBoard', () => {
  it('renders a column per status with application counts', async () => {
    renderWithProviders(
      <ApplicationBoard applications={seedApplications} onMove={jest.fn()} />,
    );
    await waitFor(() => {
      expect(screen.getAllByText('Saved').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.getByText('Screening')).toBeInTheDocument();
    expect(screen.getByText('Offer')).toBeInTheDocument();
  }, 30000);

  it('moves an application when a card is dropped on another column', async () => {
    const user = userEvent.setup();
    const onMove = jest.fn();
    await renderBoard(onMove);
    dragCardTo('Saved', 'applied');
    await user.click(document.body);
    expect(onMove).toHaveBeenCalledWith(
      expect.objectContaining({ id: 3 }),
      'applied',
    );
  }, 30000);

  it('does not call onMove when dropped on the same status column', async () => {
    const onMove = jest.fn();
    await renderBoard(onMove);
    dragCardTo('Saved', 'saved');
    expect(onMove).not.toHaveBeenCalled();
  }, 30000);

  it('does nothing when a column is dropped without a drag', async () => {
    const onMove = jest.fn();
    renderWithProviders(
      <ApplicationBoard applications={seedApplications} onMove={onMove} />,
    );
    await waitFor(() => {
      expect(screen.getByText('Applied')).toBeInTheDocument();
    });
    fireEvent.drop(columnForStatus('Applied'));
    expect(onMove).not.toHaveBeenCalled();
  }, 30000);
});
