import { Box, Link, Stack, Typography } from '@mui/material';
import type { Project } from '../../../types/project';
import type { Translation } from '../../../types/i18n';
import ResumeSection from './ResumeSection';

export default function ResumeProjects({
  title,
  projects,
  links,
}: {
  title: string;
  projects: Project[];
  links: Pick<Translation['links'], 'github' | 'demo'>;
}) {
  if (!projects.length) return null;

  return (
    <ResumeSection title={title}>
      <Stack spacing={2}>
        {projects.map((project) => (
          <Box
            component="article"
            key={project.slug}
            sx={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
          >
            <Stack component="header" spacing={0.5}>
              <Typography variant="subtitle2">
                {project.title}
                {project.technologies?.length ? (
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                  >
                    {' '}
                    ({project.technologies.join(', ')})
                  </Typography>
                ) : null}
              </Typography>
              {(project.repo || project.demo) && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  {project.repo && (
                    <Link
                      href={project.repo}
                      target="_blank"
                      rel="noreferrer"
                      color="inherit"
                      variant="caption"
                    >
                      {links.github}
                    </Link>
                  )}
                  {project.repo && project.demo && (
                    <Typography variant="caption" color="text.secondary">
                      •
                    </Typography>
                  )}
                  {project.demo && (
                    <Link
                      href={project.demo}
                      target="_blank"
                      rel="noreferrer"
                      color="inherit"
                      variant="caption"
                    >
                      {links.demo}
                    </Link>
                  )}
                </Stack>
              )}
            </Stack>
            {project.summary && (
              <Box component="ul">
                {project.summary.slice(0, 3).map((summary) => (
                  <li key={summary}>{summary}</li>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Stack>
    </ResumeSection>
  );
}
