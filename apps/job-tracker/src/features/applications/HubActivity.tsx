import { Stack, Typography } from '@mui/material';
import {
  EmptyState,
  LoadingState,
  QueryErrorAlert,
} from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import { useApplicationEvents } from '../../services/api/applications';
import type {
  Application,
  ApplicationEvent,
} from '../../services/types/application';

function stringField(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === 'string' && value !== '' ? value : null;
}

function statusSummary(payload: Record<string, unknown>): string | null {
  const from = stringField(payload, 'from');
  const to = stringField(payload, 'to');
  return from !== null && to !== null ? `${from} → ${to}` : null;
}

function followUpSummary(
  payload: Record<string, unknown>,
  locale: string,
): string | null {
  const at = stringField(payload, 'at');
  return at === null ? null : new Date(at).toLocaleString(locale);
}

function payloadSummary(
  event: ApplicationEvent,
  locale: string,
): string | null {
  const payload = event.payload;
  if (event.kind === 'status_changed') return statusSummary(payload);
  if (event.kind === 'follow_up_set') return followUpSummary(payload, locale);
  if (event.kind === 'note_added') return stringField(payload, 'note');
  return null;
}

export function HubActivity({ application }: { application: Application }) {
  const { locale, messages } = useTranslation();
  const eventsQuery = useApplicationEvents(application.id);
  const t = messages.applicationHub.activity;

  if (eventsQuery.isLoading) {
    return <LoadingState label={messages.common.loading} />;
  }
  if (eventsQuery.isError) {
    return (
      <QueryErrorAlert
        error={eventsQuery.error}
        subject={messages.applicationHub.tabs.activity}
        onRetry={() => {
          void eventsQuery.refetch();
        }}
      />
    );
  }

  const events = (eventsQuery.data?.events ?? []).toSorted(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (events.length === 0) {
    return <EmptyState title={t.empty} />;
  }

  return (
    <Stack spacing={0} sx={{ maxWidth: 720 }}>
      {events.map((event) => {
        const summary = payloadSummary(event, locale);
        return (
          <Stack
            key={event.id}
            direction="row"
            spacing={2}
            sx={{
              py: 1,
              borderBottom: 1,
              borderColor: 'divider',
              alignItems: 'baseline',
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ minWidth: 160, flexShrink: 0 }}
            >
              {new Date(event.createdAt).toLocaleString(locale)}
            </Typography>
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="body2">{t.kinds[event.kind]}</Typography>
              {summary !== null && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {summary}
                </Typography>
              )}
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}
