import { fireEvent, render, screen } from '@testing-library/react';
import { storageRemoveItem, storageSetItem } from '../app/storage';
import { LOCALE_STORAGE_KEY } from '../i18n/localeStorageKey';
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
    storageRemoveItem(LOCALE_STORAGE_KEY);
  });

  afterEach(() => {
    storageRemoveItem(LOCALE_STORAGE_KEY);
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
    storageSetItem(LOCALE_STORAGE_KEY, 'pt-BR');
    renderSwitcher();

    expect(
      screen.getByRole('button', { name: 'Mudar para português' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
