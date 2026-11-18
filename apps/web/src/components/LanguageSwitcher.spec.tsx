import { fireEvent, render, screen } from '@testing-library/react';
import { TranslationProvider } from '../i18n/Provider';
import type { Locale } from '../types/i18n';
import LanguageSwitcher from './LanguageSwitcher';

function renderSwitcher(locale: Locale, onLocaleChange = jest.fn()) {
  render(
    <TranslationProvider locale={locale} onLocaleChange={onLocaleChange}>
      <LanguageSwitcher />
    </TranslationProvider>,
  );
  return onLocaleChange;
}

describe('LanguageSwitcher', () => {
  it('marks the active locale as pressed and requests the other locale on click', () => {
    const onLocaleChange = renderSwitcher('en');

    const english = screen.getByRole('button', { name: 'Switch to English' });
    const portuguese = screen.getByRole('button', {
      name: 'Switch to Portuguese',
    });

    expect(english).toHaveAttribute('aria-pressed', 'true');
    expect(portuguese).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(portuguese);
    expect(onLocaleChange).toHaveBeenCalledWith('pt-BR');

    fireEvent.click(english);
    expect(onLocaleChange).toHaveBeenCalledWith('en');
  });

  it('reflects pt-BR as the active locale', () => {
    renderSwitcher('pt-BR');

    expect(
      screen.getByRole('button', { name: 'Mudar para português' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
