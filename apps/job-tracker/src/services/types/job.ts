import type { Schemas, Wire } from './contract';

export const JOB_SOURCES = [
  'gupy',
  'solides',
  'empregos_com_br',
  'sine_bahia',
  'casa_do_trabalhador',
  'remote',
  'greenhouse',
  'lever',
  'google_jobs',
  'manual',
  'other',
] as const satisfies readonly Schemas['JobSource'][];

export type JobSource = Schemas['JobSource'];

export const JOB_LEVELS = [
  'intern',
  'junior',
  'mid',
  'senior',
  'lead',
  'unknown',
] as const satisfies readonly Schemas['JobLevel'][];

export type JobLevel = Schemas['JobLevel'];

export const JOB_AREAS = [
  'frontend',
  'backend',
  'fullstack',
  'data',
  'devops',
  'mobile',
  'qa',
  'management',
  'other',
] as const satisfies readonly Schemas['JobArea'][];

export type JobArea = Schemas['JobArea'];

export const JOB_FILTER_RESULTS = [
  'unevaluated',
  'passed',
  'filtered_level',
  'filtered_location',
  'filtered_area',
  'filtered_remote',
  'filtered_age',
] as const satisfies readonly Schemas['JobFilterResult'][];

export type JobFilterResult = Schemas['JobFilterResult'];

export const REQUIREMENT_CLASSIFICATIONS = [
  'proven',
  'equivalent',
  'partial',
  'unproven',
] as const satisfies readonly Schemas['RequirementClassification'][];

export type RequirementClassification = Schemas['RequirementClassification'];

export type Requirement = Wire<Schemas['RequirementSchema']>;

export type Job = Wire<Schemas['JobResponse']>;

export type JobCreate = Wire<Schemas['JobCreate']>;

export type JobPatch = Wire<Schemas['JobPatch']>;

/** Query parameters for GET /api/jobs — not part of the JSON contract. */
export interface JobFilter {
  source?: JobSource | undefined;
  level?: JobLevel | undefined;
  location?: string | undefined;
  area?: JobArea | undefined;
  remoteOnly?: boolean | undefined;
  maxAgeDays?: number | undefined;
  preset?: 'profile' | null | undefined;
}

export type JobListPage = Wire<Schemas['JobListResponse']>;

export type JobStats = Wire<Schemas['JobStatsResponse']>;
