import { Box, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { useTranslation } from '../../i18n/Provider';
import type {
  Requirement,
  RequirementClassification,
} from '../../services/types/job';

interface MatchAnalysisProps {
  requirements: Requirement[];
}

const classificationColors = {
  proven: 'success',
  equivalent: 'info',
  partial: 'warning',
  unproven: 'error',
} as const;

export function MatchAnalysis({ requirements }: MatchAnalysisProps) {
  const { messages } = useTranslation();

  if (requirements.length === 0) {
    return (
      <Typography variant="body2">
        {messages.jobs.requirements.noRequirements}
      </Typography>
    );
  }

  const grouped: Record<RequirementClassification, Requirement[]> = {
    proven: [],
    equivalent: [],
    partial: [],
    unproven: [],
  };
  for (const req of requirements) {
    grouped[req.classification].push(req);
  }

  const totalWeight = requirements.reduce((sum, req) => sum + req.weight, 0);
  const provenWeight = grouped.proven.reduce((sum, req) => sum + req.weight, 0);
  const matchPercentage =
    totalWeight > 0 ? Math.round((provenWeight / totalWeight) * 100) : 0;

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {messages.jobs.matchScore}: {matchPercentage}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={matchPercentage}
          color={
            matchPercentage >= 80
              ? 'success'
              : matchPercentage >= 50
                ? 'warning'
                : 'error'
          }
        />
      </Box>
      {(Object.keys(classificationColors) as RequirementClassification[]).map(
        (classification) => {
          const reqs = grouped[classification];
          if (reqs.length === 0) return null;
          return (
            <Box key={classification}>
              <Typography variant="subtitle2" gutterBottom>
                <Chip
                  label={
                    messages.jobs.requirements.classifications[classification]
                  }
                  color={classificationColors[classification]}
                  size="small"
                  sx={{ mr: 1 }}
                />
                ({reqs.length})
              </Typography>
              <Stack spacing={0.5}>
                {reqs.map((req) => (
                  <Typography
                    key={`${req.text}-${req.classification}`}
                    variant="body2"
                    color="text.secondary"
                  >
                    {req.text} ({messages.jobs.requirements.weight}:{' '}
                    {req.weight})
                  </Typography>
                ))}
              </Stack>
            </Box>
          );
        },
      )}
    </Stack>
  );
}
