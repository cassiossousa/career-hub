import { Box, Link, Typography } from '@mui/material';
import type { Project } from '../../../types/project';
import type { ResumeProjectLinks } from '../types';
import ResumeBulletList from './ResumeBulletList';
import ResumeSection from './ResumeSection';

export default function ResumeProjects({
  title,
  projects,
  links,
}: {
  title: string;
  projects: Project[];
  links: ResumeProjectLinks;
}) {
  if (!projects.length) return null;

  return (
    <ResumeSection title={title}>
      {projects.map((project) => (
        <Box
          component="article"
          key={project.slug}
          sx={{ mb: 1.75, breakInside: 'avoid', pageBreakInside: 'avoid' }}
        >
          <Box component="header" sx={{ mb: 0.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              {project.title}
              {project.technologies?.length ? (
                <Box
                  component="span"
                  sx={{
                    ml: 0.5,
                    color: 'text.secondary',
                    fontSize: 11,
                    fontWeight: 400,
                  }}
                >
                  ({project.technologies.join(', ')})
                </Box>
              ) : null}
            </Typography>
            {(project.repo || project.demo) && (
              <Box sx={{ mt: 0.25, fontSize: 11, fontWeight: 600 }}>
                {project.repo && (
                  <Link
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer"
                    color="inherit"
                  >
                    {links.github}
                  </Link>
                )}
                {project.repo && project.demo && (
                  <Box
                    component="span"
                    sx={{ mx: 0.75, color: 'text.secondary' }}
                  >
                    •
                  </Box>
                )}
                {project.demo && (
                  <Link
                    href={project.demo}
                    target="_blank"
                    rel="noreferrer"
                    color="inherit"
                  >
                    {links.demo}
                  </Link>
                )}
              </Box>
            )}
          </Box>
          {project.summary && (
            <ResumeBulletList>
              {project.summary.slice(0, 3).map((summary) => (
                <Box component="li" key={summary}>
                  {summary}
                </Box>
              ))}
            </ResumeBulletList>
          )}
        </Box>
      ))}
    </ResumeSection>
  );
}
