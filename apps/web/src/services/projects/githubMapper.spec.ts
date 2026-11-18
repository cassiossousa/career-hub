import fc from 'fast-check';

import type { GitHubRepo } from '../../types/github';
import { normalizeGithubRepo } from './githubMapper';

const BLOCKED_TOPICS = ['featured', 'portfolio', 'demo', 'resume'];

const repoArb: fc.Arbitrary<GitHubRepo> = fc.record({
  name: fc.string({ minLength: 1 }),
  description: fc.oneof(fc.string(), fc.constant(null)),
  html_url: fc.webUrl(),
  homepage: fc.oneof(fc.string(), fc.constant(null)),
  stargazers_count: fc.nat(),
  topics: fc.option(fc.array(fc.string(), { maxLength: 6 }), {
    nil: undefined,
  }),
  language: fc.option(fc.oneof(fc.string(), fc.constant(null)), {
    nil: undefined,
  }),
});

describe('normalizeGithubRepo', () => {
  it('preserves repo identity and falls back to repo fields without a readme', () => {
    fc.assert(
      fc.property(repoArb, (repo) => {
        const project = normalizeGithubRepo(repo);

        return (
          project.slug === repo.name &&
          project.repo === repo.html_url &&
          project.title === repo.name &&
          project.description === (repo.description ?? '') &&
          project.demo === (repo.homepage ?? undefined) &&
          project.stars ===
            (repo.stargazers_count === 0 ? undefined : repo.stargazers_count) &&
          JSON.stringify(project.topics) ===
            JSON.stringify(repo.topics ?? []) &&
          project.featured === (repo.topics ?? []).includes('featured')
        );
      }),
    );
  });

  it('derives technologies from language and non-blocked topics, deduplicated', () => {
    fc.assert(
      fc.property(repoArb, (repo) => {
        const project = normalizeGithubRepo(repo);
        const technologies = project.technologies ?? [];

        const isAllowed = (tech: string) =>
          tech === repo.language ||
          ((repo.topics ?? []).includes(tech) &&
            !BLOCKED_TOPICS.includes(tech));

        return (
          new Set(technologies).size === technologies.length &&
          technologies.every(isAllowed)
        );
      }),
    );
  });

  it('never throws and keeps identity for arbitrary readme content', () => {
    fc.assert(
      fc.property(repoArb, fc.string(), (repo, readme) => {
        const project = normalizeGithubRepo(repo, readme);
        return project.slug === repo.name && project.repo === repo.html_url;
      }),
    );
  });
});
