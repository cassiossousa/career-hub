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

export type JobLevel = 'intern' | 'junior' | 'mid' | 'senior' | 'lead';

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

export type JobSortOrder =
  | 'posted_desc'
  | 'match_score_desc'
  | 'match_score_asc';

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
  weight: number; // 1-10, default 5
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
  matchScore: number | null;
  requirements: Requirement[];
  filterResult: JobFilterResult;
  createdAt: string;
}

export interface JobCreate {
  source: JobSource;
  externalId?: string | undefined;
  url: string;
  title: string;
  company: string;
  location: string;
  area: JobArea;
  level: JobLevel;
  contractType?: string | undefined;
  description: string;
  remote: boolean;
  salaryMin?: number | undefined;
  salaryMax?: number | undefined;
  currency?: string | undefined;
  postedAt?: string | undefined;
  matchScore?: number | undefined;
  requirements?: Requirement[] | undefined;
  filterResult?: JobFilterResult | undefined;
}

export type JobUpdate = Partial<JobCreate>;

export interface JobFilter {
  source?: JobSource | undefined;
  level?: JobLevel | undefined;
  location?: string | undefined;
  area?: JobArea | undefined;
  remoteOnly?: boolean | undefined;
  minMatchScore?: number | undefined;
  maxAgeDays?: number | undefined;
  sort?: JobSortOrder | undefined;
  preset?: 'profile' | null | undefined;
}

export interface JobStats {
  total: number;
  bySource: Partial<Record<JobSource, number>>;
  byLevel: Partial<Record<JobLevel, number>>;
  byArea: Partial<Record<JobArea, number>>;
  filtered: Partial<Record<JobFilterResult, number>>;
  applicationsByStatus: Record<string, number>;
  avgMatchScore: number | null;
  jobsByAge: {
    lessThanOneDay: number;
    oneToSevenDays: number;
    sevenToThirtyDays: number;
    overThirtyDays: number;
  };
}
