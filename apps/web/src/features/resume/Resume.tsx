import { useMemo } from 'react';
import { Button, Container, Stack, Typography } from '@mui/material';
import { content } from 'virtual:portfolio-content';
import { useTranslation } from '../../i18n/provider';
import { getProjects } from '../../services/projects/getProjects';
import { mapContentToWorkRoles } from '../../services/work-experience/workModel';
import ResumeDocument from './ResumeDocument';
import type { ResumeDocumentData, ResumeDocumentLabels } from './types';

export default function Resume() {
  const { locale, messages: t } = useTranslation();
  const { data, projects } = useMemo(() => {
    const roles = mapContentToWorkRoles(
      content[locale].workExperience,
      t,
      locale,
    );

    const projects = getProjects(locale).filter((project) =>
      project.topics?.includes('resume'),
    );

    const data: ResumeDocumentData = {
      name: t.home.name,
      title: `${t.home.title} • ${t.home.subtitle}`,
      username: t.home.username,
      summary: t.resume.summary,
      roles,
      languages: [t.resume.languages.portuguese, t.resume.languages.english],
    };

    return { data, projects };
  }, [locale, t]);

  const labels: ResumeDocumentLabels = {
    resume: {
      summaryTitle: t.resume.summaryTitle,
      experienceTitle: t.resume.experienceTitle,
      languagesTitle: t.resume.languagesTitle,
    },
    projectTitle: t.projects.title,
    projectLinks: {
      github: t.links.github,
      demo: t.links.demo,
    },
    skills: t.skills,
  };

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
        <ResumeDocument data={data} projects={projects} labels={labels} />
      </Stack>
    </Container>
  );
}
