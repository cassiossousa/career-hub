import { Alert, Button, Stack, Typography } from '@mui/material';
import {
  errorMessage,
  LoadingState,
  QueryErrorAlert,
} from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import {
  useIngestionRuns,
  useTriggerIngestionRuns,
} from '../../services/api/ingestion';
import { RunsTable, SourceCounts } from './IngestionSections';

export function IngestionDashboard() {
  const { messages } = useTranslation();
  const runsQuery = useIngestionRuns();
  const trigger = useTriggerIngestionRuns();
  const t = messages.ingestion;

  return (
    <Stack spacing={3} sx={{ maxWidth: 1100 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          rowGap: 1,
        }}
      >
        <Stack spacing={0.5} sx={{ maxWidth: 640 }}>
          <Typography component="h1" variant="h5">
            {t.title}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          disabled={trigger.isPending}
          onClick={() => {
            trigger.mutate({});
          }}
        >
          {trigger.isPending ? t.running : t.runAll}
        </Button>
      </Stack>
      {trigger.isError && (
        <Alert severity="error">{errorMessage(trigger.error)}</Alert>
      )}
      <SourceCounts />
      <Stack spacing={1}>
        <Typography variant="subtitle1">{t.runsTitle}</Typography>
        {runsQuery.isLoading && (
          <LoadingState label={messages.common.loading} />
        )}
        {runsQuery.isError && (
          <QueryErrorAlert
            error={runsQuery.error}
            subject={t.runsTitle}
            onRetry={() => void runsQuery.refetch()}
          />
        )}
        {runsQuery.data !== undefined && (
          <RunsTable runs={runsQuery.data.runs} />
        )}
      </Stack>
    </Stack>
  );
}
