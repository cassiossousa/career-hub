import {
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import {
  LoadingState,
  QueryErrorAlert,
} from '../../components/AsyncStatus/AsyncStatus';
import { interpolate } from '../../i18n/interpolate';
import { useTranslation } from '../../i18n/Provider';
import { useApplications } from '../../services/api/applications';
import { useJobSummaries } from '../../services/api/jobs';

const MAX_ITEMS = 5;

export function FollowUpsCard() {
  const { locale, messages } = useTranslation();
  const followUpsQuery = useApplications({ followUp: 'due' });
  const jobSummaries = useJobSummaries();
  const t = messages.dashboard.followUps;

  if (followUpsQuery.isLoading) {
    return <LoadingState label={messages.common.loading} />;
  }
  if (followUpsQuery.isError) {
    return (
      <QueryErrorAlert
        error={followUpsQuery.error}
        subject={t.title}
        onRetry={() => {
          void followUpsQuery.refetch();
        }}
      />
    );
  }

  const applications = followUpsQuery.data?.applications ?? [];
  const visible = applications.slice(0, MAX_ITEMS);

  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography component="h2" variant="h6">
              {t.title}
            </Typography>
            {(followUpsQuery.data?.total ?? 0) > 0 && (
              <Typography variant="body2" color="text.secondary">
                {followUpsQuery.data?.total}
              </Typography>
            )}
          </Stack>
          {applications.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t.empty}
            </Typography>
          ) : (
            <Stack
              spacing={1}
              component="ul"
              sx={{ m: 0, pl: 0, listStyle: 'none' }}
            >
              {visible.map((application) => {
                const summary = jobSummaries.get(application.jobId);
                const title =
                  summary?.title ??
                  interpolate(messages.applications.jobFallback, {
                    id: String(application.jobId),
                  });
                return (
                  <Stack
                    component="li"
                    key={application.id}
                    direction="row"
                    sx={{ gap: 1, alignItems: 'baseline', flexWrap: 'wrap' }}
                  >
                    <Link
                      component={RouterLink}
                      to={routePaths.applicationDetail(String(application.id))}
                      variant="body2"
                    >
                      {title}
                    </Link>
                    {summary !== undefined && (
                      <Typography variant="body2" color="text.secondary">
                        {summary.company}
                      </Typography>
                    )}
                    {application.followUpAt !== null && (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(application.followUpAt).toLocaleDateString(
                          locale,
                        )}
                      </Typography>
                    )}
                  </Stack>
                );
              })}
            </Stack>
          )}
          <Button
            component={RouterLink}
            to={routePaths.applications}
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          >
            {t.viewAll}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
