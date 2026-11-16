import { useMemo } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { content } from 'virtual:portfolio-content';
import { useTranslation } from '../../i18n/provider';
import { getProjects } from '../../services/projects/getProjects';
import { mapContentToWorkRoles } from '../../services/work-experience/workModel';
import ResumeDocument, { type ResumeDocumentData } from './ResumeDocument';

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

  return (
    <Container
      component="section"
      maxWidth="md"
      sx={{ py: 6, '@media print': { py: 0, px: 0 } }}
    >
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
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
      </Box>
      <Typography
        variant="body2"
        sx={{ my: 1.5, '@media print': { display: 'none' } }}
      >
        {t.resume.printInstructions}
      </Typography>
      <ResumeDocument data={data} projects={projects} messages={t} />
    </Container>
  );
}
