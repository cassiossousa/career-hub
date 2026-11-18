import 'dotenv/config';

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

import { getRepoReadme, getRepos } from '../apps/web/src/services/github.ts';
import { normalizeGithubRepo } from '../apps/web/src/services/projects/githubMapper.ts';

/**
 * @typedef {import('../apps/web/src/types/github').GitHubRepo} GitHubRepo
 */

function clean(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );
}

function extractListSection(markdown, title) {
  const regex = new RegExp(`##\\s+${title}[\\s\\S]*?(?=\\n##\\s|$)`, 'i');

  const match = markdown.match(regex);
  if (!match) return undefined;

  const bullets = [...match[0].matchAll(/^- (.*)/gm)];

  if (!bullets.length) return undefined;

  return bullets.map((b) => b[1].trim());
}

function extractTechnologies(markdown) {
  const section = extractListSection(markdown, 'Tech Stack');
  if (!section) return undefined;

  return section.map((s) => s.replace(/\*\*/g, '').replace(/:.*/, '').trim());
}

async function clearProjects(dir) {
  try {
    const files = await fs.readdir(dir);

    await Promise.all(
      files
        .filter((f) => f.endsWith('.mdx'))
        .map((f) => fs.unlink(path.join(dir, f))),
    );
  } catch {}
}

async function run(targetDir) {
  /** @type {GitHubRepo[]} */
  const repos = await getRepos(true);

  const featured = repos.filter(
    (repo) =>
      Boolean(repo.topics?.includes('featured') || repo.featured) ||
      Boolean(repo.topics?.includes('resume')),
  );

  const dir = targetDir;

  await fs.mkdir(dir, { recursive: true });

  await clearProjects(dir);

  for (const repo of featured) {
    const readme = await getRepoReadme(repo.name, true);

    let readmeContent = '';
    let readmeData = {};

    if (readme) {
      const parsed = matter(readme);

      readmeContent = parsed.content.trim();
      readmeData = parsed.data;
    }

    const project = normalizeGithubRepo(repo, readme);

    const extractedSummary = extractListSection(
      readmeContent,
      'Project Summary',
    );

    const extractedHighlights = extractListSection(
      readmeContent,
      'Architecture Highlights',
    );

    const extractedTechnologies = extractTechnologies(readmeContent);

    const frontmatter = clean({
      title: project.title,
      repo: project.repo,
      demo: project.demo,
      stars: project.stars,
      featured: project.featured,
      topics: repo.topics ?? [],

      technologies: readmeData.technologies ?? extractedTechnologies,

      summary: readmeData.summary ?? extractedSummary,

      highlights: readmeData.highlights ?? extractedHighlights,

      ...readmeData,
    });

    const file = matter.stringify(readmeContent, frontmatter);

    const filePath = path.join(dir, `${project.slug}.mdx`);

    await fs.writeFile(filePath, file);
  }

  console.log(`Synced ${featured.length} GitHub projects.`);
}

const CHECK_MODE = process.argv.includes('--check');

async function check() {
  const os = await import('node:os');
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-projects-'));
  await run(tmp);

  const expectedDir = path.join(process.cwd(), 'content/projects');
  const expectedFiles = (await fs.readdir(expectedDir))
    .filter((f) => f.endsWith('.mdx'))
    .toSorted();
  const actualFiles = (await fs.readdir(tmp))
    .filter((f) => f.endsWith('.mdx'))
    .toSorted();

  const diffs = [];
  if (JSON.stringify(expectedFiles) !== JSON.stringify(actualFiles)) {
    diffs.push('file list differs');
  } else {
    for (const name of expectedFiles) {
      const [expected, actual] = await Promise.all([
        fs.readFile(path.join(expectedDir, name), 'utf8'),
        fs.readFile(path.join(tmp, name), 'utf8'),
      ]);
      if (expected !== actual) diffs.push(name);
    }
  }

  if (diffs.length > 0) {
    console.error(
      'content/projects is stale — run npm run sync:projects and commit the result. Diffs: ' +
        diffs.join(', '),
    );
    process.exit(1);
  }

  console.log('content/projects is up to date.');
}

if (CHECK_MODE) {
  check().catch((error) => {
    console.error(error);
    process.exit(1);
  });
} else {
  run(path.join(process.cwd(), 'content/projects')).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
