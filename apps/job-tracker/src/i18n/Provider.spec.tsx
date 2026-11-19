import { renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/TestUtils';
import { TranslationProvider, useTranslation } from './Provider';

function LocaleProbe() {
  const { locale, messages, onLocaleChange } = useTranslation();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="dashboard">{messages.navigation.dashboard}</span>
      <button
        type="button"
        onClick={() => {
          onLocaleChange('pt-BR');
        }}
      >
        switch
      </button>
    </div>
  );
}

describe('TranslationProvider', () => {
  it('switches locale, updates document lang and dictionary', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TranslationProvider>
        <LocaleProbe />
      </TranslationProvider>,
    );
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('dashboard')).toHaveTextContent('Dashboard');

    await user.click(screen.getByRole('button', { name: 'switch' }));

    expect(screen.getByTestId('locale')).toHaveTextContent('pt-BR');
    expect(screen.getByTestId('dashboard')).toHaveTextContent('Painel');
    expect(document.documentElement.lang).toBe('pt-BR');
  });

  it('useTranslation throws outside the provider', () => {
    expect(() => renderHook(() => useTranslation())).toThrow(
      'useTranslation must be used within TranslationProvider',
    );
  });
});
