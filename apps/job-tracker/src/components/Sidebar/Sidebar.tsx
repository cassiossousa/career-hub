import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { env } from '../../app/env';
import { isMockApiEnabled, setMockApiEnabled } from '../../app/mockApi';
import { getNavItems } from '../../app/routes';
import { useTranslation } from '../../i18n/Provider';
import { useUIStore } from '../../store/uiStore';

export const DRAWER_WIDTH = 240;

function isActivePath(pathname: string, path: string): boolean {
  return path === '/' ? pathname === '/' : pathname.startsWith(path);
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { pathname } = useLocation();
  const { messages } = useTranslation();
  const navItems = getNavItems(messages.navigation);
  const mockEnabled = isMockApiEnabled(env);
  const { openManualJobForm } = useUIStore();

  const toggleMockData = () => {
    setMockApiEnabled(!mockEnabled);
    window.location.reload();
  };

  return (
    <Box
      component="nav"
      aria-label={messages.navigation.mainNav}
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Toolbar />
        <List sx={{ flexGrow: 1 }}>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActivePath(pathname, item.path)}
                aria-current={
                  isActivePath(pathname, item.path) ? 'page' : undefined
                }
                onClick={onClose}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                openManualJobForm();
                onClose();
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={messages.navigation.addJob} />
            </ListItemButton>
          </ListItem>
          {env.isDev && (
            <ListItem disablePadding>
              <ListItemButton
                onClick={toggleMockData}
                aria-pressed={mockEnabled}
              >
                <ListItemText
                  primary={messages.navigation.mockData}
                  secondary={
                    mockEnabled
                      ? messages.navigation.mockDataOn
                      : messages.navigation.mockDataOff
                  }
                />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Drawer>
    </Box>
  );
}
