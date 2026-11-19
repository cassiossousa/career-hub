import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useTranslation } from '../../i18n/Provider';
import { useJobStats } from '../../services/api/jobs';
import { filterResultLabelKey } from '../../services/filterResult';
import type { JobFilterResult } from '../../services/types/job';
import { EmptyState, QueryGate } from '../AsyncStatus/AsyncStatus';

const FILTER_RESULTS: JobFilterResult[] = [
  'filtered_level',
  'filtered_location',
  'filtered_area',
  'filtered_remote',
  'filtered_age',
];

function StatCard({ value, label }: { value: ReactNode; label: string }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4">{value}</Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

export function DashboardStats() {
  const { messages } = useTranslation();
  const statsQuery = useJobStats();

  return (
    <QueryGate
      query={statsQuery}
      empty={<EmptyState title={messages.common.error} />}
    >
      {(stats) => {
        const filteredTotal = FILTER_RESULTS.reduce(
          (sum, key) => sum + (stats.filtered[key] ?? 0),
          0,
        );

        return (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <StatCard
                value={stats.total}
                label={messages.dashboard.totalJobs}
              />
              <StatCard
                value={`${stats.avgMatchScore ?? 0}%`}
                label={messages.dashboard.avgMatchScore}
              />
              <StatCard
                value={stats.jobsByAge.lessThanOneDay}
                label={messages.dashboard.jobsToday}
              />
              <StatCard
                value={stats.jobsByAge.oneToSevenDays}
                label={messages.dashboard.jobsThisWeek}
              />
            </Grid>
            {filteredTotal > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {messages.dashboard.filteredCount.replace(
                      '{count}',
                      String(filteredTotal),
                    )}
                  </Typography>
                  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
                    {FILTER_RESULTS.map((key) => {
                      const count = stats.filtered[key] ?? 0;
                      if (count === 0) return null;
                      return (
                        <Typography
                          key={key}
                          variant="body2"
                          color="text.secondary"
                        >
                          {
                            messages.jobs.filterResult[
                              filterResultLabelKey[key]
                            ]
                          }
                          : {count}
                        </Typography>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        );
      }}
    </QueryGate>
  );
}
