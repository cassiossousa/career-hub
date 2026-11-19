import {
  createLanguageOptions,
  LanguageSwitcher,
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
import { useState } from 'react';
import { useTranslation } from '../../i18n/Provider';
import { useUIStore } from '../../store/uiStore';
import type { Locale } from '../../types/i18n';
import { DRAWER_WIDTH, Sidebar } from '../Sidebar/Sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { themeMode, toggleThemeMode } = useUIStore();
  const { locale, messages, onLocaleChange } = useTranslation();

  const languageOptions = createLanguageOptions<Locale>([
    { value: 'en', ariaLabel: messages.navigation.switchToEnglish },
    { value: 'pt-BR', ariaLabel: messages.navigation.switchToPortuguese },
  ]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              aria-label={messages.navigation.menu}
              sx={{ mr: 2 }}
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
        sx={{
          flexGrow: 1,
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
