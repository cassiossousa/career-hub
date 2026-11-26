import { renderHook, waitFor } from '@testing-library/react';
import { jsonResponse } from '../../test/fetchMock';
import {
  resetPortfolioLanguagesCache,
  usePortfolioLanguages,
} from './languages';

jest.mock('../../app/env', () => ({ apiBaseUrl: '' }));

function mockFetch(payload: unknown, ok = true) {
  const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
  fetchMock.mockResolvedValue(jsonResponse(ok, ok ? 200 : 500, payload));
  global.fetch = fetchMock;
  return fetchMock;
}

const PAYLOAD = {
  languages: [
    {
      language: 'portuguese',
      proficiency: 'native',
      name: 'Português',
      proficiencyLabel: 'Nativo',
    },
    {
      language: 'english',
      proficiency: 'c1',
      name: 'English',
      proficiencyLabel: 'C1',
    },
  ],
};

describe('usePortfolioLanguages', () => {
  beforeEach(() => {
    resetPortfolioLanguagesCache();
  });

  it('fetches and exposes resolved languages for the locale', async () => {
    const fetchMock = mockFetch(PAYLOAD);

    const { result } = renderHook(() => usePortfolioLanguages('pt-BR'));

    expect(result.current.status).toBe('loading');
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.languages).toHaveLength(2);
    expect(result.current.languages[0]?.name).toBe('Português');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portfolio/languages?locale=pt-BR',
    );
  });

  it('returns an empty ready list when the API has no languages', async () => {
    mockFetch({ languages: [] });

    const { result } = renderHook(() => usePortfolioLanguages('en'));

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.languages).toEqual([]);
  });

  it('transitions to error when the request fails', async () => {
    mockFetch({}, false);

    const { result } = renderHook(() => usePortfolioLanguages('en'));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.languages).toEqual([]);
  });

  it('drops malformed entries and non-array payloads', async () => {
    mockFetch({
      languages: [PAYLOAD.languages[0], { language: 'spanish' }, 'junk'],
    });

    const { result } = renderHook(() => usePortfolioLanguages('en'));

    await waitFor(() => {
      expect(result.current.languages.map((l) => l.language)).toEqual([
        'portuguese',
      ]);
    });
  });

  it('serves repeated hooks from the cache without refetching', async () => {
    const fetchMock = mockFetch(PAYLOAD);

    const { result: first, unmount } = renderHook(() =>
      usePortfolioLanguages('en'),
    );
    await waitFor(() => {
      expect(first.current.status).toBe('ready');
    });
    unmount();

    const { result: second } = renderHook(() => usePortfolioLanguages('en'));
    expect(second.current.status).toBe('ready');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
