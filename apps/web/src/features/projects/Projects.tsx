import { generatePath, Link } from 'react-router-dom';
import {
  Box,
  Card,
  Chip,
  Container,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from '../../i18n/provider';
import { getProjects } from '../../services/projects/getProjects';
import { routePaths } from '../../app/routePaths';

export default function Projects() {
  const { locale, messages: t } = useTranslation();
  const featuredProjects = getProjects(locale).filter(
    (project) =>
      Boolean(project.topics?.includes('featured') || project.featured) ||
      Boolean(project.topics?.includes('resume')),
  );

  return (
    <Container component="section" maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h1" component="h1" sx={{ mb: 4 }}>
        {t.projects.title}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 3,
        }}
      >
        {featuredProjects.map((project) => (
          <Card
            key={project.slug}
            component="article"
            variant="outlined"
            sx={{ p: 3, boxShadow: 1 }}
          >
            <MuiLink
              component={Link}
              to={generatePath(routePaths.projectDetails, {
                slug: project.slug,
              })}
              variant="h3"
              color="text.primary"
              underline="hover"
            >
              {project.title}
            </MuiLink>

            {project.summary && (
              <Box
                component="ul"
                sx={{
                  mt: 1.5,
                  pl: 2.5,
                  listStyleType: 'disc',
                  '& li': { fontSize: '0.875rem' },
                }}
              >
                {project.summary.slice(0, 3).map((bullet) => (
                  <Box component="li" key={bullet}>
                    {bullet}
                  </Box>
                ))}
              </Box>
            )}

            {project.technologies && project.technologies.length > 0 && (
              <Stack direction="row" sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
                {project.technologies.map((tech) => (
                  <Chip key={tech} label={tech} size="small" />
                ))}
              </Stack>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
              {project.stars && (
                <Typography
                  variant="body2"
                  aria-label={`${project.stars} ${t.projects.stars}`}
                >
                  ⭐ {project.stars}
                </Typography>
              )}
              {project.repo && (
                <MuiLink
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer"
                  variant="body2"
                >
                  {t.links.github}
                </MuiLink>
              )}
              {project.demo && (
                <MuiLink
                  href={project.demo}
                  target="_blank"
                  rel="noreferrer"
                  variant="body2"
                >
                  {t.links.demo}
                </MuiLink>
              )}
            </Stack>
          </Card>
        ))}
      </Box>
    </Container>
  );
}
