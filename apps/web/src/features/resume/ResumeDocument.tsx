import type { ReactNode } from 'react';
import { Box, Link, Typography } from '@mui/material';
import { skills } from '../../services/skills';
import type { WorkRole } from '../../services/work-experience/workModel';
import type { Translation } from '../../types/i18n';
import type { Project } from '../../types/project';

export interface ResumeDocumentData {
  name: string;
  title: string;
  username: string;
  summary: string;
  roles: WorkRole[];
  languages: string[];
}

interface ResumeDocumentProps {
  data: ResumeDocumentData;
  projects: Project[];
  messages: Translation;
}

function ResumeSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box component="section">
      <Typography
        component="h2"
        variant="h6"
        sx={{
          mt: 3,
          mb: 1,
          borderBottom: '1px solid #ddd',
          pb: 0.25,
          fontSize: 17,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function ResumeList({ children }: { children: ReactNode }) {
  return (
    <Box
      component="ul"
      sx={{
        mt: 0.75,
        mb: 0,
        pl: '22px',
        listStyleType: 'disc',
        '& li': { mb: '2px', fontSize: 12, lineHeight: 1.5 },
      }}
    >
      {children}
    </Box>
  );
}

function ExperienceItem({
  company,
  title,
  location,
  period,
  bullets,
}: WorkRole) {
  return (
    <Box
      component="article"
      sx={{ mb: 1.75, breakInside: 'avoid', pageBreakInside: 'avoid' }}
    >
      <Box component="header" sx={{ mb: 0.5 }}>
        <Typography
          component="h3"
          variant="subtitle1"
          sx={{ m: 0, fontSize: 14, fontWeight: 600 }}
        >
          {company}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{title}</Typography>
        <Typography sx={{ color: '#666', fontSize: 12 }}>
          {location && `${location} | `}
          {period}
        </Typography>
      </Box>
      <ResumeList>
        {bullets.map((bullet, index) => (
          <Box component="li" key={`${index}-${bullet}`}>
            {bullet}
          </Box>
        ))}
      </ResumeList>
    </Box>
  );
}

function ProjectItem({
  project,
  messages,
}: {
  project: Project;
  messages: Translation;
}) {
  return (
    <Box
      component="article"
      sx={{ mb: 1.75, breakInside: 'avoid', pageBreakInside: 'avoid' }}
    >
      <Box component="header" sx={{ mb: 0.5 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
          {project.title}
          {project.technologies?.length ? (
            <Box
              component="span"
              sx={{ ml: 0.5, color: '#555', fontSize: 11, fontWeight: 400 }}
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
                {messages.links.github}
              </Link>
            )}
            {project.repo && project.demo && (
              <Box component="span" sx={{ mx: 0.75, color: '#888' }}>
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
                {messages.links.demo}
              </Link>
            )}
          </Box>
        )}
      </Box>
      {project.summary && (
        <ResumeList>
          {project.summary.slice(0, 3).map((summary) => (
            <Box component="li" key={summary}>
              {summary}
            </Box>
          ))}
        </ResumeList>
      )}
    </Box>
  );
}

export default function ResumeDocument({
  data,
  projects,
  messages,
}: ResumeDocumentProps) {
  const skillEntries = Object.entries(skills) as [
    keyof typeof skills,
    string[],
  ][];

  return (
    <Box
      component="article"
      sx={{
        boxSizing: 'border-box',
        mx: 'auto',
        maxWidth: 768,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: '#fff',
        p: 4,
        color: '#0f172a',
        boxShadow: 1,
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        lineHeight: 1.5,
        '@media print': {
          width: '100%',
          maxWidth: 'none',
          m: 0,
          border: 0,
          p: '14mm',
          boxShadow: 'none',
          WebkitBoxDecorationBreak: 'clone',
          boxDecorationBreak: 'clone',
        },
      }}
    >
      <Box component="header" sx={{ mb: 2.5, textAlign: 'center' }}>
        <Typography
          component="h1"
          variant="h4"
          sx={{ mb: 0.5, fontSize: 28, letterSpacing: '-0.2px' }}
        >
          {data.name}
        </Typography>
        <Typography
          component="p"
          sx={{ mb: 0.75, color: '#333', fontSize: 14, fontWeight: 500 }}
        >
          {data.title}
        </Typography>
        <Box sx={{ fontSize: 12 }}>
          <Link
            href={`https://github.com/${data.username}`}
            target="_blank"
            rel="noreferrer"
            color="inherit"
          >
            github.com/{data.username}
          </Link>
          <Box component="span" sx={{ mx: 0.75, color: '#888' }}>
            •
          </Box>
          <Link
            href={`https://linkedin.com/in/${data.username}`}
            target="_blank"
            rel="noreferrer"
            color="inherit"
          >
            linkedin.com/in/{data.username}
          </Link>
        </Box>
      </Box>

      <ResumeSection title={messages.resume.summaryTitle}>
        <Typography sx={{ fontSize: 'inherit' }}>{data.summary}</Typography>
      </ResumeSection>

      <ResumeSection title={messages.resume.experienceTitle}>
        {data.roles.map((role, index) => (
          <ExperienceItem
            key={`${role.company}-${role.period}-${index}`}
            {...role}
          />
        ))}
      </ResumeSection>

      {projects.length > 0 && (
        <ResumeSection title={messages.projects.title}>
          {projects.map((project) => (
            <ProjectItem
              key={project.slug}
              project={project}
              messages={messages}
            />
          ))}
        </ResumeSection>
      )}

      <ResumeSection title={messages.skills.title}>
        <ResumeList>
          {skillEntries.map(([key, items]) => (
            <Box component="li" key={key}>
              <Box component="strong">{messages.skills[key]}:</Box>{' '}
              {items.join(', ')}
            </Box>
          ))}
        </ResumeList>
      </ResumeSection>

      <ResumeSection title={messages.resume.languagesTitle}>
        <ResumeList>
          {data.languages.map((language) => (
            <Box component="li" key={language}>
              {language}
            </Box>
          ))}
        </ResumeList>
      </ResumeSection>
    </Box>
  );
}
