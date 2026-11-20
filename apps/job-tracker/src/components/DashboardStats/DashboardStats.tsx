import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useTranslation } from '../../i18n/Provider';
import { useJobStats } from '../../services/api/jobs';
import { LoadingState, QueryErrorAlert } from '../AsyncStatus/AsyncStatus';

const EMPTY_VALUE = '—';

function StatCard({ value, label }: { value: ReactNode; label: string }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Card>
        <CardContent>
          <Typography component="div" variant="h4">
            {value}
          </Typography>
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
  const stats = statsQuery.data;

  return (
    <Stack spacing={2}>
      {statsQuery.isLoading && <LoadingState label={messages.common.loading} />}
      {statsQuery.isError && (
        <QueryErrorAlert
          error={statsQuery.error}
          subject={messages.dashboard.title}
          onRetry={() => void statsQuery.refetch()}
        />
      )}
      <Grid container spacing={2}>
        <StatCard
          value={stats?.total ?? EMPTY_VALUE}
          label={messages.dashboard.totalJobs}
        />
        <StatCard
          value={stats?.jobsByAge['<1d'] ?? EMPTY_VALUE}
          label={messages.dashboard.jobsToday}
        />
        <StatCard
          value={stats?.jobsByAge['1-7d'] ?? EMPTY_VALUE}
          label={messages.dashboard.jobsThisWeek}
        />
        <StatCard
          value={stats?.jobsByAge['7-30d'] ?? EMPTY_VALUE}
          label={messages.dashboard.jobsThisMonth}
        />
      </Grid>
    </Stack>
  );
}
