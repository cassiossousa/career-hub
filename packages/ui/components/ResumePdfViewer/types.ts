import type { z } from 'zod';
import type { resumePdfDocumentSchema } from '../../pdf/schema';

// The zod schema in `pdf/schema.ts` is the single source of truth for the
// preview document contract; these aliases keep the component-facing names.
export type ResumePdfDocument = z.infer<typeof resumePdfDocumentSchema>;
export type ResumePdfBasics = ResumePdfDocument['basics'];
export type ResumePdfExperienceEntry = NonNullable<
  ResumePdfDocument['experience']
>[number];
export type ResumePdfProjectEntry = NonNullable<
  ResumePdfDocument['projects']
>[number];
export type ResumePdfSkillGroup = NonNullable<
  ResumePdfDocument['skillGroups']
>[number];
export type ResumePdfEducationEntry = NonNullable<
  ResumePdfDocument['education']
>[number];
export type ResumePdfCertificationEntry = NonNullable<
  ResumePdfDocument['certifications']
>[number];
export type ResumePdfLanguageEntry = NonNullable<
  ResumePdfDocument['languages']
>[number];

export interface ResumePdfViewerLabels {
  summary: string;
  experience: string;
  projects: string;
  skillGroups: string;
  education: string;
  certifications: string;
  languages: string;
  repository: string;
  demo: string;
}
