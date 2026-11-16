import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { TranslationProvider } from './i18n/provider';
import { routePaths } from './app/routePaths';
import type { Locale } from './types/i18n';
import Home from './features/home/Home';
import ProjectDetails from './features/projects/ProjectDetails';
import Projects from './features/projects/Projects';
import Resume from './features/resume/Resume';
import WorkExperience from './features/work-experience/WorkExperience';
import './styles.css';

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
    <TranslationProvider locale={locale} onLocaleChange={changeLocale}>
      <Navbar />
      <main className="pt-20">
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
          <Route path="*" element={<Navigate to={routePaths.home} replace />} />
        </Routes>
      </main>
      <Footer />
    </TranslationProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App initialLocale={initialLocale()} />
    </BrowserRouter>
  </React.StrictMode>,
);
