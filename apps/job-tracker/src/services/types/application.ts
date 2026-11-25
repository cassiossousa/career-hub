import type { Schemas, Wire } from './contract';

export const APPLICATION_STATUS_ORDER = [
  'saved',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
  'no_response',
] as const satisfies readonly Schemas['ApplicationStatus'][];

export type ApplicationStatus = Schemas['ApplicationStatus'];

export const TERMINAL_APPLICATION_STATUSES: ReadonlySet<ApplicationStatus> =
  new Set(['rejected', 'withdrawn', 'no_response']);

export const NEXT_APPLICATION_STATUS: Partial<
  Record<ApplicationStatus, ApplicationStatus>
> = {
  saved: 'applied',
  applied: 'screening',
  screening: 'interview',
  interview: 'offer',
};

export type Application = Wire<Schemas['ApplicationResponse']>;

export type ApplicationListPage = Wire<Schemas['ApplicationListResponse']>;

export const APPLICATION_EVENT_KINDS = [
  'created',
  'status_changed',
  'note_added',
  'follow_up_set',
  'follow_up_cleared',
] as const satisfies readonly Schemas['ApplicationEventKind'][];

export type ApplicationEventKind = Schemas['ApplicationEventKind'];

export type ApplicationEvent = Wire<Schemas['ApplicationEventResponse']>;

export type ApplicationEventListPage = Wire<
  Schemas['ApplicationEventListResponse']
>;

export type ApplicationCreate = Wire<Schemas['ApplicationCreate']>;

export type ApplicationUpdate = Wire<Schemas['ApplicationPatch']>;
