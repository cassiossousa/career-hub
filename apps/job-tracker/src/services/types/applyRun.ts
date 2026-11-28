import type { Schemas, Wire } from './contract';

export const APPLY_RUN_STATUSES = [
  'queued',
  'inspecting',
  'ready_for_review',
  'approved',
  'submitted',
  'failed',
  'skipped',
  'needs_human',
] as const satisfies readonly Schemas['ApplyRunStatus'][];

export type ApplyRunStatus = Schemas['ApplyRunStatus'];

export const APPLY_PROVIDERS = [
  'greenhouse',
  'lever',
  'ashby',
  'workable',
  'smartrecruiters',
  'generic',
  'unknown',
] as const satisfies readonly Schemas['ApplyProvider'][];

export type ApplyProvider = Schemas['ApplyProvider'];

export const APPLY_ANSWER_SOURCES = [
  'fact',
  'resume',
  'cover_letter',
  'ai',
  'manual',
  'none',
] as const satisfies readonly Schemas['ApplyAnswerSource'][];

export type ApplyAnswerSource = Schemas['ApplyAnswerSource'];

export const APPLY_FORM_FIELD_KINDS = [
  'text',
  'textarea',
  'select',
  'multiselect',
  'file',
  'boolean',
  'date',
  'unknown',
] as const satisfies readonly Schemas['ApplyFormFieldKind'][];

export type ApplyFormFieldKind = Schemas['ApplyFormFieldKind'];

/** Apply-run row as returned by the API (mirrors ApplyRunResponse). */
export type ApplyRun = Wire<Schemas['ApplyRunResponse']>;

export type ApplyRunListPage = Wire<Schemas['ApplyRunListResponse']>;

export type ApplyFormField = Wire<Schemas['ApplyFormFieldResponse']>;

export type ProposedAnswer = Wire<Schemas['ProposedAnswerResponse']>;

export type ApplyArtifact = Wire<Schemas['ApplyArtifactResponse']>;

/** PATCH body for POST review decisions on an apply run. */
export type ApplyRunReview = Wire<Schemas['ApplyRunReview']>;
