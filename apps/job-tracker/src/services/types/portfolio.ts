import type { Schemas, Wire } from './contract';

export const SKILL_CATEGORIES = [
  'frontend',
  'backend',
  'databases',
  'distributed',
  'cloud',
  'testing',
] as const satisfies readonly Schemas['SkillCategory'][];

export type SkillCategory = Schemas['SkillCategory'];

export const LINK_KINDS = [
  'github',
  'linkedin',
  'website',
  'email',
  'other',
] as const satisfies readonly Schemas['PortfolioLinkKind'][];

export type LinkKind = Schemas['PortfolioLinkKind'];

export const LANGUAGE_NAMES = [
  'english',
  'portuguese',
  'spanish',
  'french',
  'german',
] as const satisfies readonly Schemas['LanguageName'][];

export type LanguageName = Schemas['LanguageName'];

export type PortfolioLink = Wire<Schemas['PortfolioLinkSchema']>;

export type PortfolioBasics = Wire<Schemas['PortfolioBasicsSchema']>;

export type ExperienceBullet = Wire<Schemas['ExperienceBulletSchema']>;

export type ExperienceEntry = Wire<Schemas['ExperienceEntrySchema']>;

export type SkillGroup = Wire<Schemas['SkillGroupSchema']>;

export type ProjectEntry = Wire<Schemas['ProjectEntrySchema']>;

export type PortfolioFilters = Wire<Schemas['PortfolioFiltersSchema']>;

/** Per-locale display overrides for one language entry's fields. */
export type PortfolioLanguageLabels = Wire<Schemas['LanguageLabelsSchema']>;

export type PortfolioLanguage = Wire<Schemas['PortfolioLanguageSchema']>;

/** One locale's portfolio content document (no locale tag, no filters). */
export type PortfolioContent = Wire<Schemas['PortfolioContentSchema']>;

export type Portfolio = Wire<Schemas['PortfolioResponse']>;

/** PUT /api/portfolio body: one locale's document + optional shared filters. */
export type PortfolioDocumentWrite = Wire<Schemas['PortfolioDocument']>;
