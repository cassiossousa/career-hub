import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { EmptyState } from '../../components/AsyncStatus/AsyncStatus';
import { PortfolioQueryGate } from '../../components/PortfolioQueryGate/PortfolioQueryGate';
import { useTranslation } from '../../i18n/Provider';
import { FiltersForm } from './FiltersForm';

export function SettingsEditor() {
  const { messages } = useTranslation();

  return (
    <PortfolioQueryGate subject={messages.settings.title}>
      {({ portfolio }) => {
        const documents = portfolio?.documents ?? {};
        const locales = Object.keys(documents).toSorted();
        const locale = locales.includes('en') ? 'en' : (locales[0] ?? 'en');
        const content = documents[locale];

        return (
          <Stack spacing={3} sx={{ maxWidth: 720 }}>
            <Stack spacing={0.5}>
              <Typography component="h1" variant="h5">
                {messages.settings.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {messages.settings.description}
              </Typography>
            </Stack>
            {locales.length > 0 &&
            content !== undefined &&
            portfolio !== undefined ? (
              <FiltersForm
                key={locale}
                locale={locale}
                content={content}
                filters={portfolio.filters}
              />
            ) : (
              <EmptyState
                title={messages.settings.noPortfolio}
                action={
                  <Button
                    component={RouterLink}
                    to={routePaths.portfolio}
                    variant="contained"
                  >
                    {messages.settings.openPortfolio}
                  </Button>
                }
              />
            )}
          </Stack>
        );
      }}
    </PortfolioQueryGate>
  );
}
