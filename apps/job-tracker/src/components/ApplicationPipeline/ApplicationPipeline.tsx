import { Box, Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { interpolate } from '../../i18n/interpolate';
import { useTranslation } from '../../i18n/Provider';
import { useApplicationTracker } from '../../services/api/applications';
import {
  APPLICATION_STATUS_ORDER,
  type Application,
  type ApplicationStatus,
  NEXT_APPLICATION_STATUS,
} from '../../services/types/application';
import { EmptyState, QueryGate } from '../AsyncStatus/AsyncStatus';

const STATUSES = APPLICATION_STATUS_ORDER;
const NEXT_STATUS = NEXT_APPLICATION_STATUS;

export function ApplicationPipeline() {
  const { locale, messages } = useTranslation();
  const [selected, setSelected] = useState(0);
  const { applicationsQuery, updateApplication, titleForJob, companyForJob } =
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

        const activeStatus = STATUSES[selected] ?? 'saved';
        const items = byStatus.get(activeStatus) ?? [];

        return (
          <Stack spacing={2}>
            <Typography component="h2" variant="h6">
              {messages.dashboard.pipeline.title}
            </Typography>
            <Tabs
              value={selected}
              onChange={(_, value: number) => {
                setSelected(value);
              }}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label={messages.dashboard.pipeline.title}
            >
              {STATUSES.map((status, index) => (
                <Tab
                  key={status}
                  id={`pipeline-tab-${index}`}
                  aria-controls={`pipeline-panel-${index}`}
                  label={`${messages.applications.status[status]} (${(byStatus.get(status) ?? []).length})`}
                />
              ))}
            </Tabs>
            <Box
              role="tabpanel"
              id={`pipeline-panel-${selected}`}
              aria-labelledby={`pipeline-tab-${selected}`}
            >
              {items.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {messages.applications.noApplications}
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {items.map((app) => {
                    const nextStatus = NEXT_STATUS[app.status];
                    const title = titleForJob(app.jobId);
                    const company = companyForJob(app.jobId);
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
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {title}
                        </Typography>
                        {company !== null && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            {company}
                          </Typography>
                        )}
                        {app.appliedAt && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            {new Date(app.appliedAt).toLocaleDateString(locale)}
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
                                  messages.applications.status[nextStatus],
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
              )}
            </Box>
          </Stack>
        );
      }}
    </QueryGate>
  );
}
