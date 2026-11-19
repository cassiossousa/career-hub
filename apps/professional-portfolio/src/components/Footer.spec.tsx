import { render, screen } from '@testing-library/react';
import { TranslationProvider } from '../i18n/Provider';
import Footer from './Footer';

describe('Footer', () => {
  it('renders identity, social links, and the copyright year', () => {
    render(
      <TranslationProvider>
        <Footer />
      </TranslationProvider>,
    );

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(
      screen.getAllByText('Cássio dos Santos Sousa').length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(`© ${new Date().getFullYear()} Cássio dos Santos Sousa`),
    ).toBeInTheDocument();

    const github = screen.getByRole('link', { name: 'GitHub' });
    expect(github).toHaveAttribute('href', 'https://github.com/cassiossousa');
    expect(github).toHaveAttribute('target', '_blank');
    expect(github).toHaveAttribute('rel', expect.stringContaining('noopener'));

    const linkedin = screen.getByRole('link', { name: 'LinkedIn' });
    expect(linkedin).toHaveAttribute(
      'href',
      'https://linkedin.com/in/cassiossousa',
    );

    expect(
      screen.getByRole('navigation', { name: 'Footer navigation' }),
    ).toBeInTheDocument();
  });
});
