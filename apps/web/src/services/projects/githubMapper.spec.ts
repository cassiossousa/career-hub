import fc from 'fast-check';

import type { GitHubRepo } from '../../types/github';
import { normalizeGithubRepo } from './githubMapper';

const BLOCKED_TOPICS = ['featured', 'portfolio', 'demo', 'resume'];

const baseRepo: GitHubRepo = {
  name: 'my-repo',
  description: 'Repo description',
  html_url: 'https://github.com/u/my-repo',
  homepage: 'https://example.com',
  stargazers_count: 42,
  topics: ['featured', 'react'],
  language: 'TypeScript',
};

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

  it('excludes blocked topics from derived technologies', () => {
    const project = normalizeGithubRepo({
      ...baseRepo,
      language: null,
      topics: ['featured', 'portfolio', 'demo', 'resume', 'react'],
    });

    expect(project.technologies).toEqual(['react']);
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

describe('normalizeGithubRepo readme parsing', () => {
  it('prefers readme frontmatter over repo fields and derived values', () => {
    const readme = `---
title: Custom Title
demo: https://demo.example.com
featured: false
topics:
  - featured
  - awesome
technologies:
  - Rust
summary:
  - Shipped the thing
highlights:
  - Scaled to millions
---
# Heading

Body text here.
`;

    const project = normalizeGithubRepo(baseRepo, readme);

    expect(project.title).toBe('Custom Title');
    expect(project.demo).toBe('https://demo.example.com');
    expect(project.featured).toBe(false);
    expect(project.topics).toEqual(['featured', 'awesome']);
    expect(project.technologies).toEqual(['Rust']);
    expect(project.summary).toEqual(['Shipped the thing']);
    expect(project.highlights).toEqual(['Scaled to millions']);
    expect(project.description).toBe('Body text here.');
  });

  it('ignores wrongly-typed frontmatter fields and falls back', () => {
    const readme = `---
title: 123
featured: "yes"
technologies: "not-an-array"
highlights:
  - Real
  - 5
---
# T

Desc line.
`;

    const project = normalizeGithubRepo(baseRepo, readme);

    expect(project.title).toBe('my-repo');
    expect(project.featured).toBe(true);
    expect(project.technologies).toEqual(['TypeScript', 'react']);
    expect(project.highlights).toBeUndefined();
    expect(project.description).toBe('Desc line.');
  });

  it('extracts sections, bullets and technologies from markdown', () => {
    const readme = `# My Project

   
A cool project description.

## Overview

- decoy bullet

## tech stack

- **React**: UI library
- **Node.js**
- plain bullet
- Foo : detail

## Project Summary

-  Padded item
- Built things
- Shipped fast
note - inline mention

## Architecture Highlights

- Modular design
`;

    const project = normalizeGithubRepo(baseRepo, readme);

    expect(project.description).toBe('A cool project description.');
    expect(project.technologies).toEqual([
      'React',
      'Node.js',
      'plain bullet',
      'Foo',
    ]);
    expect(project.summary).toEqual([
      'Padded item',
      'Built things',
      'Shipped fast',
    ]);
    expect(project.highlights).toEqual(['Modular design']);
  });

  it('falls back to derived technologies when sections have no bullets', () => {
    const readme = `# T

## Tech Stack

Prose only, no bullets.

## Project Summary

- Only bullet
`;

    const project = normalizeGithubRepo(baseRepo, readme);

    expect(project.technologies).toEqual(['TypeScript', 'react']);
    expect(project.summary).toEqual(['Only bullet']);
    expect(project.highlights).toBeUndefined();
  });

  it('falls back to repo description when content starts with a section heading', () => {
    const readme = `# T

## Notes

- not a description
`;

    const project = normalizeGithubRepo(baseRepo, readme);

    expect(project.description).toBe('Repo description');
  });

  it('keeps a non-standard first line as the description', () => {
    const project = normalizeGithubRepo(baseRepo, '#NoSpace\n\nBody');

    expect(project.description).toBe('#NoSpace');
  });

  it('returns repo fallbacks for blank or unparseable readmes', () => {
    const blank = normalizeGithubRepo(baseRepo, '   ');

    expect(blank.title).toBe('my-repo');
    expect(blank.description).toBe('Repo description');
    expect(blank.technologies).toEqual(['TypeScript', 'react']);

    const broken = normalizeGithubRepo(
      baseRepo,
      '---\nfoo: *missing\n---\n# T\n\nBody',
    );

    expect(broken.title).toBe('my-repo');
    expect(broken.description).toBe('Repo description');
    expect(broken.technologies).toEqual(['TypeScript', 'react']);
  });
});
