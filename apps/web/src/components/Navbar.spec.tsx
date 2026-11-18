import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TranslationProvider } from '../i18n/Provider';
import Navbar from './Navbar';

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
});
