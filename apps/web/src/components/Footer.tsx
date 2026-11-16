import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { useTranslation } from '../i18n/provider';

export default function Footer() {
  const { messages: t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        borderTop: 1,
        borderColor: 'divider',
        '@media print': { display: 'none' },
      }}
    >
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{ justifyContent: 'space-between' }}
        >
          <Box>
            <Typography sx={{ fontWeight: 600 }}>{t.home.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {t.home.title}
            </Typography>
          </Box>

          <Box component="nav" aria-label={t.navigation.footerLabel}>
            <Stack
              component="ul"
              direction="row"
              spacing={3}
              sx={{ m: 0, p: 0, listStyle: 'none' }}
            >
              <Box component="li">
                <Link
                  href={`https://github.com/${t.home.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                >
                  {t.links.github}
                </Link>
              </Box>

              <Box component="li">
                <Link
                  href={`https://linkedin.com/in/${t.home.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                >
                  {t.links.linkedin}
                </Link>
              </Box>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary">
            © {year} {t.home.name}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
