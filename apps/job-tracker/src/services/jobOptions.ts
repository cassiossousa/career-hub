import type { JobArea, JobLevel, JobSortOrder, JobSource } from './types/job';

export const JOB_LEVELS = [
  'intern',
  'junior',
  'mid',
  'senior',
  'lead',
] as const satisfies readonly JobLevel[];

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
] as const satisfies readonly JobArea[];

export const JOB_SOURCES = [
  'gupy',
  'solides',
  'empregos_com_br',
  'sine_bahia',
  'casa_do_trabalhador',
  'remote',
  'google_jobs',
  'manual',
  'other',
] as const satisfies readonly JobSource[];

export const JOB_SORT_ORDERS = [
  'posted_desc',
  'match_score_desc',
  'match_score_asc',
] as const satisfies readonly JobSortOrder[];
