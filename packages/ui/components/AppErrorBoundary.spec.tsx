import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppErrorBoundary } from './AppErrorBoundary';

function Bomb(): never {
  throw new Error('render blew up');
}

describe('AppErrorBoundary', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('renders children when nothing throws', () => {
    render(
      <AppErrorBoundary>
        <p>all good</p>
      </AppErrorBoundary>,
    );
    expect(screen.getByText('all good')).toBeInTheDocument();
  });

  it('renders the default fallback with a reload action after a crash', async () => {
    const user = userEvent.setup();

    render(
      <AppErrorBoundary>
        <Bomb />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText('Something went wrong. Please reload the page.'),
    ).toBeInTheDocument();

    // jsdom does not implement navigation; clicking exercises the handler.
    await user.click(screen.getByRole('button', { name: 'Reload' }));
  });

  it('renders a custom fallback when provided', () => {
    render(
      <AppErrorBoundary fallback={<p>custom fallback</p>}>
        <Bomb />
      </AppErrorBoundary>,
    );
    expect(screen.getByText('custom fallback')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
