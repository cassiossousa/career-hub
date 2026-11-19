import {
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import {
  EmptyState,
  QueryGate,
} from '../../components/AsyncStatus/AsyncStatus';
import { JobAgeBadge } from '../../components/JobAgeBadge/JobAgeBadge';
import { MatchAnalysis } from '../../components/MatchAnalysis/MatchAnalysis';
import { useTranslation } from '../../i18n/Provider';
import {
  useApplications,
  useCreateApplication,
} from '../../services/api/applications';
import { useJob } from '../../services/api/jobs';
import {
  filterResultLabelKey,
  isFilteredResult,
} from '../../services/filterResult';

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { messages } = useTranslation();
  const parsedId = id ? Number.parseInt(id, 10) : Number.NaN;
  const jobId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
  const jobQuery = useJob(jobId ?? 0, {
    enabled: jobId !== null,
  });
  const { data: applications } = useApplications({
    jobId: jobId ?? undefined,
  });
  const { mutate: createApplication, isPending } = useCreateApplication();

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
        const existingApplication = applications?.[0];

        const markAsApplied = () => {
          createApplication({
            jobId: job.id,
            status: 'applied',
            appliedAt: new Date().toISOString(),
          });
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
                  </Stack>
                  {job.matchScore !== null && (
                    <Typography component="p" variant="h6" color="primary">
                      {messages.jobs.matchScore}: {job.matchScore}%
                    </Typography>
                  )}
                  {isFilteredResult(job.filterResult) && (
                    <Typography variant="body2" color="warning.main">
                      {
                        messages.jobs.filterResult[
                          filterResultLabelKey[job.filterResult]
                        ]
                      }
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
                    {existingApplication ? (
                      <Chip
                        label={`${messages.applications.status[existingApplication.status]} · #${existingApplication.id}`}
                        color="primary"
                        variant="outlined"
                      />
                    ) : (
                      <Button
                        variant="outlined"
                        onClick={markAsApplied}
                        disabled={isPending}
                      >
                        {messages.applications.status.applied}
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography component="h2" variant="h6" gutterBottom>
                  {messages.jobs.matched} / {messages.jobs.missing}
                </Typography>
                <MatchAnalysis requirements={job.requirements} />
              </CardContent>
            </Card>
          </Stack>
        );
      }}
    </QueryGate>
  );
}
