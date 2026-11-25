import type { Schemas, Wire } from './contract';

export const INTERVIEW_MODES = [
  'onsite',
  'remote',
  'video',
  'phone',
] as const satisfies readonly Schemas['InterviewMode'][];

export type InterviewMode = Schemas['InterviewMode'];

export const INTERVIEW_OUTCOMES = [
  'pending',
  'completed',
  'cancelled',
  'no_show',
] as const satisfies readonly Schemas['InterviewOutcome'][];

export type InterviewOutcome = Schemas['InterviewOutcome'];

export type Interview = Wire<Schemas['InterviewResponse']>;

export type InterviewListPage = Wire<Schemas['InterviewListResponse']>;

export type InterviewCreate = Wire<Schemas['InterviewCreate']>;

export type InterviewUpdate = Wire<Schemas['InterviewPatch']>;
