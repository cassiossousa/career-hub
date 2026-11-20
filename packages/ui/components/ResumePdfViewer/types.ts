export interface ResumePdfBasics {
  fullName: string;
  headline?: string | undefined;
  subtitle?: string | undefined;
  location?: string | undefined;
  links: { label: string; url: string }[];
}

export interface ResumePdfExperienceEntry {
  company: string;
  role: string;
  location?: string | undefined;
  period: string;
  bullets: string[];
}

export interface ResumePdfProjectEntry {
  title: string;
  technologies?: string[] | undefined;
  repoUrl?: string | null | undefined;
  demoUrl?: string | null | undefined;
  highlights: string[];
}

export interface ResumePdfSkillGroup {
  category: string;
  items: string[];
}

export interface ResumePdfEducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy?: string | undefined;
  period?: string | undefined;
  details?: string | undefined;
}

export interface ResumePdfCertificationEntry {
  name: string;
  issuer?: string | undefined;
  year?: string | undefined;
}

export interface ResumePdfLanguageEntry {
  name: string;
  proficiency?: string | undefined;
}

/** Presentation-ready resume document consumed by ResumePdfViewer. */
export interface ResumePdfDocument {
  basics: ResumePdfBasics;
  summary?: string | undefined;
  experience?: ResumePdfExperienceEntry[] | undefined;
  projects?: ResumePdfProjectEntry[] | undefined;
  skillGroups?: ResumePdfSkillGroup[] | undefined;
  education?: ResumePdfEducationEntry[] | undefined;
  certifications?: ResumePdfCertificationEntry[] | undefined;
  languages?: ResumePdfLanguageEntry[] | undefined;
}

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
