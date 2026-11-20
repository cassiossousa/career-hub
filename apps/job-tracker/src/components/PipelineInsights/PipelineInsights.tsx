import { Card, CardContent, Stack, Typography } from '@mui/material';
import { useTranslation } from '../../i18n/Provider';
import { useApplications } from '../../services/api/applications';
import { useJobs } from '../../services/api/jobs';
import {
  appliedThisWeek,
  reachedInterview,
  responseRate,
} from '../../services/applicationStats';
import type { JobSource } from '../../services/types/job';
import {
  EmptyState,
  QueryGate,
  SkeletonGrid,
} from '../AsyncStatus/AsyncStatus';

export function PipelineInsights() {
  const { messages } = useTranslation();
  const applicationsQuery = useApplications();
  const jobsQuery = useJobs();

  const jobs = jobsQuery.data?.jobs ?? [];
  const sourceByJobId = new Map(jobs.map((job) => [job.id, job.source]));

  return (
    <QueryGate
      query={applicationsQuery}
      subject={messages.dashboard.insights.title}
      isEmpty={(page) => page.applications.length === 0}
      empty={<EmptyState title={messages.applications.noApplications} />}
      loading={<SkeletonGrid variant="row" count={2} />}
    >
      {(page) => {
        const applications = page.applications;
        const rate = responseRate(applications);
        const interviewCount = reachedInterview(applications);
        const weekCount = appliedThisWeek(applications);

        const sourceCounts = new Map<JobSource, number>();
        for (const application of applications) {
          const source = sourceByJobId.get(application.jobId);
          if (source !== undefined) {
            sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
          }
        }
        const topSource = [...sourceCounts.entries()].toSorted(
          (a, b) => b[1] - a[1],
        )[0];

        const rows: [string, string][] = [
          [
            messages.dashboard.insights.responseRate,
            rate === null ? '—' : `${rate}%`,
          ],
          [
            messages.dashboard.insights.reachedInterview,
            String(interviewCount),
          ],
          [messages.dashboard.insights.appliedThisWeek, String(weekCount)],
          [
            messages.dashboard.insights.topSource,
            topSource === undefined ? '—' : messages.jobs.sources[topSource[0]],
          ],
        ];

        return (
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle1">
                  {messages.dashboard.insights.title}
                </Typography>
                {rows.map(([label, value]) => (
                  <Stack
                    key={label}
                    direction="row"
                    sx={{ justifyContent: 'space-between' }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        );
      }}
    </QueryGate>
  );
}
