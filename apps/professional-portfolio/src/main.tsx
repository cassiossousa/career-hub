import { AppErrorBoundary } from '@career-hub/ui/components';
import type { ThemeMode } from '@career-hub/ui/theme';
import { Box, CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { routePaths } from './app/routePaths';
import { storageSetItem } from './app/storage';
import { appThemes, initialThemeMode, THEME_STORAGE_KEY } from './app/theme';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Home from './features/home/Home';
import ProjectDetails from './features/projects/ProjectDetails';
import Projects from './features/projects/Projects';
import Resume from './features/resume/Resume';
import WorkExperience from './features/work-experience/WorkExperience';
import { TranslationProvider } from './i18n/Provider';

function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialThemeMode);

  const toggleThemeMode = () => {
    const next: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    storageSetItem(THEME_STORAGE_KEY, next);
    setThemeMode(next);
  };

  return (
    <ThemeProvider theme={appThemes[themeMode]}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '@page': { margin: 0 },
          '@media print': { body: { margin: 0 } },
        }}
      />
      <TranslationProvider>
        <AppErrorBoundary>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                md: 'minmax(0, 1fr) minmax(0, 900px) minmax(0, 1fr)',
              },
              gridTemplateRows: 'auto 1fr auto',
              minHeight: '100vh',
              '@media print': { minHeight: 0 },
            }}
          >
            <Navbar themeMode={themeMode} onToggleTheme={toggleThemeMode} />
            <Box
              component="main"
              sx={{
                gridColumn: { xs: '1 / -1', md: '2' },
                minWidth: 0,
              }}
            >
              <Routes>
                <Route path={routePaths.home} element={<Home />} />
                <Route path={routePaths.projects} element={<Projects />} />
                <Route
                  path={routePaths.projectDetails}
                  element={<ProjectDetails />}
                />
                <Route
                  path={routePaths.workExperience}
                  element={<WorkExperience />}
                />
                <Route path={routePaths.resume} element={<Resume />} />
                <Route
                  path="*"
                  element={<Navigate to={routePaths.home} replace />}
                />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </AppErrorBoundary>
      </TranslationProvider>
    </ThemeProvider>
  );
}

// Stale chunk after a deploy must reload, not white-screen (ChunkLoadError).
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing root element');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
