import { fireEvent, render, screen } from '@testing-library/react';
import { storageRemoveItem, storageSetItem } from '../app/storage';
import { TranslationProvider } from '../i18n/Provider';
import LanguageSwitcher from './LanguageSwitcher';

function renderSwitcher(onLocaleChange = jest.fn()) {
  render(
    <TranslationProvider onLocaleChange={onLocaleChange}>
      <LanguageSwitcher />
    </TranslationProvider>,
  );
  return onLocaleChange;
}

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    storageRemoveItem('lang');
  });

  afterEach(() => {
    storageRemoveItem('lang');
  });

  it('marks the active locale as pressed and requests the other locale on click', () => {
    const onLocaleChange = renderSwitcher();

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

  it('reflects a stored pt-BR locale as the active one', () => {
    storageSetItem('lang', 'pt-BR');
    renderSwitcher();

    expect(
      screen.getByRole('button', { name: 'Mudar para português' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
