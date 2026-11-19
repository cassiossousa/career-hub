import matter from 'gray-matter';
import type { GitHubRepo } from '../../types/github';
import type { Project } from '../../types/project';

function extractStack(repo: GitHubRepo): string[] {
  const stack = new Set<string>();

  if (repo.language) stack.add(repo.language);

  if (repo.topics) {
    for (const topic of repo.topics) {
      if (!['featured', 'portfolio', 'demo', 'resume'].includes(topic)) {
        stack.add(topic);
      }
    }
  }

  return [...stack];
}

function getSection(content: string, title: string): string | undefined {
  const regex = new RegExp(`## ${title}[\\s\\S]*?(?=\\n## |$)`, 'i');
  const match = content.match(regex);

  if (!match) return;

  return match[0];
}

function extractBullets(section?: string): string[] | undefined {
  if (!section) return;

  const bullets = [...section.matchAll(/^- (.*)/gm)];

  if (!bullets.length) return;

  return bullets.map((b) => b[1].trim());
}

function extractTechnologies(section?: string): string[] | undefined {
  return extractBullets(section)?.map((line) =>
    line.replace(/\*\*/g, '').replace(/:.*/, '').trim(),
  );
}

function removeTopHeading(markdown: string): string {
  const lines = markdown.split('\n');

  let i = 0;

  while (i < lines.length && lines[i].trim() === '') i++;

  if (lines[i]?.startsWith('# ')) {
    lines.splice(i, 1);
  }

  return lines.join('\n').trim();
}

function extractDescription(content: string): string | undefined {
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) continue;
    if (trimmed.startsWith('## ')) break;

    return trimmed;
  }
}

interface ReadmeFrontmatter {
  title?: string;
  demo?: string;
  technologies?: string[];
  summary?: string[];
  highlights?: string[];
  topics?: string[];
  featured?: boolean;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

function toReadmeFrontmatter(data: unknown): ReadmeFrontmatter {
  if (typeof data !== 'object' || data === null) return {};

  const fields = new Map<string, unknown>(Object.entries(data));

  const stringField = (key: string) => {
    const value = fields.get(key);
    return typeof value === 'string' ? value : undefined;
  };

  const arrayField = (key: string) => {
    const value = fields.get(key);
    return isStringArray(value) ? value : undefined;
  };

  const featured = fields.get('featured');

  return {
    title: stringField('title'),
    demo: stringField('demo'),
    technologies: arrayField('technologies'),
    summary: arrayField('summary'),
    highlights: arrayField('highlights'),
    topics: arrayField('topics'),
    featured: typeof featured === 'boolean' ? featured : undefined,
  };
}

function parseReadme(readme?: string) {
  if (!readme) return {};

  try {
    const parsed = matter(readme);
    const data = toReadmeFrontmatter(parsed.data);

    const content = removeTopHeading(parsed.content.trim());

    const techSection = getSection(content, 'Tech Stack');

    return {
      title: data.title,
      demo: data.demo,

      description: extractDescription(content),

      technologies: data.technologies ?? extractTechnologies(techSection),

      summary:
        data.summary ?? extractBullets(getSection(content, 'Project Summary')),

      highlights:
        data.highlights ??
        extractBullets(getSection(content, 'Architecture Highlights')),

      topics: data.topics,

      featured: data.featured,
    };
  } catch {
    return {};
  }
}

export function normalizeGithubRepo(
  repo: GitHubRepo,
  readme?: string,
): Project {
  const parsed = parseReadme(readme);

  const topics = parsed.topics ?? repo.topics ?? [];

  return {
    slug: repo.name,

    title: parsed.title ?? repo.name,

    description: parsed.description ?? repo.description ?? '',

    repo: repo.html_url,

    demo: parsed.demo ?? repo.homepage ?? undefined,

    stars: repo.stargazers_count || undefined,

    technologies: parsed.technologies ?? extractStack(repo),

    summary: parsed.summary,

    highlights: parsed.highlights,

    topics,

    featured: parsed.featured ?? topics.includes('featured'),
  };
}
