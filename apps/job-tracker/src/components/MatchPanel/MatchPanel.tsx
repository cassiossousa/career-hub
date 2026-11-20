import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { useTranslation } from '../../i18n/Provider';
import { isApiError } from '../../services/api/client';
import { useJobMatchAllAlgorithms } from '../../services/api/match';
import type { MatchAlgorithm, MatchResult } from '../../services/types/match';
import { LoadingState, QueryErrorAlert } from '../AsyncStatus/AsyncStatus';

interface MatchPanelProps {
  jobId: number;
  applicationId?: number | undefined;
}

function scoreColor(score: number): 'success' | 'warning' | 'error' {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'error';
}

function AlgorithmScoreChip({
  algorithm,
  result,
}: {
  algorithm: MatchAlgorithm;
  result: MatchResult | undefined;
}) {
  const { messages } = useTranslation();
  const label = messages.match.algorithms[algorithm];

  if (result === undefined) {
    return <Chip label={label} size="small" variant="outlined" />;
  }
  return (
    <Chip
      label={`${label}: ${result.score}%`}
      size="small"
      color={scoreColor(result.score)}
      variant="outlined"
    />
  );
}

function MatchBreakdown({ result }: { result: MatchResult }) {
  const { messages } = useTranslation();
  const componentEntries = Object.entries(result.components);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {messages.match.score}: {result.score}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={result.score}
          color={scoreColor(result.score)}
        />
        <Typography variant="caption" color="text.secondary">
          {messages.match.baseline[result.baseline.kind]}
          {result.baseline.locale ? ` · ${result.baseline.locale}` : ''}
        </Typography>
      </Box>

      {componentEntries.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {messages.match.components}
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {componentEntries.map(([name, value]) => (
              <Chip
                key={name}
                label={`${messages.match.componentNames[name] ?? name}: ${value}`}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>
      )}

      {result.matchedTerms.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {messages.match.matchedTerms}
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {result.matchedTerms.map((term) => (
              <Chip
                key={term}
                label={term}
                size="small"
                color="success"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>
      )}

      {result.missingTerms.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {messages.match.missingTerms}
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {result.missingTerms.map((term) => (
              <Chip
                key={term}
                label={term}
                size="small"
                color="warning"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>
      )}

      {result.requirements.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {messages.match.requirements}
          </Typography>
          <Stack spacing={0.5}>
            {result.requirements.map((req) => (
              <Stack
                key={req.text}
                direction="row"
                sx={{ alignItems: 'center', gap: 1 }}
              >
                {req.matched ? (
                  <CheckIcon
                    fontSize="small"
                    color="success"
                    aria-label={messages.match.requirementMatched}
                  />
                ) : (
                  <CloseIcon
                    fontSize="small"
                    color="disabled"
                    aria-label={messages.match.requirementMissing}
                  />
                )}
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {req.text}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {req.score}%
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

export function MatchPanel({ jobId, applicationId }: MatchPanelProps) {
  const { messages } = useTranslation();
  const matches = useJobMatchAllAlgorithms(jobId, { applicationId });

  const allLoading = matches.every((m) => m.isLoading);
  const allFailed = matches.every((m) => m.isError);
  const portfolioMissing =
    allFailed &&
    matches.every((m) => isApiError(m.error) && m.error.code === 'not_found');

  if (allLoading) {
    return <LoadingState label={messages.common.loading} />;
  }

  if (portfolioMissing) {
    return (
      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">
          {messages.match.portfolioRequired}
        </Typography>
        <Button
          component={RouterLink}
          to={routePaths.portfolio}
          size="small"
          variant="outlined"
          sx={{ alignSelf: 'flex-start' }}
        >
          {messages.match.setupPortfolio}
        </Button>
      </Stack>
    );
  }

  const detail = matches.find((m) => m.algorithm === 'hybrid')?.result;

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
        {matches.map((match) => (
          <AlgorithmScoreChip
            key={match.algorithm}
            algorithm={match.algorithm}
            result={match.result}
          />
        ))}
      </Stack>
      {matches.map((match) =>
        match.isError && match.result === undefined ? (
          <QueryErrorAlert
            key={match.algorithm}
            error={match.error}
            subject={messages.match.algorithms[match.algorithm]}
          />
        ) : null,
      )}
      {detail !== undefined && <MatchBreakdown result={detail} />}
    </Stack>
  );
}
