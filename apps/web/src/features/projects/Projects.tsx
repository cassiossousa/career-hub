import { generatePath, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
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
      <Stack spacing={4}>
        <Typography variant="h1" component="h1">
          {t.projects.title}
        </Typography>

        <Grid container spacing={3}>
          {featuredProjects.map((project) => (
            <Grid key={project.slug} size={{ xs: 12, md: 6 }}>
              <Card component="article" variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <MuiLink
                      component={Link}
                      to={generatePath(routePaths.projectDetails, {
                        slug: project.slug,
                      })}
                      variant="h3"
                      underline="hover"
                      sx={{ color: 'text.primary' }}
                    >
                      {project.title}
                    </MuiLink>

                    {project.summary && (
                      <ul>
                        {project.summary.slice(0, 3).map((bullet) => (
                          <li key={bullet}>
                            <Typography variant="body2">{bullet}</Typography>
                          </li>
                        ))}
                      </ul>
                    )}

                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <Grid container spacing={1}>
                          {project.technologies.map((tech) => (
                            <Grid key={tech} size="auto">
                              <Chip label={tech} size="small" />
                            </Grid>
                          ))}
                        </Grid>
                      )}

                    <Stack direction="row" spacing={2}>
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
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}
