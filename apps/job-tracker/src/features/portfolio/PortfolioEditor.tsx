import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { EmptyState } from '../../components/AsyncStatus/AsyncStatus';
import { PortfolioQueryGate } from '../../components/PortfolioQueryGate/PortfolioQueryGate';
import { useTranslation } from '../../i18n/Provider';
import type { PortfolioContent } from '../../services/types/portfolio';
import { PortfolioForm } from './PortfolioForm';

const LOCALES = ['en', 'pt-BR'] as const;

const EMPTY_CONTENT: PortfolioContent = {
  basics: {
    fullName: '',
    headline: '',
    subtitle: '',
    username: '',
    location: '',
    links: [],
  },
  experience: [],
  skillGroups: [],
  projects: [],
};

export function PortfolioEditor() {
  const { messages, locale } = useTranslation();
  const [selectedLocale, setSelectedLocale] = useState<string>(locale);

  return (
    <PortfolioQueryGate subject={messages.portfolio.title}>
      {({ portfolio, missing }) => {
        const documents = portfolio?.documents ?? {};
        const initial = documents[selectedLocale] ?? EMPTY_CONTENT;

        return (
          <Stack spacing={3}>
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                rowGap: 1,
              }}
            >
              <Typography component="h1" variant="h5">
                {messages.portfolio.title}
              </Typography>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>{messages.portfolio.locale}</InputLabel>
                <Select
                  value={selectedLocale}
                  label={messages.portfolio.locale}
                  onChange={(e) => {
                    setSelectedLocale(e.target.value);
                  }}
                >
                  {LOCALES.map((l) => (
                    <MenuItem key={l} value={l}>
                      {messages.common.locales[l]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            {documents[selectedLocale] === undefined && !missing && (
              <EmptyState
                title={messages.portfolio.noDocumentForLocale.replace(
                  '{locale}',
                  selectedLocale,
                )}
              />
            )}
            <PortfolioForm
              key={selectedLocale}
              locale={selectedLocale}
              initial={initial}
            />
            <Button
              component={RouterLink}
              to={routePaths.applications}
              variant="text"
              sx={{ alignSelf: 'flex-start' }}
            >
              {messages.common.back}
            </Button>
          </Stack>
        );
      }}
    </PortfolioQueryGate>
  );
}
