import { Container, Typography } from '@mui/material';
import { useTranslation } from '../../i18n/provider';

export default function Home() {
  const { messages: t } = useTranslation();

  return (
    <Container component="section" maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h1" component="h1">
        {t.home.name}
      </Typography>
      <Typography variant="h3" component="h2" sx={{ mt: 2 }}>
        {t.home.title}
      </Typography>
      <Typography variant="h6" component="p" sx={{ mt: 1 }}>
        {t.home.subtitle}
      </Typography>
      <Typography sx={{ mt: 2, textAlign: 'justify' }}>
        {t.resume.summary}
      </Typography>
    </Container>
  );
}
