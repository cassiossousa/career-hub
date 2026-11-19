export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

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

export interface ApplicationCreate {
  jobId: number;
  status?: ApplicationStatus | undefined;
  notes?: string | undefined;
  appliedAt?: string | undefined;
}

export interface ApplicationUpdate {
  status?: ApplicationStatus | undefined;
  notes?: string | undefined;
  appliedAt?: string | undefined;
}
