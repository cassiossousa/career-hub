import { content } from 'virtual:portfolio-content';
import type { ProjectEntry } from '../../types/content';
import type { Locale } from '../../types/i18n';
import type { Project } from '../../types/project';

function fromProjectEntry(entry: ProjectEntry): Project {
  return {
    slug: entry.slug,
    title: entry.frontmatter.title ?? entry.slug,
    description: entry.content.split('\n')[0].trim(),
    repo: entry.frontmatter.repo,
    demo: entry.frontmatter.demo,
    stars: entry.frontmatter.stars,
    technologies: entry.frontmatter.technologies,
    summary: entry.frontmatter.summary,
    highlights: entry.frontmatter.highlights,
    topics: entry.frontmatter.topics,
    featured:
      entry.frontmatter.featured ??
      entry.frontmatter.topics?.includes('featured'),
  };
}

export function getProjects(locale: Locale): Project[] {
  return content[locale].projects.map(fromProjectEntry);
}

export function getProject(slug: string, locale: Locale): Project | null {
  return getProjects(locale).find((project) => project.slug === slug) ?? null;
}
