import type { Schemas, Wire } from './contract';

export type EducationEntry = Wire<Schemas['EducationEntrySchema']>;

export type CertificationEntry = Wire<Schemas['CertificationEntrySchema']>;

export type LanguageEntry = Wire<Schemas['LanguageEntrySchema']>;

/** PUT body: one locale's full resume document (no Markdown). */
export type ResumeDocument = Wire<Schemas['ResumeDocument']>;

/** GET response: persisted resume = document fields + server metadata. */
export type Resume = Wire<Schemas['ResumeResponse']>;

export type ResumeListPage = Wire<Schemas['ResumeListResponse']>;
