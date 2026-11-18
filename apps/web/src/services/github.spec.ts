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

async function loadModule(username?: string) {
  jest.resetModules();
  if (username === undefined) {
    delete process.env.GITHUB_USERNAME;
  } else {
    process.env.GITHUB_USERNAME = username;
  }
  const mod = await import('./github');
  getRepos = mod.getRepos;
  getRepoReadme = mod.getRepoReadme;
}

function mockResponse(ok: boolean, status: number, payload: unknown): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(payload),
  } as Response;
}

function mockFetchOk(payload: unknown) {
  const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
  fetchMock.mockResolvedValue(mockResponse(true, 200, payload));
  global.fetch = fetchMock;
}

describe('github service', () => {
  beforeEach(async () => {
    await loadModule('me');
    jest.restoreAllMocks();
  });

  afterAll(() => {
    delete process.env.GITHUB_USERNAME;
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
      fetchMock.mockResolvedValue(mockResponse(false, 403, {}));
      global.fetch = fetchMock;

      await expect(getRepos(true)).rejects.toThrow(
        'GitHub request failed (403)',
      );
    });
  });

  describe('getRepoReadme', () => {
    it('returns undefined when GITHUB_USERNAME is missing', async () => {
      await loadModule();

      await expect(getRepoReadme('portfolio', true)).resolves.toBeUndefined();
    });

    it('decodes base64 readme content', async () => {
      mockFetchOk({
        content: Buffer.from('# Hello').toString('base64'),
      });

      await expect(getRepoReadme('portfolio', true)).resolves.toBe('# Hello');
    });

    it('returns undefined for malformed payloads', async () => {
      mockFetchOk({ download_url: 'https://example.com' });

      await expect(getRepoReadme('portfolio', true)).resolves.toBeUndefined();
    });

    it('returns undefined when the request fails', async () => {
      const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
      fetchMock.mockRejectedValue(new Error('network down'));
      global.fetch = fetchMock;

      await expect(getRepoReadme('portfolio', true)).resolves.toBeUndefined();
    });
  });
});
