import { content } from 'virtual:portfolio-content';
import { Button, Container, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from '../../i18n/provider';
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
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            '@media print': { display: 'none' },
          }}
        >
          <Typography variant="h1" component="h1">
            {t.resume.title}
          </Typography>
          <Button
            type="button"
            variant="contained"
            onClick={() => window.print()}
          >
            {t.resume.printAction}
          </Button>
        </Stack>
        <Typography
          variant="body2"
          sx={{ '@media print': { display: 'none' } }}
        >
          {t.resume.printInstructions}
        </Typography>
        <ResumeDocument roles={roles} projects={projects} />
      </Stack>
    </Container>
  );
}
