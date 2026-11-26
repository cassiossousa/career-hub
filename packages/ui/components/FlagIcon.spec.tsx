import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { FlagIcon } from './FlagIcon';

describe('FlagIcon', () => {
  it.each(['us', 'br'] as const)(
    'renders a decorative flag image for %s',
    (code) => {
      render(<FlagIcon code={code} />);
      const img = screen.getByRole('img');
      expect(img.tagName).toBe('IMG');
      expect(img).toHaveAttribute('alt', '');
      expect(img).toHaveAttribute('src');
    },
  );
});
