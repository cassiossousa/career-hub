import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TranslationProvider } from '../i18n/provider';
import Navbar from './Navbar';

describe('Navbar', () => {
  it('shows the home name on small screens and keeps resume navigation in the app', () => {
    render(
      <MemoryRouter>
        <TranslationProvider locale="en" onLocaleChange={() => {}}>
          <Navbar />
        </TranslationProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: 'Cássio dos Santos Sousa' }),
    ).toHaveAttribute('href', '/');

    expect(screen.getByRole('link', { name: /^Resume/ })).toHaveAttribute(
      'href',
      '/resume',
    );
    expect(screen.getByRole('link', { name: /^Resume/ })).not.toHaveAttribute(
      'target',
    );
  });
});
