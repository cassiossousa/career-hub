import { Stack, Typography } from '@mui/material';
import {
  LoadingState,
  QueryErrorAlert,
} from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import { useProfileFacts } from '../../services/api/facts';
import { FactsForm } from './FactsForm';

export function FactsEditor() {
  const { messages } = useTranslation();
  const factsQuery = useProfileFacts();

  if (factsQuery.isLoading) {
    return <LoadingState label={messages.common.loading} />;
  }

  const facts = factsQuery.data?.facts;
  if (facts === undefined) {
    if (factsQuery.isError) {
      return (
        <QueryErrorAlert
          error={factsQuery.error}
          subject={messages.facts.title}
          onRetry={() => void factsQuery.refetch()}
        />
      );
    }
    return <LoadingState label={messages.common.loading} />;
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography component="h1" variant="h5">
          {messages.facts.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {messages.facts.description}
        </Typography>
      </Stack>
      <FactsForm facts={facts} />
    </Stack>
  );
}
