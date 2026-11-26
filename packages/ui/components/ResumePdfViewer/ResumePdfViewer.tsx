import { Typography } from '@mui/material';
import { PdfViewer } from '../PdfViewer';
import { PagedResume } from './PagedResume';
import { ResumePdfHeader } from './ResumePdfHeader';
import {
  CertificationsSection,
  EducationSection,
  ExperienceSection,
  LanguagesSection,
  ProjectsSection,
  ResumePdfSection,
  SkillGroupsSection,
} from './ResumePdfSections';
import type { ResumePdfDocument, ResumePdfViewerLabels } from './types';

export interface ResumePdfViewerProps {
  document: ResumePdfDocument;
  labels: ResumePdfViewerLabels;
  /** When set, renders a print/PDF button above the page. */
  printLabel?: string | undefined;
  /** Render as fixed A4 pages instead of one continuous page. */
  paged?: boolean | undefined;
}

/**
 * Renders a presentation-ready resume document as a print-styled page —
 * the same visual language as a generated PDF. Purely presentational:
 * callers map their domain document into `ResumePdfDocument` first.
 */
export function ResumePdfViewer({
  document,
  labels,
  printLabel,
  paged = false,
}: ResumePdfViewerProps) {
  return (
    <PdfViewer
      printLabel={printLabel}
      pagedContent={
        paged ? <PagedResume document={document} labels={labels} /> : undefined
      }
    >
      <ResumePdfHeader basics={document.basics} />
      {document.summary ? (
        <ResumePdfSection title={labels.summary}>
          <Typography variant="body2">{document.summary}</Typography>
        </ResumePdfSection>
      ) : null}
      <ExperienceSection
        title={labels.experience}
        entries={document.experience}
      />
      <ProjectsSection
        title={labels.projects}
        entries={document.projects}
        repositoryLabel={labels.repository}
        demoLabel={labels.demo}
      />
      <SkillGroupsSection
        title={labels.skillGroups}
        groups={document.skillGroups}
      />
      <EducationSection title={labels.education} entries={document.education} />
      <CertificationsSection
        title={labels.certifications}
        entries={document.certifications}
      />
      <LanguagesSection title={labels.languages} entries={document.languages} />
    </PdfViewer>
  );
}
