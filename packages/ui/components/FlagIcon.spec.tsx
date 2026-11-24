import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { FlagIcon } from './FlagIcon';

describe('FlagIcon', () => {
  it.each(['us', 'br'] as const)(
    'renders a decorative flag image for %s',
    (code) => {
      const { container } = render(<FlagIcon code={code} />);
      const img = container.querySelector('img');
      expect(img).not.toBeNull();
      expect(img).toHaveAttribute('alt', '');
      expect(img).toHaveAttribute('src');
    },
  );
});
