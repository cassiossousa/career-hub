import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { routePaths } from '../../app/routePaths';
import { renderWithProviders } from '../../test/TestUtils';

function renderLayout() {
  return renderWithProviders(
    <Layout>
      <div>content</div>
    </Layout>,
  );
}

import { Layout } from './Layout';

describe('Layout', () => {
  it('renders navigation and language switcher', () => {
    renderLayout();
    expect(screen.getByText('content')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /switch to portuguese/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /switch to english/i }),
    ).toBeInTheDocument();
  });

  it('navigates when a nav item is clicked', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getByRole('link', { name: 'Job openings' }));
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Job openings' })).toHaveClass(
        'Mui-selected',
      );
    });
  });

  it('toggles the mobile drawer via the menu button', async () => {
    const original = window.matchMedia.bind(window);
    window.matchMedia = (query: string) => {
      const list = original(query);
      return {
        matches: query.includes('max-width'),
        media: list.media,
        onchange: list.onchange,
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- MediaQueryList still requires the deprecated listeners.
        addListener: list.addListener.bind(list),
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- MediaQueryList still requires the deprecated listeners.
        removeListener: list.removeListener.bind(list),
        addEventListener: list.addEventListener.bind(list),
        removeEventListener: list.removeEventListener.bind(list),
        dispatchEvent: list.dispatchEvent.bind(list),
      };
    };
    try {
      const user = userEvent.setup();
      renderLayout();
      expect(
        screen.queryByRole('link', { name: 'Dashboard' }),
      ).not.toBeInTheDocument();
      const menuButton = screen.getByRole('button', {
        name: /open navigation menu/i,
      });
      await user.click(menuButton);
      expect(
        await screen.findByRole('link', { name: 'Dashboard' }),
      ).toBeInTheDocument();
      await user.click(menuButton);
      await waitFor(() => {
        expect(
          screen.queryByRole('link', { name: 'Dashboard' }),
        ).not.toBeInTheDocument();
      });
    } finally {
      window.matchMedia = original;
    }
  }, 30000);

  it('marks the active nav item on nested routes', () => {
    renderWithProviders(
      <Layout>
        <div>content</div>
      </Layout>,
      { route: routePaths.jobDetail('42') },
    );
    expect(screen.getByRole('link', { name: 'Job openings' })).toHaveClass(
      'Mui-selected',
    );
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveClass(
      'Mui-selected',
    );
  });

  it('marks only the dashboard item on the root route', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveClass(
      'Mui-selected',
    );
    expect(screen.getByRole('link', { name: 'Job openings' })).not.toHaveClass(
      'Mui-selected',
    );
  });

  it('switches locale when a flag is clicked', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(
      screen.getByRole('button', { name: /switch to portuguese/i }),
    );
    expect(document.documentElement.lang).toBe('pt-BR');
  });
});
