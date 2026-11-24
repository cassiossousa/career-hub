import { Box, Divider, Link, Stack, Typography } from '@mui/material';
import { Fragment, type ReactNode } from 'react';
import type {
  ResumePdfCertificationEntry,
  ResumePdfEducationEntry,
  ResumePdfExperienceEntry,
  ResumePdfLanguageEntry,
  ResumePdfProjectEntry,
  ResumePdfSkillGroup,
} from './types';

export function ResumePdfSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Stack component="section" spacing={1}>
      <Typography component="h3" variant="h6">
        {title}
      </Typography>
      <Divider />
      {children}
    </Stack>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
      {items.map((item) => (
        <Box component="li" key={item} sx={{ typography: 'body2' }}>
          {item}
        </Box>
      ))}
    </Box>
  );
}

function ResumeEntry({
  title,
  subtitle,
  meta,
  children,
}: {
  title: string;
  subtitle?: string | undefined;
  meta?: (string | undefined)[] | undefined;
  children?: ReactNode;
}) {
  const metaParts = meta?.filter((part): part is string => Boolean(part));
  return (
    <Box
      component="article"
      sx={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
    >
      <Stack component="header" spacing={0.5}>
        <Typography component="h4" variant="subtitle1">
          {title}
        </Typography>
        {subtitle ? <Typography variant="body2">{subtitle}</Typography> : null}
        {metaParts?.length ? (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {metaParts.join(' | ')}
          </Typography>
        ) : null}
      </Stack>
      {children ? <Box sx={{ mt: 0.5 }}>{children}</Box> : null}
    </Box>
  );
}

function ResumeEntrySection<T>({
  title,
  entries,
  spacing = 2,
  entryKey,
  renderEntry,
}: {
  title: string;
  entries?: T[] | undefined;
  spacing?: number;
  entryKey: (entry: T) => string;
  renderEntry: (entry: T) => ReactNode;
}) {
  if (!entries?.length) return null;
  return (
    <ResumePdfSection title={title}>
      <Stack spacing={spacing}>
        {entries.map((entry) => (
          <Fragment key={entryKey(entry)}>{renderEntry(entry)}</Fragment>
        ))}
      </Stack>
    </ResumePdfSection>
  );
}

export function ExperienceSection({
  title,
  entries,
}: {
  title: string;
  entries?: ResumePdfExperienceEntry[] | undefined;
}) {
  return (
    <ResumeEntrySection
      title={title}
      entries={entries}
      entryKey={(entry) => `${entry.company}-${entry.role}-${entry.period}`}
      renderEntry={(entry) => (
        <ResumeEntry
          title={entry.role}
          subtitle={entry.company}
          meta={[entry.location, entry.period]}
        >
          <BulletList items={entry.bullets} />
        </ResumeEntry>
      )}
    />
  );
}

export function ProjectsSection({
  title,
  entries,
  repositoryLabel,
  demoLabel,
}: {
  title: string;
  entries?: ResumePdfProjectEntry[] | undefined;
  repositoryLabel: string;
  demoLabel: string;
}) {
  return (
    <ResumeEntrySection
      title={title}
      entries={entries}
      entryKey={(entry) => entry.title}
      renderEntry={(entry) => (
        <ResumeEntry
          title={entry.title}
          meta={
            entry.technologies?.length
              ? [entry.technologies.join(', ')]
              : undefined
          }
        >
          <Stack spacing={0.5}>
            {entry.repoUrl || entry.demoUrl ? (
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', flexWrap: 'wrap' }}
              >
                {entry.repoUrl ? (
                  <Link
                    href={entry.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    color="inherit"
                    variant="caption"
                  >
                    {repositoryLabel}
                  </Link>
                ) : null}
                {entry.repoUrl && entry.demoUrl ? (
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    •
                  </Typography>
                ) : null}
                {entry.demoUrl ? (
                  <Link
                    href={entry.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    color="inherit"
                    variant="caption"
                  >
                    {demoLabel}
                  </Link>
                ) : null}
              </Stack>
            ) : null}
            <BulletList items={entry.highlights} />
          </Stack>
        </ResumeEntry>
      )}
    />
  );
}

export function SkillGroupsSection({
  title,
  groups,
}: {
  title: string;
  groups?: ResumePdfSkillGroup[] | undefined;
}) {
  const items = (groups ?? [])
    .filter((group) => group.items.length > 0)
    .map((group) => `${group.category}: ${group.items.join(', ')}`);
  if (items.length === 0) return null;
  return (
    <ResumePdfSection title={title}>
      <BulletList items={items} />
    </ResumePdfSection>
  );
}

export function EducationSection({
  title,
  entries,
}: {
  title: string;
  entries?: ResumePdfEducationEntry[] | undefined;
}) {
  return (
    <ResumeEntrySection
      title={title}
      entries={entries}
      entryKey={(entry) => `${entry.institution}-${entry.degree}`}
      renderEntry={(entry) => (
        <ResumeEntry
          title={
            entry.fieldOfStudy
              ? `${entry.degree} — ${entry.fieldOfStudy}`
              : entry.degree
          }
          subtitle={entry.institution}
          meta={entry.period ? [entry.period] : undefined}
        >
          {entry.details ? (
            <Typography variant="body2">{entry.details}</Typography>
          ) : null}
        </ResumeEntry>
      )}
    />
  );
}

export function CertificationsSection({
  title,
  entries,
}: {
  title: string;
  entries?: ResumePdfCertificationEntry[] | undefined;
}) {
  return (
    <ResumeEntrySection
      title={title}
      entries={entries}
      spacing={1}
      entryKey={(entry) => entry.name}
      renderEntry={(entry) => (
        <ResumeEntry
          title={entry.name}
          subtitle={entry.issuer}
          meta={entry.year ? [entry.year] : undefined}
        />
      )}
    />
  );
}

export function LanguagesSection({
  title,
  entries,
}: {
  title: string;
  entries?: ResumePdfLanguageEntry[] | undefined;
}) {
  if (!entries?.length) return null;
  return (
    <ResumePdfSection title={title}>
      <BulletList
        items={entries.map((entry) =>
          entry.proficiency
            ? `${entry.name} — ${entry.proficiency}`
            : entry.name,
        )}
      />
    </ResumePdfSection>
  );
}
