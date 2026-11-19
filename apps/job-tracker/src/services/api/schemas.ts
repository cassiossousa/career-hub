import { z } from 'zod';
import type { Application, ApplicationStatus } from '../types/application';
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
import type {
  ExperienceBullet,
  ExperienceEntry,
  LocalizedText,
  Portfolio,
  PortfolioBasics,
  PortfolioFilters,
  PortfolioLink,
  ProjectEntry,
  SkillCategory,
  SkillGroup,
} from '../types/portfolio';

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
  weight: z.number(),
}) satisfies z.ZodType<Requirement>;

const localizedTextSchema = z.record(
  z.string(),
  z.string(),
) satisfies z.ZodType<LocalizedText>;

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
  matchScore: z.number().nullable(),
  requirements: z.array(requirementSchema),
  filterResult: jobFilterResultSchema,
  createdAt: z.string(),
}) satisfies z.ZodType<Job>;

const jobStatsSchema = z.object({
  total: z.number(),
  bySource: z.record(z.string(), z.number()),
  byLevel: z.record(z.string(), z.number()),
  byArea: z.record(z.string(), z.number()),
  filtered: z.record(z.string(), z.number()),
  applicationsByStatus: z.record(z.string(), z.number()),
  avgMatchScore: z.number().nullable(),
  jobsByAge: z.object({
    lessThanOneDay: z.number(),
    oneToSevenDays: z.number(),
    sevenToThirtyDays: z.number(),
    overThirtyDays: z.number(),
  }),
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
  label: z.string().optional(),
}) satisfies z.ZodType<PortfolioLink>;

const portfolioBasicsSchema = z.object({
  fullName: z.string(),
  headline: localizedTextSchema,
  subtitle: localizedTextSchema,
  username: z.string(),
  location: localizedTextSchema,
  avatarUrl: z.string().optional(),
  links: z.array(portfolioLinkSchema),
}) satisfies z.ZodType<PortfolioBasics>;

const experienceBulletSchema = z.object({
  text: localizedTextSchema,
  skills: z.array(z.string()),
}) satisfies z.ZodType<ExperienceBullet>;

const experienceEntrySchema = z.object({
  company: z.string(),
  role: localizedTextSchema,
  location: localizedTextSchema.optional(),
  start: z.string(),
  end: z.string().optional(),
  bullets: z.array(experienceBulletSchema),
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
  items: z.array(z.string()),
}) satisfies z.ZodType<SkillGroup>;

const projectEntrySchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: localizedTextSchema,
  summary: z.array(localizedTextSchema),
  highlights: z.array(localizedTextSchema),
  repo: z.string().optional(),
  demo: z.string().optional(),
  featured: z.boolean(),
  technologies: z.array(z.string()),
  topics: z.array(z.string()),
  category: z.string().optional(),
  stars: z.number().optional(),
}) satisfies z.ZodType<ProjectEntry>;

const portfolioFiltersSchema = z.object({
  levels: z.array(jobLevelSchema),
  areas: z.array(jobAreaSchema),
  locations: z.array(z.string()),
  remoteOnly: z.boolean(),
}) satisfies z.ZodType<PortfolioFilters>;

const portfolioSchema = z.object({
  id: z.number(),
  basics: portfolioBasicsSchema,
  experience: z.array(experienceEntrySchema),
  skillGroups: z.array(skillGroupSchema),
  projects: z.array(projectEntrySchema),
  filters: portfolioFiltersSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<Portfolio>;

export const jobsResponseSchema = z.object({
  jobs: z.array(jobSchema),
});

export const jobResponseSchema = z.object({ job: jobSchema });

export const jobStatsResponseSchema = jobStatsSchema;

export const applicationsResponseSchema = z.object({
  applications: z.array(applicationSchema),
});

export const applicationResponseSchema = z.object({
  application: applicationSchema,
});

export const portfolioResponseSchema = z.object({
  portfolio: portfolioSchema,
});
