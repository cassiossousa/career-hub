import type { JobArea, JobLevel } from './job';

export type SkillCategory =
  | 'frontend'
  | 'backend'
  | 'databases'
  | 'distributed'
  | 'cloud'
  | 'testing';

export interface PortfolioLink {
  kind: 'github' | 'linkedin' | 'website' | 'email' | 'other';
  url: string;
  label?: string | undefined;
}

export interface LocalizedText {
  [locale: string]: string;
}

export interface PortfolioBasics {
  fullName: string;
  headline: LocalizedText;
  subtitle: LocalizedText;
  username: string;
  location: LocalizedText;
  avatarUrl?: string | undefined;
  links: PortfolioLink[];
}

export interface ExperienceBullet {
  text: LocalizedText;
  skills: string[];
}

export interface ExperienceEntry {
  company: string;
  role: LocalizedText;
  location?: LocalizedText | undefined;
  start: string; // YYYY-MM
  end?: string | undefined; // YYYY-MM or null for present
  bullets: ExperienceBullet[];
}

export interface SkillGroup {
  category: SkillCategory;
  items: string[];
}

export interface ProjectEntry {
  slug: string;
  title: string;
  description: LocalizedText;
  summary: LocalizedText[];
  highlights: LocalizedText[];
  repo?: string | undefined;
  demo?: string | undefined;
  featured: boolean;
  technologies: string[];
  topics: string[];
  category?: string | undefined;
  stars?: number | undefined;
}

export interface PortfolioFilters {
  levels: JobLevel[];
  areas: JobArea[];
  locations: string[];
  remoteOnly: boolean;
}

export interface Portfolio {
  id: number;
  basics: PortfolioBasics;
  experience: ExperienceEntry[];
  skillGroups: SkillGroup[];
  projects: ProjectEntry[];
  filters: PortfolioFilters;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioCreate {
  basics: PortfolioBasics;
  experience: ExperienceEntry[];
  skillGroups: SkillGroup[];
  projects: ProjectEntry[];
  filters: PortfolioFilters;
}
