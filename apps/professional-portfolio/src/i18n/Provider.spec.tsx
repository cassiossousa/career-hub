import { fireEvent, render, screen } from '@testing-library/react';
import {
  storageGetItem,
  storageRemoveItem,
  storageSetItem,
} from '../app/storage';
import { TranslationProvider, useTranslation } from './Provider';

function Consumer() {
  const { locale, onLocaleChange } = useTranslation();
  return (
    <>
      <div data-testid="locale">{locale}</div>
      <button
        type="button"
        onClick={() => {
          onLocaleChange('pt-BR');
        }}
      >
        switch
      </button>
    </>
  );
}

function renderConsumer(onLocaleChange?: (locale: 'en' | 'pt-BR') => void) {
  render(
    <TranslationProvider onLocaleChange={onLocaleChange}>
      <Consumer />
    </TranslationProvider>,
  );
}

describe('useTranslation', () => {
  beforeEach(() => {
    storageRemoveItem('lang');
  });

  afterEach(() => {
    storageRemoveItem('lang');
  });

  it('throws when used outside TranslationProvider', () => {
    expect(() => render(<Consumer />)).toThrow(
      'useTranslation must be used within TranslationProvider',
    );
  });

  it('defaults to English when nothing is stored', () => {
    renderConsumer();

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });

  it('initializes from a valid stored locale', () => {
    storageSetItem('lang', 'pt-BR');
    renderConsumer();

    expect(screen.getByTestId('locale')).toHaveTextContent('pt-BR');
  });

  it('falls back to English for an invalid stored locale', () => {
    storageSetItem('lang', 'klingon');
    renderConsumer();

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });

  it('persists locale changes to storage and notifies listeners', () => {
    const onLocaleChange = jest.fn();
    renderConsumer(onLocaleChange);

    fireEvent.click(screen.getByRole('button', { name: 'switch' }));

    expect(screen.getByTestId('locale')).toHaveTextContent('pt-BR');
    expect(storageGetItem('lang')).toBe('pt-BR');
    expect(onLocaleChange).toHaveBeenCalledWith('pt-BR');
  });
});
