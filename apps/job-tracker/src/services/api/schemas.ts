import { z } from 'zod';
import type {
  Application,
  ApplicationEvent,
  ApplicationEventKind,
  ApplicationEventListPage,
  ApplicationListPage,
  ApplicationStatus,
} from '../types/application';
import {
  APPLICATION_EVENT_KINDS,
  APPLICATION_STATUS_ORDER,
} from '../types/application';
import type {
  ApplicationContact,
  Contact,
  ContactListPage,
} from '../types/contact';
import type { CoverLetter } from '../types/coverLetter';
import type {
  IngestionRun,
  IngestionRunListPage,
  IngestionRunStatus,
} from '../types/ingestion';
import { INGESTION_RUN_STATUSES } from '../types/ingestion';
import type {
  Interview,
  InterviewListPage,
  InterviewMode,
  InterviewOutcome,
} from '../types/interview';
import { INTERVIEW_MODES, INTERVIEW_OUTCOMES } from '../types/interview';
import type {
  Job,
  JobArea,
  JobFilterResult,
  JobLevel,
  JobListPage,
  JobSource,
  JobStats,
  Requirement,
  RequirementClassification,
} from '../types/job';
import {
  JOB_AREAS,
  JOB_FILTER_RESULTS,
  JOB_LEVELS,
  JOB_SOURCES,
  REQUIREMENT_CLASSIFICATIONS,
} from '../types/job';
import type {
  MatchAlgorithm,
  MatchBaseline,
  MatchResult,
  RequirementMatch,
} from '../types/match';
import { MATCH_ALGORITHMS, MATCH_BASELINE_KINDS } from '../types/match';
import type { Offer, OfferListPage, OfferStatus } from '../types/offer';
import { OFFER_STATUSES } from '../types/offer';
import type {
  ExperienceBullet,
  ExperienceEntry,
  LanguageName,
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
import {
  LANGUAGE_NAMES,
  LINK_KINDS,
  SKILL_CATEGORIES,
} from '../types/portfolio';
import type {
  CertificationEntry,
  EducationEntry,
  LanguageEntry,
  Resume,
  ResumeListPage,
} from '../types/resume';
import type {
  Skill,
  SkillGroupLabels,
  SkillGroupLabelsList,
  SkillListPage,
} from '../types/skills';

const jobSourceSchema = z.enum(JOB_SOURCES) satisfies z.ZodType<JobSource>;

const jobLevelSchema = z.enum(JOB_LEVELS) satisfies z.ZodType<JobLevel>;

const jobAreaSchema = z.enum(JOB_AREAS) satisfies z.ZodType<JobArea>;

const jobFilterResultSchema = z.enum(
  JOB_FILTER_RESULTS,
) satisfies z.ZodType<JobFilterResult>;

const requirementClassificationSchema = z.enum(
  REQUIREMENT_CLASSIFICATIONS,
) satisfies z.ZodType<RequirementClassification>;

const requirementSchema = z.object({
  text: z.string(),
  classification: requirementClassificationSchema,
  weight: z.number().optional(),
}) satisfies z.ZodType<Requirement>;

const applicationStatusSchema = z.enum(
  APPLICATION_STATUS_ORDER,
) satisfies z.ZodType<ApplicationStatus>;

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
  closedAt: z.string().nullable(),
  requirements: z.array(requirementSchema),
  tags: z.array(z.string()),
  filterResult: jobFilterResultSchema,
  createdAt: z.string(),
  applicationId: z.number().nullable(),
  applicationStatus: applicationStatusSchema.nullable(),
}) satisfies z.ZodType<Job>;

const jobStatsSchema = z.object({
  total: z.number(),
  bySource: z.record(z.string(), z.number()),
  byLevel: z.record(z.string(), z.number()),
  byArea: z.record(z.string(), z.number()),
  filtered: z.record(z.string(), z.number()),
  applicationsByStatus: z.record(z.string(), z.number()),
  jobsByAge: z.record(z.string(), z.number()),
}) satisfies z.ZodType<JobStats>;

const applicationEventKindSchema = z.enum(
  APPLICATION_EVENT_KINDS,
) satisfies z.ZodType<ApplicationEventKind>;

const applicationEventSchema = z.object({
  id: z.number(),
  kind: applicationEventKindSchema,
  payload: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
}) satisfies z.ZodType<ApplicationEvent>;

const applicationSchema = z.object({
  id: z.number(),
  jobId: z.number(),
  portfolioId: z.number(),
  status: applicationStatusSchema,
  notes: z.string().nullable(),
  appliedAt: z.string().nullable(),
  followUpAt: z.string().nullable(),
  tags: z.array(z.string()),
  statusChangedAt: z.string(),
  createdAt: z.string(),
}) satisfies z.ZodType<Application>;

const portfolioLinkKindSchema = z.enum(LINK_KINDS);

const portfolioLinkSchema = z.object({
  kind: portfolioLinkKindSchema,
  url: z.string(),
  label: z.string().nullish(),
}) satisfies z.ZodType<PortfolioLink>;

const portfolioBasicsSchema = z.object({
  fullName: z.string(),
  headline: z.string().nullish(),
  subtitle: z.string().nullish(),
  location: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  links: z.array(portfolioLinkSchema).optional(),
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

const skillCategorySchema = z.enum(
  SKILL_CATEGORIES,
) satisfies z.ZodType<SkillCategory>;

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

const languageNameSchema = z.enum(
  LANGUAGE_NAMES,
) satisfies z.ZodType<LanguageName>;

const portfolioLanguageLabelsSchema = z.object({
  name: z.string().nullish(),
  proficiency: z.string().nullish(),
}) satisfies z.ZodType<PortfolioLanguageLabels>;

const portfolioLanguageSchema = z.object({
  language: languageNameSchema,
  proficiency: z.string().min(1).max(100),
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
  levels: z.array(jobLevelSchema).optional(),
  areas: z.array(jobAreaSchema).optional(),
  locations: z.array(z.string()).optional(),
  remoteOnly: z.boolean().optional(),
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

const ingestionRunStatusSchema = z.enum(
  INGESTION_RUN_STATUSES,
) satisfies z.ZodType<IngestionRunStatus>;

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

const matchAlgorithmSchema = z.enum(
  MATCH_ALGORITHMS,
) satisfies z.ZodType<MatchAlgorithm>;

const matchBaselineSchema = z.object({
  kind: z.enum(MATCH_BASELINE_KINDS),
  locale: z.string().nullable(),
  applicationId: z.number().nullable(),
}) satisfies z.ZodType<MatchBaseline>;

const requirementMatchSchema = z.object({
  text: z.string(),
  weight: z.number(),
  matched: z.boolean(),
  score: z.number(),
}) satisfies z.ZodType<RequirementMatch>;

const matchResultSchema = z.object({
  score: z.number(),
  algorithm: matchAlgorithmSchema,
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
}) satisfies z.ZodType<JobListPage>;

export const jobResponseSchema = jobSchema;

export const jobStatsResponseSchema = jobStatsSchema;

export const applicationsResponseSchema = z.object({
  applications: z.array(applicationSchema),
  total: z.number(),
}) satisfies z.ZodType<ApplicationListPage>;

export const applicationResponseSchema = applicationSchema;

export const applicationEventsResponseSchema = z.object({
  events: z.array(applicationEventSchema),
  total: z.number(),
}) satisfies z.ZodType<ApplicationEventListPage>;

const interviewModeSchema = z.enum(
  INTERVIEW_MODES,
) satisfies z.ZodType<InterviewMode>;

const interviewOutcomeSchema = z.enum(
  INTERVIEW_OUTCOMES,
) satisfies z.ZodType<InterviewOutcome>;

const interviewSchema = z.object({
  id: z.number(),
  applicationId: z.number(),
  mode: interviewModeSchema,
  outcome: interviewOutcomeSchema,
  scheduledAt: z.string(),
  durationMinutes: z.number().nullable(),
  roundLabel: z.string().nullable(),
  location: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<Interview>;

export const interviewResponseSchema = interviewSchema;

export const interviewsResponseSchema = z.object({
  interviews: z.array(interviewSchema),
  total: z.number(),
}) satisfies z.ZodType<InterviewListPage>;

const contactSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  company: z.string().nullable(),
  role: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<Contact>;

export const contactResponseSchema = contactSchema;

export const contactsResponseSchema = z.object({
  contacts: z.array(contactSchema),
  total: z.number(),
}) satisfies z.ZodType<ContactListPage>;

const applicationContactSchema = z.object({
  applicationId: z.number(),
  contact: contactSchema,
  isPrimary: z.boolean(),
}) satisfies z.ZodType<ApplicationContact>;

export const applicationContactsResponseSchema = z.array(
  applicationContactSchema,
);

const offerStatusSchema = z.enum(
  OFFER_STATUSES,
) satisfies z.ZodType<OfferStatus>;

const offerSchema = z.object({
  id: z.number(),
  applicationId: z.number(),
  status: offerStatusSchema,
  currency: z.string(),
  salaryMin: z.number().nullable(),
  salaryMax: z.number().nullable(),
  equityNotes: z.string().nullable(),
  benefitsNotes: z.string().nullable(),
  decidedAt: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<Offer>;

export const offerResponseSchema = offerSchema;

export const offersResponseSchema = z.object({
  offers: z.array(offerSchema),
  total: z.number(),
}) satisfies z.ZodType<OfferListPage>;

const coverLetterSchema = z.object({
  id: z.number(),
  applicationId: z.number(),
  locale: z.string(),
  subject: z.string().nullable(),
  bodyText: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<CoverLetter>;

export const coverLetterResponseSchema = coverLetterSchema;

export const portfolioResponseSchema = portfolioSchema;

export const skillsResponseSchema = z.object({
  skills: z.array(skillSchema),
  total: z.number(),
}) satisfies z.ZodType<SkillListPage>;

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
}) satisfies z.ZodType<ResumeListPage>;
