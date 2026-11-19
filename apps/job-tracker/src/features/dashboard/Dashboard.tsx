import { Stack, Typography } from '@mui/material';
import { ApplicationPipeline } from '../../components/ApplicationPipeline/ApplicationPipeline';
import { DashboardStats } from '../../components/DashboardStats/DashboardStats';
import { FilterBar } from '../../components/FilterBar/FilterBar';
import { Recommendations } from '../../components/Recommendations/Recommendations';
import { useTranslation } from '../../i18n/Provider';

export function Dashboard() {
  const { messages } = useTranslation();

  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h5">
        {messages.dashboard.title}
      </Typography>
      <DashboardStats />
      <FilterBar />
      <Recommendations />
      <ApplicationPipeline />
    </Stack>
  );
}
