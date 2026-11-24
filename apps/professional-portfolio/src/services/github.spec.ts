import { jsonResponse } from '../test/fetchMock';
import type * as githubModule from './github';

const VALID_REPO = {
  name: 'portfolio',
  description: 'My portfolio',
  html_url: 'https://github.com/me/portfolio',
  homepage: null,
  stargazers_count: 10,
  topics: ['featured'],
  language: 'TypeScript',
};

let getRepos: typeof githubModule.getRepos;
let getRepoReadme: typeof githubModule.getRepoReadme;

async function loadModule(username?: string, token?: string) {
  jest.resetModules();
  if (username === undefined) {
    delete process.env.GITHUB_USERNAME;
  } else {
    process.env.GITHUB_USERNAME = username;
  }
  if (token === undefined) {
    delete process.env.GITHUB_TOKEN;
  } else {
    process.env.GITHUB_TOKEN = token;
  }
  const mod = await import('./github');
  getRepos = mod.getRepos;
  getRepoReadme = mod.getRepoReadme;
}

function mockFetchOk(payload: unknown) {
  const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
  fetchMock.mockResolvedValue(jsonResponse(true, 200, payload));
  global.fetch = fetchMock;
  return fetchMock;
}

describe('github service', () => {
  beforeEach(async () => {
    await loadModule('me');
    jest.restoreAllMocks();
  });

  afterAll(() => {
    delete process.env.GITHUB_USERNAME;
    delete process.env.GITHUB_TOKEN;
  });

  describe('getRepos', () => {
    it('throws when GITHUB_USERNAME is missing', async () => {
      await loadModule();

      await expect(getRepos(true)).rejects.toThrow('Missing GITHUB_USERNAME');
    });

    it('returns only repos matching the GitHubRepo shape', async () => {
      mockFetchOk([VALID_REPO, { name: 'broken' }, 'not-an-object', null]);

      const repos = await getRepos(true);

      expect(repos).toEqual([VALID_REPO]);
    });

    it('rejects repos with malformed optional fields', async () => {
      mockFetchOk([
        { ...VALID_REPO, topics: 'featured' },
        { ...VALID_REPO, topics: [1, 2] },
        { ...VALID_REPO, language: 42 },
        { ...VALID_REPO, stargazers_count: '10' },
      ]);

      expect(await getRepos(true)).toEqual([]);
    });

    it('throws when the response is not an array', async () => {
      mockFetchOk({ message: 'rate limited' });

      await expect(getRepos(true)).rejects.toThrow(
        'Unexpected GitHub repos response',
      );
    });

    it('throws on non-ok responses', async () => {
      const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
      fetchMock.mockResolvedValue(jsonResponse(false, 403, {}));
      global.fetch = fetchMock;

      await expect(getRepos(true)).rejects.toThrow(
        'GitHub request failed (403)',
      );
    });

    it('requests the user repos endpoint with GitHub headers', async () => {
      const fetchMock = mockFetchOk([VALID_REPO]);

      await getRepos(true);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('https://api.github.com/users/me/repos'),
        expect.anything(),
      );
      expect(fetchMock.mock.calls[0][1]?.headers).toEqual(
        expect.objectContaining({
          Accept: 'application/vnd.github+json',
          'User-Agent': 'portfolio-sync',
        }),
      );
    });

    it('omits the Authorization header without a token and sends it with one', async () => {
      const plainMock = mockFetchOk([VALID_REPO]);
      await getRepos(true);
      expect(plainMock.mock.calls[0][1]?.headers).not.toHaveProperty(
        'Authorization',
      );

      await loadModule('me', 'secret-token');
      const tokenMock = mockFetchOk([VALID_REPO]);
      await getRepos(true);
      expect(tokenMock.mock.calls[0][1]?.headers).toEqual(
        expect.objectContaining({ Authorization: 'Bearer secret-token' }),
      );

      await loadModule('me');
    });

    it('simulates failures below the fail rate unless bypassed', async () => {
      const random = jest.spyOn(Math, 'random');
      mockFetchOk([VALID_REPO]);

      random.mockReturnValue(0.1);
      await expect(getRepos(false)).rejects.toThrow(
        'Simulated GitHub failure (20%)',
      );
      expect(global.fetch).not.toHaveBeenCalled();

      random.mockReturnValue(0.2);
      await expect(getRepos(false)).resolves.toEqual([VALID_REPO]);

      random.mockReturnValue(0.0);
      await expect(getRepos(true)).resolves.toEqual([VALID_REPO]);

      random.mockReturnValue(0.9);
      await expect(getRepos()).resolves.toEqual([VALID_REPO]);
      await expect(getRepoReadme('portfolio')).resolves.toBeUndefined();

      random.mockReturnValue(0.1);
      await expect(getRepos()).rejects.toThrow(
        'Simulated GitHub failure (20%)',
      );

      random.mockRestore();
    });

    it('rejects repos missing required keys or with wrong primitive types', async () => {
      const withoutName = {
        description: VALID_REPO.description,
        html_url: VALID_REPO.html_url,
        homepage: VALID_REPO.homepage,
        stargazers_count: VALID_REPO.stargazers_count,
        topics: VALID_REPO.topics,
        language: VALID_REPO.language,
      };
      const withoutDescription = {
        name: VALID_REPO.name,
        html_url: VALID_REPO.html_url,
        homepage: VALID_REPO.homepage,
        stargazers_count: VALID_REPO.stargazers_count,
        topics: VALID_REPO.topics,
        language: VALID_REPO.language,
      };
      mockFetchOk([
        withoutName,
        withoutDescription,
        { ...VALID_REPO, name: 42 },
        { ...VALID_REPO, html_url: null },
        { ...VALID_REPO, description: undefined },
        { ...VALID_REPO, homepage: 7 },
        { ...VALID_REPO, language: true },
        { ...VALID_REPO, stargazers_count: '10' },
      ]);

      expect(await getRepos(true)).toEqual([]);
    });

    it('accepts repos with absent or null optional fields', async () => {
      mockFetchOk([
        {
          name: 'a',
          html_url: 'u',
          stargazers_count: 0,
          description: null,
          homepage: null,
        },
        {
          name: 'b',
          html_url: 'u',
          stargazers_count: 1,
          description: 'd',
          homepage: null,
          topics: undefined,
          language: undefined,
        },
        {
          name: 'c',
          html_url: 'u',
          stargazers_count: 2,
          description: 'd',
          homepage: 'h',
          language: null,
          topics: [],
        },
      ]);

      const repos = await getRepos(true);

      expect(repos.map((repo) => repo.name)).toEqual(['a', 'b', 'c']);
    });
  });

  describe('getRepoReadme', () => {
    it('returns undefined when GITHUB_USERNAME is missing', async () => {
      await loadModule();

      await expect(getRepoReadme('portfolio', true)).resolves.toBeUndefined();
    });

    it('decodes base64 readme content', async () => {
      const fetchMock = mockFetchOk({
        content: Buffer.from('# Hello').toString('base64'),
      });

      await expect(getRepoReadme('portfolio', true)).resolves.toBe('# Hello');
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://api.github.com/repos/me/portfolio/readme',
        ),
        expect.anything(),
      );
    });

    it('returns undefined for malformed payloads', async () => {
      mockFetchOk({ download_url: 'https://example.com' });

      await expect(getRepoReadme('portfolio', true)).resolves.toBeUndefined();
    });

    it('returns undefined for non-string content payloads', async () => {
      for (const payload of [
        { content: 123 },
        { content: null },
        'raw-string',
        42,
        null,
        [],
      ]) {
        mockFetchOk(payload);
        await expect(getRepoReadme('portfolio', true)).resolves.toBeUndefined();
      }
    });

    it('does not fetch when GITHUB_USERNAME is missing', async () => {
      await loadModule();
      const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
      global.fetch = fetchMock;

      await expect(getRepoReadme('portfolio', true)).resolves.toBeUndefined();
      expect(fetchMock).not.toHaveBeenCalled();

      await loadModule('me');
    });

    it('returns undefined when the request fails', async () => {
      const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
      fetchMock.mockRejectedValue(new Error('network down'));
      global.fetch = fetchMock;

      await expect(getRepoReadme('portfolio', true)).resolves.toBeUndefined();
    });
  });
});
