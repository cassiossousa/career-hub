import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { TranslationProvider } from '../i18n/Provider';
import Navbar from './Navbar';

function renderNavbar(props?: {
  themeMode?: 'light' | 'dark';
  onToggleTheme?: () => void;
}) {
  return render(
    <MemoryRouter>
      <TranslationProvider>
        <Navbar {...props} />
      </TranslationProvider>
    </MemoryRouter>,
  );
}

describe('Navbar', () => {
  it('shows the home name on small screens and keeps resume navigation in the app', () => {
    render(
      <MemoryRouter>
        <TranslationProvider>
          <Navbar />
        </TranslationProvider>
      </MemoryRouter>,
    );

    const homeLink = screen.getByRole('link', {
      name: 'Cássio dos Santos Sousa',
    });
    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });

    expect(homeLink).toHaveAttribute('href', '/');
    expect(
      menuButton.compareDocumentPosition(homeLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(screen.getByRole('link', { name: /^Resume/ })).toHaveAttribute(
      'href',
      '/resume',
    );
    expect(screen.getByRole('link', { name: /^Resume/ })).not.toHaveAttribute(
      'target',
    );
  });

  it('renders the theme toggle only when theme props are provided', () => {
    renderNavbar();
    expect(
      screen.queryByRole('button', { name: 'Switch to dark mode' }),
    ).not.toBeInTheDocument();
  });

  it('toggles theme mode from the light state', async () => {
    const onToggleTheme = jest.fn();
    const user = userEvent.setup();
    renderNavbar({ themeMode: 'light', onToggleTheme });

    const toggle = screen.getByRole('button', { name: 'Switch to dark mode' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await user.click(toggle);
    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('toggles theme mode from the dark state', async () => {
    const onToggleTheme = jest.fn();
    const user = userEvent.setup();
    renderNavbar({ themeMode: 'dark', onToggleTheme });

    const toggle = screen.getByRole('button', {
      name: 'Switch to light mode',
    });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await user.click(toggle);
    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup();
    renderNavbar();

    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    const resumeLinks = screen.getAllByRole('link', { name: /^Resume/ });
    await user.click(resumeLinks[resumeLinks.length - 1]);
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });
});
