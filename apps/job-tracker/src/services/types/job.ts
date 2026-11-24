export type JobSource =
  | 'gupy'
  | 'solides'
  | 'empregos_com_br'
  | 'sine_bahia'
  | 'casa_do_trabalhador'
  | 'remote'
  | 'google_jobs'
  | 'manual'
  | 'other';

export type JobLevel =
  | 'intern'
  | 'junior'
  | 'mid'
  | 'senior'
  | 'lead'
  | 'unknown';

export type JobArea =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'data'
  | 'devops'
  | 'mobile'
  | 'qa'
  | 'management'
  | 'other';

export type JobFilterResult =
  | 'unevaluated'
  | 'passed'
  | 'filtered_level'
  | 'filtered_location'
  | 'filtered_area'
  | 'filtered_remote'
  | 'filtered_age';

export type RequirementClassification =
  | 'proven'
  | 'equivalent'
  | 'partial'
  | 'unproven';

export interface Requirement {
  text: string;
  classification: RequirementClassification;
  weight?: number | undefined; // 1-10, backend default 5
}

export interface Job {
  id: number;
  source: JobSource;
  externalId: string | null;
  url: string;
  title: string;
  company: string;
  location: string;
  area: JobArea;
  level: JobLevel;
  contractType: string | null;
  description: string;
  remote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  postedAt: string | null;
  lastSeenAt: string | null;
  closedAt?: string | null | undefined;
  requirements: Requirement[];
  filterResult: JobFilterResult;
  createdAt: string;
}

export interface JobCreate {
  source: JobSource;
  externalId?: string | null | undefined;
  url: string;
  title: string;
  company: string;
  location: string;
  area: JobArea;
  level: JobLevel;
  contractType?: string | null | undefined;
  description?: string | undefined;
  remote?: boolean | undefined;
  salaryMin?: number | null | undefined;
  salaryMax?: number | null | undefined;
  currency?: string | undefined;
  postedAt?: string | null | undefined;
  requirements?: Requirement[] | undefined;
  filterResult?: JobFilterResult | undefined;
}

export interface JobPatch {
  title?: string | null | undefined;
  company?: string | null | undefined;
  location?: string | null | undefined;
  area?: JobArea | null | undefined;
  level?: JobLevel | null | undefined;
  contractType?: string | null | undefined;
  description?: string | null | undefined;
  remote?: boolean | null | undefined;
  salaryMin?: number | null | undefined;
  salaryMax?: number | null | undefined;
  currency?: string | null | undefined;
  postedAt?: string | null | undefined;
  requirements?: Requirement[] | null | undefined;
  filterResult?: JobFilterResult | null | undefined;
}

export interface JobFilter {
  source?: JobSource | undefined;
  level?: JobLevel | undefined;
  location?: string | undefined;
  area?: JobArea | undefined;
  remoteOnly?: boolean | undefined;
  maxAgeDays?: number | undefined;
  preset?: 'profile' | null | undefined;
}

export interface JobListPage {
  jobs: Job[];
  total: number;
}

type JobAgeBucket = 'unknown' | '<1d' | '1-7d' | '7-30d' | '>30d';

export interface JobStats {
  total: number;
  bySource: Partial<Record<JobSource, number>>;
  byLevel: Partial<Record<JobLevel, number>>;
  byArea: Partial<Record<JobArea, number>>;
  filtered: Partial<Record<JobFilterResult, number>>;
  applicationsByStatus: Record<string, number>;
  jobsByAge: Partial<Record<JobAgeBucket, number>>;
}
