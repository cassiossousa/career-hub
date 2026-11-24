import type { Schemas, Wire } from './contract';

export const APPLICATION_STATUS_ORDER = [
  'saved',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
] as const satisfies readonly Schemas['ApplicationStatus'][];

export type ApplicationStatus = Schemas['ApplicationStatus'];

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

export type Application = Wire<Schemas['ApplicationResponse']>;

export type ApplicationListPage = Wire<Schemas['ApplicationListResponse']>;

export type ApplicationCreate = Wire<Schemas['ApplicationCreate']>;

export type ApplicationUpdate = Wire<Schemas['ApplicationPatch']>;
