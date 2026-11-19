import {
  createLanguageOptions,
  LanguageSwitcher,
} from '@career-hub/ui/components';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/Provider';
import { useUIStore } from '../../store/uiStore';
import type { Locale } from '../../types/i18n';

const DRAWER_WIDTH = 240;

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { openManualJobForm } = useUIStore();
  const { locale, messages, onLocaleChange } = useTranslation();

  const navItems = [
    { label: messages.navigation.dashboard, path: '/' },
    { label: messages.navigation.jobs, path: '/jobs' },
    { label: messages.navigation.applications, path: '/applications' },
    { label: messages.navigation.portfolio, path: '/portfolio' },
  ];

  const languageOptions = createLanguageOptions<Locale>([
    { value: 'en', ariaLabel: messages.navigation.switchToEnglish },
    { value: 'pt-BR', ariaLabel: messages.navigation.switchToPortuguese },
  ]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <List>
      {navItems.map((item) => (
        <ListItem key={item.path} disablePadding>
          <ListItemButton
            component={Link}
            to={item.path}
            onClick={() => {
              setMobileOpen(false);
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

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
          <LanguageSwitcher
            locale={locale}
            options={languageOptions}
            onLocaleChange={onLocaleChange}
          />
          <Button color="inherit" onClick={openManualJobForm}>
            {messages.navigation.addJob}
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        aria-label={messages.navigation.mainNav}
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          <Toolbar />
          {drawer}
        </Drawer>
      </Box>
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
