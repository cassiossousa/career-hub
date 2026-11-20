import type {
  ExperienceEntry,
  PortfolioBasics,
  ProjectEntry,
  SkillGroup,
} from './portfolio';

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy?: string | null | undefined;
  start?: string | null | undefined; // YYYY-MM
  end?: string | null | undefined; // YYYY-MM
  details?: string | null | undefined;
}

export interface CertificationEntry {
  name: string;
  issuer?: string | null | undefined;
  url?: string | null | undefined;
  year?: number | null | undefined;
}

export interface LanguageEntry {
  name: string;
  proficiency?: string | null | undefined;
}

/** PUT body: one locale's full resume document (no Markdown). */
export interface ResumeDocument {
  locale: string;
  summary: string;
  basics: PortfolioBasics;
  experience?: ExperienceEntry[] | undefined;
  education?: EducationEntry[] | undefined;
  certifications?: CertificationEntry[] | undefined;
  languages?: LanguageEntry[] | undefined;
  projects?: ProjectEntry[] | undefined;
  skillGroups?: SkillGroup[] | undefined;
}

/** GET response: persisted resume = document fields + server metadata. */
export interface Resume extends ResumeDocument {
  id: number;
  applicationId: number;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
