import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  GlobalStyles,
  ThemeProvider,
  Toolbar,
} from '@mui/material';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { TranslationProvider } from './i18n/provider';
import { routePaths } from './app/routePaths';
import { appTheme } from './app/theme';
import type { Locale } from './types/i18n';
import Home from './features/home/Home';
import ProjectDetails from './features/projects/ProjectDetails';
import Projects from './features/projects/Projects';
import Resume from './features/resume/Resume';
import WorkExperience from './features/work-experience/WorkExperience';

function initialLocale() {
  const match = document.cookie.match(/(?:^|;\s*)lang=(en|pt-BR)(?:;|$)/);
  return match?.[1] === 'pt-BR' ? 'pt-BR' : 'en';
}

function App({ initialLocale }: { initialLocale: Locale }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  function changeLocale(nextLocale: Locale) {
    document.cookie = `lang=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
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
        <Navbar />
        <Toolbar
          sx={{
            minHeight: '80px !important',
            '@media print': { display: 'none' },
          }}
        />
        <Box component="main">
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
      </TranslationProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App initialLocale={initialLocale()} />
    </BrowserRouter>
  </React.StrictMode>,
);
