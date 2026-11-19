import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/TestUtils';
import {
  EmptyState,
  ErrorState,
  errorMessage,
  LoadingState,
} from './AsyncStatus';

describe('AsyncStatus', () => {
  it('LoadingState exposes a polite status region', () => {
    renderWithProviders(<LoadingState label="Fetching jobs" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Fetching jobs')).toBeInTheDocument();
  });

  it('ErrorState renders message and invokes retry', async () => {
    const onRetry = jest.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ErrorState message="Boom" onRetry={onRetry} retryLabel="Try again" />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Boom');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('ErrorState omits the retry action when onRetry is absent', () => {
    renderWithProviders(<ErrorState message="Boom" retryLabel="Try again" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Boom');
    expect(
      screen.queryByRole('button', { name: 'Try again' }),
    ).not.toBeInTheDocument();
  });

  it('EmptyState renders title, description and action', () => {
    renderWithProviders(
      <EmptyState
        title="Nothing here"
        description="Add something"
        action={<button type="button">Add</button>}
      />,
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Add something')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('errorMessage unwraps Error and stringifies unknowns', () => {
    expect(errorMessage(new Error('x'))).toBe('x');
    expect(errorMessage('plain')).toBe('plain');
    expect(errorMessage(42)).toBe('42');
  });
});
