import type { JobArea, JobLevel, JobSource } from './types/job';
import type { LanguageName, SkillCategory } from './types/portfolio';

export const JOB_LEVELS = [
  'intern',
  'junior',
  'mid',
  'senior',
  'lead',
  'unknown',
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

export const SKILL_CATEGORIES = [
  'frontend',
  'backend',
  'databases',
  'distributed',
  'cloud',
  'testing',
] as const satisfies readonly SkillCategory[];

export const LANGUAGE_NAMES = [
  'english',
  'portuguese',
  'spanish',
  'french',
  'german',
] as const satisfies readonly LanguageName[];
