import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFilterStore } from '../../store/filterStore';
import { renderWithProviders } from '../../test/TestUtils';
import { FilterBar } from './FilterBar';

let lastSearch = '';

function SearchProbe() {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    lastSearch = searchParams.toString();
  }, [searchParams]);
  return null;
}

describe('FilterBar', () => {
  beforeEach(() => {
    useFilterStore.getState().resetFilters();
  });

  it('renders all filter controls', () => {
    renderWithProviders(<FilterBar />);
    expect(screen.getAllByText('Level').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Location').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Remote Only').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(3);
  });

  it('toggles remote-only switch and updates the store', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FilterBar />);
    const toggle = screen.getByRole('switch', { name: /remote only/i });
    await user.click(toggle);
    expect(useFilterStore.getState().remoteOnly).toBe(true);
  });

  it('updates every filter control', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FilterBar />);

    await user.type(screen.getByLabelText(/location/i), 'Remote');
    expect(useFilterStore.getState().location).toBe('Remote');

    const comboboxes = screen.getAllByRole('combobox');
    for (const combo of comboboxes) {
      await user.click(combo);
      const options = screen.getAllByRole('option');
      const secondOption = options[1];
      if (secondOption) await user.click(secondOption);
      else await user.keyboard('{Escape}');
    }

    const switches = screen.getAllByRole('switch');
    const remoteSwitch = switches[0];
    const presetSwitch = switches[1];
    if (!remoteSwitch || !presetSwitch) {
      throw new Error('expected two filter switches');
    }
    await user.click(remoteSwitch);
    expect(useFilterStore.getState().remoteOnly).toBe(true);
    await user.click(presetSwitch);
    expect(useFilterStore.getState().preset).toBe('profile');
  }, 30000);

  it('hydrates filters from the URL on mount', async () => {
    renderWithProviders(<FilterBar />, {
      route: '/?level=senior&remote=1&area=frontend',
    });
    await waitFor(() => {
      expect(useFilterStore.getState().level).toBe('senior');
      expect(useFilterStore.getState().remoteOnly).toBe(true);
      expect(useFilterStore.getState().area).toBe('frontend');
    });
  });

  it('writes active filters to the URL query string', async () => {
    lastSearch = '';
    renderWithProviders(
      <>
        <FilterBar />
        <SearchProbe />
      </>,
    );
    act(() => {
      useFilterStore.getState().setLevel('senior');
    });
    await waitFor(() => {
      expect(lastSearch).toContain('level=senior');
    });
  });

  it('resets filters via the reset button', async () => {
    const user = userEvent.setup();
    useFilterStore.getState().setLocation('São Paulo');
    renderWithProviders(<FilterBar />);
    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(useFilterStore.getState().location).toBeUndefined();
  });
});
