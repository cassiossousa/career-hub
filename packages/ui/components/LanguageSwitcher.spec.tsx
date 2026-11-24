import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createLanguageOptions, LanguageSwitcher } from './LanguageSwitcher';

const OPTIONS = createLanguageOptions([
  { value: 'en', ariaLabel: 'English', flag: 'us' },
  { value: 'pt-BR', ariaLabel: 'Português' },
] as const);

describe('createLanguageOptions', () => {
  it('derives short labels and passes flags through', () => {
    expect(OPTIONS).toEqual([
      { value: 'en', label: 'EN', ariaLabel: 'English', flag: 'us' },
      { value: 'pt-BR', label: 'PT', ariaLabel: 'Português' },
    ]);
  });
});

describe('LanguageSwitcher', () => {
  it('renders one button per option and marks the active locale', () => {
    render(
      <LanguageSwitcher
        locale="en"
        options={OPTIONS}
        onLocaleChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Português' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('requests a locale change when another option is clicked', async () => {
    const user = userEvent.setup();
    const onLocaleChange = jest.fn();
    render(
      <LanguageSwitcher
        locale="en"
        options={OPTIONS}
        onLocaleChange={onLocaleChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Português' }));
    expect(onLocaleChange).toHaveBeenCalledWith('pt-BR');
  });

  it('shows flag icons for flagged options and text labels otherwise', () => {
    const { container } = render(
      <LanguageSwitcher
        locale="en"
        options={OPTIONS}
        onLocaleChange={() => {}}
      />,
    );
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(screen.getByText('PT')).toBeInTheDocument();
  });
});
