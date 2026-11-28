import { z } from 'zod';

// Contract for the PDF preview document. Everything except the applicant's
// name is optional — a partially filled resume still renders, missing pieces
// simply don't appear. Blank strings inside lists are dropped so empty editor
// rows never reach the page.

const optionalText = z.string().optional();

const textList = z
  .array(z.string())
  .transform((items) => items.filter((item) => item.trim() !== ''));

const basicsSchema = z.object({
  fullName: z.string(),
  headline: optionalText,
  subtitle: optionalText,
  location: optionalText,
  links: z.array(z.object({ label: z.string(), url: z.string() })),
});

const experienceEntrySchema = z.object({
  company: z.string(),
  role: z.string(),
  location: optionalText,
  period: z.string(),
  bullets: textList,
});

const projectEntrySchema = z.object({
  title: z.string(),
  technologies: z.array(z.string()).optional(),
  repoUrl: z.string().nullish(),
  demoUrl: z.string().nullish(),
  highlights: textList,
});

const skillGroupSchema = z.object({
  category: z.string(),
  items: textList,
});

const educationEntrySchema = z.object({
  institution: z.string(),
  degree: z.string(),
  fieldOfStudy: optionalText,
  period: optionalText,
  details: optionalText,
});

const certificationEntrySchema = z.object({
  name: z.string(),
  issuer: optionalText,
  year: optionalText,
});

const languageEntrySchema = z.object({
  name: z.string(),
  proficiency: optionalText,
});

// Provenance envelope (ADR 0035): which resume schema produced the
// document and where it came from. Rendering ignores it; the viewer and
// download flows may surface it. All fields optional — older documents
// simply carry no meta.
const resumeDocumentMetaSchema = z.object({
  locale: optionalText,
  source: optionalText,
  versionId: z.union([z.string(), z.number()]).optional(),
  applicationId: z.union([z.string(), z.number()]).optional(),
  jobId: z.union([z.string(), z.number()]).optional(),
  generatedAt: optionalText,
});

export const resumePdfDocumentSchema = z.object({
  // Schema version of the resume document shape (backend
  // RESUME_SCHEMA_VERSION); documents predating versioning parse as 1.
  schemaVersion: z.number().int().nonnegative().default(1),
  meta: resumeDocumentMetaSchema.optional(),
  basics: basicsSchema,
  summary: optionalText,
  experience: z.array(experienceEntrySchema).optional(),
  projects: z.array(projectEntrySchema).optional(),
  skillGroups: z.array(skillGroupSchema).optional(),
  education: z.array(educationEntrySchema).optional(),
  certifications: z.array(certificationEntrySchema).optional(),
  languages: z.array(languageEntrySchema).optional(),
});
