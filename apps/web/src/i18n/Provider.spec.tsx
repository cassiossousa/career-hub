import { render, screen } from '@testing-library/react';
import { TranslationProvider, useTranslation } from './Provider';

function Consumer() {
  const { locale } = useTranslation();
  return <div>{locale}</div>;
}

describe('useTranslation', () => {
  it('throws when used outside TranslationProvider', () => {
    expect(() => render(<Consumer />)).toThrow(
      'useTranslation must be used within TranslationProvider',
    );
  });

  it('exposes the current locale and dictionary through context', () => {
    render(
      <TranslationProvider locale="en" onLocaleChange={() => {}}>
        <Consumer />
      </TranslationProvider>,
    );

    expect(screen.getByText('en')).toBeInTheDocument();
  });
});
