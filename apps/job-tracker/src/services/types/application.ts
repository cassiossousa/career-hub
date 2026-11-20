export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export const APPLICATION_STATUS_ORDER: readonly ApplicationStatus[] = [
  'saved',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
];

export const TERMINAL_APPLICATION_STATUSES: ReadonlySet<ApplicationStatus> =
  new Set(['rejected', 'withdrawn']);

export const NEXT_APPLICATION_STATUS: Partial<
  Record<ApplicationStatus, ApplicationStatus>
> = {
  saved: 'applied',
  applied: 'screening',
  screening: 'interview',
  interview: 'offer',
  offer: 'rejected',
};

export interface Application {
  id: number;
  jobId: number;
  portfolioId: number;
  status: ApplicationStatus;
  notes: string | null;
  appliedAt: string | null;
  statusChangedAt: string;
  createdAt: string;
}

export interface ApplicationListPage {
  applications: Application[];
  total: number;
}

export interface ApplicationCreate {
  jobId: number;
  status?: ApplicationStatus | undefined;
  notes?: string | undefined;
  appliedAt?: string | undefined;
}

export interface ApplicationUpdate {
  status?: ApplicationStatus | null | undefined;
  notes?: string | null | undefined;
  appliedAt?: string | null | undefined;
}
