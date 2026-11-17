import { Box, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from '../../i18n/provider';
import type { WorkRole } from '../../services/work-experience/workModel';
import type { Project } from '../../types/project';
import ResumeExperience from './components/ResumeExperience';
import ResumeHeader from './components/ResumeHeader';
import ResumeProjects from './components/ResumeProjects';
import ResumeSection from './components/ResumeSection';
import ResumeSkills from './components/ResumeSkills';

interface ResumeDocumentProps {
  roles: WorkRole[];
  projects: Project[];
}

export default function ResumeDocument({
  roles,
  projects,
}: ResumeDocumentProps) {
  const { messages: t } = useTranslation();
  const languages = [t.resume.languages.portuguese, t.resume.languages.english];

  return (
    <Paper
      component="article"
      variant="outlined"
      square
      elevation={0}
      sx={{
        boxSizing: 'border-box',
        mx: 'auto',
        maxWidth: 768,
        p: 4,
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
        <ResumeHeader
          name={t.home.name}
          title={`${t.home.title} • ${t.home.subtitle}`}
          username={t.home.username}
        />

        <ResumeSection title={t.resume.summaryTitle}>
          <Typography variant="body2">{t.resume.summary}</Typography>
        </ResumeSection>

        <ResumeExperience title={t.resume.experienceTitle} roles={roles} />

        <ResumeProjects
          title={t.projects.title}
          projects={projects}
          links={{ github: t.links.github, demo: t.links.demo }}
        />

        <ResumeSkills skills={t.skills} />

        {languages.length > 0 && (
          <ResumeSection title={t.resume.languagesTitle}>
            <Box component="ul">
              {languages.map((language) => (
                <li key={language}>{language}</li>
              ))}
            </Box>
          </ResumeSection>
        )}
      </Stack>
    </Paper>
  );
}
