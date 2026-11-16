import { Link as RouterLink, useParams } from 'react-router-dom';
import { Box, Chip, Container, Link, Stack, Typography } from '@mui/material';
import { useTranslation } from '../../i18n/provider';
import { getProject } from '../../services/projects/getProjects';
import { routePaths } from '../../app/routePaths';

function Section({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;

  return (
    <Box component="section" sx={{ mt: 5 }}>
      <Typography variant="h3" component="h2" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <Box component="ul" sx={{ pl: 2.5, listStyleType: 'disc' }}>
        {items.map((item) => (
          <Box component="li" key={item} sx={{ mb: 0.5 }}>
            {item}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function ProjectDetails() {
  const { slug } = useParams();
  const { locale, messages: t } = useTranslation();
  const project = slug ? getProject(slug, locale) : null;

  if (!project) {
    return (
      <Container component="section" maxWidth="md" sx={{ py: 6 }}>
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
      </Container>
    );
  }

  return (
    <Container component="article" maxWidth="md" sx={{ py: 6 }}>
      <Box component="header" sx={{ mb: 5 }}>
        <Typography variant="h1" component="h1">
          {project.title}
        </Typography>
        {project.description && (
          <Typography variant="h6" sx={{ mt: 1.5 }}>
            {project.description}
          </Typography>
        )}
        {project.summary && (
          <Box component="ul" sx={{ mt: 2, pl: 2.5, listStyleType: 'disc' }}>
            {project.summary.map((bullet) => (
              <Box component="li" key={bullet} sx={{ mb: 0.5 }}>
                {bullet}
              </Box>
            ))}
          </Box>
        )}
        {project.technologies && (
          <Stack direction="row" sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
            {project.technologies.map((tech) => (
              <Chip key={tech} label={tech} size="small" />
            ))}
          </Stack>
        )}
        <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
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
      </Box>
      <Section title={t.projects.highlights} items={project.highlights} />
    </Container>
  );
}
