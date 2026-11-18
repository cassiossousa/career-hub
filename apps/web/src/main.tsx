import { Box, CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { routePaths } from './app/routePaths';
import { storageGetItem, storageSetItem } from './app/storage';
import { appTheme } from './app/theme';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Home from './features/home/Home';
import ProjectDetails from './features/projects/ProjectDetails';
import Projects from './features/projects/Projects';
import Resume from './features/resume/Resume';
import WorkExperience from './features/work-experience/WorkExperience';
import { TranslationProvider } from './i18n/Provider';
import type { Locale } from './types/i18n';

function readStoredLocale(): Locale | null {
  const stored = storageGetItem('lang');
  return stored === 'pt-BR' || stored === 'en' ? stored : null;
}

function initialLocale() {
  return readStoredLocale() ?? 'en';
}

function App({ initialLocale: startingLocale }: { initialLocale: Locale }) {
  const [locale, setLocale] = useState<Locale>(startingLocale);

  function changeLocale(nextLocale: Locale) {
    storageSetItem('lang', nextLocale);
    setLocale(nextLocale);
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '@page': { margin: 0 },
          '@media print': { body: { margin: 0 } },
        }}
      />
      <TranslationProvider locale={locale} onLocaleChange={changeLocale}>
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
          <Navbar />
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
      </TranslationProvider>
    </ThemeProvider>
  );
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing root element');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App initialLocale={initialLocale()} />
    </BrowserRouter>
  </React.StrictMode>,
);
