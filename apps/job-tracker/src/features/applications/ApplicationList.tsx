import {
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import {
  EmptyState,
  QueryGate,
} from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import { useApplications } from '../../services/api/applications';
import { useJobTitleById } from '../../services/api/jobs';

export function ApplicationList() {
  const { messages, locale } = useTranslation();
  const navigate = useNavigate();
  const applicationsQuery = useApplications();
  const jobTitleById = useJobTitleById();
  const emptyState = (
    <EmptyState title={messages.applications.noApplications} />
  );

  return (
    <Stack spacing={2}>
      <Typography component="h1" variant="h5">
        {messages.applications.title}
      </Typography>
      <QueryGate
        query={applicationsQuery}
        subject={messages.applications.title}
        isEmpty={(page) => page.applications.length === 0}
        empty={emptyState}
      >
        {(page) => {
          const applications = page.applications;
          return (
            <Stack spacing={2}>
              <Typography component="h2" variant="h6">
                {messages.applications.title} ({page.total})
              </Typography>
              <Grid container spacing={2}>
                {applications.map((app) => (
                  <Grid size={{ xs: 12, md: 6 }} key={app.id}>
                    <Card>
                      <CardContent>
                        <Stack spacing={1}>
                          <Typography component="h3" variant="h6">
                            {jobTitleById.get(app.jobId) ?? `Job #${app.jobId}`}
                          </Typography>
                          <Chip
                            label={messages.applications.status[app.status]}
                            size="small"
                            color="primary"
                          />
                          {app.appliedAt && (
                            <Typography variant="body2" color="text.secondary">
                              {messages.applications.appliedAt}:{' '}
                              {new Date(app.appliedAt).toLocaleDateString(
                                locale,
                              )}
                            </Typography>
                          )}
                          {app.notes && (
                            <Typography variant="body2">{app.notes}</Typography>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              void navigate(
                                routePaths.applicationDetail(app.id.toString()),
                              );
                            }}
                            sx={{ alignSelf: 'flex-start' }}
                          >
                            {messages.applications.resume}
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          );
        }}
      </QueryGate>
    </Stack>
  );
}
