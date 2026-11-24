import type { ResumePdfDocument } from '@career-hub/ui/components';
import type {
  ExperienceEntry,
  PortfolioBasics,
  PortfolioContent,
  PortfolioLanguage,
  PortfolioLink,
  ProjectEntry,
  SkillCategory,
  SkillGroup,
} from './types/portfolio';
import type {
  CertificationEntry,
  EducationEntry,
  LanguageEntry,
  ResumeDocument,
} from './types/resume';

export interface ResumePreviewCopy {
  presentLabel: string;
  linkKindLabels: Record<PortfolioLink['kind'], string>;
  skillCategoryLabels: Record<SkillCategory, string>;
}

type FormatMonthYear = (value: string) => string | null;

const MONTH_YEAR_PATTERN = /^(\d{4})-(\d{2})$/;

function createMonthYearFormat(locale: string): FormatMonthYear {
  const formatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return (value) => {
    const match = MONTH_YEAR_PATTERN.exec(value);
    if (!match) return null;
    const year = Number.parseInt(match[1] ?? '', 10);
    const month = Number.parseInt(match[2] ?? '', 10);
    if (!Number.isInteger(year) || month < 1 || month > 12) return null;
    return formatter.format(new Date(Date.UTC(year, month - 1, 1)));
  };
}

function formatPeriod(
  start: string,
  end: string | null | undefined,
  formatMonthYear: FormatMonthYear,
  presentLabel: string,
): string {
  const startLabel = start ? (formatMonthYear(start) ?? start) : '';
  const endLabel = end ? (formatMonthYear(end) ?? end) : presentLabel;
  return [startLabel, endLabel].filter(Boolean).join(' – ');
}

function formatOptionalPeriod(
  start: string | null | undefined,
  end: string | null | undefined,
  formatMonthYear: FormatMonthYear,
): string | undefined {
  const parts = [start, end]
    .filter((value): value is string => Boolean(value))
    .map((value) => formatMonthYear(value) ?? value);
  return parts.length > 0 ? parts.join(' – ') : undefined;
}

function toBasics(
  basics: PortfolioBasics,
  copy: ResumePreviewCopy,
): ResumePdfDocument['basics'] {
  return {
    fullName: basics.fullName,
    headline: basics.headline || undefined,
    subtitle: basics.subtitle || undefined,
    location: basics.location || undefined,
    links: basics.links
      .filter((link) => link.url.trim() !== '')
      .map((link) => ({
        label: link.label || copy.linkKindLabels[link.kind],
        url: link.url,
      })),
  };
}

function toExperience(
  entry: ExperienceEntry,
  formatMonthYear: FormatMonthYear,
  copy: ResumePreviewCopy,
): NonNullable<ResumePdfDocument['experience']>[number] {
  return {
    company: entry.company,
    role: entry.role,
    location: entry.location ?? undefined,
    period: formatPeriod(
      entry.start,
      entry.end,
      formatMonthYear,
      copy.presentLabel,
    ),
    bullets: (entry.bullets ?? []).map((bullet) => bullet.text),
  };
}

function toProject(
  entry: ProjectEntry,
): NonNullable<ResumePdfDocument['projects']>[number] {
  return {
    title: entry.title,
    technologies: entry.technologies,
    repoUrl: entry.repoUrl,
    demoUrl: entry.demoUrl,
    highlights:
      entry.highlights && entry.highlights.length > 0
        ? entry.highlights
        : entry.summary
          ? [entry.summary]
          : [],
  };
}

function toSkillGroup(
  group: SkillGroup,
  copy: ResumePreviewCopy,
): NonNullable<ResumePdfDocument['skillGroups']>[number] {
  return {
    category: copy.skillCategoryLabels[group.category],
    items: group.items ?? [],
  };
}

function toEducation(
  entry: EducationEntry,
  formatMonthYear: FormatMonthYear,
): NonNullable<ResumePdfDocument['education']>[number] {
  return {
    institution: entry.institution,
    degree: entry.degree,
    fieldOfStudy: entry.fieldOfStudy ?? undefined,
    period: formatOptionalPeriod(entry.start, entry.end, formatMonthYear),
    details: entry.details ?? undefined,
  };
}

function toCertification(
  entry: CertificationEntry,
): NonNullable<ResumePdfDocument['certifications']>[number] {
  return {
    name: entry.name,
    issuer: entry.issuer ?? undefined,
    year:
      entry.year === null || entry.year === undefined
        ? undefined
        : String(entry.year),
  };
}

function toLanguage(
  entry: LanguageEntry,
): NonNullable<ResumePdfDocument['languages']>[number] {
  return {
    name: entry.name,
    proficiency: entry.proficiency ?? undefined,
  };
}

const LABEL_FALLBACK_LOCALE = 'en';

function humanizeEnum(value: string): string {
  return value.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

function resolveLanguageLabel(
  entry: PortfolioLanguage,
  locale: string,
  field: 'name' | 'proficiency',
): string | undefined {
  for (const candidate of [locale, LABEL_FALLBACK_LOCALE]) {
    const value = entry.labels?.[candidate]?.[field];
    if (typeof value === 'string' && value !== '') return value;
  }
  return undefined;
}

function toPortfolioLanguage(
  entry: PortfolioLanguage,
  locale: string,
): LanguageEntry {
  return {
    name:
      resolveLanguageLabel(entry, locale, 'name') ??
      humanizeEnum(entry.language),
    proficiency:
      resolveLanguageLabel(entry, locale, 'proficiency') ??
      humanizeEnum(entry.proficiency),
  };
}

/** Maps the editable resume document into the viewer's presentation model. */
export function toResumePdfDocument(
  doc: ResumeDocument,
  locale: string,
  copy: ResumePreviewCopy,
): ResumePdfDocument {
  const formatMonthYear = createMonthYearFormat(locale);
  return {
    basics: toBasics(doc.basics, copy),
    summary: doc.summary.trim() === '' ? undefined : doc.summary,
    experience: (doc.experience ?? []).map((entry) =>
      toExperience(entry, formatMonthYear, copy),
    ),
    projects: (doc.projects ?? []).map(toProject),
    skillGroups: (doc.skillGroups ?? []).map((group) =>
      toSkillGroup(group, copy),
    ),
    education: (doc.education ?? []).map((entry) =>
      toEducation(entry, formatMonthYear),
    ),
    certifications: (doc.certifications ?? []).map(toCertification),
    languages: (doc.languages ?? []).map(toLanguage),
  };
}

/** Maps the editable portfolio document into the viewer's presentation model. */
export function toPortfolioPdfDocument(
  content: PortfolioContent,
  locale: string,
  copy: ResumePreviewCopy,
): ResumePdfDocument {
  return toResumePdfDocument(
    {
      locale,
      summary: '',
      basics: content.basics,
      experience: content.experience,
      skillGroups: content.skillGroups,
      projects: content.projects,
      languages: (content.languages ?? []).map((entry) =>
        toPortfolioLanguage(entry, locale),
      ),
    },
    locale,
    copy,
  );
}
