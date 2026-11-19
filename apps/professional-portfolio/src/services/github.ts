import type { GitHubRepo } from '../types/github';

const BASE = 'https://api.github.com';
const USERNAME = process.env.GITHUB_USERNAME;
const TOKEN = process.env.GITHUB_TOKEN;
const FAIL_RATE = 0.2;

const headers: HeadersInit = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'portfolio-sync',
  ...(TOKEN && {
    Authorization: `Bearer ${TOKEN}`,
  }),
};

function simulateFailure() {
  if (Math.random() < FAIL_RATE) {
    throw new Error(`Simulated GitHub failure (${FAIL_RATE * 100}%)`);
  }
}

async function fetchJson(
  url: string,
  bypassFailRate: boolean,
): Promise<unknown> {
  if (!bypassFailRate) {
    simulateFailure();
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`GitHub request failed (${res.status})`);
  }

  const data: unknown = await res.json();
  return data;
}

function isStringOrNull(value: unknown): value is string | null {
  return typeof value === 'string' || value === null;
}

function isGitHubRepo(value: unknown): value is GitHubRepo {
  if (typeof value !== 'object' || value === null) return false;

  if (
    !('name' in value) ||
    typeof value.name !== 'string' ||
    !('html_url' in value) ||
    typeof value.html_url !== 'string' ||
    !('stargazers_count' in value) ||
    typeof value.stargazers_count !== 'number' ||
    !('description' in value) ||
    !isStringOrNull(value.description) ||
    !('homepage' in value) ||
    !isStringOrNull(value.homepage)
  ) {
    return false;
  }

  if (
    'topics' in value &&
    value.topics !== undefined &&
    (!Array.isArray(value.topics) ||
      !value.topics.every((topic) => typeof topic === 'string'))
  ) {
    return false;
  }

  if (
    'language' in value &&
    value.language !== undefined &&
    value.language !== null &&
    typeof value.language !== 'string'
  ) {
    return false;
  }

  return true;
}

function isReadmePayload(value: unknown): value is { content: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'content' in value &&
    typeof value.content === 'string'
  );
}

export async function getRepos(
  bypassFailRate: boolean = false,
): Promise<GitHubRepo[]> {
  if (!USERNAME) throw new Error('Missing GITHUB_USERNAME');

  const data: unknown = await fetchJson(
    `${BASE}/users/${USERNAME}/repos?per_page=100&sort=updated&type=owner`,
    bypassFailRate,
  );

  if (!Array.isArray(data)) {
    throw new Error('Unexpected GitHub repos response');
  }

  return data.filter(isGitHubRepo);
}

export async function getRepoReadme(
  repo: string,
  bypassFailRate: boolean = false,
): Promise<string | undefined> {
  if (!USERNAME) return;

  try {
    const data: unknown = await fetchJson(
      `${BASE}/repos/${USERNAME}/${repo}/readme`,
      bypassFailRate,
    );

    if (!isReadmePayload(data)) return;

    return Buffer.from(data.content, 'base64').toString('utf8');
  } catch {
    return;
  }
}
