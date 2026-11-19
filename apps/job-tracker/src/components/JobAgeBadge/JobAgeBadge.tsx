import { Chip } from '@mui/material';
import { useTranslation } from '../../i18n/Provider';
import type { Job } from '../../services/types/job';

const renderedAtMs = Date.now();

interface JobAgeBadgeProps {
  job: Job;
}

function fill(template: string, count: number): string {
  return template.replace('{count}', String(count));
}

export function JobAgeBadge({ job }: JobAgeBadgeProps) {
  const { messages } = useTranslation();
  if (!job.postedAt) return null;

  const diffDays = Math.max(
    0,
    Math.ceil((renderedAtMs - new Date(job.postedAt).getTime()) / 86400000),
  );
  const age = messages.jobs.age;

  let color: 'success' | 'warning' | 'default' = 'default';
  let label = '';

  if (diffDays < 1) {
    color = 'success';
    label = age.today;
  } else if (diffDays < 7) {
    color = 'success';
    label = fill(age.daysAgo, diffDays);
  } else if (diffDays < 30) {
    color = 'warning';
    label = fill(age.weeksAgo, Math.floor(diffDays / 7));
  } else {
    color = 'default';
    label = fill(age.monthsAgo, Math.floor(diffDays / 30));
  }

  return <Chip label={label} color={color} size="small" variant="outlined" />;
}
