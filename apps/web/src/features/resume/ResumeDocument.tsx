import type { ReactNode } from 'react';
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
    <section className="resume-section">
      <h2>{title}</h2>
      {children}
    </section>
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
    <article className="resume-role">
      <header className="resume-role-header">
        <h3 className="resume-company">{company}</h3>
        <div className="resume-title">{title}</div>
        <div className="resume-meta">
          {location && `${location} | `}
          {period}
        </div>
      </header>
      <ul>
        {bullets.map((bullet, index) => (
          <li key={`${index}-${bullet}`}>{bullet}</li>
        ))}
      </ul>
    </article>
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
    <article className="resume-role">
      <header className="resume-role-header">
        <div className="resume-title">
          {project.title}
          {project.technologies?.length ? (
            <span className="resume-tech">
              ({project.technologies.join(', ')})
            </span>
          ) : null}
        </div>
        {(project.repo || project.demo) && (
          <div className="resume-links">
            {project.repo && (
              <a href={project.repo} target="_blank" rel="noreferrer">
                {messages.links.github}
              </a>
            )}
            {project.repo && project.demo && (
              <span className="resume-separator">•</span>
            )}
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noreferrer">
                {messages.links.demo}
              </a>
            )}
          </div>
        )}
      </header>
      {project.summary && (
        <ul>
          {project.summary.slice(0, 3).map((summary) => (
            <li key={summary}>{summary}</li>
          ))}
        </ul>
      )}
    </article>
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
    <article className="resume-document">
      <header className="resume-header">
        <h1>{data.name}</h1>
        <p className="resume-headline">{data.title}</p>
        <div className="resume-contact">
          <a
            href={`https://github.com/${data.username}`}
            target="_blank"
            rel="noreferrer"
          >
            github.com/{data.username}
          </a>
          <span className="resume-separator">•</span>
          <a
            href={`https://linkedin.com/in/${data.username}`}
            target="_blank"
            rel="noreferrer"
          >
            linkedin.com/in/{data.username}
          </a>
        </div>
      </header>

      <ResumeSection title={messages.resume.summaryTitle}>
        <p>{data.summary}</p>
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
        <ul>
          {skillEntries.map(([key, items]) => (
            <li key={key}>
              <strong>{messages.skills[key]}:</strong> {items.join(', ')}
            </li>
          ))}
        </ul>
      </ResumeSection>

      <ResumeSection title={messages.resume.languagesTitle}>
        <ul>
          {data.languages.map((language) => (
            <li key={language}>{language}</li>
          ))}
        </ul>
      </ResumeSection>
    </article>
  );
}
