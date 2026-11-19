import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import {
  EmptyState,
  errorMessage,
  QueryGate,
} from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import { usePortfolio, useUpsertPortfolio } from '../../services/api/portfolio';
import type { Portfolio } from '../../services/types/portfolio';

interface BasicsFormState {
  fullName: string;
  headline: string;
  subtitle: string;
  location: string;
}

function toFormState(portfolio: Portfolio): BasicsFormState {
  return {
    fullName: portfolio.basics.fullName,
    headline: portfolio.basics.headline.en ?? '',
    subtitle: portfolio.basics.subtitle.en ?? '',
    location: portfolio.basics.location.en ?? '',
  };
}

function PortfolioBasicsForm({ portfolio }: { portfolio: Portfolio }) {
  const { messages } = useTranslation();
  const { mutate: upsertPortfolio, isPending } = useUpsertPortfolio();
  const [formData, setFormData] = useState<BasicsFormState>(() =>
    toFormState(portfolio),
  );
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    upsertPortfolio(
      {
        basics: {
          ...portfolio.basics,
          fullName: formData.fullName,
          headline: { ...portfolio.basics.headline, en: formData.headline },
          subtitle: { ...portfolio.basics.subtitle, en: formData.subtitle },
          location: { ...portfolio.basics.location, en: formData.location },
        },
        experience: portfolio.experience,
        skillGroups: portfolio.skillGroups,
        projects: portfolio.projects,
        filters: portfolio.filters,
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
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {feedback && (
              <Alert severity={feedback.type}>{feedback.text}</Alert>
            )}
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
              label={messages.portfolio.basics.location}
              value={formData.location}
              onChange={update('location')}
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={isPending}>
              {isPending ? messages.common.saving : messages.portfolio.save}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}

export function PortfolioEditor() {
  const { messages } = useTranslation();
  const portfolioQuery = usePortfolio();

  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h5">
        {messages.portfolio.title}
      </Typography>
      <QueryGate
        query={portfolioQuery}
        subject={messages.portfolio.title}
        empty={<EmptyState title={messages.portfolio.notFound} />}
      >
        {(portfolio) => (
          <PortfolioBasicsForm key={portfolio.id} portfolio={portfolio} />
        )}
      </QueryGate>
    </Stack>
  );
}
