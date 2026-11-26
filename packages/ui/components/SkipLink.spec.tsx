import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { SkipLink } from './SkipLink';

describe('SkipLink', () => {
  it('renders a link to the target landmark', () => {
    render(<SkipLink href="#main-content" label="Skip to content" />);

    expect(
      screen.getByRole('link', { name: 'Skip to content' }),
    ).toHaveAttribute('href', '#main-content');
  });

  it('moves focus to the target element on click', () => {
    render(
      <>
        <SkipLink href="#main-content" label="Skip to content" />
        <main id="main-content" tabIndex={-1} data-testid="main">
          content
        </main>
      </>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Skip to content' }));

    expect(screen.getByTestId('main')).toHaveFocus();
  });

  it('does not throw when the target is missing', () => {
    render(<SkipLink href="#missing" label="Skip to content" />);

    expect(() => {
      fireEvent.click(screen.getByRole('link', { name: 'Skip to content' }));
    }).not.toThrow();
  });
});
