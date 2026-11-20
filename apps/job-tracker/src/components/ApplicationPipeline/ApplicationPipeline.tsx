import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { interpolate } from '../../i18n/interpolate';
import { useTranslation } from '../../i18n/Provider';
import { useApplicationTracker } from '../../services/api/applications';
import {
  APPLICATION_STATUS_ORDER,
  type Application,
  type ApplicationStatus,
  NEXT_APPLICATION_STATUS,
} from '../../services/types/application';
import {
  APPLICATION_STATUS_COLORS,
  ApplicationStatusChip,
} from '../ApplicationStatusChip/ApplicationStatusChip';
import { EmptyState, QueryGate } from '../AsyncStatus/AsyncStatus';

const STATUSES = APPLICATION_STATUS_ORDER;
const NEXT_STATUS = NEXT_APPLICATION_STATUS;

function columnSx(status: ApplicationStatus) {
  return {
    borderColor: 'divider',
    borderTop: 3,
    borderTopColor: `${APPLICATION_STATUS_COLORS[status]}.main`,
  } as const;
}

export function ApplicationPipeline() {
  const { locale, messages } = useTranslation();
  const { applicationsQuery, updateApplication, titleForJob } =
    useApplicationTracker(messages.applications.jobFallback);
  const { mutate: updateApp } = updateApplication;

  const advance = (app: Application) => {
    const next = NEXT_STATUS[app.status];
    if (!next) return;
    updateApp({
      id: app.id,
      data: {
        status: next,
        ...(next === 'applied' && !app.appliedAt
          ? { appliedAt: new Date().toISOString().slice(0, 10) }
          : {}),
      },
    });
  };

  return (
    <QueryGate
      query={applicationsQuery}
      subject={messages.dashboard.pipeline.title}
      isEmpty={(page) => page.applications.length === 0}
      empty={<EmptyState title={messages.dashboard.pipeline.noApplications} />}
    >
      {(page) => {
        const applications = page.applications;
        const byStatus = new Map<ApplicationStatus, Application[]>();
        for (const status of STATUSES) {
          byStatus.set(status, []);
        }
        for (const app of applications) {
          byStatus.get(app.status)?.push(app);
        }

        return (
          <Stack spacing={2}>
            <Typography component="h2" variant="h6">
              {messages.dashboard.pipeline.title}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                alignItems: 'flex-start',
              }}
            >
              {STATUSES.map((status) => {
                const items = byStatus.get(status) ?? [];
                return (
                  <Card
                    key={status}
                    variant="outlined"
                    sx={{
                      ...columnSx(status),
                      flex: '1 1 200px',
                      minWidth: 0,
                    }}
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
                        <ApplicationStatusChip status={status} />
                        <Typography
                          component="div"
                          variant="h6"
                          color="text.secondary"
                        >
                          {items.length}
                        </Typography>
                      </Stack>
                      {items.length > 0 && <Divider sx={{ mb: 1 }} />}
                      <Stack spacing={1}>
                        {items.map((app) => {
                          const nextStatus = NEXT_STATUS[app.status];
                          const title = titleForJob(app.jobId);
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
