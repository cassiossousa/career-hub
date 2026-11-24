import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { EmptyState } from '../../components/AsyncStatus/AsyncStatus';
import { PortfolioQueryGate } from '../../components/PortfolioQueryGate/PortfolioQueryGate';
import { useTranslation } from '../../i18n/Provider';
import type { PortfolioContent } from '../../services/types/portfolio';
import { LOCALES } from '../../types/i18n';
import { PortfolioForm } from './PortfolioForm';

const EMPTY_CONTENT: PortfolioContent = {
  basics: {
    fullName: '',
    links: [],
  },
  experience: [],
  skillGroups: [],
  projects: [],
  languages: [],
};

export function PortfolioEditor() {
  const { messages, locale } = useTranslation();
  // ?locale= selects which portfolio document is edited; unknown values
  // fall back to the UI locale. Shareable like ?view=preview.
  const [searchParams, setSearchParams] = useSearchParams();
  const paramLocale = searchParams.get('locale');
  const selectedLocale = LOCALES.find((l) => l === paramLocale) ?? locale;

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
                rowGap: 2,
              }}
            >
              <Typography component="h1" variant="h5">
                {messages.portfolio.title}
              </Typography>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="portfolio-locale-label">
                  {messages.portfolio.locale}
                </InputLabel>
                <Select
                  labelId="portfolio-locale-label"
                  value={selectedLocale}
                  label={messages.portfolio.locale}
                  onChange={(e) => {
                    const next = new URLSearchParams(searchParams);
                    next.set('locale', e.target.value);
                    setSearchParams(next);
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
