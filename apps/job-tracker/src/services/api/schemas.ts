import { z } from 'zod';
import type { Application, ApplicationStatus } from '../types/application';
import type {
  IngestionRun,
  IngestionRunListPage,
  IngestionRunStatus,
} from '../types/ingestion';
import type {
  Job,
  JobArea,
  JobFilterResult,
  JobLevel,
  JobSource,
  JobStats,
  Requirement,
  RequirementClassification,
} from '../types/job';
import type { MatchResult } from '../types/match';
import type {
  ExperienceBullet,
  ExperienceEntry,
  LanguageName,
  LanguageProficiency,
  Portfolio,
  PortfolioBasics,
  PortfolioContent,
  PortfolioFilters,
  PortfolioLanguage,
  PortfolioLanguageLabels,
  PortfolioLink,
  ProjectEntry,
  SkillCategory,
  SkillGroup,
} from '../types/portfolio';
import type {
  CertificationEntry,
  EducationEntry,
  LanguageEntry,
  Resume,
} from '../types/resume';
import type {
  Skill,
  SkillGroupLabels,
  SkillGroupLabelsList,
} from '../types/skills';

const jobSourceSchema = z.enum([
  'gupy',
  'solides',
  'empregos_com_br',
  'sine_bahia',
  'casa_do_trabalhador',
  'remote',
  'google_jobs',
  'manual',
  'other',
]) satisfies z.ZodType<JobSource>;

const jobLevelSchema = z.enum([
  'intern',
  'junior',
  'mid',
  'senior',
  'lead',
]) satisfies z.ZodType<JobLevel>;

const jobAreaSchema = z.enum([
  'frontend',
  'backend',
  'fullstack',
  'data',
  'devops',
  'mobile',
  'qa',
  'management',
  'other',
]) satisfies z.ZodType<JobArea>;

const jobFilterResultSchema = z.enum([
  'unevaluated',
  'passed',
  'filtered_level',
  'filtered_location',
  'filtered_area',
  'filtered_remote',
  'filtered_age',
]) satisfies z.ZodType<JobFilterResult>;

const requirementClassificationSchema = z.enum([
  'proven',
  'equivalent',
  'partial',
  'unproven',
]) satisfies z.ZodType<RequirementClassification>;

const requirementSchema = z.object({
  text: z.string(),
  classification: requirementClassificationSchema,
  weight: z.number().optional(),
}) satisfies z.ZodType<Requirement>;

const jobSchema = z.object({
  id: z.number(),
  source: jobSourceSchema,
  externalId: z.string().nullable(),
  url: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  area: jobAreaSchema,
  level: jobLevelSchema,
  contractType: z.string().nullable(),
  description: z.string(),
  remote: z.boolean(),
  salaryMin: z.number().nullable(),
  salaryMax: z.number().nullable(),
  currency: z.string(),
  postedAt: z.string().nullable(),
  lastSeenAt: z.string().nullable(),
  closedAt: z.string().nullable().optional(),
  requirements: z.array(requirementSchema),
  filterResult: jobFilterResultSchema,
  createdAt: z.string(),
}) satisfies z.ZodType<Job>;

const jobAgeBucketSchema = z.enum(['unknown', '<1d', '1-7d', '7-30d', '>30d']);

const jobStatsSchema = z.object({
  total: z.number(),
  bySource: z.record(z.string(), z.number()),
  byLevel: z.record(z.string(), z.number()),
  byArea: z.record(z.string(), z.number()),
  filtered: z.record(z.string(), z.number()),
  applicationsByStatus: z.record(z.string(), z.number()),
  jobsByAge: z.partialRecord(jobAgeBucketSchema, z.number()),
}) satisfies z.ZodType<JobStats>;

const applicationStatusSchema = z.enum([
  'saved',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
]) satisfies z.ZodType<ApplicationStatus>;

const applicationSchema = z.object({
  id: z.number(),
  jobId: z.number(),
  portfolioId: z.number(),
  status: applicationStatusSchema,
  notes: z.string().nullable(),
  appliedAt: z.string().nullable(),
  statusChangedAt: z.string(),
  createdAt: z.string(),
}) satisfies z.ZodType<Application>;

const portfolioLinkSchema = z.object({
  kind: z.enum(['github', 'linkedin', 'website', 'email', 'other']),
  url: z.string(),
  label: z.string().nullish(),
}) satisfies z.ZodType<PortfolioLink>;

const portfolioBasicsSchema = z.object({
  fullName: z.string(),
  headline: z.string(),
  subtitle: z.string(),
  username: z.string(),
  location: z.string(),
  avatarUrl: z.string().nullish(),
  links: z.array(portfolioLinkSchema),
}) satisfies z.ZodType<PortfolioBasics>;

const experienceBulletSchema = z.object({
  text: z.string(),
  skills: z.array(z.string()).optional(),
}) satisfies z.ZodType<ExperienceBullet>;

const experienceEntrySchema = z.object({
  company: z.string(),
  role: z.string(),
  location: z.string().nullish(),
  start: z.string(),
  end: z.string().nullish(),
  bullets: z.array(experienceBulletSchema).optional(),
}) satisfies z.ZodType<ExperienceEntry>;

const skillCategorySchema = z.enum([
  'frontend',
  'backend',
  'databases',
  'distributed',
  'cloud',
  'testing',
]) satisfies z.ZodType<SkillCategory>;

const skillGroupSchema = z.object({
  category: skillCategorySchema,
  items: z.array(z.string()).optional(),
}) satisfies z.ZodType<SkillGroup>;

const projectEntrySchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  highlights: z.array(z.string()).optional(),
  repoUrl: z.string().nullish(),
  demoUrl: z.string().nullish(),
  featured: z.boolean().optional(),
  technologies: z.array(z.string()).optional(),
  topics: z.array(z.string()).optional(),
  category: z.string().nullish(),
  stars: z.number().nullish(),
}) satisfies z.ZodType<ProjectEntry>;

const educationEntrySchema = z.object({
  institution: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string().nullish(),
  start: z.string().nullish(),
  end: z.string().nullish(),
  details: z.string().nullish(),
}) satisfies z.ZodType<EducationEntry>;

const certificationEntrySchema = z.object({
  name: z.string(),
  issuer: z.string().nullish(),
  url: z.string().nullish(),
  year: z.number().nullish(),
}) satisfies z.ZodType<CertificationEntry>;

const languageEntrySchema = z.object({
  name: z.string(),
  proficiency: z.string().nullish(),
}) satisfies z.ZodType<LanguageEntry>;

const languageNameSchema = z.enum([
  'english',
  'portuguese',
  'spanish',
  'french',
  'german',
]) satisfies z.ZodType<LanguageName>;

const languageProficiencySchema = z.enum([
  'native',
  'c2',
  'c1',
  'b2',
  'b1',
  'a2',
  'a1',
]) satisfies z.ZodType<LanguageProficiency>;

const portfolioLanguageLabelsSchema = z.object({
  name: z.string().nullish(),
  proficiency: z.string().nullish(),
}) satisfies z.ZodType<PortfolioLanguageLabels>;

const portfolioLanguageSchema = z.object({
  language: languageNameSchema,
  proficiency: languageProficiencySchema,
  labels: z.record(z.string(), portfolioLanguageLabelsSchema).optional(),
}) satisfies z.ZodType<PortfolioLanguage>;

const portfolioContentSchema = z.object({
  basics: portfolioBasicsSchema,
  experience: z.array(experienceEntrySchema).optional(),
  skillGroups: z.array(skillGroupSchema).optional(),
  projects: z.array(projectEntrySchema).optional(),
  languages: z.array(portfolioLanguageSchema).optional(),
}) satisfies z.ZodType<PortfolioContent>;

const portfolioFiltersSchema = z.object({
  levels: z.array(jobLevelSchema),
  areas: z.array(jobAreaSchema),
  locations: z.array(z.string()),
  remoteOnly: z.boolean(),
}) satisfies z.ZodType<PortfolioFilters>;

const portfolioSchema = z.object({
  id: z.number(),
  filters: portfolioFiltersSchema,
  documents: z.record(z.string(), portfolioContentSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<Portfolio>;

const skillLabelsSchema = z.record(z.string(), z.string());

const skillSchema = z.object({
  id: z.number(),
  name: z.string(),
  group: skillCategorySchema,
  labels: skillLabelsSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<Skill>;

const ingestionRunStatusSchema = z.enum([
  'succeeded',
  'partial',
  'failed',
]) satisfies z.ZodType<IngestionRunStatus>;

const ingestionRunSchema = z.object({
  id: z.number(),
  startedAt: z.string(),
  finishedAt: z.string(),
  createdAt: z.string(),
  source: jobSourceSchema,
  status: ingestionRunStatusSchema,
  fetched: z.number(),
  inserted: z.number(),
  updated: z.number(),
  failed: z.number(),
  error: z.string().nullable(),
}) satisfies z.ZodType<IngestionRun>;

const matchBaselineSchema = z.object({
  kind: z.enum(['resume', 'portfolio']),
  locale: z.string().nullable(),
  applicationId: z.number().nullable(),
});

const requirementMatchSchema = z.object({
  text: z.string(),
  weight: z.number(),
  matched: z.boolean(),
  score: z.number(),
});

const matchResultSchema = z.object({
  score: z.number(),
  algorithm: z.enum(['keyword', 'tfidf', 'hybrid']),
  baseline: matchBaselineSchema,
  components: z.record(z.string(), z.number()),
  matchedTerms: z.array(z.string()),
  missingTerms: z.array(z.string()),
  requirements: z.array(requirementMatchSchema),
}) satisfies z.ZodType<MatchResult>;

const resumeSchema = z.object({
  id: z.number(),
  applicationId: z.number(),
  locale: z.string(),
  summary: z.string(),
  basics: portfolioBasicsSchema,
  experience: z.array(experienceEntrySchema).optional(),
  education: z.array(educationEntrySchema).optional(),
  certifications: z.array(certificationEntrySchema).optional(),
  languages: z.array(languageEntrySchema).optional(),
  projects: z.array(projectEntrySchema).optional(),
  skillGroups: z.array(skillGroupSchema).optional(),
  submittedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<Resume>;

export const jobsResponseSchema = z.object({
  jobs: z.array(jobSchema),
  total: z.number(),
});

export const jobResponseSchema = jobSchema;

export const jobStatsResponseSchema = jobStatsSchema;

export const applicationsResponseSchema = z.object({
  applications: z.array(applicationSchema),
  total: z.number(),
});

export const applicationResponseSchema = applicationSchema;

export const portfolioResponseSchema = portfolioSchema;

export const skillsResponseSchema = z.object({
  skills: z.array(skillSchema),
  total: z.number(),
});

export const skillResponseSchema = skillSchema;

const skillGroupLabelsSchema = z.object({
  group: skillCategorySchema,
  labels: skillLabelsSchema,
}) satisfies z.ZodType<SkillGroupLabels>;

export const skillGroupLabelsListSchema = z.object({
  groups: z.array(skillGroupLabelsSchema),
}) satisfies z.ZodType<SkillGroupLabelsList>;

export const skillGroupLabelsResponseSchema = skillGroupLabelsSchema;

export const ingestionRunListResponseSchema = z.object({
  runs: z.array(ingestionRunSchema),
  total: z.number(),
}) satisfies z.ZodType<IngestionRunListPage>;

export const matchResponseSchema = matchResultSchema;

export const resumeResponseSchema = resumeSchema;

export const resumesResponseSchema = z.object({
  resumes: z.array(resumeSchema),
  total: z.number(),
});
