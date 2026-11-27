import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { useTranslation } from '../i18n/Provider';

const currentYear = new Date().getFullYear();

export default function Footer() {
  const { messages: t } = useTranslation();

  return (
    <Box
      component="footer"
      sx={{
        gridColumn: '1 / -1',
        borderTop: 1,
        borderColor: 'divider',
        '@media print': { display: 'none' },
      }}
    >
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{ justifyContent: 'space-between' }}
        >
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" component="p">
              {t.home.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t.home.title}
            </Typography>
          </Stack>

          <Stack
            component="nav"
            aria-label={t.navigation.footerLabel}
            direction="row"
            spacing={3}
          >
            <Link
              href={`https://github.com/${t.home.username}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
            >
              {t.links.github}
            </Link>
            <Link
              href={`https://linkedin.com/in/${t.home.username}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
            >
              {t.links.linkedin}
            </Link>
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            © {currentYear} {t.home.name}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
