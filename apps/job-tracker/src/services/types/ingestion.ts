import type { Schemas, Wire } from './contract';

export const INGESTION_RUN_STATUSES = [
  'succeeded',
  'partial',
  'failed',
] as const satisfies readonly Schemas['IngestionRunStatus'][];

export type IngestionRunStatus = Schemas['IngestionRunStatus'];

export type IngestionRun = Wire<Schemas['IngestionRunResponse']>;

export type IngestionRunListPage = Wire<Schemas['IngestionRunListResponse']>;

/** POST /api/ingestion/runs body; omitted source means "all sources". */
export type IngestionRunTrigger = Wire<Schemas['IngestionRunCreate']>;
