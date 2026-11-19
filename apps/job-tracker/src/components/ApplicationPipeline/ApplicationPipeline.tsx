import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { useTranslation } from '../../i18n/Provider';
import {
  useApplications,
  useUpdateApplication,
} from '../../services/api/applications';
import { useJobTitleById } from '../../services/api/jobs';
import type {
  Application,
  ApplicationStatus,
} from '../../services/types/application';
import { EmptyState, QueryGate } from '../AsyncStatus/AsyncStatus';

const STATUSES: ApplicationStatus[] = [
  'saved',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
];

const NEXT_STATUS: Partial<Record<ApplicationStatus, ApplicationStatus>> = {
  saved: 'applied',
  applied: 'screening',
  screening: 'interview',
  interview: 'offer',
  offer: 'rejected',
};

const STATUS_COLORS: Record<
  ApplicationStatus,
  'default' | 'info' | 'primary' | 'warning' | 'success' | 'error'
> = {
  saved: 'default',
  applied: 'info',
  screening: 'primary',
  interview: 'warning',
  offer: 'success',
  rejected: 'error',
  withdrawn: 'default',
};

function columnSx(status: ApplicationStatus): SxProps<Theme> {
  return {
    borderTop: 3,
    borderTopColor: `${STATUS_COLORS[status]}.main`,
    borderColor: 'divider',
  };
}

function interpolate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    template,
  );
}

export function ApplicationPipeline() {
  const { locale, messages } = useTranslation();
  const applicationsQuery = useApplications();
  const { mutate: updateApplication } = useUpdateApplication();
  const jobTitleById = useJobTitleById();

  const advance = (app: Application) => {
    const next = NEXT_STATUS[app.status];
    if (!next) return;
    updateApplication({
      id: app.id,
      data: {
        status: next,
        ...(next === 'applied' && !app.appliedAt
          ? { appliedAt: new Date().toISOString() }
          : {}),
      },
    });
  };

  return (
    <QueryGate
      query={applicationsQuery}
      isEmpty={(apps) => apps.length === 0}
      empty={<EmptyState title={messages.dashboard.pipeline.noApplications} />}
    >
      {(applications) => {
        const byStatus = new Map<ApplicationStatus, Application[]>();
        for (const status of STATUSES) {
          byStatus.set(status, []);
        }
        for (const app of applications) {
          byStatus.get(app.status)?.push(app);
        }

        return (
          <Stack spacing={2}>
            <Typography variant="h6">
              {messages.dashboard.pipeline.title}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 2,
              }}
            >
              {STATUSES.map((status) => {
                const items = byStatus.get(status) ?? [];
                return (
                  <Card
                    key={status}
                    variant="outlined"
                    elevation={1}
                    sx={columnSx(status)}
                  >
                    <CardContent sx={{ pb: items.length > 0 ? 1 : undefined }}>
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Chip
                          label={messages.applications.status[status]}
                          color={STATUS_COLORS[status]}
                          size="small"
                        />
                        <Typography variant="h6" color="text.secondary">
                          {items.length}
                        </Typography>
                      </Stack>
                      {items.length > 0 && <Divider sx={{ mb: 1 }} />}
                      <Stack spacing={1}>
                        {items.map((app) => {
                          const nextStatus = NEXT_STATUS[app.status];
                          const title =
                            jobTitleById.get(app.jobId) ??
                            interpolate(messages.applications.jobFallback, {
                              id: String(app.jobId),
                            });
                          return (
                            <Box
                              key={app.id}
                              sx={{
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: 'action.hover',
                                border: 1,
                                borderColor: 'divider',
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {title}
                              </Typography>
                              {app.appliedAt && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: 'block' }}
                                >
                                  {new Date(app.appliedAt).toLocaleDateString(
                                    locale,
                                  )}
                                </Typography>
                              )}
                              {nextStatus && (
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => {
                                    advance(app);
                                  }}
                                  aria-label={interpolate(
                                    messages.applications.advanceTo,
                                    {
                                      title,
                                      status:
                                        messages.applications.status[
                                          nextStatus
                                        ],
                                    },
                                  )}
                                  sx={{ mt: 0.5, px: 0, minWidth: 0 }}
                                >
                                  → {messages.applications.status[nextStatus]}
                                </Button>
                              )}
                            </Box>
                          );
                        })}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Stack>
        );
      }}
    </QueryGate>
  );
}
