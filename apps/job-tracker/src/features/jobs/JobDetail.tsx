import {
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { ApplicationStatusChip } from '../../components/ApplicationStatusChip/ApplicationStatusChip';
import {
  EmptyState,
  QueryGate,
} from '../../components/AsyncStatus/AsyncStatus';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { JobAgeBadge } from '../../components/JobAgeBadge/JobAgeBadge';
import { MatchPanel } from '../../components/MatchPanel/MatchPanel';
import { useTranslation } from '../../i18n/Provider';
import {
  useApplications,
  useCreateApplication,
  useUpdateApplication,
} from '../../services/api/applications';
import { useEnqueueApplyRun } from '../../services/api/applyRuns';
import { useJob } from '../../services/api/jobs';
import { isFilteredResult } from '../../services/filterResult';
import { formatJobSalary, isJobStale } from '../../services/jobMeta';
import type { Application } from '../../services/types/application';

const renderedAtMs = Date.now();

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { messages } = useTranslation();
  const parsedId = id ? Number.parseInt(id, 10) : Number.NaN;
  const jobId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
  const jobQuery = useJob(jobId ?? 0, {
    enabled: jobId !== null,
  });
  const applicationsQuery = useApplications({
    jobId: jobId ?? undefined,
  });
  const { mutate: createApplication, isPending: isCreating } =
    useCreateApplication();
  const { mutate: updateApplication, isPending: isUpdating } =
    useUpdateApplication();
  const [confirmApplied, setConfirmApplied] = useState(false);

  const handleCreateError = () => {
    void applicationsQuery.refetch();
  };

  if (jobId === null) {
    return <EmptyState title={messages.jobs.notFound} />;
  }

  return (
    <QueryGate
      query={jobQuery}
      subject={messages.jobs.title}
      empty={<EmptyState title={messages.jobs.notFound} />}
    >
      {(job) => {
        const existingApplication = applicationsQuery.data?.applications[0];
        const salary = formatJobSalary(job);
        const meta = [salary, job.contractType]
          .filter((part): part is string => part !== null && part !== '')
          .join(' · ');

        const saveForLater = () => {
          createApplication(
            { jobId: job.id, status: 'saved' },
            { onError: handleCreateError },
          );
        };

        const markAsApplied = () => {
          setConfirmApplied(false);
          if (existingApplication === undefined) {
            createApplication(
              {
                jobId: job.id,
                status: 'applied',
                appliedAt: new Date().toISOString().slice(0, 10),
              },
              { onError: handleCreateError },
            );
          } else {
            updateApplication({
              id: existingApplication.id,
              data: {
                status: 'applied',
                appliedAt:
                  existingApplication.appliedAt ??
                  new Date().toISOString().slice(0, 10),
              },
            });
          }
        };

        return (
          <Stack spacing={3}>
            <Button
              onClick={() => {
                void navigate(routePaths.jobs);
              }}
            >
              {messages.common.back}
            </Button>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Typography
                      component="h1"
                      variant="h4"
                      sx={{ overflowWrap: 'anywhere' }}
                    >
                      {job.title}
                    </Typography>
                    <JobAgeBadge job={job} />
                  </Stack>
                  <Typography component="p" variant="h6" color="text.secondary">
                    {job.company}
                  </Typography>
                  {meta !== '' && (
                    <Typography variant="body2" color="text.secondary">
                      {meta}
                    </Typography>
                  )}
                  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label={messages.jobs.levels[job.level]}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={messages.jobs.areas[job.area]}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={job.location}
                      size="small"
                      variant="outlined"
                    />
                    {job.remote && (
                      <Chip
                        label={messages.jobs.remote}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {isJobStale(job) && (
                      <Chip
                        label={messages.jobs.possiblyExpired}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                  {isFilteredResult(job.filterResult) && (
                    <Typography variant="body2" color="warning.main">
                      {messages.jobs.filterResult[job.filterResult]}
                    </Typography>
                  )}
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {job.description}
                  </Typography>
                  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
                    <Button
                      variant="contained"
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {messages.common.view}
                    </Button>
                    {!applicationsQuery.isLoading &&
                      (existingApplication === undefined ? (
                        <>
                          <Button
                            variant="outlined"
                            onClick={saveForLater}
                            disabled={isCreating}
                          >
                            {messages.jobs.saveForLater}
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => {
                              setConfirmApplied(true);
                            }}
                            disabled={isCreating}
                          >
                            {messages.jobs.markApplied}
                          </Button>
                        </>
                      ) : (
                        <ApplicationActionRow
                          application={existingApplication}
                          onMarkApplied={() => {
                            setConfirmApplied(true);
                          }}
                          pending={isCreating || isUpdating}
                        />
                      ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography component="h2" variant="h6" gutterBottom>
                  {messages.match.title}
                </Typography>
                <MatchPanel
                  jobId={job.id}
                  applicationId={existingApplication?.id}
                />
              </CardContent>
            </Card>
            <ConfirmDialog
              open={confirmApplied}
              title={messages.jobs.appliedConfirmTitle}
              body={messages.jobs.appliedConfirmBody}
              confirmLabel={messages.jobs.markApplied}
              cancelLabel={messages.common.cancel}
              onConfirm={markAsApplied}
              onCancel={() => {
                setConfirmApplied(false);
              }}
            />
          </Stack>
        );
      }}
    </QueryGate>
  );
}

function ApplicationActionRow({
  application,
  onMarkApplied,
  pending,
}: {
  application: Application;
  onMarkApplied: () => void;
  pending: boolean;
}) {
  const { messages, locale } = useTranslation();
  const navigate = useNavigate();
  const enqueueApply = useEnqueueApplyRun();
  const followUpOverdue =
    application.followUpAt != null &&
    new Date(application.followUpAt).getTime() <= renderedAtMs;
  return (
    <>
      <ApplicationStatusChip status={application.status} />
      {application.followUpAt != null && (
        <Typography
          variant="body2"
          color={followUpOverdue ? 'warning.main' : 'text.secondary'}
        >
          {messages.applications.followUp}:{' '}
          {new Date(application.followUpAt).toLocaleString(locale)}
        </Typography>
      )}
      {application.status === 'saved' && (
        <>
          <Button
            variant="contained"
            onClick={onMarkApplied}
            disabled={pending}
          >
            {messages.jobs.markApplied}
          </Button>
          <Button
            variant="outlined"
            disabled={enqueueApply.isPending}
            onClick={() => {
              enqueueApply.mutate(application.id, {
                onSuccess: (run) => {
                  void navigate(routePaths.applyRun(String(run.id)));
                },
              });
            }}
          >
            {enqueueApply.isPending
              ? messages.apply.enqueueing
              : messages.apply.enqueue}
          </Button>
        </>
      )}
      <Button
        component={RouterLink}
        to={routePaths.applicationDetail(application.id.toString())}
        variant="outlined"
      >
        {messages.applications.viewApplication}
      </Button>
    </>
  );
}
