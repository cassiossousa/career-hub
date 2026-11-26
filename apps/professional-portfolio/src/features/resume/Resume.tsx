import { content } from 'virtual:portfolio-content';
import { Container, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from '../../i18n/Provider';
import { getProjects } from '../../services/projects/getProjects';
import {
  mapContentToWorkRoles,
  sortRolesByStart,
} from '../../services/work-experience/workModel';
import ResumeDocument from './ResumeDocument';

export default function Resume() {
  const { locale, messages: t } = useTranslation();
  const { roles, projects } = useMemo(() => {
    const sortedRoles = sortRolesByStart(
      mapContentToWorkRoles(content[locale].workExperience, t, locale),
    );

    const resumeProjects = getProjects(locale).filter((project) =>
      project.topics?.includes('resume'),
    );

    return { roles: sortedRoles, projects: resumeProjects };
  }, [locale, t]);

  return (
    <Container
      component="section"
      maxWidth="md"
      sx={{ py: 6, '@media print': { py: 0, px: 0 } }}
    >
      <Stack spacing={3}>
        <Stack spacing={2} sx={{ '@media print': { display: 'none' } }}>
          <Typography variant="h1" component="h1">
            {t.resume.title}
          </Typography>
        </Stack>
        <ResumeDocument
          roles={roles}
          projects={projects}
          printLabel={t.resume.printAction}
        />
      </Stack>
    </Container>
  );
}
