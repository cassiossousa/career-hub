import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import {
  EmptyState,
  errorMessage,
  LoadingState,
  QueryErrorAlert,
} from '../../components/AsyncStatus/AsyncStatus';
import { FormCard } from '../../components/FormCard/FormCard';
import { useTranslation } from '../../i18n/Provider';
import { isApiError } from '../../services/api/client';
import { usePortfolio, useUpsertPortfolio } from '../../services/api/portfolio';
import type {
  PortfolioBasics,
  PortfolioContent,
} from '../../services/types/portfolio';

interface BasicsFormState {
  fullName: string;
  headline: string;
  subtitle: string;
  username: string;
  location: string;
}

const EMPTY_BASICS: PortfolioBasics = {
  fullName: '',
  headline: '',
  subtitle: '',
  username: '',
  location: '',
  links: [],
};

function toFormState(basics: PortfolioBasics): BasicsFormState {
  return {
    fullName: basics.fullName,
    headline: basics.headline,
    subtitle: basics.subtitle,
    username: basics.username,
    location: basics.location,
  };
}

function PortfolioBasicsForm({
  locale,
  content,
}: {
  locale: string;
  content: PortfolioContent | undefined;
}) {
  const { messages } = useTranslation();
  const { mutate: upsertPortfolio, isPending } = useUpsertPortfolio();
  const [formData, setFormData] = useState<BasicsFormState>(() =>
    toFormState(content?.basics ?? EMPTY_BASICS),
  );
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const basics: PortfolioBasics = {
      ...(content?.basics ?? EMPTY_BASICS),
      ...formData,
      links: content?.basics.links ?? [],
    };
    upsertPortfolio(
      {
        locale,
        basics,
        experience: content?.experience ?? [],
        skillGroups: content?.skillGroups ?? [],
        projects: content?.projects ?? [],
      },
      {
        onSuccess: () => {
          setFeedback({ type: 'success', text: messages.common.saved });
        },
        onError: (error) => {
          setFeedback({ type: 'error', text: errorMessage(error) });
        },
      },
    );
  };

  const update =
    (field: keyof BasicsFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <FormCard onSubmit={handleSubmit}>
      {feedback && <Alert severity={feedback.type}>{feedback.text}</Alert>}
      <TextField
        label={messages.portfolio.basics.fullName}
        value={formData.fullName}
        onChange={update('fullName')}
        required
        fullWidth
      />
      <TextField
        label={messages.portfolio.basics.headline}
        value={formData.headline}
        onChange={update('headline')}
        required
        fullWidth
      />
      <TextField
        label={messages.portfolio.basics.subtitle}
        value={formData.subtitle}
        onChange={update('subtitle')}
        fullWidth
      />
      <TextField
        label={messages.portfolio.basics.username}
        value={formData.username}
        onChange={update('username')}
        required
        fullWidth
      />
      <TextField
        label={messages.portfolio.basics.location}
        value={formData.location}
        onChange={update('location')}
        required
        fullWidth
      />
      <Button type="submit" variant="contained" disabled={isPending}>
        {isPending ? messages.common.saving : messages.portfolio.save}
      </Button>
    </FormCard>
  );
}

export function PortfolioEditor() {
  const { messages, locale } = useTranslation();
  const portfolioQuery = usePortfolio();

  if (portfolioQuery.isLoading) {
    return <LoadingState label={messages.common.loading} />;
  }

  const portfolioMissing =
    portfolioQuery.isError &&
    isApiError(portfolioQuery.error) &&
    portfolioQuery.error.code === 'not_found';

  if (portfolioQuery.isError && !portfolioMissing) {
    return (
      <QueryErrorAlert
        error={portfolioQuery.error}
        subject={messages.portfolio.title}
        onRetry={() => void portfolioQuery.refetch()}
      />
    );
  }

  const content = portfolioQuery.data?.documents[locale];

  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h5">
        {messages.portfolio.title}
      </Typography>
      {content === undefined && !portfolioMissing && (
        <EmptyState
          title={messages.portfolio.noDocumentForLocale.replace(
            '{locale}',
            locale,
          )}
        />
      )}
      <PortfolioBasicsForm
        key={`${locale}-${content === undefined ? 'new' : 'edit'}`}
        locale={locale}
        content={content}
      />
    </Stack>
  );
}
