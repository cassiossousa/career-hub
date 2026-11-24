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
  label?: string | null | undefined;
}

export interface PortfolioBasics {
  fullName: string;
  headline: string;
  subtitle: string;
  username: string;
  location: string;
  avatarUrl?: string | null | undefined;
  links: PortfolioLink[];
}

export interface ExperienceBullet {
  text: string;
  skills?: string[] | undefined;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  location?: string | null | undefined;
  start: string; // YYYY-MM
  end?: string | null | undefined; // YYYY-MM or null for present
  bullets?: ExperienceBullet[] | undefined;
}

export interface SkillGroup {
  category: SkillCategory;
  items?: string[] | undefined;
}

export interface ProjectEntry {
  slug: string;
  title: string;
  summary: string;
  highlights?: string[] | undefined;
  repoUrl?: string | null | undefined;
  demoUrl?: string | null | undefined;
  featured?: boolean | undefined;
  technologies?: string[] | undefined;
  topics?: string[] | undefined;
  category?: string | null | undefined;
  stars?: number | null | undefined;
}

export interface PortfolioFilters {
  levels: JobLevel[];
  areas: JobArea[];
  locations: string[];
  remoteOnly: boolean;
}

export type LanguageName =
  | 'english'
  | 'portuguese'
  | 'spanish'
  | 'french'
  | 'german';

export type LanguageProficiency =
  | 'native'
  | 'c2'
  | 'c1'
  | 'b2'
  | 'b1'
  | 'a2'
  | 'a1';

/** Per-locale display overrides for one language entry's fields. */
export interface PortfolioLanguageLabels {
  name?: string | null | undefined;
  proficiency?: string | null | undefined;
}

export interface PortfolioLanguage {
  language: LanguageName;
  proficiency: LanguageProficiency;
  labels?: Record<string, PortfolioLanguageLabels> | undefined;
}

/** One locale's portfolio content document (no locale tag, no filters). */
export interface PortfolioContent {
  basics: PortfolioBasics;
  experience?: ExperienceEntry[] | undefined;
  skillGroups?: SkillGroup[] | undefined;
  projects?: ProjectEntry[] | undefined;
  languages?: PortfolioLanguage[] | undefined;
}

export interface Portfolio {
  id: number;
  filters: PortfolioFilters;
  documents: Record<string, PortfolioContent>;
  createdAt: string;
  updatedAt: string;
}

/** PUT /api/portfolio body: one locale's document + optional shared filters. */
export interface PortfolioDocumentWrite {
  locale: string;
  basics: PortfolioBasics;
  experience?: ExperienceEntry[] | undefined;
  skillGroups?: SkillGroup[] | undefined;
  projects?: ProjectEntry[] | undefined;
  languages?: PortfolioLanguage[] | undefined;
  filters?: PortfolioFilters | undefined;
}
