import { Link, Paper, Stack, Typography } from '@mui/material';
import { Fragment } from 'react';
import {
  CertificationsSection,
  EducationSection,
  ExperienceSection,
  LanguagesSection,
  ProjectsSection,
  ResumePdfSection,
  SkillGroupsSection,
} from './ResumePdfSections';
import type {
  ResumePdfBasics,
  ResumePdfDocument,
  ResumePdfViewerLabels,
} from './types';

export interface ResumePdfViewerProps {
  document: ResumePdfDocument;
  labels: ResumePdfViewerLabels;
}

function ResumePdfHeader({ basics }: { basics: ResumePdfBasics }) {
  const title = [basics.headline, basics.subtitle]
    .filter((part): part is string => Boolean(part))
    .join(' • ');
  return (
    <Stack
      component="header"
      spacing={1}
      sx={{ alignItems: 'center', textAlign: 'center' }}
    >
      <Typography component="h2" variant="h5">
        {basics.fullName}
      </Typography>
      {title ? (
        <Typography
          component="p"
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >
          {title}
        </Typography>
      ) : null}
      {basics.location ? (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {basics.location}
        </Typography>
      ) : null}
      {basics.links.length > 0 ? (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {basics.links.map((link, index) => (
            <Fragment key={`${link.label}-${link.url}`}>
              {index > 0 ? (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ color: 'text.secondary' }}
                >
                  •
                </Typography>
              ) : null}
              <Link
                href={link.url}
                target="_blank"
                rel="noreferrer"
                color="inherit"
                variant="caption"
              >
                {link.label}
              </Link>
            </Fragment>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

/**
 * Renders a presentation-ready resume document as a print-styled page —
 * the same visual language as a generated PDF. Purely presentational:
 * callers map their domain document into `ResumePdfDocument` first.
 */
export function ResumePdfViewer({ document, labels }: ResumePdfViewerProps) {
  return (
    <Paper
      component="article"
      variant="outlined"
      square
      elevation={0}
      sx={{
        boxSizing: 'border-box',
        width: '100%',
        p: { xs: 2.5, sm: 4 },
        boxShadow: 1,
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        lineHeight: 1.5,
        '@media print': {
          width: '100%',
          maxWidth: 'none',
          m: 0,
          border: 0,
          p: '14mm',
          boxShadow: 'none',
          WebkitBoxDecorationBreak: 'clone',
          boxDecorationBreak: 'clone',
        },
      }}
    >
      <Stack spacing={3}>
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
        <EducationSection
          title={labels.education}
          entries={document.education}
        />
        <CertificationsSection
          title={labels.certifications}
          entries={document.certifications}
        />
        <LanguagesSection
          title={labels.languages}
          entries={document.languages}
        />
      </Stack>
    </Paper>
  );
}
