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
import type { RequirementClassification } from '../../services/types/job';
import type { MatchAlgorithm, MatchResult } from '../../services/types/match';
import type { Locale } from '../../types/i18n';
import { LoadingState, QueryErrorAlert } from '../AsyncStatus/AsyncStatus';

const MAX_TERMS = 12;
const MAX_REQUIREMENTS = 20;

function tierFor(score: number, matched: boolean): RequirementClassification {
  if (!matched) return 'unproven';
  if (score >= 80) return 'proven';
  if (score >= 50) return 'equivalent';
  return 'partial';
}

function localeName(
  locale: string | null,
  locales: Record<Locale, string>,
): string | null {
  if (locale === null) return null;
  return locale in locales ? locales[locale as Locale] : locale;
}

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
  const matchedTerms = [...new Set(result.matchedTerms)];
  const missingTerms = [...new Set(result.missingTerms)];
  const matchedCount = result.requirements.filter((req) => req.matched).length;
  const baselineLocale = localeName(
    result.baseline.locale,
    messages.common.locales,
  );

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
          {messages.match.scoreMeaning}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block' }}
        >
          {messages.match.baseline[result.baseline.kind]}
          {baselineLocale ? ` · ${baselineLocale}` : ''}
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

      {matchedTerms.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {messages.match.matchedTerms}
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {matchedTerms.slice(0, MAX_TERMS).map((term) => (
              <Chip
                key={term}
                label={term}
                size="small"
                color="success"
                variant="outlined"
              />
            ))}
            {matchedTerms.length > MAX_TERMS && (
              <Chip
                label={messages.match.moreTerms.replace(
                  '{count}',
                  String(matchedTerms.length - MAX_TERMS),
                )}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>
      )}

      {missingTerms.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {messages.match.missingTerms}
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {missingTerms.slice(0, MAX_TERMS).map((term) => (
              <Chip
                key={term}
                label={term}
                size="small"
                color="warning"
                variant="outlined"
              />
            ))}
            {missingTerms.length > MAX_TERMS && (
              <Chip
                label={messages.match.moreTerms.replace(
                  '{count}',
                  String(missingTerms.length - MAX_TERMS),
                )}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>
      )}

      {result.requirements.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {messages.match.requirements} (
            {messages.match.requirementsMet
              .replace('{met}', String(matchedCount))
              .replace('{total}', String(result.requirements.length))}
            )
          </Typography>
          <Stack spacing={0.5}>
            {result.requirements.slice(0, MAX_REQUIREMENTS).map((req) => {
              const tier = tierFor(req.score, req.matched);
              return (
                <Stack
                  key={`${req.text}|${req.score}|${req.weight}`}
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
                  <Chip
                    label={messages.match.tiers[tier]}
                    size="small"
                    variant="outlined"
                    color={
                      tier === 'proven'
                        ? 'success'
                        : tier === 'unproven'
                          ? 'default'
                          : 'warning'
                    }
                  />
                  <Typography variant="caption" color="text.secondary">
                    {req.score}% ·{' '}
                    {messages.match.weightShort.replace(
                      '{weight}',
                      String(req.weight),
                    )}
                  </Typography>
                </Stack>
              );
            })}
            {result.requirements.length > MAX_REQUIREMENTS && (
              <Typography variant="caption" color="text.secondary">
                {messages.match.moreTerms.replace(
                  '{count}',
                  String(result.requirements.length - MAX_REQUIREMENTS),
                )}
              </Typography>
            )}
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
