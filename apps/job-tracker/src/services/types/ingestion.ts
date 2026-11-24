import type { JobSource } from './job';

export type IngestionRunStatus = 'succeeded' | 'partial' | 'failed';

export interface IngestionRun {
  id: number;
  startedAt: string;
  finishedAt: string;
  createdAt: string;
  source: JobSource;
  status: IngestionRunStatus;
  fetched: number;
  inserted: number;
  updated: number;
  failed: number;
  error: string | null;
}

export interface IngestionRunListPage {
  runs: IngestionRun[];
  total: number;
}

/** POST /api/ingestion/runs body; omitted source means "all sources". */
export interface IngestionRunTrigger {
  source?: JobSource | null | undefined;
}
