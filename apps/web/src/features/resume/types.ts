import type { WorkRole } from '../../services/work-experience/workModel';
import type { Translation } from '../../types/i18n';

export interface ResumeDocumentData {
  name: string;
  title: string;
  username: string;
  summary: string;
  roles: WorkRole[];
  languages: string[];
}

type ResumeSkillCategory = Exclude<keyof Translation['skills'], 'title'>;

export type ResumeSkillLabels = Pick<
  Translation['skills'],
  ResumeSkillCategory | 'title'
>;

export type ResumeProjectLinks = Pick<Translation['links'], 'github' | 'demo'>;

export interface ResumeDocumentLabels {
  resume: Pick<
    Translation['resume'],
    'summaryTitle' | 'experienceTitle' | 'languagesTitle'
  >;
  projectTitle: Translation['projects']['title'];
  projectLinks: ResumeProjectLinks;
  skills: ResumeSkillLabels;
}
