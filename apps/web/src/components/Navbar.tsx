import { useState } from 'react';
import {
  AppBar,
  Container,
  IconButton,
  Link as MuiLink,
  Paper,
  Stack,
  Toolbar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../i18n/provider';
import { navigationItems, routePaths } from '../app/routePaths';

export default function Navbar() {
  const { messages: t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = navigationItems.map(({ to, label }) => ({
    to,
    label: label(t),
  }));

  return (
    <AppBar
      component="nav"
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        height: 80,
        borderBottom: 1,
        borderColor: 'divider',
        '@media print': { display: 'none' },
      }}
    >
      <Toolbar disableGutters sx={{ minHeight: '80px !important' }}>
        <Container maxWidth="md">
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack
              direction="row"
              spacing={3}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              {links.map((link) => (
                <MuiLink
                  key={link.to}
                  component={RouterLink}
                  to={link.to}
                  color="text.secondary"
                  underline="hover"
                >
                  {link.label}
                </MuiLink>
              ))}
            </Stack>

            <MuiLink
              component={RouterLink}
              to={routePaths.home}
              color="text.primary"
              underline="none"
              noWrap
              sx={{
                display: { xs: 'block', md: 'none' },
                maxWidth: '45vw',
                fontWeight: 600,
              }}
            >
              {t.home.name}
            </MuiLink>

            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <IconButton
                onClick={() => setMobileOpen((open) => !open)}
                aria-label={t.navigation.toggleMenu}
                aria-expanded={mobileOpen}
                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
              <LanguageSwitcher />
            </Stack>
          </Stack>
        </Container>
      </Toolbar>

      {mobileOpen && (
        <Paper
          square
          elevation={4}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <Container maxWidth="md" sx={{ py: 2 }}>
            <Stack spacing={2}>
              {links.map((link) => (
                <MuiLink
                  key={link.to}
                  component={RouterLink}
                  to={link.to}
                  color="text.primary"
                  underline="hover"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Stack>
          </Container>
        </Paper>
      )}
    </AppBar>
  );
}
