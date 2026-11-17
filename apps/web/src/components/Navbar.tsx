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
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        gridColumn: '1 / -1',
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
            <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  alignItems: 'center',
                }}
              >
                <IconButton
                  onClick={() => setMobileOpen((open) => !open)}
                  aria-label={t.navigation.toggleMenu}
                  aria-expanded={mobileOpen}
                >
                  {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
                <MuiLink
                  component={RouterLink}
                  to={routePaths.home}
                  underline="none"
                  noWrap
                  sx={{
                    maxWidth: '45vw',
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  {t.home.name}
                </MuiLink>
              </Stack>

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
                    underline="hover"
                    sx={{ color: 'text.secondary' }}
                  >
                    {link.label}
                  </MuiLink>
                ))}
              </Stack>
            </Stack>

            <LanguageSwitcher />
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
                  underline="hover"
                  onClick={() => setMobileOpen(false)}
                  sx={{ color: 'text.primary' }}
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
