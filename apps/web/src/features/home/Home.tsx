import { Container, Stack, Typography } from '@mui/material';
import { useTranslation } from '../../i18n/Provider';

export default function Home() {
  const { messages: t } = useTranslation();

  return (
    <Container component="section" maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={2}>
        <Typography variant="h1" component="h1">
          {t.home.name}
        </Typography>
        <Typography variant="h3" component="h2">
          {t.home.title}
        </Typography>
        <Typography variant="h6" component="p">
          {t.home.subtitle}
        </Typography>
        <Typography align="justify">{t.resume.summary}</Typography>
      </Stack>
    </Container>
  );
}
