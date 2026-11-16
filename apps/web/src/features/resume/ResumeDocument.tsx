import { Box, Typography } from '@mui/material';
import type { Project } from '../../types/project';
import ResumeBulletList from './components/ResumeBulletList';
import ResumeExperience from './components/ResumeExperience';
import ResumeHeader from './components/ResumeHeader';
import ResumeProjects from './components/ResumeProjects';
import ResumeSection from './components/ResumeSection';
import ResumeSkills from './components/ResumeSkills';
import type { ResumeDocumentData, ResumeDocumentLabels } from './types';

export type { ResumeDocumentData } from './types';

interface ResumeDocumentProps {
  data: ResumeDocumentData;
  projects: Project[];
  labels: ResumeDocumentLabels;
}

export default function ResumeDocument({
  data,
  projects,
  labels,
}: ResumeDocumentProps) {
  return (
    <Box
      component="article"
      sx={{
        boxSizing: 'border-box',
        mx: 'auto',
        maxWidth: 768,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: 4,
        color: 'text.primary',
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
      <ResumeHeader
        name={data.name}
        title={data.title}
        username={data.username}
      />

      <ResumeSection title={labels.resume.summaryTitle}>
        <Typography sx={{ fontSize: 'inherit' }}>{data.summary}</Typography>
      </ResumeSection>

      <ResumeExperience
        title={labels.resume.experienceTitle}
        roles={data.roles}
      />

      <ResumeProjects
        title={labels.projectTitle}
        projects={projects}
        links={labels.projectLinks}
      />

      <ResumeSkills skills={labels.skills} />

      {data.languages.length > 0 && (
        <ResumeSection title={labels.resume.languagesTitle}>
          <ResumeBulletList>
            {data.languages.map((language) => (
              <Box component="li" key={language}>
                {language}
              </Box>
            ))}
          </ResumeBulletList>
        </ResumeSection>
      )}
    </Box>
  );
}
