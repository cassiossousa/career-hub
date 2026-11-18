import { render, screen } from '@testing-library/react';
import { TranslationProvider } from '../../i18n/Provider';
import Home from './Home';

describe('Home', () => {
  it('renders the localized hero content', () => {
    render(
      <TranslationProvider locale="en" onLocaleChange={() => {}}>
        <Home />
      </TranslationProvider>,
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Cássio dos Santos Sousa',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Senior Software Engineer',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Frontend Architecture • Large-Scale Web Platforms'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Senior Software Engineer with \d+\+ years/),
    ).toBeInTheDocument();
  });
});
