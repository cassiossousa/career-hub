import {
  createLanguageOptions,
  LanguageSwitcher,
  SkipLink,
  ThemeModeToggle,
} from '@career-hub/ui/components';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { appRoutes } from '../../app/routes';
import { useTranslation } from '../../i18n/Provider';
import { useUIStore } from '../../store/uiStore';
import type { Locale, Translation } from '../../types/i18n';
import { DRAWER_WIDTH, Sidebar } from '../Sidebar/Sidebar';

function titleForPath(
  pathname: string,
  nav: Translation['navigation'],
): string {
  const match = appRoutes
    .filter(
      (route) =>
        route.navLabel !== undefined &&
        (route.path === '/'
          ? pathname === '/'
          : pathname.startsWith(route.path)),
    )
    .toSorted((a, b) => b.path.length - a.path.length)[0];
  return match?.navLabel === undefined ? 'Job Tracker' : match.navLabel(nav);
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { pathname } = useLocation();
  const { themeMode, toggleThemeMode } = useUIStore();
  const { locale, messages, onLocaleChange } = useTranslation();

  useEffect(() => {
    document.title = `${titleForPath(pathname, messages.navigation)} | Job Tracker`;
  }, [pathname, messages.navigation]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const languageOptions = createLanguageOptions<Locale>([
    { flag: 'us', value: 'en', ariaLabel: messages.navigation.switchToEnglish },
    {
      flag: 'br',
      value: 'pt-BR',
      ariaLabel: messages.navigation.switchToPortuguese,
    },
  ]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <SkipLink
        href="#main-content"
        label={messages.navigation.skipToContent}
      />
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          marginInlineStart: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              aria-label={messages.navigation.menu}
              sx={{ marginInlineEnd: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Job Tracker
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ThemeModeToggle
              mode={themeMode}
              onToggle={toggleThemeMode}
              ariaLabel={
                themeMode === 'dark'
                  ? messages.navigation.switchToLightMode
                  : messages.navigation.switchToDarkMode
              }
            />
            <LanguageSwitcher
              locale={locale}
              options={languageOptions}
              onLocaleChange={onLocaleChange}
            />
          </Stack>
        </Toolbar>
      </AppBar>
      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} />
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
