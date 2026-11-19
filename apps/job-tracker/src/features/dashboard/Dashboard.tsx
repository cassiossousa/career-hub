import { Stack } from '@mui/material';
import { ApplicationPipeline } from '../../components/ApplicationPipeline/ApplicationPipeline';
import { DashboardStats } from '../../components/DashboardStats/DashboardStats';
import { FilterBar } from '../../components/FilterBar/FilterBar';
import { Recommendations } from '../../components/Recommendations/Recommendations';

export function Dashboard() {
  return (
    <Stack spacing={3}>
      <DashboardStats />
      <FilterBar />
      <Recommendations />
      <ApplicationPipeline />
    </Stack>
  );
}
