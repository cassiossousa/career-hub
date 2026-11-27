import { Chip, Container, Grid, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { useTranslation } from '../../i18n/Provider';
import { getProject } from '../../services/projects/getProjects';

function Section({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;

  return (
    <Stack component="section" spacing={1.5}>
      <Typography variant="h3" component="h2">
        {title}
      </Typography>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Stack>
  );
}

export default function ProjectDetails() {
  const { slug } = useParams();
  const { locale, messages: t } = useTranslation();
  const project = slug ? getProject(slug, locale) : null;

  if (!project) {
    return (
      <Container component="section" maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={2}>
          <Typography variant="h1" component="h1">
            {t.projects.notFound}
          </Typography>
          <Link
            component={RouterLink}
            to={routePaths.projects}
            underline="always"
          >
            {t.projects.backToProjects}
          </Link>
        </Stack>
      </Container>
    );
  }

  return (
    <Container component="article" maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={5}>
        <Stack component="header" spacing={2}>
          <Typography variant="h1" component="h1">
            {project.title}
          </Typography>
          {project.description && (
            <Typography variant="h6" component="p">
              {project.description}
            </Typography>
          )}
          {project.summary && (
            <ul>
              {project.summary.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
          {project.technologies && (
            <Grid container spacing={1}>
              {project.technologies.map((tech) => (
                <Grid key={tech} size="auto">
                  <Chip label={tech} size="small" />
                </Grid>
              ))}
            </Grid>
          )}
          <Stack direction="row" spacing={3}>
            {project.repo && (
              <Link
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
              >
                {t.links.github}
              </Link>
            )}
            {project.demo && (
              <Link
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
              >
                {t.links.liveDemo}
              </Link>
            )}
          </Stack>
        </Stack>
        <Section title={t.projects.highlights} items={project.highlights} />
      </Stack>
    </Container>
  );
}
